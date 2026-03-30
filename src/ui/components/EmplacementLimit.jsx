import React, { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '../utils/api'
import ImportEmplacementLimit from './ImportEmplacementLimit'
import {
  Button, Input, Table, Typography, Card, Select, Spin
} from 'antd'
import { SearchOutlined, UploadOutlined, ReloadOutlined, DownOutlined } from '@ant-design/icons'
import EmplacementLimitForm from './EmplacementLimitForm'

const { Title } = Typography
const { Option } = Select

const INITIAL_FILTERS = {
  search: '',
  sort_by: 'created_at',
  sort_order: 'desc',
  per_page: 50,
}

export default function EmplacementLimit() {
  const [data, setData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimerRef = useRef(null)

  const handleSearchChange = (e) => {
    const value = e.target.value
    setFilters(prev => ({ ...prev, search: value }))
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value)
    }, 400)
  }

  const [emplacements, setEmplacements] = useState([
    { id: 1, code: "EMP-01" },
    { id: 2, code: "EMP-02" },
  ]);


  const [articles, setArticles] = useState([
    { id: 1, name: "Article A" },
    { id: 2, name: "Article B" },
  ])


  const fetchFresh = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: 1,
        search: debouncedSearch || undefined,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        per_page: filters.per_page,
      }
      const res = await api.get('emplacement-limit', { params })
      setData(res.data.data)
      setCurrentPage(res.data.current_page)
      setLastPage(res.data.last_page)
      setTotal(res.data.total)
    } catch (err) {
      console.error('Error fetching emplacement limits:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filters.sort_by, filters.sort_order, filters.per_page])

  // Load more → append to existing list
  const fetchMore = async () => {
    if (loadingMore || currentPage >= lastPage) return
    setLoadingMore(true)
    try {
      const params = {
        page: currentPage + 1,
        search: debouncedSearch || undefined,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        per_page: filters.per_page,
      }
      const res = await api.get('emplacement-limit', { params })
      setData(prev => [...prev, ...res.data.data])
      setCurrentPage(res.data.current_page)
      setLastPage(res.data.last_page)
      setTotal(res.data.total)
    } catch (err) {
      console.error('Error loading more:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchFresh()
  }, [fetchFresh])

  const handleReset = () => {
    clearTimeout(searchTimerRef.current)
    setDebouncedSearch('')
    setFilters(INITIAL_FILTERS)
  }

  const columns = [
    {
      title: <span className='whitespace-nowrap'>Emplacement</span>,
      dataIndex: ['emplacement', 'code'],
      key: 'emplacement',
      render: (code) => (
        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">{code}</code>
      ),
    },
    {
      title: 'Ref Article',
      dataIndex: ['article', 'code'],
      key: 'article_code',
      render: (code) => (
        <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">{code}</code>
      ),
    },
    {
      title: 'Description',
      dataIndex: ['article', 'description'],
      key: 'description',
      width: "30%",
      ellipsis: true,
      render: (desc) => <span className="text-gray-500 text-sm whitespace-nowrap">{desc}</span>,
    },
    {
      title: 'Dimensions',
      key: 'dimensions',

      render: (_, item) => {
        const art = item.article

        const dimsArray = [
          art?.height > 0 ? parseInt(art.height) : null,
          art?.width > 0 ? parseInt(art.width) : null,
          art?.depth > 0 ? parseInt(art.depth) : null,
        ].filter(Boolean)

        const dims = dimsArray.join(' * ')

        return (
          <span className="text-gray-500 text-sm whitespace-nowrap">
            {dims || '—'}
          </span>
        )
      },
    },
    {
      title: 'Color',
      dataIndex: ['article', 'color'],
      key: 'color',
      render: (color) => <span className="capitalize">{color || '—'}</span>,
    },
    {
      title: 'Capacete',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => (
        <span className="font-semibold ">{Number(qty).toLocaleString()}</span>
      ),
    },
    {
      title: 'Nom',
      dataIndex: ['article', 'name'],
      key: 'name',
      render: (name) => <span className='whitespace-nowrap'>{name ? name : '—'}</span>,
    },
  ]

  const hasMore = currentPage < lastPage

  return (
    <div className="p-4 space-y-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title level={4} className="!mb-0">Capacité de stock</Title>
          <span className="text-xs text-gray-400">{total} résultats</span>
        </div>

        <div className="flex gap-2">


       
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Importer
        </Button>

        <Button type="primary" onClick={() => {
          setEditData(null);
          setOpen(true);
        }}>
          Créer ou modifier
        </Button>

        {/* Example Edit */}
        {/* <Button
          className="ml-2"
          onClick={() => {
            setEditData({
              id: 1,
              emplacement_id: 1,
              article_stock_id: 2,
              quantity: 10,
            });
            setOpen(true);
          }}
        >
          Edit Example
        </Button> */}

        <EmplacementLimitForm
          open={open}
          onClose={() => setOpen(false)}
          initialValues={editData}
          emplacements={emplacements}
          articles={articles}
          onSuccess={() => console.log("refresh table")}
        />
         </div>
      </div>

      {/* Filters */}
      <Card size="small" className="shadow-sm">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Rechercher article, emplacement..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={filters.search}
            onChange={handleSearchChange}
            allowClear
            onClear={() => {
              clearTimeout(searchTimerRef.current)
              setDebouncedSearch('')
              setFilters(prev => ({ ...prev, search: '' }))
            }}
            // className="w-72"
            style={{ width: '400px' }}
          />

          <Select
            value={filters.sort_by}
            onChange={(val) => setFilters(prev => ({ ...prev, sort_by: val }))}
            className="w-40"
          >
            <Option value="created_at">Date création</Option>
            <Option value="updated_at">Date MAJ</Option>
            <Option value="quantity">Capacete</Option>
          </Select>

          <Select
            value={filters.sort_order}
            onChange={(val) => setFilters(prev => ({ ...prev, sort_order: val }))}
            className="w-32"
          >
            <Option value="desc">Décroissant</Option>
            <Option value="asc">Croissant</Option>
          </Select>

          <Select
            value={filters.per_page}
            onChange={(val) => setFilters(prev => ({ ...prev, per_page: val }))}
            className="w-28"
          >
            <Option value={25}>25 / batch</Option>
            <Option value={50}>50 / batch</Option>
            <Option value={100}>100 / batch</Option>
            <Option value={200}>200 / batch</Option>
          </Select>

          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset
          </Button>
        </div>
      </Card>

      <div className='mt-3'></div>

      {/* Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        size="small"
        pagination={false}
        scroll={{ x: 900 }}
        className="shadow-sm rounded-lg overflow-hidden"
      />

      {/* Load More */}
      <div className="flex flex-col items-center gap-2 py-2">
        <span className="text-xs text-gray-400">
          {data.length} sur {total} chargés
        </span>

        {hasMore && (
          <Button
            icon={loadingMore ? <Spin size="small" /> : <DownOutlined />}
            onClick={fetchMore}
            disabled={loadingMore}
            className="w-40"
          >
            {loadingMore ? 'Chargement...' : 'Charger plus'}
          </Button>
        )}

        {!hasMore && total > 0 && (
          <span className="text-xs text-gray-300">— Tout est chargé —</span>
        )}
      </div>

      {/* Import Modal */}
      <ImportEmplacementLimit
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          fetchFresh()
        }}
      />
    </div>
  )
}