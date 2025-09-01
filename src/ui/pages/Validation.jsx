import { Loader2, RefreshCcw, ChevronRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import DocumentCard from '../components/ui/DocumentCard'
import { Button, Select, Space, Input, Empty, message } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import Spinner from '../components/ui/Spinner'
import PreparationDocumentTable from '../components/PreparationDocumentTable'

const { Search } = Input

function Validation() {
  const [data, setData] = useState({
    data: [],
    next_page_url: null,
    total: 0,
  })
  const [loading, setLoading] = useState(false)
  const [documentStatus, setDocumentStatus] = useState(2)
  const [page, setPage] = useState(1)
  const [moreSpinner, setMoreSpinner] = useState(false)
  const [searchSpinner, setSearchSpinner] = useState(false)
  const navigate = useNavigate()
  const { roles } = useAuth()



  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get('documents/validation-controller')
      setData(response.data)
   
      
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      message.error(err.response.data.message)
      setLoading(false)
    }
  }

  const handleSelectOrder = (orderId) => {
    navigate(`/document/${orderId}`)
  }

  useEffect(() => {
    const fetchAndNotify = async () => {
      await fetchData();
      window.electron?.notifyPrintReady?.()
    }
    fetchAndNotify()
  }, [documentStatus]);

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
      message.error(err.response.data.message)
      setSearchSpinner(false)
    }
  }

  return (
    <div className='min-h-screen  '>
      {/* Header */}
      
      <div className='px-2 md:px-3 my-2'>
        <h2 className='text-lg font-semibold text-gray-800 mb-2'>
        Controle et Validation des commandes
      </h2>
      <div className='flex justify-between items-center'>
        <div className='flex gap-4'>
          <Search
            placeholder='Recherch'
            loading={searchSpinner}
            size='large'
            onChange={handleSearch}
          />

          <Button
            onClick={fetchData}
            size='large'

            >
            {loading ? (
              <Loader2 className='animate-spin text-blue-500' size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
            <span className='hidden sm:inline'>Rafraîchir</span>
          </Button>
        </div>
      </div>
      </div>

     {roles('preparation') && (
          <PreparationDocumentTable
            loading={loading}
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

export default Validation;
