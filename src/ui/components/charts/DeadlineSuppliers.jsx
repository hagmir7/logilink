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

export default function DeadlineSuppliers() {
  const [dataRow, setDataRow] = useState([]);

  const getData = async () => {
    try {
      const response = await api.get("deadline-suppliers");
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
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return dataRow
    .filter((d) => d.month !== currentMonthStr)
    .map((d) => ({
      ...d,
      label: formatMonth(d.month),
      rate: d.total > 0 ? Math.round(((d.total - d.count) / d.total) * 100) : 0,
    }));
}, [dataRow]);

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
    colors: data.map((d) => (d.rate > 0 ? "#0ea5e9" : "#e5e7eb")),
    dataLabels: { enabled: false },
    grid: {
      borderColor: "#f3f4f6",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    annotations: {
      yaxis: [
        {
          y: 80,
          borderColor: "#f97316",
          borderWidth: 2,
          strokeDashArray: 4,
          label: {
            text: "cible : ≥ 80%",
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
      max: 120,
      tickAmount: 4,
      labels: {
        formatter: (v) => `${v}%`,
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
              Taux : <span style="color:#111827;font-weight:700">${d.rate}%</span>
            </p>
            <p style="color:#9ca3af;font-size:11px;margin:4px 0 0">
              ${d.total === 0 ? "—" : d.total} / ${d.count} livraison${d.count !== 1 ? "s" : ""} conforme${d.count !== 1 ? "s" : ""}
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
      name: "Taux",
      data: data.map((d) => d.rate),
    },
  ];



  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mt-4 p-4">
      {/* En-tête */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900">
          Taux de respect des délais de livraison
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          (Nb livraisons conformes / Nb total) × 100 — juil. 2025 à juin 2026
        </p>
      </div>

      {/* Graphique ApexCharts */}
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="bar"
        height={240}
      />

      {/* Légende */}
      <div className="flex gap-5 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" />
          Avec conversions
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" />
          Aucune activité
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-0 border-t-2 border-dashed border-orange-400 inline-block" />
          Cible ≥ 80%
        </span>
      </div>
    </div>
  );
}