import React, { useEffect, useState, useCallback } from 'react'
import { Loader2, RefreshCcw } from 'lucide-react'
import { Button, Input, message, Select } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import PreparationDocumentTable from '../components/PreparationDocumentTable'
import ReadyOrder from '../components/ReadyOrder'

const { Search } = Input

function Validation() {
  const navigate = useNavigate()
  const { roles = [] } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [data, setData] = useState({
    data: [],
    next_page_url: null,
    total: 0,
  })

  const [loading, setLoading] = useState(false)
  const [moreLoading, setMoreLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [documentType, setDocumentType] = useState(
    searchParams.get('type') || ''
  )

  const [orderBy, setOrderBy] = useState('status')
  const [orderDir, setOrderDir] = useState('asc')

  const BASE_URL = 'documents/validation-controller'


  const fetchData = useCallback(
    async ({ page = 1, append = false } = {}) => {
      if (!append) setLoading(true)

      try {
        const params = new URLSearchParams()

        if (search) params.append('search', search)
        if (documentType) params.append('type', documentType)
        if (orderBy) params.append('order_by', orderBy)
        if (orderDir) params.append('order_dir', orderDir)
        if (page > 1) params.append('page', page)

        const { data: response } = await api.get(
          `${BASE_URL}?${params.toString()}`
        )

        setData(prev =>
          append
            ? {
              data: [...prev.data, ...response.data],
              next_page_url: response.next_page_url,
              total: response.total,
            }
            : response
        )
      } catch (err) {
        console.error(err)
        message.error(err.response?.data?.message || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    },
    [search, documentType, orderBy, orderDir]
  )


  useEffect(() => {
    setPage(1)
    fetchData({ page: 1 })
    window.electron?.notifyPrintReady?.()
  }, [fetchData])


  const handleSearch = async (value = '') => {
    setSearchLoading(true)
    setSearch(value)
    setPage(1)

    try {
      await fetchData({ page: 1 })
    } finally {
      setSearchLoading(false)
    }
  }

  const handleTypeChange = value => {
    setDocumentType(value)
    setPage(1)

    value ? setSearchParams({ type: value }) : setSearchParams({})
  }

  const loadMore = async () => {
    if (!data.next_page_url) return

    setMoreLoading(true)
    const nextPage = page + 1
    setPage(nextPage)

    try {
      await fetchData({ page: nextPage, append: true })
    } finally {
      setMoreLoading(false)
    }
  }

  const handleRefresh = () => {
    setSearch('')
    setDocumentType('')
    setOrderBy('')
    setOrderDir('asc')
    setPage(1)
    setSearchParams({})
    fetchData({ page: 1 })
  }

  const handleSelectOrder = orderId => {
    navigate(`/document/${orderId}`)
  }


  return (
    <div className='min-h-screen'>

      <div className='px-2 md:px-3 my-2'>
        <h2 className='text-lg font-semibold text-gray-800 mb-2'>
          Contrôle et validation des commandes
        </h2>

        <div className='flex gap-3'>
          <Search
            placeholder='Rechercher'
            size='large'
            value={search}
            className='max-w-[400px]'
            loading={searchLoading}
            allowClear
            onSearch={handleSearch}
            onChange={e => {
              const value = e.target.value
              setSearch(value)
              if (!value) handleSearch('')
            }}
          />

          <Select
            value={documentType}
            size='large'
            className='min-w-[200px]'
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

          <Button onClick={handleRefresh} size='large'>
            {loading ? (
              <Loader2 className='animate-spin text-blue-500' size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
            <span className='hidden sm:inline'> Rafraîchir</span>
          </Button>
        </div>
      </div>

      {/* TABLES */}
      {roles(['preparation', 'controleur']) && (
        <PreparationDocumentTable
          documents={data.data}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          orderDir={orderDir}
          setOrderDir={setOrderDir}
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
            type='primary'
            size='large'
            loading={moreLoading}
            onClick={loadMore}
          >
            Charger plus
          </Button>
        </div>
      )}
    </div>
  )
}

export default Validation
