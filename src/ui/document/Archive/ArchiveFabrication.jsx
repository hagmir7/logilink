
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChartPie, CircleCheck, Files, RefreshCcw } from 'lucide-react';
import { Alert, Button, DatePicker, Empty, Input, Select, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import ArchiveTable from '../../components/ArchiveTable';

const { Search } = Input;
const { RangePicker } = DatePicker;

const EMPTY_DATA = { data: [], next_page_url: null, total: 0, total_count: null, on_time: null, late: null };

function StatCard({ icon, label, value, bg, color }) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: bg, color }}>{icon}</div>
            <div className="min-w-0">
                <p className="m-0 text-sm text-gray-500 p-0" style={{padding: 0, margin:0}}>{label}</p>
                <p className="m-0 text-2xl font-semibold text-gray-900 p-0" style={{padding: 0, margin:0}}>{value ?? '—'}</p>
            </div>
        </div>
    );
}

export default function ArchiveFabrication() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();

    const [data, setData] = useState(EMPTY_DATA);
    const [companies, setCompanies] = useState([]);
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companyId, setCompanyId] = useState(null);
    const [search, setSearch] = useState('');
    const [dates, setDates] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [moreLoading, setMoreLoading] = useState(false);
    const [error, setError] = useState(null);

    const requestId = useRef(0);
    const loadingMoreRef = useRef(false);

    useEffect(() => {
        if (user === undefined) return;
        setCompanyId(current => current ?? (user?.company_id ? String(user.company_id) : 'all'));
    }, [user]);

    useEffect(() => {
        let active = true;
        setCompanyLoading(true);

        api.get('companies').then(response => {
            const payload = response.data;
            const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.data?.data) ? payload.data.data : [];
            if (active) setCompanies(list);
        }).catch(error => {
            console.error('Companies API:', error);
            if (active) messageApi.error('Impossible de charger les sociétés.');
        }).finally(() => {
            if (active) setCompanyLoading(false);
        });

        return () => { active = false; };
    }, [messageApi]);

    const fetchData = useCallback(async (pageNumber = 1, append = false) => {
        if (companyId === null || (append && loadingMoreRef.current)) return;

        const id = ++requestId.current;
        if (append) {
            loadingMoreRef.current = true;
            setMoreLoading(true);
        } else {
            setLoading(true);
        }

        try {
            const params = { page: pageNumber, company: companyId };
            if (search.trim()) params.search = search.trim();
            if (dates.length === 2) params.date = dates.join(',');

            const response = await api.get('archives/fabrication', { params });
            if (id !== requestId.current) return;

            const result = response.data;
            setData(prev => ({ ...result, data: append ? [...prev.data, ...(result.data || [])] : (result.data || []) }));
            setPage(pageNumber);
            setError(null);
        } catch (err) {
            if (id !== requestId.current) return;
            const payload = err.response?.data;
            const text = payload?.errors ? Object.values(payload.errors).flat().join(' ') : payload?.message || 'Erreur lors du chargement des archives.';
            setError(text);
            messageApi.error(text);
        } finally {
            if (id === requestId.current) {
                setLoading(false);
                setMoreLoading(false);
                loadingMoreRef.current = false;
            }
        }
    }, [companyId, search, dates, messageApi]);

    useEffect(() => {
        if (companyId === null) return;
        setData(EMPTY_DATA);
        setPage(1);

        const timeout = setTimeout(() => fetchData(1), search ? 350 : 0);
        const interval = setInterval(() => fetchData(1), 100000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
            requestId.current++;
        };
    }, [fetchData, companyId, search]);

    const loadMore = async () => {
        if (!data.next_page_url || loading || loadingMoreRef.current) return;
        await fetchData(page + 1, true);
    };

    const companyOptions = [
        { value: 'all', label: 'Toutes les sociétés' },
        ...companies.filter(c => c.id != null).map(c => ({
            value: String(c.id),
            label: c.name || c.label || c.raison_sociale || `Société ${c.id}`,
        })),
    ];

    const total = data.total_count ?? data.total;
    const onTime = data.on_time;
    const late = data.late;
    const measured = Number(onTime ?? 0) + Number(late ?? 0);
    const rate = onTime != null && late != null && measured > 0 ? `${Math.round(Number(onTime) / measured * 100)}%` : '—';

    return (
        <div className="min-h-screen">
            {contextHolder}

            <h2 className="mx-3 mb-3 p-2 text-lg font-semibold text-gray-800 md:p-1">Archives fabrication</h2>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 px-2 md:px-4">
                <Search placeholder="Rechercher..." value={search} allowClear onChange={e => setSearch(e.target.value)} style={{ width: 300 }} className="max-w-full" />

                <RangePicker className="w-full sm:w-[230px]" onChange={values => setDates(values?.length === 2 ? values.map(d => dayjs(d).format('YYYY-MM-DD')) : [])} />

                <Select showSearch optionFilterProp="label" value={companyId} onChange={setCompanyId} loading={companyLoading} options={companyOptions} className="w-full sm:w-[230px]" placeholder="Société" />

                <Button icon={<RefreshCcw size={16} />} loading={loading} onClick={() => fetchData(1)}>Rafraîchir</Button>
            </div>

            {error && (
                <div className="mb-4 px-2 md:px-4">
                    <Alert type="error" showIcon closable message="Erreur de chargement" description={error} onClose={() => setError(null)} />
                </div>
            )}

            {/* Fabrication statistics */}
            <div className="grid grid-cols-2 gap-3 px-2 pb-5 md:grid-cols-4 md:px-4">
                <StatCard icon={<Files size={20} />} label="Total documents" value={total} bg="#E6F1FB" color="#185FA5" />
                <StatCard icon={<CircleCheck size={20} />} label="Libérés à temps" value={onTime} bg="#EAF3DE" color="#3B6D11" />
                <StatCard icon={<AlertCircle size={20} />} label="Libérés en retard" value={late} bg="#FCEBEB" color="#A32D2D" />
                <StatCard icon={<ChartPie size={20} />} label="Taux à temps" value={rate} bg="#EAF3DE" color="#3B6D11" />
            </div>

            {/* Documents with per-row fabrication status */}
            {loading && data.data.length === 0 ? (
                <div className="flex justify-center py-12"><Spin size="large" /></div>
            ) : (
                <ArchiveTable
                    documents={data.data}
                    documentType={null}
                    archiveType="fabrication"
                    companyId={companyId}
                    loading={loading}
                    onSelectOrder={id => navigate(`/layout/document/${id}`)}
                />
            )}

            {/* Pagination */}
            {data.next_page_url && (
                <div className="flex justify-center py-6">
                    <Button type="primary" loading={moreLoading} onClick={loadMore}>Charger plus</Button>
                </div>
            )}

            {!loading && !error && data.data.length === 0 && (
                <Empty className="mt-10" description="Aucun document à afficher" />
            )}
        </div>
    );
}
