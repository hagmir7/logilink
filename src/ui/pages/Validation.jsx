import { Loader2, RefreshCcw, ChevronRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import DocumentCard from '../components/ui/DocumentCard'
import { Button, Select, Space, Input, Empty } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import Spinner from '../components/ui/Spinner'

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
      const response = await api.get('docentete/validation');
      console.log(response.data);
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

  const handleChange = (value) => {
    setDocumentStatus(value)
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

  return (
    <div className='min-h-screen p-2 md:p-5'>
      {/* Header */}
      <h2 className='text-xl font-semibold text-gray-800 mb-2'>
        Controle et Validation des commandes
      </h2>
      <div className='flex justify-between items-center mb-6'>
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

            {loading ? (
              <Spinner />
            ) : (
              data?.data?.length === 0 && (
                <Empty
                  className='mt-10'
                  description='Aucun document à afficher'
                />
              )
            )}
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

export default Validation;
