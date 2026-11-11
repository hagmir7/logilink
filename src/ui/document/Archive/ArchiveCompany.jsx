
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button, Select, DatePicker, Input, Empty, Alert, message } from 'antd';
import dayjs from 'dayjs';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import ArchiveTable from '../../components/ArchiveTable';

const { Search } = Input;
const { RangePicker } = DatePicker;

const EMPTY_DATA = { data: [], next_page_url: null, total: 0 };

export default function ArchiveCompany() {
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
    const loadingMore = useRef(false);

    // Select the user's company, otherwise all companies.
    useEffect(() => {
        if (user === undefined) return;
        setCompanyId(current => current ?? (user?.company_id ? String(user.company_id) : 'all'));
    }, [user]);

    // Load companies.
    useEffect(() => {
        let active = true;
        setCompanyLoading(true);

        api.get('companies').then(response => {
            const payload = response.data;
            const list = Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload?.data?.data)
                        ? payload.data.data
                        : [];

            if (active) setCompanies(list);
        }).catch(err => {
            console.error('Companies API error:', err);
            if (active) messageApi.error('Impossible de charger les sociétés.');
        }).finally(() => {
            if (active) setCompanyLoading(false);
        });

        return () => { active = false; };
    }, [messageApi]);

    const fetchData = useCallback(async (pageNumber = 1, append = false) => {
        if (companyId === null || (append && loadingMore.current)) return false;

        const currentRequest = ++requestId.current;

        if (append) {
            loadingMore.current = true;
            setMoreLoading(true);
        } else {
            setLoading(true);
        }

        setError(null);

        try {
            const params = { page: pageNumber, company: companyId };

            if (search.trim()) params.search = search.trim();
            if (dates.length === 2) params.date = dates.join(',');

            const response = await api.get('archives/company', { params });
            if (currentRequest !== requestId.current) return false;

            const result = response.data;

            setData(prev => ({
                ...result,
                data: append ? [...prev.data, ...(result.data || [])] : (result.data || []),
            }));

            setPage(pageNumber);
            return true;
        } catch (err) {
            if (currentRequest !== requestId.current) return false;

            const payload = err.response?.data;
            const validation = payload?.errors ? Object.values(payload.errors).flat().join(' ') : null;
            const text = validation || payload?.message || 'Erreur lors du chargement des archives société.';

            console.error('Archive company error:', { status: err.response?.status, response: payload });
            setError(text);
            messageApi.error(text);
            return false;
        } finally {
            if (currentRequest === requestId.current) {
                setLoading(false);
                setMoreLoading(false);
                loadingMore.current = false;
            }
        }
    }, [companyId, search, dates, messageApi]);

    // Reload when filters change and refresh every 100 seconds.
    useEffect(() => {
        if (companyId === null) return;

        setData(EMPTY_DATA);
        setPage(1);

        const timer = setTimeout(() => {
            fetchData(1).then(ok => {
                if (ok) window.electron?.notifyPrintReady?.();
            });
        }, search ? 350 : 0);

        const interval = setInterval(() => fetchData(1), 100000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
            requestId.current++;
        };
    }, [fetchData]);

    const loadMore = async () => {
        if (!data.next_page_url || loading || loadingMore.current) return;
        await fetchData(page + 1, true);
    };

    const companyOptions = [
        { value: 'all', label: 'Toutes les sociétés' },
        ...companies.filter(c => c.id != null).map(c => ({
            value: String(c.id),
            label: c.name || c.label || c.raison_sociale || `Société ${c.id}`,
        })),
    ];

    return (
        <div className="min-h-screen">
            {contextHolder}

            <h2 className="mx-3 mb-3 p-2 text-lg font-semibold text-gray-800 md:p-1">
                Archives société
            </h2>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3 px-2 md:px-4">
                <Search
                    placeholder="Rechercher un document..."
                    value={search}
                    allowClear
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: 300, maxWidth: '100%' }}
                />

                <RangePicker
                    className="w-full sm:w-[230px]"
                    onChange={values => setDates(values?.length === 2 ? values.map(d => dayjs(d).format('YYYY-MM-DD')) : [])}
                />

                <Select
                    showSearch
                    optionFilterProp="label"
                    disabled={companyId}
                    value={companyId}
                    onChange={setCompanyId}
                    loading={companyLoading}
                    options={companyOptions}
                    placeholder="Sélectionner une société"
                    className="w-full sm:w-[230px]"
                />

                <Button
                    icon={<RefreshCcw size={16} />}
                    loading={loading}
                    onClick={() => fetchData(1)}
                >
                    Rafraîchir
                </Button>
            </div>

            {/* Errors */}
            {error && (
                <div className="mb-4 px-2 md:px-4">
                    <Alert
                        type="error"
                        showIcon
                        closable
                        message="Erreur de chargement"
                        description={error}
                        onClose={() => setError(null)}
                    />
                </div>
            )}

            {/* Documents */}
            <ArchiveTable
                documents={data.data}
                documentType={null}
                archiveType="company"
                companyId={companyId}
                loading={loading}
                meta={data}
            />

            {/* Pagination */}
            {data.next_page_url && (
                <div className="flex justify-center py-6">
                    <Button type="primary" loading={moreLoading} onClick={loadMore}>
                        Charger plus
                    </Button>
                </div>
            )}

            {!loading && !error && data.data.length === 0 && (
                <Empty className="mt-10" description="Aucun document à afficher" />
            )}
        </div>
    );
}
