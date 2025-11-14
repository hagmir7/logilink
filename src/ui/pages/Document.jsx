import { Loader2, RefreshCcw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import DocumentCard from '../components/ui/DocumentCard';
import { Button, Select, DatePicker, Input, Empty } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import DocumentTable from '../components/DocumentTable';
import dayjs from 'dayjs';
import PreparationDocumentTable from '../components/PreparationDocumentTable';

const { Search } = Input;
const { RangePicker } = DatePicker;

function Document() {
  const [data, setData] = useState({ data: [], next_page_url: null, total: 0 });
  const [loading, setLoading] = useState(false);
  const [documenType, setDocumentType] = useState(2);
  const [documenStatus, setDocumentStatus] = useState('');
  const [page, setPage] = useState(1);
  const [moreSpinner, setMoreSpinner] = useState(false);
  const [searchSpinner, setSearchSpinner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(null);

  const navigate = useNavigate();
  const { roles } = useAuth();

  // Build the API URL dynamically
  const buildUrl = (pageNumber = 1, search = searchTerm) => {
    const queryParams = new URLSearchParams();
    if (documenType) queryParams.append('type', documenType);
    if (documenStatus) queryParams.append('status', documenStatus);
    if (dateFilter?.length) queryParams.append('date', dateFilter.join(','));
    if (search) queryParams.append('search', search);
    if (pageNumber) queryParams.append('page', pageNumber);

    let url = 'documents/preparation-list';
    if (roles('commercial')) url = 'docentetes/commercial';

    return `${url}?${queryParams.toString()}`;
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
  }, [documenType, documenStatus, dateFilter]);

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
        
      </h2>

      {/* Header */}
      <div className='flex flex-wrap justify-between items-center gap-4 mb-2 px-2 md:px-4'>
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
              defaultValue=''
              className='min-w-[220px] block md:hidden'
              size='large'
              onChange={(value) => setDocumentStatus(value)}
              options={[
                { value: '', label: 'Tout' },
                { value: '0', label: 'En attente' },
                { value: '1', label: 'Transféré' },
                { value: '2', label: 'Reçu' },
                { value: '3', label: 'Fabrication' },
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

      {/* Tables / Cards */}
      {roles('commercial') && (
        <DocumentTable
          documents={data.data}
          onSelectOrder={handleSelectOrder}
        />
      )}

      {(roles('preparation') || roles('montage') || roles('fabrication')) && (
        <PreparationDocumentTable
          // loading={loading}
          documents={data.data}
          onSelectOrder={handleSelectOrder}
        />
      )}

      {(roles('preparation_cuisine') ||
        roles('preparation_trailer') ||
        roles('magasinier')) && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 md:p-4'>
          {data.data.length > 0
            ? data.data.map((item, index) => (
                <DocumentCard
                  key={index}
                  data={item}
                  loading={loading}
                  onSelectOrder={handleSelectOrder}
                />
              ))
            : null}
        </div>
      )}

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
  )
}

export default Document;
