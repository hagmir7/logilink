import { Download, Loader2, RefreshCcw } from 'lucide-react';
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
  const [documenStatus, setDocumentStatus] = useState('');
  const [documenType, setDocumentType] = useState('');
  const [page, setPage] = useState(1);
  const [moreSpinner, setMoreSpinner] = useState(false);
  const [searchSpinner, setSearchSpinner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(null);

  const navigate = useNavigate();
  const { roles = [], user } = useAuth();


  const [orderBy, setOrderBy] = useState('');
  const [orderDir, setOrderDir] = useState('asc');


  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();

      if (documenType) queryParams.append('type', documenType);
      if (documenStatus) queryParams.append('status', documenStatus);
      if (dateFilter?.length) queryParams.append('date', dateFilter.join(','));
      if (searchTerm) queryParams.append('search', searchTerm);
      if (orderBy) queryParams.append('order_by', orderBy);
      if (orderDir) queryParams.append('order_dir', orderDir);

      let url = 'documents/preparation/export';
      if (roles('commercial')) url = 'docentetes/commercial/export';

      const response = await api.get(`${url}?${queryParams.toString()}`, {
        responseType: 'blob', // 🔑 IMPORTANT
      });

      // 📥 Create file
      const blob = new Blob(
        [response.data],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );

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
    }
  };


  const buildUrl = (pageNumber = 1, search = searchTerm) => {
    const queryParams = new URLSearchParams();
    if (documenType) queryParams.append('type', documenType);
    if (documenStatus) queryParams.append('status', documenStatus);
    if (dateFilter?.length) queryParams.append('date', dateFilter.join(','));
    if (search) queryParams.append('search', search);
    if (orderBy) queryParams.append('order_by', orderBy);
    if (orderDir) queryParams.append('order_dir', orderDir);
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



  }, [documenType, documenStatus, dateFilter, orderBy, orderDir]);

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
    <div className='min-h-screen pt-3'>
      {/* Header */}
      <div className='flex flex-wrap justify-between items-center gap-4 mb-2 px-2 md:px-4'>
        <div className='flex items-center gap-4'>
          <div className={roles('commercial') && 'hidden md:block'}>
            <Search
              placeholder='Recherch'
              allowClear
              loading={searchSpinner}
              size='large'
              onChange={handleSearch}
            />
           
          </div>

          <div className='hidden md:block'>
            <RangePicker
              size='large'
              onChange={handleChangeDate}
              className='min-w-[140px]'
            />
          </div>

          {roles('commercial') && (
            <Select
              defaultValue=''
              className='min-w-[140px] block md:hidden'
              size='large'
              allowClear
              onChange={(value) => setDocumentStatus(value)}
              options={[
                { value: '', label: 'État' },
                { value: '0', label: 'En attente' },
                { value: '1', label: 'Transféré' },
                { value: '2', label: 'Reçu' },
                { value: '3', label: 'Fabrication' },
              ]}
            />
          )}

          {parseInt(user.company_id, 10) === 2 && roles('preparation') && (
            <Button
              color="green"
              variant="solid"
              size="large"
              onClick={handleExport}
              icon={<Download size={17} />}
            >
              Export
            </Button>
          )}



          <Select
            defaultValue=''
            allowClear
            className='min-w-[140px] block md:hidden'
            size='large'
            onChange={(value) => setDocumentType(value)}
            options={[
              { value: '', label: 'Type' },
              { value: 'Cuisine', label: 'Cuisine' },
              { value: 'Placard', label: 'Placard' },
              { value: 'Laca', label: 'Laca' },
              { value: 'Polilaminado', label: 'Polilaminado' },
              { value: 'Stock', label: 'Stock' }
            ]}
          />

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
          documents={data.data}
          onSelectOrder={handleSelectOrder}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          orderDir={setOrderDir}
          setOrderDir={setOrderDir}
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

      {(data.data.length === 0 && !loading) && (
        <Empty className='mt-10' description='Aucun document à afficher' />
      )}
    </div>
  )
}

export default Document;
