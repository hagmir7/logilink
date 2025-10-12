import { Loader2, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Button, Select, DatePicker, Input, Empty } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import ArchiveTable from '../components/ArchiveTable';

const { Search } = Input;
const { RangePicker } = DatePicker;

function PreparationArchive() {
    const [data, setData] = useState({ data: [], next_page_url: null, total: 0 });
    const [loading, setLoading] = useState(false);
    const [documenType, setDocumentType] = useState(1);
    const [page, setPage] = useState(1);
    const [moreSpinner, setMoreSpinner] = useState(false);
    const [searchSpinner, setSearchSpinner] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState(null);

    const navigate = useNavigate();
    const { roles } = useAuth();

    const buildUrl = (pageNumber = 1, search = searchTerm) => {
        const queryParams = new URLSearchParams();
        if (documenType) queryParams.append('type', documenType);
        if (dateFilter?.length) queryParams.append('date', dateFilter.join(','));
        if (search) queryParams.append('search', search);
        if (pageNumber) queryParams.append('page', pageNumber);
        return `documents/archive?${queryParams.toString()}`;
    };

    const fetchData = async (pageNumber = 1, search = searchTerm) => {
        setLoading(true);
        try {
            const response = await api.get(buildUrl(pageNumber, search));
            setData(response.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAndNotify = async () => {
            await fetchData();
            window.electron?.notifyPrintReady?.();
        };
        fetchAndNotify();
        const intervalId = setInterval(fetchAndNotify, 40000);
        return () => clearInterval(intervalId);
    }, [documenType, dateFilter]);

    const loadMore = async () => {
        if (!data.next_page_url) return;
        setMoreSpinner(true);
        const nextPage = page + 1;
        setPage(nextPage);

        try {
            const response = await api.get(buildUrl(nextPage));
            setData({
                data: [...data.data, ...response.data.data],
                next_page_url: response.data.next_page_url,
                total: response.data.total,
            });
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setMoreSpinner(false);
        }
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSearchSpinner(true);

        try {
            const response = await api.get(buildUrl(1, value));
            setData(response.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setSearchSpinner(false);
        }
    };

    const handleChangeDate = (dates) => {
        if (dates && dates.length === 2) {
            setDateFilter(dates.map((d) => dayjs(d).format('YYYY-MM-DD')));
        } else {
            setDateFilter([]);
        }
    };

    const handleSelectOrder = (orderId) => {
        navigate(`/layout/document/${orderId}`);
    };

    return (
        <div className='min-h-screen'>
            {/* Title */}
            <h2 className='text-lg font-semibold text-gray-800 mb-1 p-2 md:p-4'>
                Historique de PL et BL
            </h2>

            {/* Header */}
            <div className='flex flex-wrap justify-between items-center gap-4 mb-4 px-2 md:px-4'>
                <div className='flex items-center gap-4'>
                    <div className='hidden md:block'>
                        <Search
                            placeholder='Recherch'
                            loading={searchSpinner}
                            size='large'
                            onChange={handleSearch}
                        />
                    </div>

                    <div className='hidden md:block'>
                        <RangePicker
                            size='large'
                            onChange={handleChangeDate}
                            className='min-w-[220px]'
                        />
                    </div>

                    {roles('commercial') && (
                        <Select
                            defaultValue={documenType}
                            className='min-w-[220px] block md:hidden'
                            size='large'
                            onChange={(value) => setDocumentType(value)}
                            options={[
                                {value: 1, label: 'Bonne de preparation'},
                                {value: 2, label: 'Bonne de livraison'},
                            ]}
                        />
                    )}

                    <Button onClick={() => fetchData()} size='large'>
                        {loading ? (
                            <Loader2 className='animate-spin text-blue-500' size={17} />
                        ) : (
                            <RefreshCcw size={17} />
                        )}
                        <span className='hidden sm:inline'>Rafraîchir</span>
                    </Button>
                </div>
            </div>
           <ArchiveTable documents={data.data} onSelectOrder={handleSelectOrder}  documentType={documenType}/>

            {data.next_page_url && (
                <div className='flex justify-center py-6'>
                    <Button
                        onClick={loadMore}
                        type='primary'
                        loading={moreSpinner}
                        iconPosition='end'
                    >
                        Charger Plus
                    </Button>
                </div>
            )}

            {data.data.length === 0 && !loading && (
                <Empty className='mt-10' description='Aucun document à afficher' />
            )}
        </div>
    );
}

export default PreparationArchive;
