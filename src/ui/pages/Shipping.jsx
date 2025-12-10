import { Loader2, RefreshCcw, ChevronRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { data, useNavigate } from 'react-router-dom'
import { Button, Select, DatePicker, Input } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import ShippingTable from '../components/ShippingTable'

const { Search } = Input
const { RangePicker } = DatePicker

function Shipping() {

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [documenStatus, setDocumentStatus] = useState('')
  const [page, setPage] = useState(1)
  const [moreSpinner, setMoreSpinner] = useState(false)
  const [searchSpinner, setSearchSpinner] = useState(false)
  const navigate = useNavigate()
  const [dateFilter, setDateFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { roles = [] } = useAuth()

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`documents/livraison?status=${documenStatus}&search=${searchQuery}`);
      setDocuments(response.data)

      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchData();
  }, [documenStatus, searchQuery]);

  const handleSelectOrder = (orderId) => {
    navigate(`/document/${orderId}`)
  }


  const loadMore = async () => {
    setMoreSpinner(true)
    setPage(page + 1)

    const response = await api.get(`documents/livraison?page=${page}`)
    setDocuments(prev => ({
      ...prev,
      data: response.data.data,
      next_page_url: response.data.next_page_url,
      total: response.data.total
    }))
    setMoreSpinner(false)

    try {


    } catch (err) {
      console.error('Failed to fetch data:', err)
      setMoreSpinner(false)
    }
  }

  const handleSearch = async (e) => {
    setSearchSpinner(true)
    const { value: inputValue } = e.target

    try {
      const response = await api.get(`${url}&search=${inputValue}`)
      setDocuments(response.data)
      setSearchSpinner(false)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setSearchSpinner(false)
    }
  }

  const handleChangeDate = (dates, dateStrings) => {
    setDateFilter(dates)
  }



  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div
        className={`
    flex flex-wrap items-center justify-between gap-3 mb-4
    ${window.electron ? 'p-5 text-2xl' : 'p-2 text-xl'}
  `}
      >

        {/* Title full width on mobile, inline on desktop */}
        <h2 className="font-semibold text-gray-800 w-full sm:w-auto mb-0 pb-0" style={{marginBottom: '0'}}>
          Gestion de Livraison
        </h2>

        {/* Search ALWAYS full width on mobile */}
        <div className="w-full sm:max-w-xs">
          <Search
            placeholder="Rechercher"
            loading={searchSpinner}
            size={window.electron ? "large" : ""}
            className="w-full"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right actions — full width stacked on mobile */}
        <div className="flex gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">

          <Select
            defaultValue=""
            size={window.electron ? "large" : ""}
            className="min-w-[200px] w-full sm:w-auto"
            onChange={(value) => setDocumentStatus(value)}
            options={[
              { value: "", label: "Tout" },
              { value: "11", label: "Validé" },
              { value: "12", label: "Livraison" },
            ]}
          />

          <Button
            size={window.electron ? "large" : ""}
            className="w-full sm:w-auto"
            onClick={fetchData}
          >
            {loading ? (
              <Loader2 className="animate-spin text-blue-500" size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
            <span className="hidden sm:inline ml-1">Rafraîchir</span>
          </Button>

        </div>
      </div>



      <ShippingTable
        loading={loading}
        documents={documents}
        onSelectOrder={handleSelectOrder}
      />
      {documents.next_page_url && (
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
  )
}

export default Shipping;
