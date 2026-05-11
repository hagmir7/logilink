import { AlertCircle, ChartPie, CircleCheck, Files, Loader2, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Button, Select, DatePicker, Input, Empty } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import ArchiveTable from '../components/ArchiveTable';

const { Search } = Input;
const { RangePicker } = DatePicker;

const StatCard = ({
    icon,
    label,
    value,
    iconBg,
    iconColor,
    valueColor,
}) => (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-white p-2">
        <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
            style={{
                backgroundColor: iconBg,
                color: iconColor,
            }}
        >
            {icon}
        </div>

        <div>
            <p className="mb-0.5 text-sm text-gray-500 p-0 m-0" style={{
                color: valueColor || '#111827', padding: 0, margin: 0
            }}>{label}</p>

            <p
                className="text-2xl font-semibold p-0 m-0"
                style={{
                    color: valueColor || '#111827', padding: 0, margin: 0
                }}
            >
                {value ?? '—'}
            </p>
        </div>
    </div>
);

function PreparationArchive() {
    const [data, setData] = useState({
        data: [],
        next_page_url: null,
        total: 0,
        total_count: null,
        on_time: null,
        late: null,
    });

    const [loading, setLoading] = useState(false);
    const [documentType, setDocumentType] = useState(1);
    const [page, setPage] = useState(1);
    const [moreSpinner, setMoreSpinner] = useState(false);
    const [searchSpinner, setSearchSpinner] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState([]);

    const navigate = useNavigate();

    const { roles = [] } = useAuth();

    const isFabrication = roles('fabrication');

    const buildUrl = (pageNumber = 1, search = searchTerm) => {
        const queryParams = new URLSearchParams();

        if (documentType) {
            queryParams.append('type', documentType);
        }

        if (dateFilter?.length) {
            queryParams.append('date', dateFilter.join(','));
        }

        if (search) {
            queryParams.append('search', search);
        }

        queryParams.append('page', pageNumber);

        return `documents/archive?${queryParams.toString()}`;
    };

    const fetchData = async (
        pageNumber = 1,
        search = searchTerm,
        append = false
    ) => {
        try {
            if (append) {
                setMoreSpinner(true);
            } else {
                setLoading(true);
            }

            const response = await api.get(buildUrl(pageNumber, search));

            if (append) {
                setData((prev) => ({
                    ...response.data,
                    data: [...prev.data, ...response.data.data],
                }));
            } else {
                setData(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
            setMoreSpinner(false);
            setSearchSpinner(false);
        }
    };

    useEffect(() => {
        const fetchAndNotify = async () => {
            await fetchData();

            window.electron?.notifyPrintReady?.();
        };

        fetchAndNotify();

        const intervalId = setInterval(fetchAndNotify, 100000);

        return () => clearInterval(intervalId);
    }, [documentType, dateFilter]);

    const loadMore = async () => {
        if (!data.next_page_url) return;

        const nextPage = page + 1;

        setPage(nextPage);

        await fetchData(nextPage, searchTerm, true);
    };

    const handleSearch = async (e) => {
        const value = e.target.value;

        setSearchTerm(value);
        setPage(1);
        setSearchSpinner(true);

        await fetchData(1, value);
    };

    const handleChangeDate = (dates) => {
        if (dates && dates.length === 2) {
            setDateFilter(
                dates.map((date) => dayjs(date).format('YYYY-MM-DD'))
            );
        } else {
            setDateFilter([]);
        }

        setPage(1);
    };

    const handleSelectOrder = (orderId) => {
        navigate(`/layout/document/${orderId}`);
    };

    const onTimeRate = data.total_count
        ? Math.round((data.on_time / (data.on_time + data.late)) * 100)
        : null;

    return (
        <div className="min-h-screen">
            {/* Title */}
            <h2 className="mx-3 mb-1 p-2 text-lg font-semibold text-gray-800 md:p-1">
                Commandes archivées
            </h2>

            {/* Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 px-2 md:px-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="hidden md:block">
                        <Search
                            placeholder="Recherche"
                            loading={searchSpinner}
                            size="large"
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="hidden md:block">
                        <RangePicker
                            size="large"
                            onChange={handleChangeDate}
                            className="min-w-[220px]"
                        />
                    </div>

                    {roles('commercial') && (
                        <Select
                            value={documentType}
                            size="large"
                            onChange={(value) => {
                                setDocumentType(value);
                                setPage(1);
                            }}
                            className="block min-w-[220px] md:hidden"
                            options={[
                                {
                                    value: 1,
                                    label: 'Bon de préparation',
                                },
                                {
                                    value: 2,
                                    label: 'Bon de livraison',
                                },
                            ]}
                        />
                    )}

                    <Button
                        size="large"
                        onClick={() => {
                            setPage(1);
                            fetchData();
                        }}
                    >
                        {loading ? (
                            <Loader2
                                size={17}
                                className="animate-spin text-blue-500"
                            />
                        ) : (
                            <RefreshCcw size={17} />
                        )}

                        <span className="hidden sm:inline">
                            Rafraîchir
                        </span>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            {isFabrication && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 pb-5">
                    <StatCard
                        icon={<Files size={20} />}
                        label="Total documents"
                        value={data.total_count}
                        iconBg="#E6F1FB"
                        iconColor="#185FA5"
                    />

                    <StatCard
                        icon={<CircleCheck size={20} />}
                        label="Libérés à temps"
                        value={data.on_time}
                        iconBg="#EAF3DE"
                        iconColor="#3B6D11"
                        valueColor="#3B6D11"
                    />

                    <StatCard
                        icon={<AlertCircle size={20} />}
                        label="Libérés en retard"
                        value={data.late}
                        iconBg="#FCEBEB"
                        iconColor="#A32D2D"
                        valueColor="#A32D2D"
                    />

                    <StatCard
                        icon={<ChartPie size={20} />}
                        label="Taux à temps"
                        value={onTimeRate !== null ? `${onTimeRate}%` : '—'}
                        iconBg="#EAF3DE"
                        iconColor="#3B6D11"
                        valueColor="#3B6D11"
                    />
                </div>
            )}

            <ArchiveTable
                documents={data.data}
                onSelectOrder={handleSelectOrder}
                documentType={documentType}
                meta={data}
            />

            {data.next_page_url && (
                <div className="flex justify-center py-6">
                    <Button
                        type="primary"
                        onClick={loadMore}
                        loading={moreSpinner}
                    >
                        Charger Plus
                    </Button>
                </div>
            )}

            {data.data.length === 0 && !loading && (
                <Empty
                    className="mt-10"
                    description="Aucun document à afficher"
                />
            )}
        </div>
    );
}

export default PreparationArchive;