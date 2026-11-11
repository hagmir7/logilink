
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DatePicker, Empty, Input, Select, Alert, message } from 'antd';
import { RefreshCcw } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '../../utils/api';
import ArchiveTable from '../../components/ArchiveTable';

const { Search } = Input;
const { RangePicker } = DatePicker;

export default function ArchiveGlobal() {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

    const [data, setData] = useState({ data: [], next_page_url: null, total: 0 });
    const [loading, setLoading] = useState(false);
    const [moreLoading, setMoreLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [documentType, setDocumentType] = useState(null);
    const [dates, setDates] = useState([]);
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);

    const requestId = useRef(0);
    const loadingMore = useRef(false);

    const fetchData = useCallback(async (pageNumber = 1, append = false) => {
        if (append && loadingMore.current) return false;

        const id = ++requestId.current;

        if (append) {
            loadingMore.current = true;
            setMoreLoading(true);
        } else {
            setLoading(true);
        }

        setError(null);

        try {
            const params = { page: pageNumber };
            if (documentType !== null) params.type = documentType;
            if (search.trim()) params.search = search.trim();
            if (dates.length === 2) params.date = dates.join(',');

            const response = await api.get('archives/global', { params });
            if (id !== requestId.current) return false;

            const result = response.data;
            setData(prev => ({
                ...result,
                data: append ? [...prev.data, ...(result.data || [])] : (result.data || []),
            }));

            setPage(pageNumber);
            return true;
        } catch (err) {
            if (id !== requestId.current) return false;

            const payload = err.response?.data;
            const text = payload?.errors ? Object.values(payload.errors).flat().join(' ') : payload?.message || 'Erreur lors du chargement des archives.';

            console.error('Global archive error:', payload || err);
            setError(text);
            messageApi.error(text);
            return false;
        } finally {
            if (id === requestId.current) setLoading(false);
            if (append) {
                loadingMore.current = false;
                setMoreLoading(false);
            }
        }
    }, [documentType, search, dates, messageApi]);

    useEffect(() => {
        setData({ data: [], next_page_url: null, total: 0 });
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

    const handleDates = values => setDates(values?.length === 2 ? values.map(d => dayjs(d).format('YYYY-MM-DD')) : []);

    return (
        <div className="min-h-screen">
            {contextHolder}

            <h2 className="mx-3 mb-3 p-2 text-lg font-semibold text-gray-800 md:p-1">Archives globales</h2>

            <div className="mb-4 flex flex-wrap items-center gap-3 px-2 md:px-4">
                <Search placeholder="Rechercher un document..." value={search} allowClear onChange={e => setSearch(e.target.value)} style={{ width: 300, maxWidth: '100%' }} />

                <RangePicker className="w-full sm:w-[230px]" onChange={handleDates} />

                <Button icon={<RefreshCcw size={16} />} loading={loading} onClick={() => fetchData(1)}>Rafraîchir</Button>
            </div>

            {error && (
                <div className="mb-4 px-2 md:px-4">
                    <Alert type="error" showIcon closable message="Erreur de chargement" description={error} onClose={() => setError(null)} />
                </div>
            )}

            <ArchiveTable
                documents={data.data}
                documentType={documentType}
                archiveType="global"
                loading={loading}
                onSelectOrder={id => navigate(`/layout/document/${id}`)}
                meta={data}
            />

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
