import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Loader2, RefreshCcw, PlusCircle, Package, Trash, Edit } from 'lucide-react'
import { Button, Empty, Input, Select, Popconfirm, message, Checkbox } from 'antd'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { categories } from '../utils/config'
import { useNavigate } from 'react-router-dom'
import TableSkeleton from '../components/ui/TableSkeleton'
import OFModal from '../components/OFModal'

const { Search } = Input

// ─── Urgency helpers ───────────────────────────────────────────────────────────

const URGENCY_OPTIONS = [
  { value: 'tout', label: 'Tous les statuts' },
  { value: '1',    label: 'Urgence 1' },
  { value: '2',    label: 'Urgence 2' },
  { value: '3',    label: 'Urgence 3' },
  { value: '4',    label: 'Surstock' },
]

const URGENCY_LABELS = { 1: 'Urgence 1', 2: 'Urgence 2', 3: 'Urgence 3', 4: 'Surstock' }

const URGENCY_BADGE = {
  1: 'bg-red-100 text-red-800 border border-red-300',
  2: 'bg-orange-100 text-orange-800 border border-orange-300',
  3: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  4: 'bg-blue-100 text-blue-800 border border-blue-300',
}

const URGENCY_ROW = {
  1: 'bg-red-50',
  2: 'bg-orange-50',
  3: 'bg-yellow-50',
  4: '',
}

function getUrgencyLevel(stock, min, max) {
  const moyenne = max / 2
  if (stock < min)                     return 1
  if (stock >= min && stock < moyenne) return 2
  if (stock >= moyenne && stock < max) return 3
  return 4
}

// ─── Sort icon (pure SVG, no extra dependency) ────────────────────────────────

function SortIcon({ col, sortBy, sortOrder }) {
  const active = sortBy === col
  const color  = active ? '#2563eb' : '#9ca3af'
  const upOp   = active && sortOrder === 'asc'  ? 1 : 0.35
  const downOp = active && sortOrder === 'desc' ? 1 : 0.35
  return (
    <svg
      width="10" height="12" viewBox="0 0 10 12"
      style={{ display: 'inline', marginLeft: 3, verticalAlign: 'middle' }}
    >
      <path d="M5 1L9 5H1Z"  fill={color} opacity={upOp} />
      <path d="M5 11L1 7H9Z" fill={color} opacity={downOp} />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

const SORTABLE = ['code', 'stock', 'ecart', 'stock_min', 'urgency_level']

function FabricationArticles({ company_id }) {
  const [loading, setLoading]           = useState(false)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [page, setPage]                 = useState(1)
  const [pageSize]                      = useState(50)
  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedCategory, setSelectedCategory] = useState('semi-fini')
  const [selectedCompany, setSelectedCompany]   = useState('')
  const [selectedUrgency, setSelectedUrgency]   = useState('tout')
  const [selectedColor, setSelectedColor]       = useState('tout')
  const [sortBy, setSortBy]             = useState('urgency_level')
  const [sortOrder, setSortOrder]       = useState('asc')
  const [hasMore, setHasMore]           = useState(true)
  const [total, setTotal]               = useState(0)
  const [articles, setArticles]         = useState([])
  const [colorOptions, setColorOptions] = useState([{ value: 'tout', label: 'Toutes les couleurs' }])
  const [selectedArticles, setSelectedArticles] = useState([])

  const { roles } = useAuth()
  const navigate  = useNavigate()
  const loaderRef = useRef(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────────

  const fetchInitial = useCallback(async (
    search   = searchQuery,
    category = selectedCategory,
    company  = selectedCompany,
    urgency  = selectedUrgency,
    color    = selectedColor,
    sb       = sortBy,
    so       = sortOrder
  ) => {
    setLoading(true)
    setArticles([])
    setPage(1)
    setHasMore(true)
    try {
      const response = await api.get('articles', {
        params: { page: 1, per_page: pageSize, search, category, company, urgency, color, sort_by: sb, sort_order: so }
      })
      const { data, total, last_page } = response.data
      setArticles(data)
      setTotal(total)
      setHasMore(1 < last_page)
      setPage(2)

      const colors = [...new Set(data.map(a => a.color).filter(Boolean))]
      if (colors.length) {
        setColorOptions([
          { value: 'tout', label: 'Toutes les couleurs' },
          ...colors.map(c => ({ value: c, label: c })),
        ])
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedCompany, selectedUrgency, selectedColor, sortBy, sortOrder, pageSize])

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const response = await api.get('articles', {
        params: { page, per_page: pageSize, search: searchQuery, category: selectedCategory, company: selectedCompany, urgency: selectedUrgency, color: selectedColor, sort_by: sortBy, sort_order: sortOrder }
      })
      const { data, last_page } = response.data
      setArticles(prev => [...prev, ...data])
      setHasMore(page < last_page)
      setPage(prev => prev + 1)
    } catch (err) {
      console.error('Failed to load more:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, page, pageSize, searchQuery, selectedCategory, selectedCompany, selectedUrgency, selectedColor, sortBy, sortOrder])

  // ── Effects ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchInitial(searchQuery, selectedCategory, selectedCompany, selectedUrgency, selectedColor, sortBy, sortOrder)
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

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleSort = (col) => {
    if (!SORTABLE.includes(col)) return
    if (sortBy === col) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortOrder('asc')
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
      console.error('Error navigating to article:', error)
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

  // ── Sortable th helper ────────────────────────────────────────────────────────

  const Th = ({ col, label, align = 'left' }) => (
    <th
      onClick={() => SORTABLE.includes(col) && handleSort(col)}
      className={`px-4 py-2 text-${align} text-xs font-bold text-gray-700 uppercase tracking-wider
        ${SORTABLE.includes(col) ? 'cursor-pointer hover:bg-gray-200 select-none' : ''}`}
    >
      {label}
      {SORTABLE.includes(col) && <SortIcon col={col} sortBy={sortBy} sortOrder={sortOrder} />}
    </th>
  )

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className='w-full h-full bg-gray-50 p-0 md:px-2'>
      <div className='max-w-[1600px] mx-auto'>

        {/* Header */}
        <div className="mb-3 bg-white md:rounded-lg md:shadow-sm border border-gray-200 py-2 px-3 mt-2">

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
                {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
              </Button>
              {selectedUrgency !== 'tout' && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${URGENCY_BADGE[Number(selectedUrgency)]}`}>
                  {URGENCY_LABELS[Number(selectedUrgency)]}
                  <button onClick={() => setSelectedUrgency('tout')} className="font-bold hover:opacity-70 leading-none">×</button>
                </span>
              )}
              {selectedColor !== 'tout' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  {selectedColor}
                  <button onClick={() => setSelectedColor('tout')} className="font-bold hover:opacity-70 leading-none">×</button>
                </span>
              )}
            </div>
            {roles('admin') && (
              <Button
                type="primary"
                size="middle"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => handleShow()}
              >
                <PlusCircle size={18} /> Créer Article
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
        <div className='bg-white md:rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'>
                  <th className='px-4 py-2 text-left'>
                    <Checkbox
                      checked={selectedArticles.length === articles.length && articles.length > 0}
                      onChange={(e) => setSelectedArticles(e.target.checked ? [...articles] : [])}
                    />
                  </th>
                  <Th col="code"          label="Référence"      align="left"   />
                  <th className='px-4 py-1 text-left   text-xs font-bold text-gray-700 uppercase tracking-wider'>Désignation</th>
                  <th className='px-4 py-1 text-left   text-xs font-bold text-gray-700 uppercase tracking-wider'>Nom</th>
                  <Th col="stock"         label="QTE Disponible" align="center" />
                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Capacité max</th>
                  <Th col="ecart"         label="Écart"          align="center" />
                  <Th col="stock_min"     label="Stock min"      align="center" />
                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Stock moy.</th>
                  <Th col="urgency_level" label="Statut"         align="center" />
                  <th className='px-4 py-1'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 whitespace-nowrap'>
                {articles.map((article, index) => {
                  const stock   = Math.floor(article.stock * 100) / 100
                  const max     = parseFloat(article.max)
                  const min     = parseFloat(article.stock_min)
                  const moyenne = max / 2
                  const ecart   = max - stock
                  const level   = article.urgency_level ?? getUrgencyLevel(stock, min, max)

                  return (
                    <tr
                      key={article.id || index}
                      className={`hover:bg-blue-50 transition-colors duration-150 cursor-pointer group ${URGENCY_ROW[level]}`}
                    >
                      <td className='px-4 py-1'>
                        <Checkbox
                          checked={selectedArticles.some(a => a.id === article.id)}
                          onChange={(e) =>
                            setSelectedArticles(prev =>
                              e.target.checked ? [...prev, article] : prev.filter(a => a.id !== article.id)
                            )
                          }
                        />
                      </td>
                      <td className='px-4 py-1'>
                        <div className='flex items-center gap-2'>
                          <div className='w-1 h-8 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity' />
                          <span className='text-sm font-mono font-bold text-gray-900'>{article.code}</span>
                        </div>
                      </td>
                      <td className='px-4 py-1'>
                        <div className='text-sm text-gray-900 font-medium max-w-xs truncate'>{article.description}</div>
                      </td>
                      <td className='px-4 py-1 text-sm text-gray-700'>{article.name}</td>
                      <td className='px-4 py-1 text-center'>
                        <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                          {stock}
                        </span>
                      </td>
                      <td className='px-4 py-1 text-center'>
                        <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200'>
                          {max}
                        </span>
                      </td>
                      <td className='px-4 py-1 text-center'>
                        <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
                          {ecart}
                        </span>
                      </td>
                      <td className='px-4 py-1 text-center'>
                        <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
                          {min}
                        </span>
                      </td>
                      <td className='px-4 py-1 text-center'>
                        <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
                          {moyenne}
                        </span>
                      </td>
                      <td className='px-4 py-1 text-center'>
                        <span className={`inline-flex items-center justify-center px-3 py-0.5 rounded-lg text-xs font-semibold ${URGENCY_BADGE[level]}`}>
                          {URGENCY_LABELS[level]}
                        </span>
                      </td>
                      <td className='px-4 py-1'>
                        <div className='flex gap-2 justify-center'>
                          <Button size='small' onClick={() => handleShow(article.code)} variant='solid' color='green'>
                            <Edit size={15} />
                          </Button>
                          <Popconfirm
                            title="Supprimer l'article"
                            description="Êtes-vous sûr de vouloir supprimer cet article ?"
                            onConfirm={() => confirmDelete(article.code)}
                            okText="Oui"
                            cancelText="Non"
                          >
                            <Button size='small' variant='solid' color='red'>
                              <Trash size={15} />
                            </Button>
                          </Popconfirm>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {loading && <TableSkeleton rows={10} columns={11} />}
              </tbody>
            </table>
          </div>

          {!loading && articles.length === 0 && (
            <div className='py-16'>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <p className="text-gray-900 font-medium mb-1">Aucun article trouvé</p>
                    <p className="text-gray-500 text-sm">Essayez de modifier vos critères de recherche</p>
                  </div>
                }
              />
            </div>
          )}

          <div ref={loaderRef} className='py-4 flex items-center justify-center'>
            {loadingMore && (
              <div className='flex items-center gap-2 text-sm text-gray-500'>
                <Loader2 className='animate-spin' size={16} />
                Chargement...
              </div>
            )}
            {!loadingMore && hasMore && articles.length > 0 && (
              <Button size='small' onClick={fetchMore} className='text-gray-400 border-gray-200'>
                Charger plus
              </Button>
            )}
            {!hasMore && articles.length > 0 && (
              <p className='text-sm text-gray-400'>Tous les articles sont chargés ({total})</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default FabricationArticles