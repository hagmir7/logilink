import { DatePicker } from "antd";
import ServiceDistribution from "../components/charts/ServiceDistribution";
import { api } from "../utils/api";
import { useEffect, useState } from "react";
import { BadgeEuro, ClockFading, Network, Users } from "lucide-react";
import MonthlyPurchases from "../components/charts/MonthlyPurchases";
import ServiceExpenditures from "../components/charts/ServiceExpenditures";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const formatMAD = (value) =>
    new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
        maximumFractionDigits: 0,
    }).format(value);

const Skeleton = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`} />
);

const StatCard = ({ title, value, percentage, positive, icon, iconBg, iconColor, loading }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex justify-between">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBg}`}>
                <div className={`w-6 h-6 ${iconColor}`}>{icon}</div>
            </div>
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-sm h-fit ${
                    positive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                }`}
            >
                {percentage}
            </span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-nowrap">{title}</div>
        {loading ? (
            <Skeleton className="h-6 w-24 mt-2" />
        ) : (
            <h4 className="mt-1 font-bold text-gray-800 text-lg dark:text-white/90 text-nowrap">{value}</h4>
        )}
    </div>
);

const DashboardSection = ({ dates }) => {
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState({
        suppliers: null,
        expenditure: null,
        documents_in_progress: null,
        services: null,
    });

    useEffect(() => {
        api.get("purchase/states")
            .then((res) => setState(res.data))
            .catch((err) => console.error("Failed to fetch purchase states:", err))
            .finally(() => setLoading(false));
    }, []);

    const stats = [
        {
            title: "Demandes en cours",
            value: state.documents_in_progress,
            percentage: "11.01%",
            positive: true,
            icon: <ClockFading />,
            iconBg: "bg-blue-50 dark:bg-blue-900/20",
            iconColor: "text-blue-500",
        },
        {
            title: "Fournisseurs actifs",
            value: state.suppliers,
            percentage: "9.05%",
            positive: false,
            icon: <Users />,
            iconBg: "bg-purple-50 dark:bg-purple-900/20",
            iconColor: "text-purple-500",
        },
        {
            title: "Total Dépense",
            value: state.expenditure != null ? formatMAD(state.expenditure) : null,
            percentage: "5.2%",
            positive: true,
            icon: <BadgeEuro />,
            iconBg: "bg-green-50 dark:bg-green-900/20",
            iconColor: "text-green-500",
        },
        {
            title: "Services",
            value: state.services,
            percentage: "1.2%",
            positive: false,
            icon: <Network />,
            iconBg: "bg-orange-50 dark:bg-orange-900/20",
            iconColor: "text-orange-500",
        },
        {
            title: "Remboursements",
            value: formatMAD(1234),
            percentage: "1.2%",
            positive: false,
            icon: <Network />,
            iconBg: "bg-red-50 dark:bg-red-900/20",
            iconColor: "text-red-500",
        },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 xl:col-span-5 gap-4">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} loading={loading} />
                ))}
            </div>

            <div className="flex gap-2 mt-3">
                <MonthlyPurchases dates={dates} />
                <ServiceDistribution dates={dates} />
            </div>
        </div>
    );
};

export default function PurchaseOverview() {
    const [dates, setDates] = useState([dayjs("2026-01-01"), dayjs()]);

    const handleChangeDate = (range) => {
        if (range) setDates(range);
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-end">
                <RangePicker
                    defaultValue={dates}
                    size="middle"
                    onChange={handleChangeDate}
                    format="DD/MM/YYYY"
                    className="min-w-[160px]"
                />
            </div>
            <DashboardSection dates={dates} />
            <div className="grid grid-cols-2 gap-2">
                <ServiceExpenditures dates={dates} />
                <ServiceExpenditures dates={dates} />
            </div>
        </div>
    );
}