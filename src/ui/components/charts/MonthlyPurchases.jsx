import React, { useEffect, useState } from 'react'
import Chart from "react-apexcharts";
import axios from 'axios';
import { api } from '../../utils/api';


const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export default function MonthlyPurchases() {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [countData, setCountData] = useState([]);
    const [ttcData, setTtcData] = useState([]);

    useEffect(() => {
        api.get('purchase/monthly-purchases')
            .then(({ data }) => {
                setCategories(data.map(row => `${MONTH_NAMES[row.month - 1]} ${row.year}`));
                setCountData(data.map(row => row.total_documents));
                setTtcData(data.map(row => row.total_ttc));
            })
            .finally(() => setLoading(false));
    }, []);

    const chartOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
            stacked: false,
        },
        plotOptions: {
            bar: { borderRadius: 4, columnWidth: "50%", dataLabels: { position: 'top' } }
        },
        dataLabels: { enabled: false },
        xaxis: { categories },
        yaxis: [
            {
                seriesName: "Nombre d'achats",
                // title: { text: "Documents" },
                labels: {
                    formatter: (val) => Math.round(val),
                },
            },
            {
                seriesName: "Total TTC",
                opposite: true,
                // title: { text: "Total TTC (MAD)" },
                labels: {
                    formatter: (val) => new Intl.NumberFormat('fr-MA', {
                        notation: 'compact',
                        compactDisplay: 'short'
                    }).format(val)
                },
            },
        ],
        tooltip: {
            shared: true,
            intersect: false,
            y: [
                {
                    formatter: (val) => `${val}`,
                },
                {
                    formatter: (val) => new Intl.NumberFormat('fr-MA', {
                        style: 'currency',
                        currency: 'MAD'
                    }).format(val),
                },
            ]
        },
        colors: ['#3b82f6', '#e2e8f0'],
        legend: { position: 'top' },
    };

    const chartSeries = [
        { name: "Nombre d'achats", type: "bar", data: countData },
        { name: "Total TTC",           type: "bar", data: ttcData  },
    ];

    return (
        <div className="overflow-hidden rounded-2xl w-[60%] border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2 px-2 pt-2">
                Achats mensuels
            </h3>

            {loading ? (
                <div className="flex items-center justify-center h-48 text-gray-400">
                    Chargement...
                </div>
            ) : (
                <Chart options={chartOptions} series={chartSeries} type="bar" />
            )}
        </div>
    );
}