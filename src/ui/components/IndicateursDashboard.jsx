import { useState, useEffect, useRef } from "react";

const delaisData = [
  { mois: "Jan", valeur: 82 },
  { mois: "Fév", valeur: 78 },
  { mois: "Mar", valeur: 88 },
  { mois: "Apr", valeur: 91 },
  { mois: "Mai", valeur: 84 },
  { mois: "Jun", valeur: 85 },
];

const ncData = [
  { mois: "Jan", valeur: 4 },
  { mois: "Fév", valeur: 6 },
  { mois: "Mar", valeur: 5 },
  { mois: "Apr", valeur: 8 },
  { mois: "Mai", valeur: 7 },
  { mois: "Jun", valeur: 7 },
];

const indicateurs = [
  {
    label: "Taux de respect des délais de livraison",
    cible: "≥ 80%",
    valeur: "85%",
    frequence: "Mensuelle",
    statut: "OK",
    ok: true,
  },
  {
    label: "Taux de non-conformité fournisseurs",
    cible: "≤ 5%",
    valeur: "7%",
    frequence: "Mensuelle",
    statut: "NOK",
    ok: false,
  },
  {
    label: "Taux de dépendance fournisseur unique",
    cible: "≤ 30%",
    valeur: "22%",
    frequence: "Annuelle",
    statut: "OK",
    ok: true,
  },
  {
    label: "Taux de prestataires évalués annuellement",
    cible: "100%",
    valeur: "100%",
    frequence: "Annuelle",
    statut: "OK",
    ok: true,
  },
];

const kpis = [
  {
    label: "Taux de respect\ndes délais",
    valeur: "85%",
    cible: "Cible ≥ 80% ✓",
    ok: true,
  },
  {
    label: "Taux de\nnon-conformité",
    valeur: "7%",
    cible: "Cible ≤ 5% ✗",
    ok: false,
  },
  {
    label: "Dépendance\nfournisseur unique",
    valeur: "22%",
    cible: "Cible ≤ 30% ✓",
    ok: true,
  },
  {
    label: "Prestataires\névalués",
    valeur: "100%",
    cible: "Cible 100% ✓",
    ok: true,
  },
];

function ApexBarChart({ id, series, categories, referenceLine, colorFn, yMin, yMax, yTickAmount }) {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    // Dynamically load ApexCharts if not already available
    const initChart = () => {
      if (!window.ApexCharts) return;

      const colors = series[0].data.map((v) => colorFn(v));

      const options = {
        chart: {
          type: "bar",
          height: 210,
          toolbar: { show: false },
          background: "transparent",
          fontFamily: "inherit",
          animations: { enabled: true, easing: "easeinout", speed: 600 },
        },
        series,
        xaxis: {
          categories,
          labels: { style: { colors: "#9ca3af", fontSize: "12px" } },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          min: yMin,
          max: yMax,
          tickAmount: yTickAmount,
          labels: {
            formatter: (v) => `${v}%`,
            style: { colors: "#9ca3af", fontSize: "11px" },
          },
        },
        annotations: {
          yaxis: [
            {
              y: referenceLine,
              borderColor: "#f87171",
              strokeDashArray: 5,
              borderWidth: 1.5,
              label: {
                text: `Cible ${referenceLine}%`,
                style: {
                  color: "#f87171",
                  background: "transparent",
                  fontSize: "11px",
                  fontWeight: 400,
                },
                position: "right",
                offsetX: -8,
              },
            },
          ],
        },
        fill: { colors },
        plotOptions: {
          bar: {
            borderRadius: 4,
            columnWidth: "52%",
            distributed: true,
          },
        },
        dataLabels: { enabled: false },
        grid: {
          borderColor: "rgba(0,0,0,0.07)",
          strokeDashArray: 3,
          yaxis: { lines: { show: true } },
          xaxis: { lines: { show: false } },
        },
        tooltip: {
          theme: "light",
          y: { formatter: (v) => `${v}%` },
        },
        legend: { show: false },
      };

      if (instanceRef.current) {
        instanceRef.current.destroy();
      }

      instanceRef.current = new window.ApexCharts(chartRef.current, options);
      instanceRef.current.render();
    };

    if (window.ApexCharts) {
      initChart();
    } else {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/apexcharts/3.45.2/apexcharts.min.js";
      script.onload = initChart;
      document.head.appendChild(script);
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, []);

  return <div ref={chartRef} id={id} />;
}

export default function IndicateursDashboard() {
  const [activeAction, setActiveAction] = useState(null);

  const delaisSeries = [{ name: "Délais", data: delaisData.map((d) => d.valeur) }];
  const ncSeries = [{ name: "Non-conformité", data: ncData.map((d) => d.valeur) }];
  const categories = delaisData.map((d) => d.mois);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="mb-2">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">
            Système de management de la qualité · PRS.ACH.08
          </p>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Tableau de bord — Processus Achats
          </h1>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2"
            >
              <p className="text-sm text-gray-500 leading-snug whitespace-pre-line">
                {kpi.label}
              </p>
              <p
                className={`text-4xl font-bold tracking-tight ${
                  kpi.ok ? "text-blue-700" : "text-red-500"
                }`}
              >
                {kpi.valeur}
              </p>
              <p
                className={`text-xs font-medium ${
                  kpi.ok ? "text-emerald-600" : "text-red-400"
                }`}
              >
                {kpi.cible}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Chart 1 — Délais */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              Respect des délais vs cible
            </p>
            <ApexBarChart
              id="chart-delais"
              series={delaisSeries}
              categories={categories}
              referenceLine={80}
              colorFn={() => "#93c5fd"}
              yMin={60}
              yMax={100}
              yTickAmount={5}
            />
          </div>

          {/* Chart 2 — Non-conformité */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              Non-conformité fournisseurs
            </p>
            <ApexBarChart
              id="chart-nc"
              series={ncSeries}
              categories={categories}
              referenceLine={5}
              colorFn={(v) => (v <= 5 ? "#86efac" : "#fca5a5")}
              yMin={0}
              yMax={12}
              yTickAmount={6}
            />
          </div>
        </div>

        {/* Synthesis Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">
            Tableau de synthèse des indicateurs
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-1/2">
                    Indicateur
                  </th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Cible
                  </th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Valeur
                  </th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Fréquence
                  </th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {indicateurs.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 pr-4 text-gray-700 leading-snug">
                      {row.label}
                    </td>
                    <td className="py-4 px-3 text-center text-gray-600">
                      {row.cible}
                    </td>
                    <td
                      className={`py-4 px-3 text-center font-semibold ${
                        row.ok ? "text-blue-700" : "text-red-500"
                      }`}
                    >
                      {row.valeur}
                    </td>
                    <td className="py-4 px-3 text-center text-gray-500">
                      {row.frequence}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span
                        className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                          row.ok
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {row.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-1">
          {[
            "Ajouter des indicateurs",
            "Améliorer les NOK",
            "Exporter en Word",
          ].map((label) => (
            <button
              key={label}
              onClick={() => setActiveAction(label)}
              className={`text-sm px-4 py-2 rounded-xl border transition-all duration-150 font-medium
                ${
                  activeAction === label
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800"
                }`}
            >
              {label} ↗
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}