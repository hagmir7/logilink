import Chart from "react-apexcharts";

const serviceData = [
    { service_id: null, service_name: "Sans service", total: "26", percent: 59.09 },
    { service_id: "1", service_name: "Marketing", total: "17", percent: 38.64 },
    { service_id: "3", service_name: "Stock", total: "1", percent: 2.27 },
];

const ServiceDistribution = () => {
    const series = serviceData.map(item => Number(item.total));
    const labels = serviceData.map(item => item.service_name);

    const options = {
        chart: { type: "donut", animations: { enabled: true, easing: "easeinout", speed: 800 } },
        labels: labels,
        colors: [
            "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
            "#14B8A6", "#F472B6", "#F97316", "#EAB308", "#6366F1",
            "#22D3EE", "#F43F5E", "#A3E635", "#636363", "#B91C1C"
        ],
        plotOptions: {
            pie: {
                donut: {
                    size: "65%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            fontSize: "18px",
                            fontWeight: 600,
                            formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
                        },
                    },
                },
            },
        },
        dataLabels: { enabled: true, style: { fontSize: "14px" } },
        legend: { position: "bottom", fontSize: "14px" },
        tooltip: {
            y: {
                formatter: (val, opts) => {
                    const percent = serviceData[opts.seriesIndex].percent;
                    return `${val} Domands (${percent}%)`;
                },
            },
        },
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl w-[40%]">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2 px-3 pt-2">
                Distribution de services
            </h2>
            <Chart options={options} series={series} type="donut" />
        </div>
    );
};

export default ServiceDistribution;