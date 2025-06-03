import { Loader2, RefreshCcw, ChevronRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { Button, Select, DatePicker, Input } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import ShippingTable from '../components/ShippingTable'

const { Search } = Input
const { RangePicker } = DatePicker

function Shipping() {
  const [data, setData] = useState({
    data: [],
    next_page_url: null,
    total: 0,
  })
  const [loading, setLoading] = useState(false)
  const [documenStatus, setDocumentStatus] = useState('')
  const [page, setPage] = useState(1)
  const [moreSpinner, setMoreSpinner] = useState(false)
  const [searchSpinner, setSearchSpinner] = useState(false)
  const navigate = useNavigate()
  const [dateFilter, setDateFilter] = useState(null)
  const { roles } = useAuth()




  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get('document/livraison')

      setData(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectOrder = (orderId) => {
    navigate(`/document/${orderId}`)
  }


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
    <div className='min-h-screen'>
      {/* Title */}
      <h2 className='text-xl font-semibold text-gray-800 mb-1 p-2 md:p-4'>
        Gestion de Livraison
      </h2>

      {/* Header */}
      <div className='flex flex-wrap justify-between items-center gap-4 mb-4 px-2 md:px-4'>
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
            className='min-w-[220px] block md:hidden'
          />

          {roles('commercial') && (
            <Select
              defaultValue=''
              className='min-w-[220px] block md:hidden'
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

          <Button onClick={fetchData} size='large'>
            {loading ? (
              <Loader2 className='animate-spin text-blue-500' size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
            <span className='hidden sm:inline'>Rafraîchir</span>
          </Button>
        </div>
      </div>
      {roles('commercial') && (
        <ShippingTable
          documents={data.data}
          onSelectOrder={handleSelectOrder}
        />
      )}
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
