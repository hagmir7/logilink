import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Loader2, RefreshCcw, PlusCircle, Package, Trash, Edit } from 'lucide-react'
import { Button, Empty, Input, Select, Popconfirm, message, Checkbox } from 'antd'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { categories, uppercaseFirst } from '../utils/config'
import { useNavigate } from 'react-router-dom'
import TableSkeleton from '../components/ui/TableSkeleton'
import OFModal from '../components/OFModal'

const { Search } = Input

function FabricationArticles({ company_id }) {
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('semi-fini')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const { roles } = useAuth()
  const [selectedArticles, setSelectedArticles] = useState([])
  const [articles, setArticles] = useState([])

  const navigate = useNavigate()
  const loaderRef = useRef(null)

  const fetchInitial = useCallback(async (
    search = searchQuery,
    category = selectedCategory,
    company = selectedCompany
  ) => {
    setLoading(true)
    setArticles([])
    setPage(1)
    setHasMore(true)
    try {
      const response = await api.get('articles', {
        params: { page: 1, per_page: pageSize, search, category, company }
      })
      const { data, total, last_page } = response.data
      setArticles(data)
      setTotal(total)
      setHasMore(1 < last_page)
      setPage(2)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategory, selectedCompany, pageSize])

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const response = await api.get('articles', {
        params: {
          page,
          per_page: pageSize,
          search: searchQuery,
          category: selectedCategory,
          company: selectedCompany
        }
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
  }, [loadingMore, hasMore, page, pageSize, searchQuery, selectedCategory, selectedCompany])

  // Reset & refetch when filters change
  useEffect(() => {
    fetchInitial(searchQuery, selectedCategory, selectedCompany)
  }, [searchQuery, selectedCategory, selectedCompany])

  // Intersection observer for auto load-more on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchMore()
        }
      },
      { threshold: 0.1 }
    )
    const el = loaderRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [fetchMore, hasMore, loadingMore])

  const handleShow = async (id = null) => {
    if (!roles(['admin', 'supper_admin'])) return
    try {
      let url = id ? `/articles/${typeof id === 'object' ? id.id || id.code : id}` : '/articles/create'
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

  return (
    <div className='w-full h-full bg-gray-50 p-0 md:px-2'>
      <div className='max-w-[1600px] mx-auto'>

        {/* Header */}
        <div className="mb-3 bg-white md:rounded-lg md:shadow-sm border border-gray-200 py-2 px-3 mt-2">
          <div className="flex items-center gap-3 mb-0">
            <div className="p-1 bg-blue-50 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Gestion des Articles</h1>
              <p className="text-sm text-gray-500">Gérez et consultez votre stock</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:items-end">
            <div className="flex gap-3 col-span-2 items-center">
              <Search
                placeholder="Rechercher un article..."
                allowClear
                size="middle"
                className='flex-1 max-w-md'
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                value={selectedCategory}
                placeholder="Catégorie"
                size="middle"
                className="min-w-[180px]"
                options={categories}
                onChange={setSelectedCategory}
              />
              <OFModal articles={selectedArticles} />
              <Button
                size="middle"
                onClick={() => fetchInitial()}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
              </Button>
            </div>

            {roles('admin') && (
              <div className="flex gap-3 col-span-1 justify-start md:justify-end">
                <Button
                  type="primary"
                  size="middle"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={handleShow}
                >
                  <PlusCircle size={18} /> Créer Article
                </Button>
              </div>
            )}
          </div>

          {total > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                <span className="font-semibold text-gray-900">{articles.length}</span>
                {' '}sur{' '}
                <span className="font-semibold text-gray-900">{total}</span> articles chargés
              </span>
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
                      onChange={(e) =>
                        setSelectedArticles(e.target.checked ? [...articles] : [])
                      }
                    />
                    
                  </th>
                  <th className='px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>Référence</th>
                  <th className='px-4 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>Désignation</th>
                  <th className='px-4 py-1 text-start text-xs font-bold text-gray-700 uppercase tracking-wider'>Nom</th>
                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>QTE Disponible</th>
                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Capacité totale</th>
                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Écart</th>
                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Stock min</th>
                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>Stock moyenne</th>
                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 whitespace-nowrap'>
                {articles.map((article, index) => (
                  <tr
                    key={article.id || index}
                    className='hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group'
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
                        <div className='w-1 h-8 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'></div>
                        <span className='text-sm font-mono font-bold text-gray-900'>{article.code}</span>
                      </div>
                    </td>
                    <td className='px-4 py-1'>
                      <div className='text-sm text-gray-900 font-medium max-w-md'>
                        {roles(['commercial', 'admin'])
                          ? uppercaseFirst(article.description)
                          : uppercaseFirst(article.name || article.description)
                        }
                      </div>
                    </td>
                    <td className='px-4 py-1 text-start'>{article.name}</td>
                    <td className='px-4 py-1 text-center'>
                      <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                        {Math.floor(article.stock * 100) / 100}
                      </span>
                    </td>
                    <td className='px-4 py-1 text-center'>
                      <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200'>
                        {parseFloat(article.max)}
                      </span>
                    </td>
                    <td className='px-4 py-1 text-center'>
                      <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
                        {(Math.floor(article.stock * 100) / 100) - parseFloat(article.max)}
                      </span>
                    </td>
                    <td className='px-4 py-1 text-center'>
                      <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
                        {parseFloat(article.stock_min)}
                      </span>
                    </td>
                    <td className='px-4 py-1 text-center'>
                      <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
                        {parseFloat(article.stock_prepartion)}
                      </span>
                    </td>
                    <td className='px-4 py-1 text-center flex gap-2'>
                      <Button size='small' onClick={() => handleShow(article.code)} variant='solid' color='green'><Edit size={15} /></Button>
                      <Popconfirm
                        title="Supprimer l'article"
                        description="Êtes-vous sûr de vouloir supprimer cet article ?"
                        onConfirm={() => confirmDelete(article.code)}
                        okText="Oui"
                        cancelText="Non"
                      >
                        <Button size='small' variant='solid' color='red'><Trash size={15} /></Button>
                      </Popconfirm>
                    </td>
                  </tr>
                ))}

                {loading && <TableSkeleton rows={10} columns={9} />}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
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

          {/* Load more trigger (intersection observer target) */}
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