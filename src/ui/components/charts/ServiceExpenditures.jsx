import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import axios from "axios";
import dayjs from "dayjs";
import { api } from "../../utils/api";

const formatMAD = (value) =>
    new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
        maximumFractionDigits: 0,
    }).format(value);

const Skeleton = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
);

const DEFAULT_DATES = [dayjs("2026-01-01"), dayjs()];

const ServiceExpenditures = ({ dates }) => {
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(true);

    // fallback to default if dates is null/undefined/incomplete
    const activeDates = dates?.length === 2 ? dates : DEFAULT_DATES;

    useEffect(() => {
        setLoading(true);
        api.get("purchase/service-expenditures", {
            params: {
                start: activeDates[0].format("YYYYMMDD"),
                end:   activeDates[1].format("YYYYMMDD"),
            },
        })
        .then(({ data }) => setData(data))
        .finally(() => setLoading(false));
    }, [activeDates[0].format("YYYYMMDD"), activeDates[1].format("YYYYMMDD")]);

    const categories = data.map((item) => item.service_name);
    const seriesData = data.map((item) => item.total_ttc);

    const options = {
        chart: { type: "bar", toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
        dataLabels: { enabled: false },
        xaxis: {
            categories,
            labels: { formatter: (val) => formatMAD(val) },
        },
        tooltip: {
            y: {
                formatter: (val, opts) => {
                    const item = data[opts.dataPointIndex];
                    return `${formatMAD(val)} — ${item?.total_documents} documents`;
                },
            },
        },
        colors: ["#3b82f6"],
    };

    const series = [{ name: "Total TTC", data: seriesData }];

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2 px-3 pt-2">
                Achats par service
            </h3>

            {loading ? (
                <div className="p-4 space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-7 rounded" style={{ width: `${85 - i * 10}%` }} />
                    ))}
                </div>
            ) : (
                <Chart options={options} series={series} type="bar" height={350} />
            )}
        </div>
    );
};

export default ServiceExpenditures;