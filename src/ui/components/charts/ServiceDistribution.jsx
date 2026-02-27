import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { api } from "../../utils/api";

const COLORS = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#14B8A6", "#F472B6", "#F97316", "#EAB308", "#6366F1",
    "#22D3EE", "#F43F5E", "#A3E635", "#636363", "#B91C1C"
];

const ServiceDistribution = () => {
    const [loading, setLoading] = useState(true);
    const [serviceData, setServiceData] = useState([]);

    useEffect(() => {
        api.get('purchase/count-document-service')
            .then(({ data }) => setServiceData(data))
            .finally(() => setLoading(false));
    }, []);

    const series = serviceData.map(item => Number(item.total));
    const labels = serviceData.map(item => item.service_name);

    const options = {
        chart: { type: "donut", animations: { enabled: true, easing: "easeinout", speed: 800 } },
        labels,
        colors: COLORS.slice(0, serviceData.length),
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
                    const percent = serviceData[opts.seriesIndex]?.percent;
                    return `${val} Demandes (${percent}%)`;
                },
            },
        },
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl w-[40%]">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2 px-3 pt-2">
                Distribution de services
            </h2>

            {loading ? (
                <div className="flex items-center justify-center h-48 text-gray-400">
                    Chargement...
                </div>
            ) : (
                <Chart options={options} series={series} type="donut" />
            )}
        </div>
    );
};

export default ServiceDistribution;