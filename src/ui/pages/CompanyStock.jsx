import React, { useEffect, useState } from 'react'
import { Loader2, RefreshCcw, Eye, PlusCircle, Package } from 'lucide-react'
import { Button, Empty, Input, Select, Pagination } from 'antd'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { categories, uppercaseFirst } from '../utils/config'
import { useNavigate } from 'react-router-dom'
import ImportArticle from '../components/ImportArticle'
import TableSkeleton from '../components/ui/TableSkeleton'

const { Search } = Input

function CompanyStock({ company_id }) {
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('panneaux')
  const [selectedCompany, setSelectedCompany] = useState('')
  const { roles } = useAuth()

  const [articles, setArticles] = useState({
    data: [],
    total: 0,
    current_page: 1,
    per_page: 100,
    last_page: 1
  })

  const navigate = useNavigate()

  const fetchData = async (currentPage = 1, search = searchQuery, category = selectedCategory, size = pageSize, company = selectedCompany) => {
    setLoading(true)
    try {
      const response = await api.get(`articles`, {
        params: {
          page: currentPage,
          per_page: size,
          search: search,
          category: category,
          company: company
        }
      })
      setArticles({
        data: response.data.data,
        total: response.data.total,
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        last_page: response.data.last_page
      })
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when page changes
  useEffect(() => {
    fetchData(page, searchQuery, selectedCategory, pageSize, selectedCompany)
  }, [page])

  // Reset to page 1 and fetch when filters change
  useEffect(() => {
    setPage(1)
    fetchData(1, searchQuery, selectedCategory, pageSize, selectedCompany)
  }, [searchQuery, selectedCategory, selectedCompany, pageSize])

  const handlePageChange = (newPage, newPageSize) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setPage(1) // Reset to page 1 when changing page size
    } else {
      setPage(newPage)
    }
  }

  const handleShow = async (id = null) => {
    if(!roles(['admin', 'supper_admin'])){
      return;
    }

    try {
      let url;

      if (id) {
        if (typeof id === 'object') {
          console.warn('⚠️ handleShow received an object instead of ID:', id);
          id = id.id || id.code || null;
        }
        url = `/articles/${id}`;
      }
      else {
        url = '/articles/create';
      }

      if (window.electron && typeof window.electron.openShow === 'function') {
        await window.electron.openShow({
          width: 900,
          height: 700,
          url,
        });
      } else {
        navigate(url);
      }

    } catch (error) {
      console.error('❌ Error navigating to article:', error);
    }
  };

  return (
    <div className='w-full h-full bg-gray-50 p-0 md:px-2'>
      <div className='max-w-[1600px] mx-auto'>
        {/* Header Section */}
        <div className="mb-4 bg-white md:rounded-lg md:shadow-sm border border-gray-200 py-2 px-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1 bg-blue-50 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Gestion des Articles</h1>
              <p className="text-sm text-gray-500">Gérez et consultez votre stock</p>
            </div>
          </div>

          {/* Controls */}
          <div className="grid gap-4 md:grid-cols-3 md:items-end">
            {/* Left Side Inputs */}
            <div className="flex gap-3 col-span-2 items-center">
              <Search
                placeholder="Rechercher un article..."
                allowClear
                size="large"
                className='flex-1 max-w-md'
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                value={selectedCategory}
                placeholder="Catégorie"
                size="large"
                className="min-w-[180px]"
                options={categories}
                onChange={setSelectedCategory}
              />

              <Select
                value={selectedCompany}
                placeholder="Société"
                size="large"
                className="min-w-[180px]"
                options={[
                   {label: "Tout", value: ''},
                  {label: "Intercocina", value: 1},
                  {label: "Seriemoble", value: 2},
                  {label: "AstiDkora", value: 3}
                ]}
                onChange={setSelectedCompany}
              />

              <Button
                size="large"
                className="flex items-center gap-2"
                onClick={() => fetchData(page, searchQuery, selectedCategory)}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
              </Button>
            </div>

            {/* Right Side Admin Actions */}
            {roles("admin") && (
              <div className="flex gap-3 col-span-1 justify-start md:justify-end">
                <ImportArticle />
                <Button
                  type="primary"
                  size="large"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={handleShow}
                >
                  <PlusCircle size={18} /> Créer Article
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          {articles.total > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Affichage de <span className="font-semibold text-gray-900">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, articles.total)}</span> sur <span className="font-semibold text-gray-900">{articles.total}</span> articles
              </span>
              <span className="text-gray-500">Page {articles.current_page} / {articles.last_page}</span>
            </div>
          )}
        </div>

        {/* Table Card */}
        <div className='bg-white md:rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full overflow-x-auto'>
              <thead>
                <tr className='bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200'>
                  <th className='px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    Référence
                  </th>

                  <th className='px-4 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    Désignation
                  </th>

                  {!roles(['commercial', 'admin']) && (
                    <>
                      <th className="px-4 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Couleur
                      </th>
                      <th className="px-4 py-1 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Dimensions
                      </th>
                    </>
                  )}

                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    Disponible
                  </th>

                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    Physique
                  </th>

                  <th className='px-4 py-1 text-center text-xs font-bold text-gray-700 uppercase tracking-wider'>
                    Préparation
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 whitespace-nowrap'>
                {articles?.data?.map((article, index) => (
                  <tr
                    key={article.id || index}
                     onClick={() => handleShow(article.code)}
                    className='hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group'
                  >
                    <td className='px-4 py-1'>
                      <div className='flex items-center gap-2'>
                        <div className='w-1 h-8 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'></div>
                        <span className='text-sm font-mono font-bold text-gray-900'>
                          {article.code}
                        </span>
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

                    {!roles(['commercial', 'admin']) && (
                      <>
                        <td className='px-4 py-1'>
                          <div className='text-sm text-gray-700'>
                            {article.color || (
                              <span className='text-gray-400 italic'>Non spécifié</span>
                            )}
                          </div>
                        </td>

                        <td className='px-4 py-1'>
                          <div className='text-sm text-gray-700 font-mono bg-gray-50 px-3 py-1 rounded inline-block'>
                            {article.height || '—'} × {article.width || '—'}
                          </div>
                        </td>
                      </>
                    )}

                    <td className='px-4 py-1 text-center'>
                      <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                        {Math.floor(article.stock * 100) / 100}
                      </span>
                    </td>

                    <td className='px-4 py-1 text-center'>
                      <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200'>
                        {Math.floor((parseFloat(article.stock) + parseFloat(article.stock_prepartion)) * 100) / 100}
                      </span>
                    </td>

                    <td className='px-4 py-1 text-center'>
                      <span className='inline-flex items-center justify-center min-w-[60px] px-3 py-1.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
                        {parseFloat(article.stock_prepartion)}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Loading State */}
                {loading && (
                  <TableSkeleton rows={roles(['admin', 'commercial']) ? 8 : 10} columns={roles(['admin', 'commercial']) ? 5 : 7} />
                )}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!loading && articles.data.length === 0 && (
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

          {/* Pagination */}
          {!loading && articles.data.length > 0 && (
            <div className='px-4 py-1 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4'>
              <Pagination
                current={page}
                total={articles.total}
                pageSize={pageSize}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} sur ${total} articles`
                }
                onChange={handlePageChange}
                onShowSizeChange={handlePageChange}
                pageSizeOptions={['10', '20', '50', '100']}
                size='default'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyStock