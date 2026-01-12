import { Loader2, RefreshCcw } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Input, message, Select } from 'antd'
import { useAuth } from '../contexts/AuthContext'
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

  const [currentSearch, setCurrentSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [documentType, setDocumentType] = useState(
    searchParams.get('type') || ''
  )

  const navigate = useNavigate()
  const { roles = [] } = useAuth()

  const baseUrl = 'documents/validation-controller'

  /* =========================
     FETCH DATA
  ========================= */
  const fetchData = async (searchTerm = '', pageNum = 1, append = false) => {
    if (!append) setLoading(true)

    try {
      let url = baseUrl
      const params = []

      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`)
      if (documentType) params.push(`type=${encodeURIComponent(documentType)}`)
      if (pageNum > 1) params.push(`page=${pageNum}`)

      if (params.length > 0) {
        url += `?${params.join('&')}`
      }

      const response = await api.get(url)

      if (append) {
        setData(prev => ({
          data: [...prev.data, ...response.data.data],
          next_page_url: response.data.next_page_url,
          total: response.data.total,
        }))
      } else {
        setData(response.data)
      }

      setLoading(false)
    } catch (err) {
      console.error(err)
      message.error(err.response?.data?.message || 'Failed to fetch data')
      setLoading(false)
    }
  }

  /* =========================
     EFFECTS
  ========================= */
  useEffect(() => {
    fetchData()
    window.electron?.notifyPrintReady?.()
  }, [])

  useEffect(() => {
    setPage(1)
    fetchData(currentSearch, 1, false)
  }, [documentType])

  /* =========================
     HANDLERS
  ========================= */
  const handleSelectOrder = (orderId) => {
    navigate(`/document/${orderId}`)
  }

  const loadMore = async () => {
    setMoreSpinner(true)
    const nextPage = page + 1
    setPage(nextPage)

    try {
      await fetchData(currentSearch, nextPage, true)
    } finally {
      setMoreSpinner(false)
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setSearchSpinner(true)
    setCurrentSearch(value)
    setPage(1)

    try {
      await fetchData(value, 1, false)
    } catch {
      message.error('Search failed')
    } finally {
      setSearchSpinner(false)
    }
  }

  const handleTypeChange = (value) => {
    setDocumentType(value)
    setPage(1)

    if (value) {
      setSearchParams({ type: value })
    } else {
      setSearchParams({})
    }
  }

  const handleRefresh = () => {
    setCurrentSearch('')
    setPage(1)
    fetchData('', 1, false)
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className='min-h-screen'>
      {/* HEADER */}
      <div className='px-2 md:px-3 my-2'>
        <h2 className='text-lg font-semibold text-gray-800 mb-2'>
          Controle et Validation des commandes
        </h2>

        <div className='flex justify-between items-center'>
          <div className='flex gap-4'>
            <div className='flex gap-2'>
              <Search
                placeholder='Rechercher'
                loading={searchSpinner}
                size='large'
                onChange={handleSearch}
                allowClear
              />

              <Select
                value={documentType}
                className='min-w-[200px] block md:hidden'
                size='large'
                onChange={handleTypeChange}
                options={[
                  { value: '', label: 'Type' },
                  { value: 'Cuisine', label: 'Cuisine' },
                  { value: 'Placard', label: 'Placard' },
                  { value: 'Laca', label: 'Laca' },
                  { value: 'Polilaminado', label: 'Polilaminado' },
                  { value: 'Stock', label: 'Stock' },
                ]}
              />
            </div>

            <Button onClick={handleRefresh} size='large'>
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

      {/* TABLES */}
      {roles(['preparation', 'controleur']) && (
        <PreparationDocumentTable
          documents={data.data}
          onSelectOrder={handleSelectOrder}
        />
      )}

      {roles('commercial') && (
        <ReadyOrder
          documents={data.data}
          onSelectOrder={handleSelectOrder}
        />
      )}

      {/* LOAD MORE */}
      {data.next_page_url && (
        <div className='flex justify-center my-4 pb-12'>
          <Button
            onClick={loadMore}
            size='large'
            type='primary'
            loading={moreSpinner}
          >
            Charger Plus
          </Button>
        </div>
      )}
    </div>
  )
}

export default Validation
