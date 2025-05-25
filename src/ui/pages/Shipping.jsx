import { Loader2, RefreshCcw, ChevronRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import DocumentCard from '../components/ui/DocumentCard'
import { Button, Select, DatePicker, Input } from 'antd'
import { useAuth } from '../contexts/AuthContext'

const { Search } = Input
const { RangePicker } = DatePicker

function Shipping() {
  const [data, setData] = useState({
    data: [],
    next_page_url: null,
    total: 0,
  })
  const [loading, setLoading] = useState(false)
  const [documenType, setDocumentType] = useState(2)
  const [documenStatus, setDocumentStatus] = useState('')
  const [page, setPage] = useState(1)
  const [moreSpinner, setMoreSpinner] = useState(false)
  const [searchSpinner, setSearchSpinner] = useState(false)
  const navigate = useNavigate()
  const [dateFilter, setDateFilter] = useState(null)
  const { roles } = useAuth()

  let url = `docentete/shipping?page=${page}`

  if (roles('commercial')) {
    url = `docentete/shipping?type=${documenType}&page=${page}&status=${documenStatus}&date=${
      dateFilter || ''
    }`
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(url)
      setData(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setLoading(false)
    }
  }

  const handleSelectOrder = (orderId) => {
    navigate(`/document/${orderId}`)
  }

  useEffect(() => {
    const fetchAndNotify = async () => {
      await fetchData()
      window.electron?.notifyPrintReady?.()
    }
    fetchAndNotify()
  }, [documenType, documenStatus, dateFilter])

  const loadMore = async () => {
    setMoreSpinner(true)
    setPage(page + 1)
    try {
      const response = await api.get(`${url}&page=${page}`)
      setData({
        data: [...data.data, ...response.data.data],
        next_page_url: response.data.next_page_url,
        total: response.data.total,
      })
      setMoreSpinner(false)
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
      setData({
        data: response.data.data,
        next_page_url: response.data.next_page_url,
        total: response.data.total,
      })
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
    <div className='min-h-screen p-2 md:p-5'>
      {/* Header */}
      <h2 className='text-xl font-semibold text-gray-800 mb-2'>
        Gestion des commandes
      </h2>
      <div className='flex flex-wrap justify-between items-center gap-4 mb-6'>
        <div className='flex items-center gap-4'>
          <Search
            placeholder='Recherch'
            loading={searchSpinner}
            size='large'
            onChange={handleSearch}
          />
          <RangePicker
            size='large'
            onChange={handleChangeDate}
            className='h-10 min-w-[220px]'
          />

          {/* {roles('commercial') && (
            <Select
              defaultValue='2'
              className='h-10 min-w-[220px]'
              size='large'
              onChange={()=>setDocumentType(value)}
              options={[
                { value: '0', label: 'Devis' },
                { value: '1', label: 'Bon de command' },
                { value: '2', label: 'Preparation de livraison' },
                { value: '3', label: 'Bon de livraison' },
                { value: '6', label: 'Facture' },
                { value: 'disabled', label: 'Disabled', disabled: true },
              ]}
            />
          )} */}

          {roles('commercial') && (
            <Select
              defaultValue=''
              className='h-10 min-w-[220px]'
              size='large'
              onChange={(value) => setDocumentStatus(value)}
              options={[
                { value: '', label: 'En attente' },
                { value: '1', label: 'Transféré' },
                { value: '2', label: 'Reçu' },
                { value: '3', label: 'Fabrication' },
              ]}
            />
          )}

          <button
            type='button'
            onClick={fetchData}
            className='h-10 px-4 inline-flex items-center gap-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50'
          >
            {loading ? (
              <Loader2 className='animate-spin text-blue-500' size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
            <span className='hidden sm:inline'>Rafraîchir</span>
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div className='space-y-4'>
        {loading ? (
          <div className='flex flex-col items-center justify-center h-64'>
            <Loader2 className='animate-spin text-blue-500 mb-2' size={32} />
            <span className='text-gray-600'>Chargement...</span>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {data?.data?.length > 0
                ? data.data.map((item, index) => (
                    <DocumentCard
                      key={index}
                      data={item}
                      onSelectOrder={handleSelectOrder}
                    />
                  ))
                : null}
            </div>
          </>
        )}
      </div>
      {data.next_page_url && (
        <div className='flex justify-center'>
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
