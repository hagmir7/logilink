import { Loader2, RefreshCcw, ChevronRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import DocumentCard from '../components/ui/DocumentCard'
import { Button, Select, Space, Input, Empty, message } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import Spinner from '../components/ui/Spinner'
import PreparationDocumentTable from '../components/PreparationDocumentTable'
import ReadyOrder from '../components/ReadyOrder'

const { Search } = Input

function Validation() {
  const [data, setData] = useState({
    data: [],
    next_page_url: null,
    total: 0,
  })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [moreSpinner, setMoreSpinner] = useState(false)
  const [searchSpinner, setSearchSpinner] = useState(false)
  const [currentSearch, setCurrentSearch] = useState('') // Track current search
  const navigate = useNavigate()
  const { roles = [] } = useAuth()

  // Define the base URL
  const baseUrl = 'documents/validation-controller'

  const fetchData = async (searchTerm = '', pageNum = 1, append = false) => {
    if (!append) setLoading(true)
    
    try {
      let url = baseUrl
      const params = []
      
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`)
      if (pageNum > 1) params.push(`page=${pageNum}`)
      
      if (params.length > 0) {
        url += `?${params.join('&')}`
      }

      const response = await api.get(url)
      
      if (append) {
        setData(prevData => ({
          data: [...prevData.data, ...response.data.data],
          next_page_url: response.data.next_page_url,
          total: response.data.total,
        }))
      } else {
        setData(response.data)
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      message.error(err.response?.data?.message || 'Failed to fetch data')
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
  }, []) // Remove documentStatus dependency since it's not used

  const loadMore = async () => {
    setMoreSpinner(true)
    const nextPage = page + 1
    setPage(nextPage)
    
    try {
      await fetchData(currentSearch, nextPage, true) // append = true
      setMoreSpinner(false)
    } catch (err) {
      console.error('Failed to fetch more data:', err)
      setMoreSpinner(false)
    }
  }

  const handleSearch = async (e) => {
    setSearchSpinner(true)
    const searchValue = e.target.value
    setCurrentSearch(searchValue)
    setPage(1) // Reset to first page
    
    try {
      await fetchData(searchValue, 1, false) // append = false
      setSearchSpinner(false)
    } catch (err) {
      console.error('Failed to search:', err)
      message.error(err.response?.data?.message || 'Search failed')
      setSearchSpinner(false)
    }
  }

  const handleRefresh = () => {
    setCurrentSearch('')
    setPage(1)
    fetchData()
  }

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='px-2 md:px-3 my-2'>
        <h2 className='text-lg font-semibold text-gray-800 mb-2'>
          Controle et Validation des commandes
        </h2>
        <div className='flex justify-between items-center'>
          <div className='flex gap-4'>
            <Search
              placeholder='Rechercher'
              loading={searchSpinner}
              size='large'
              onChange={handleSearch}
              allowClear
            />

            <Button
              onClick={handleRefresh}
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

      {roles(['preparation', 'controleur']) && (
        <PreparationDocumentTable
          // loading={loading}
          documents={data.data}
          onSelectOrder={handleSelectOrder}
        />
      )}

      {
        roles('commercial') && (
          <ReadyOrder
            // loading={loading}
            documents={data.data}
            onSelectOrder={handleSelectOrder}
          />
        )
      }
        
      {data.next_page_url && (
        <div className='flex justify-center my-4'>
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

export default Validation