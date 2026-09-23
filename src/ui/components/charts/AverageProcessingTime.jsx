import { useMemo, useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { api } from "../../utils/api";
import { message } from "antd";

function formatMonth(str) {
  const [y, m] = str.split("-");
  return new Date(+y, +m - 1).toLocaleString("fr-FR", {
    month: "short",
    year: "2-digit",
  });
}

function getLast12Months() {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(key);
  }
  return months;
}

const TARGET_DAYS = 3;

export default function AverageProcessingTime() {
  const [dataRow, setDataRow] = useState([]);

  const getData = async () => {
    try {
      const response = await api.get("purchase/avg-processing-time");
      setDataRow(response.data);
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Erreur de chargement des données"
      );
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const data = useMemo(() => {
    const months = getLast12Months();
    const byMonth = Object.fromEntries(dataRow.map((d) => [d.month, d]));

    return months.map((month) => {
      const found = byMonth[month];
      return {
        month,
        label: formatMonth(month),
        delay: found?.average_delay_days ?? 0,
        processed_count: found?.processed_count ?? 0,
      };
    });
  }, [dataRow]);

  const maxDelay = useMemo(() => {
    const max = Math.max(TARGET_DAYS, ...data.map((d) => d.delay));
    return Math.ceil(max * 1.2) || TARGET_DAYS * 2;
  }, [data]);

  const chartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "55%",
        distributed: true,
      },
    },
    legend: {
      show: false,
    },
    // No activity -> gray, within target -> sky, above target -> red
    colors: data.map((d) =>
      d.processed_count === 0 ? "#e5e7eb" : d.delay <= TARGET_DAYS ? "#0ea5e9" : "#f87171"
    ),
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f3f4f6",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    annotations: {
      yaxis: [
        {
          y: TARGET_DAYS,
          borderColor: "#f97316",
          borderWidth: 2,
          strokeDashArray: 4,
          label: {
            text: `cible : ≤ ${TARGET_DAYS} jours`,
            position: "right",
            offsetX: -4,
            style: {
              color: "#f97316",
              background: "#fff7ed",
              fontSize: "11px",
              fontWeight: 600,
              padding: { top: 3, bottom: 3, left: 6, right: 6 },
            },
          },
        },
      ],
    },
    xaxis: {
      categories: data.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        rotate: -35,
        style: { fontSize: "11px", colors: "#9ca3af" },
      },
    },
    yaxis: {
      min: 0,
      max: maxDelay,
      tickAmount: 4,
      labels: {
        formatter: (v) => `${v} j`,
        style: { fontSize: "11px", colors: "#9ca3af" },
      },
    },
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const d = data[dataPointIndex];
        if (!d) return "";
        return `
          <div style="background:#fff;padding:12px 16px;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
            <p style="font-weight:600;color:#1f2937;margin:0 0 4px">${d.label}</p>
            <p style="color:#6b7280;margin:0">
              Délai moyen : <span style="color:#111827;font-weight:700">${d.delay} j</span>
            </p>
            <p style="color:#9ca3af;font-size:11px;margin:4px 0 0">
              ${d.processed_count === 0 ? "Aucune donnée" : `${d.processed_count} demande${d.processed_count !== 1 ? "s" : ""} traitée${d.processed_count !== 1 ? "s" : ""}`}
            </p>
          </div>`;
      },
    },
    states: {
      hover: { filter: { type: "darken", value: 0.85 } },
    },
  };

  const chartSeries = [
    {
      name: "Délai moyen",
      data: data.map((d) => d.delay),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mt-4 p-4">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900">
          Délai moyen de traitement des demandes d'achat
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          (∑ délais de traitement / Nb demandes traitées) — en jours, 12 derniers mois
        </p>
      </div>

      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={240}
      />

      <div className="flex gap-5 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" />
          Dans la cible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />
          Hors cible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" />
          Aucune activité
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0 border-t-2 border-dashed border-orange-400 inline-block" />
          Cible ≤ {TARGET_DAYS} jours
        </span>
      </div>
    </div>
  );
}