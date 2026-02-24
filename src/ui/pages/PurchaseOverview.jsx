import { DatePicker } from "antd";
import Chart from "react-apexcharts";
import { Pie, Column } from "@ant-design/plots";
import ServiceDistribution from "../components/charts/ServiceDistribution";
const { RangePicker } = DatePicker;

// Reusable StatCard
const StatCard = ({ title, value, percentage, positive }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
      <div className="w-6 h-6 bg-gray-400 rounded-full" />
    </div>
    <div className="flex items-end justify-between mt-4">
      <div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <h4 className="mt-1 font-bold text-gray-800 text-lg dark:text-white/90">{value}</h4>
      </div>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-sm ${
          positive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}
      >
        {percentage}
      </span>
    </div>
  </div>
);



// Country Sales Chart
const CountrySalesChart = () => {
  const options = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: [
        "South Korea",
        "Canada",
        "United Kingdom",
        "Netherlands",
        "Italy",
        "France",
        "Japan",
        "United States",
        "China",
        "Germany",
      ],
    },
  };

  const series = [
    {
      name: "Sales",
      data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380],
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mt-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2 px-3 pt-2">
        Achats par service
      </h3>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
};

// Dashboard Section
const DashboardSection = () => {
  const stats = [
    { title: "Demandes en cours", value: "3,782", percentage: "11.01%", positive: true },
    { title: "Fournisseurs actifs", value: "5,359", percentage: "9.05%", positive: false },
    { title: "Total Dépense", value: "$23,450", percentage: "5.2%", positive: true },
    { title: "Refunds", value: "$1,234", percentage: "1.2%", positive: false },
    { title: "Refunds", value: "$1,234", percentage: "1.2%", positive: false },
  ];

  const chartOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "40%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"] },
    yaxis: { max: 400 },
  };

  const chartSeries = [{ name: "Sales", data: [168,385,201,298,187,195,291,110,215,390,250] }];

  return (
    <div className="">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 xl:col-span-5 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="flex gap-2 mt-3">
        <div className="overflow-hidden rounded-2xl w-[60%] border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2 px-2 pt-2">
            Achats mensuels
          </h3>
          <Chart options={chartOptions} series={chartSeries} type="bar"  />
        </div>

        <ServiceDistribution />
      </div>
    </div>
  );
};

// Main Component
export default function PurchaseOverview() {
  const handleChangeDate = (dates) => {
    // date filter logic
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end">
        <RangePicker size="middle" onChange={handleChangeDate} className="min-w-[160px]" />
      </div>

      <DashboardSection />

      <div className="grid grid-cols-2 gap-2">
        <CountrySalesChart />
        <CountrySalesChart />
      </div>
    </div>
  );
}