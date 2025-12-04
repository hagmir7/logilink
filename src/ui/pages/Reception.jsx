import { Loader2, RefreshCcw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Button, Select, DatePicker, Input, Empty } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import ReceptionTable from '../components/ReceptionTable';

const { Search } = Input;
const { RangePicker } = DatePicker;

function Reception() {
  const [data, setData] = useState({ data: [], next_page_url: null, total: 0 });
  const [loading, setLoading] = useState(false);
  const [documenType, setDocumentType] = useState(12); // default Laravel filter
  const [documenStatus, setDocumentStatus] = useState('');
  const [company, setCompany] = useState('sqlsrv_inter');
  const [page, setPage] = useState(1);
  const [moreSpinner, setMoreSpinner] = useState(false);
  const [searchSpinner, setSearchSpinner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(null);

  const navigate = useNavigate();
  const { roles = [] } = useAuth();

  // Build URL with filters
  const buildUrl = (pageNumber = 1, search = searchTerm) => {
    const queryParams = new URLSearchParams();

    if (documenType) queryParams.append('type', documenType);
    if (documenStatus !== '') queryParams.append('status', documenStatus);
    if (company) queryParams.append('company', company);
    if (dateFilter?.length === 2) queryParams.append('date', dateFilter.join(','));
    if (search) queryParams.append('search', search);
    if (pageNumber) queryParams.append('page', pageNumber);

    return `receptions?${queryParams.toString()}`;
  };

  // Fetch API data
  const fetchData = async (pageNumber = 1, search = searchTerm) => {
    setLoading(true);
    try {
      const response = await api.get(buildUrl(pageNumber, search));
      setData(response.data); // Laravel paginate JSON
      setPage(pageNumber);
    } catch (err) {
      console.error('❌ Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load more (append pagination data)
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
      console.error('❌ Failed to load more:', err);
    } finally {
      setMoreSpinner(false);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchSpinner(true);

    try {
      const response = await api.get(buildUrl(1, value));
      setData(response.data);
      setPage(1);
    } catch (err) {
      console.error('❌ Failed to search:', err);
    } finally {
      setSearchSpinner(false);
    }
  };

  // Handle date range filter
  const handleChangeDate = (dates) => {
    if (dates && dates.length === 2) {
      setDateFilter(dates.map((d) => dayjs(d).format('YYYY-MM-DD')));
    } else {
      setDateFilter([]);
    }
  };

  // Navigate to document
  const handleSelectOrder = (orderId) => {
    navigate(`/layout/document/${orderId}`);
  };

  // Auto fetch + refresh every 40s
  useEffect(() => {
    const fetchAndNotify = async () => {
      await fetchData();
      window.electron?.notifyPrintReady?.();
    };
    fetchAndNotify();

    const intervalId = setInterval(fetchAndNotify, 40000);
    return () => clearInterval(intervalId);
  }, [documenType, documenStatus, dateFilter, company]);

  return (
    <div className="min-h-screen">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800 mb-1 p-2 md:p-1">
        Gestion de la réception
      </h2>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4 px-2 md:px-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:block">
            <Search
              placeholder="Recherche"
              loading={searchSpinner}
              size="large"
              onChange={handleSearch}
            />
          </div>

          {/* Date range */}
          <div className="hidden md:block">
            <RangePicker
              size="large"
              onChange={handleChangeDate}
              className="min-w-[220px]"
            />
          </div>

          {/* Status selector */}
          <Select
            defaultValue=""
            className="min-w-[220px] block md:hidden"
            size="large"
            onChange={(value) => setDocumentStatus(value)}
            options={[
              { value: '', label: 'Tout' },
              { value: '0', label: 'En attente' },
              { value: '1', label: 'Transféré' },
              { value: '2', label: 'Réceptionné' },
              { value: '3', label: 'Validé' },
            ]}
          />

          {/* Company selector */}
          <Select
            value={company}
            className="min-w-[220px] block md:hidden"
            size="large"
            placeholder="Société"
            onChange={(value) => setCompany(value)}
            options={[
              { value: 'sqlsrv_inter', label: 'INTERCOCINA' },
              { value: 'sqlsrv_serie', label: 'SERIE MOBLE' },
              { value: 'sqlsrv', label: 'STILE MOBILI' },
              { value: 'sqlsrv_asti', label: 'ASTIDKORA' },
            ]}
          />

          {/* Refresh button */}
          <Button onClick={() => fetchData()} size="large">
            {loading ? (
              <Loader2 className="animate-spin text-blue-500" size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
            <span className="hidden sm:inline">Rafraîchir</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <ReceptionTable documents={data.data} onSelectOrder={handleSelectOrder} company={company} />

      {/* Load more */}
      {data.next_page_url && (
        <div className="flex justify-center py-6">
          <Button
            onClick={loadMore}
            type="primary"
            loading={moreSpinner}
            iconPosition="end"
          >
            Charger Plus
          </Button>
        </div>
      )}

      {/* Empty state */}
      {data.data.length === 0 && !loading && (
        <Empty className="mt-10" description="Aucun document à afficher" />
      )}
    </div>
  );
}

export default Reception;
