import { Download, Loader2, RefreshCcw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import DocumentCard from '../components/ui/DocumentCard';
import { Button, Select, DatePicker, Input, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import DocumentTable from '../components/DocumentTable';
import dayjs from 'dayjs';
import PreparationDocumentTable from '../components/PreparationDocumentTable';

const { Search } = Input;
const { RangePicker } = DatePicker;

function Document() {
  const [data, setData] = useState({ data: [], next_page_url: null, total: 0 });
  const [loading, setLoading] = useState(false);
  const [documentStatus, setDocumentStatus] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [page, setPage] = useState(1);
  const [moreSpinner, setMoreSpinner] = useState(false);
  const [searchSpinner, setSearchSpinner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState([]);
  const [exportSpin, setExportSpin] = useState(false);
  const [orderBy, setOrderBy] = useState('');
  const [orderDir, setOrderDir] = useState('asc');

  const navigate = useNavigate();
  const { roles = () => false, user } = useAuth();

  const buildParams = (search = searchTerm) => {
    const params = new URLSearchParams();
    if (documentType) params.append('type', documentType);
    if (documentStatus) params.append('status', documentStatus);
    if (dateFilter?.length) params.append('date', dateFilter.join(','));
    if (search) params.append('search', search);
    if (orderBy) params.append('order_by', orderBy);
    if (orderDir) params.append('order_dir', orderDir);
    return params;
  };

  const handleExport = async () => {
    setExportSpin(true);
    try {
      const response = await api.get(
        `documents/preparation/export?${buildParams().toString()}`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', 'preparation_documents.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Export failed');
    } finally {
      setExportSpin(false);
    }
  };

  const buildUrl = (pageNumber = 1, search = searchTerm) => {
    const params = buildParams(search);
    if (pageNumber) params.append('page', pageNumber);

    const url = roles('commercial')
      ? 'docentetes/commercial'
      : 'documents/preparation-list';

    return `${url}?${params.toString()}`;
  };

  const fetchData = async (pageNumber = 1, search = searchTerm) => {
    setLoading(true);
    try {
      const response = await api.get(buildUrl(pageNumber, search));
      setData(response.data);
      setPage(pageNumber);
    } catch (err) {
      const raw = localStorage.getItem('user');
      if (!raw || raw === 'undefined' || raw === 'null') {
        navigate('/login', { replace: true });
      }
      message.error(err?.response?.data?.message || 'Failed to fetch data');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentType, documentStatus, dateFilter, orderBy, orderDir]);

  const loadMore = async () => {
    if (!data.next_page_url) return;
    setMoreSpinner(true);
    const nextPage = page + 1;

    try {
      const response = await api.get(buildUrl(nextPage));
      setData({
        data: [...data.data, ...response.data.data],
        next_page_url: response.data.next_page_url,
        total: response.data.total,
      });
      setPage(nextPage);
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
      setPage(1);
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

  const canExport =
    (!roles('preparation_cuisine') && !roles('preparation_trailer')) ||
    Number(user?.company_id) !== 1;

  return (
    <div className='min-h-screen pt-3'>
      {/* Header */}
      <div className='flex flex-wrap justify-between items-center gap-4 mb-2 px-2 md:px-4'>
        <div className='flex items-center gap-4'>
          <div className={roles('commercial') ? 'hidden md:block' : undefined}>
            <Search
              placeholder='Recherch'
              allowClear
              loading={searchSpinner}
              size='middle'
              onChange={handleSearch}
            />
          </div>

          <div className='hidden md:block'>
            <RangePicker
              size='middle'
              onChange={handleChangeDate}
              className='min-w-[140px]'
            />
          </div>

          {roles('commercial') && (
            <Select
              value={documentStatus || undefined}
              placeholder='État'
              className='min-w-[140px] block md:hidden'
              size='middle'
              allowClear
              onChange={(value) => setDocumentStatus(value ?? '')}
              options={[
                { value: '0', label: 'En attente' },
                { value: '1', label: 'Transféré' },
                { value: '2', label: 'Reçu' },
                { value: '3', label: 'Fabrication' },
              ]}
            />
          )}

          {canExport && (
            <div className='flex items-center gap-2'>
              <Button
                color='green'
                variant='solid'
                size='middle'
                hidden={roles('preparation_cuisine') || roles('preparation_trailer')}
                loading={exportSpin}
                onClick={handleExport}
                icon={<Download size={17} />}
              >
                Export
              </Button>

              <Select
                value={documentType || undefined}
                placeholder='Type'
                allowClear
                className='min-w-[140px] block md:hidden'
                size='middle'
                onChange={(value) => setDocumentType(value ?? '')}
                options={[
                  { value: 'Cuisine', label: 'Cuisine' },
                  { value: 'Placard', label: 'Placard' },
                  { value: 'Laca', label: 'Laca' },
                  { value: 'Polilaminado', label: 'Polilaminado' },
                  { value: 'Stock', label: 'Stock' },
                ]}
              />
            </div>
          )}

          <Button onClick={() => fetchData()} size='middle'>
            {loading ? (
              <Loader2 className='animate-spin text-blue-500' size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
            <span className='hidden sm:inline'></span>
          </Button>
        </div>
      </div>

      {/* Tables / Cards */}
      {roles('commercial') && (
        <DocumentTable documents={data.data} onSelectOrder={handleSelectOrder} />
      )}

      {(roles('preparation') ||
        roles('montage') ||
        roles('fabrication') ||
        roles('peinture')) && (
        <PreparationDocumentTable
          documents={data.data}
          onSelectOrder={handleSelectOrder}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          orderDir={orderDir}
          setOrderDir={setOrderDir}
          loading={loading}
        />
      )}

      {(roles('preparation_cuisine') ||
        roles('preparation_trailer') ||
        roles('magasinier')) && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 md:p-4'>
          {data.data.map((item, index) => (
            <DocumentCard
              key={item.id ?? index}
              data={item}
              loading={loading}
              onSelectOrder={handleSelectOrder}
            />
          ))}
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
    </div>
  );
}

export default Document;