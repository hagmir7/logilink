import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Loader2, RefreshCcw, PlusCircle, Package, Trash, Edit } from 'lucide-react'
import { Button, Empty, Input, Select, Popconfirm, message, Checkbox, Table, Tag } from 'antd'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { categories } from '../utils/config'
import { useNavigate } from 'react-router-dom'
import OFModal from '../components/OFModal'

const { Search } = Input

// ─── Urgency helpers ──────────────────────────────────────────────────────────

const URGENCY_OPTIONS = [
  { value: 'tout', label: 'Tous les statuts' },
  { value: '1',    label: 'Urgence 1' },
  { value: '2',    label: 'Urgence 2' },
  { value: '3',    label: 'Urgence 3' },
  { value: '4',    label: 'Surstock' },
]

const URGENCY_LABELS = { 1: 'Urgence 1', 2: 'Urgence 2', 3: 'Urgence 3', 4: 'Surstock' }

const URGENCY_COLOR = { 1: 'red', 2: 'orange', 3: 'gold', 4: 'blue' }

const URGENCY_BADGE = {
  1: 'bg-red-100 text-red-800 border border-red-300',
  2: 'bg-orange-100 text-orange-800 border border-orange-300',
  3: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  4: 'bg-blue-100 text-blue-800 border border-blue-300',
}

function getUrgencyLevel(stock, min, max) {
  const moyenne = max / 2
  if (stock < min)                     return 1
  if (stock >= min && stock < moyenne) return 2
  if (stock >= moyenne && stock < max) return 3
  return 4
}

// ─── Component ────────────────────────────────────────────────────────────────

function FabricationArticles({ company_id }) {
  const [loading, setLoading]         = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [articles, setArticles]       = useState([])
  const [total, setTotal]             = useState(0)
  const [hasMore, setHasMore]         = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('semi-fini')
  const [selectedCompany, setSelectedCompany]   = useState('')
  const [selectedUrgency, setSelectedUrgency]   = useState('tout')
  const [selectedColor, setSelectedColor]       = useState('tout')
  const [sortBy, setSortBy]           = useState('urgency_level')
  const [sortOrder, setSortOrder]     = useState('asc')
  const [colorOptions, setColorOptions] = useState([{ value: 'tout', label: 'Toutes les couleurs' }])
  const [selectedArticles, setSelectedArticles] = useState([])

  const pageRef     = useRef(1)
  const loaderRef   = useRef(null)
  const filtersRef  = useRef({})

  const PAGE_SIZE = 50

  const { roles } = useAuth()
  const navigate  = useNavigate()

  // keep filtersRef in sync so fetchMore always reads latest values
  useEffect(() => {
    filtersRef.current = { searchQuery, selectedCategory, selectedCompany, selectedUrgency, selectedColor, sortBy, sortOrder }
  }, [searchQuery, selectedCategory, selectedCompany, selectedUrgency, selectedColor, sortBy, sortOrder])

  // ── Fetch ─────────────────────────────────────────────────────────────────

const fetchInitial = useCallback(async (overrides = {}) => {
    const f = { ...filtersRef.current, ...overrides }
    setLoading(true)
    setArticles([])
    setHasMore(true)
    pageRef.current = 1  // ← reset page
    try {
      const res = await api.get('articles', {
        params: {
          page:       1,
          per_page:   PAGE_SIZE,
          search:     f.searchQuery,
          category:   f.selectedCategory,
          company:    f.selectedCompany,
          urgency:    f.selectedUrgency,
          color:      f.selectedColor,
          sort_by:    f.sortBy,
          sort_order: f.sortOrder,
        },
      })
      const { data, total, last_page } = res.data
      setArticles(data)
      setTotal(total)
      setHasMore(1 < last_page)
      pageRef.current = 2  // ← next page to load is 2
    } catch (err) {
      console.error('Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    const f = filtersRef.current
    const nextPage = pageRef.current  // ← snapshot before async call
    pageRef.current += 1              // ← increment immediately to prevent double calls
    setLoadingMore(true)
    try {
      const res = await api.get('articles', {
        params: {
          page:       nextPage,
          per_page:   PAGE_SIZE,
          search:     f.searchQuery,
          category:   f.selectedCategory,
          company:    f.selectedCompany,
          urgency:    f.selectedUrgency,
          color:      f.selectedColor,
          sort_by:    f.sortBy,
          sort_order: f.sortOrder,
        },
      })
      const { data, last_page } = res.data
      setArticles(prev => {
        // dedupe by id just in case
        const existingIds = new Set(prev.map(a => a.id || a.code))
        const newItems = data.filter(a => !existingIds.has(a.id || a.code))
        return [...prev, ...newItems]
      })
      setHasMore(nextPage < last_page)
    } catch (err) {
      pageRef.current -= 1  // ← roll back on error
      console.error('Failed to load more:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore])



  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchInitial()
  }, [searchQuery, selectedCategory, selectedCompany, selectedUrgency, selectedColor, sortBy, sortOrder])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loadingMore) fetchMore() },
      { threshold: 0.1 }
    )
    const el = loaderRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [fetchMore, hasMore, loadingMore])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortOrder('asc')
    }
  }

  const handleTableChange = (_, __, sorter) => {
    if (sorter && sorter.field) {
      const order = sorter.order === 'ascend' ? 'asc' : 'desc'
      setSortBy(sorter.field)
      setSortOrder(order)
    }
  }

  const handleShow = async (id = null) => {
    if (!roles(['admin', 'supper_admin'])) return
    try {
      const url = id
        ? `/articles/${typeof id === 'object' ? id.id || id.code : id}`
        : '/articles/create'
      if (window.electron?.openShow) {
        await window.electron.openShow({ width: 900, height: 700, url })
      } else {
        navigate(url)
      }
    } catch (error) {
      console.error('Error navigating:', error)
    }
  }

  const confirmDelete = async (id) => {
    try {
      await api.delete(`articles/${id}`)
      message.success('Article supprimé avec succès')
      setArticles(prev => prev.filter(a => a.code !== id))
      setTotal(prev => prev - 1)
    } catch (error) {
      message.error(
        error.response?.status === 403
          ? 'Action non autorisée'
          : "Erreur lors de la suppression de l'article"
      )
    }
  }

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedArticles.length === articles.length && articles.length > 0}
          indeterminate={selectedArticles.length > 0 && selectedArticles.length < articles.length}
          onChange={(e) => setSelectedArticles(e.target.checked ? [...articles] : [])}
        />
      ),
      key: 'select',
      width: 48,
      render: (_, article) => (
        <Checkbox
          checked={selectedArticles.some(a => a.id === article.id)}
          onChange={(e) =>
            setSelectedArticles(prev =>
              e.target.checked ? [...prev, article] : prev.filter(a => a.id !== article.id)
            )
          }
        />
      ),
    },
    {
      title: 'Référence',
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      render: (code) => (
        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold text-gray-800">
          {code}
        </code>
      ),
    },
    {
      title: 'Désignation',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc) => <span className="text-sm text-gray-700">{desc}</span>,
    },
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name) => <span className="text-sm text-gray-600">{name}</span>,
    },
    {
      title: 'QTE Disponible',
      dataIndex: 'stock',
      key: 'stock',
      sorter: true,
      align: 'center',
      render: (stock) => (
        <span className="inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {Math.floor(stock * 100) / 100}
        </span>
      ),
    },
    {
      title: 'Capacité max',
      dataIndex: 'max',
      key: 'max',
      align: 'center',
      render: (max) => (
        <span className="inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          {parseFloat(max)}
        </span>
      ),
    },
    {
      title: 'Écart',
      key: 'ecart',
      sorter: true,
      align: 'center',
      render: (_, a) => {
        const ecart = parseFloat(a.max) - Math.floor(a.stock * 100) / 100
        return (
          <span className="inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            {ecart}
          </span>
        )
      },
    },
    {
      title: 'Stock min',
      dataIndex: 'stock_min',
      key: 'stock_min',
      sorter: true,
      align: 'center',
      render: (min) => (
        <span className="inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          {parseFloat(min)}
        </span>
      ),
    },
    {
      title: 'Stock moy.',
      key: 'moyenne',
      align: 'center',
      render: (_, a) => (
        <span className="inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          {parseInt(parseInt(a.max) / 2)}
        </span>
      ),
    },
    {
      title: 'Statut',
      key: 'urgency_level',
      sorter: true,
      align: 'center',
      render: (_, a) => {
        const level = a.urgency_level ?? getUrgencyLevel(
          Math.floor(a.stock * 100) / 100,
          parseFloat(a.stock_min),
          parseFloat(a.max)
        )
        return (
          <Tag color={URGENCY_COLOR[level]} className="rounded-full text-xs font-semibold">
            {URGENCY_LABELS[level]}
          </Tag>
        )
      },
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_, article) => (
        <div className="flex gap-1 justify-center">
          <Button size="small" variant="solid" color="green" onClick={() => handleShow(article.code)}>
            <Edit size={14} />
          </Button>
          <Popconfirm
            title="Supprimer l'article"
            description="Êtes-vous sûr de vouloir supprimer cet article ?"
            onConfirm={() => confirmDelete(article.code)}
            okText="Oui"
            cancelText="Non"
          >
            <Button size="small" variant="solid" color="red">
              <Trash size={14} />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full bg-gray-50 p-0 md:px-2">
      <div className="max-w-[1600px] mx-auto space-y-3 pt-2">

        {/* Header card */}
        <div className="bg-white md:rounded-lg md:shadow-sm border border-gray-200 py-2 px-3">

          {/* Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="p-1 bg-blue-50 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Gestion des Articles</h1>
              <p className="text-sm text-gray-500">Gérez et consultez votre stock</p>
            </div>
          </div>

          {/* Urgency quick-filter pills */}
          {!loading && articles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {[1, 2, 3, 4].map(lvl => {
                const count = articles.filter(a => {
                  const s = Math.floor(a.stock * 100) / 100
                  return getUrgencyLevel(s, parseFloat(a.stock_min), parseFloat(a.max)) === lvl
                }).length
                if (!count) return null
                const active = selectedUrgency === String(lvl)
                return (
                  <button
                    key={lvl}
                    onClick={() => setSelectedUrgency(active ? 'tout' : String(lvl))}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all
                      ${URGENCY_BADGE[lvl]}
                      ${active ? 'ring-2 ring-offset-1 ring-current' : 'opacity-70 hover:opacity-100'}`}
                  >
                    {URGENCY_LABELS[lvl]} — {count}
                  </button>
                )
              })}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center mb-2">
            <Search
              placeholder="Rechercher un article..."
              allowClear
              size="middle"
              className="flex-1 min-w-[180px] max-w-xs"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              value={selectedCategory}
              placeholder="Catégorie"
              size="middle"
              className="min-w-[160px]"
              options={categories}
              onChange={setSelectedCategory}
            />
            <Select
              value={selectedUrgency}
              size="middle"
              className="min-w-[170px]"
              options={URGENCY_OPTIONS}
              onChange={setSelectedUrgency}
            />
            <Select
              value={selectedColor}
              size="middle"
              className="min-w-[150px]"
              options={colorOptions}
              onChange={setSelectedColor}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 items-center flex-wrap">
              <OFModal articles={selectedArticles} />
              <Button size="middle" onClick={() => fetchInitial()} disabled={loading}>
                {loading
                  ? <Loader2 className="animate-spin" size={18} />
                  : <RefreshCcw size={18} />
                }
              </Button>
              {selectedUrgency !== 'tout' && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${URGENCY_BADGE[Number(selectedUrgency)]}`}>
                  {URGENCY_LABELS[Number(selectedUrgency)]}
                  <button onClick={() => setSelectedUrgency('tout')} className="font-bold hover:opacity-70">×</button>
                </span>
              )}
              {selectedColor !== 'tout' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  {selectedColor}
                  <button onClick={() => setSelectedColor('tout')} className="font-bold hover:opacity-70">×</button>
                </span>
              )}
            </div>
            {roles('admin') && (
              <Button
                type="primary"
                size="middle"
                icon={<PlusCircle size={18} />}
                onClick={() => handleShow()}
              >
                Créer Article
              </Button>
            )}
          </div>

          {total > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{articles.length}</span>
              {' '}sur{' '}
              <span className="font-semibold text-gray-900">{total}</span> articles chargés
            </div>
          )}
        </div>

        {/* Table */}
        <Table
          rowKey={(r) => r.id || r.code}
          columns={columns}
          dataSource={articles}
          loading={loading}
          onChange={handleTableChange}
          pagination={false}
          size="small"
          scroll={{ x: 1200 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          rowClassName={(record) => {
            const level = record.urgency_level ?? getUrgencyLevel(
              Math.floor(record.stock * 100) / 100,
              parseFloat(record.stock_min),
              parseFloat(record.max)
            )
            const map = { 1: 'bg-red-50', 2: 'bg-orange-50', 3: 'bg-yellow-50', 4: '' }
            return map[level] || ''
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <p className="text-gray-900 font-medium mb-1">Aucun article trouvé</p>
                    <p className="text-gray-500 text-sm">Essayez de modifier vos critères de recherche</p>
                  </div>
                }
              />
            ),
          }}
        />

        {/* Load more / infinite scroll trigger */}
        <div ref={loaderRef} className="py-4 flex items-center justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="animate-spin" size={16} />
              Chargement...
            </div>
          )}
          {!loadingMore && hasMore && articles.length > 0 && (
            <Button size="small" onClick={fetchMore} className="text-gray-400 border-gray-200">
              Charger plus
            </Button>
          )}
          {!hasMore && articles.length > 0 && (
            <p className="text-sm text-gray-400">Tous les articles sont chargés ({total})</p>
          )}
        </div>

      </div>
    </div>
  )
}

export default FabricationArticles