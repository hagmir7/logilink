import React, { useEffect, useState } from 'react'
import { Loader2, RefreshCcw, Eye } from 'lucide-react'
import { Button, Empty, Input, Select, Pagination, Tag } from 'antd'
import { api } from '../utils/api'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../contexts/AuthContext'
import { categories, uppercaseFirst } from '../utils/config'
import { useNavigate } from 'react-router-dom'
import ImportArticle from '../components/ImportArticle'

const { Search } = Input

function CompanyStock({ company_id }) {
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('panneaux')
  const { roles } = useAuth()

  const [articles, setArticles] = useState({
    data: [],
    total: 0,
    current_page: 1,
    per_page: 10,
    last_page: 1
  })

  const navigate = useNavigate()

  const fetchData = async (currentPage = 1, search = searchQuery, category = selectedCategory) => {
    setLoading(true)
    try {
      const response = await api.get(`articles`, {
        params: {
          page: currentPage,
          per_page: pageSize,
          search: search,
          category: category
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

  useEffect(() => {
    setPage(1) // Reset to first page when search changes
    fetchData(1, searchQuery, selectedCategory)
  }, [searchQuery, selectedCategory, pageSize])

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage)
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
    fetchData(newPage, searchQuery, selectedCategory)
  }

  const handleShow = async (id) => {
    try {
      const url = `/articles/${id}`
      if (window.electron && typeof window.electron.openShow === 'function') {
        await window.electron.openShow({
          width: 900,
          height: 700,
          url,
        })
      } else {
        navigate(`/articles/${id}`)
      }
    } catch (error) {
      console.error('Error navigating to article:', error)
    }
  }

  const getConditionColor = (condition) => {
    const conditionColors = {
      'excellent': 'green',
      'bon': 'blue',
      'moyen': 'orange',
      'mauvais': 'red',
      'neuf': 'cyan'
    }
    return conditionColors[condition?.toLowerCase()] || 'default'
  }

  return (
    <div className='w-full mx-auto p-4'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='flex flex-wrap gap-3 items-center'>
            <Search
              placeholder='Rechercher un article...'
              allowClear
              size='large'
              className='w-64'
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select
              value={selectedCategory}
              placeholder='Catégorie'
              size='large'
              className='w-48'
              options={categories}
              onChange={setSelectedCategory}
            />

            <Button 
              size='large'
              onClick={() => fetchData(page, searchQuery, selectedCategory)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className='animate-spin' size={16} />
              ) : (
                <RefreshCcw size={16} />
              )}
              Actualiser
            </Button>
          </div>

          <div>
            <ImportArticle />
          </div>
        </div>

        {/* Stats */}
        <div className='mt-4 text-sm text-gray-600'>
          {articles.total > 0 && (
            <span>
              Affichage de {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, articles.total)} sur {articles.total} articles
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr className='border-b border-gray-200'>
                <th className='px-4 py-3 text-left text-md font-medium text-gray-700 uppercase tracking-wider'>
                  Référence
                </th>

                <th className='px-4 py-3 text-left text-md font-medium text-gray-700 uppercase tracking-wider'>
                  Désignation
                </th>

                 {!roles('commercial') || !roles('admin') ? (
                <>
                  <th className="px-4 py-3 text-left text-md font-medium text-gray-700 uppercase tracking-wider">
                    Couleur
                  </th>
                  <th className="px-4 py-3 text-left text-md font-medium text-gray-700 uppercase tracking-wider">
                    Dimensions
                  </th>
                </>
              ) : null}

                <th className='px-4 py-3 text-left text-md font-medium text-gray-700 uppercase tracking-wider'>
                  Disponible
                </th>

                <th className='px-4 py-3 text-left text-md font-medium text-gray-700 uppercase tracking-wider'>
                  Physique
                </th>

                 <th className='px-4 py-3 text-left text-md font-medium text-gray-700 uppercase tracking-wider'>
                  Preparation
                </th>

                <th className='px-4 py-3 text-left text-md font-medium text-gray-700 uppercase tracking-wider'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {articles?.data?.map((article, index) => (
                <tr
                  key={article.id || index}
                  className='hover:bg-gray-50 transition-colors duration-150'
                >
                  <td className='px-4 py-2'>
                    <div className='text-sm font-mono font-semibold text-gray-900'>
                      {article.code}
                    </div>
                  </td>
                  
                  <td className='px-4 py-2'>
                    <div className='text-sm text-gray-900 max-w-xs whitespace-nowrap'>
                      {roles('commercial') || roles('admin') 
                        ? uppercaseFirst(article.description)
                        : uppercaseFirst(article.name || article.description)
                      }
                    </div>
                  </td>

                   {!roles('commercial') || !roles('admin') ? <>
                   <td className='px-4 py-2'>
                    <div className='text-sm text-gray-900'>
                      {article.color || (
                        <span className='text-gray-400'>—</span>
                      )}
                    </div>
                  </td>

                  <td className='px-4 py-2'>
                    <div className='text-sm text-gray-600 font-mono'>
                      {article.height || '—'} × {article.width || '—'}
                    </div>
                  </td>
                  
                  </> : ''}

                  <td className='px-4 py-2'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      { article.quantity + article.stock_prepare }
                    </span>
                  </td>

                  <td className='px-4 py-2'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      {article.quantity}
                    </span>
                  </td>

                  <td className='px-4 py-2'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      {parseFloat(article.stock_prepartion)}
                    </span>
                  </td>

                 

                 

                  <td className='px-4 py-2'>
                    <Button
                      type='text'
                      size='small'
                      icon={<Eye size={14} />}
                      onClick={() => handleShow(article.code)}
                      className='text-blue-600 hover:text-blue-700'
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading && articles.data.length === 0 && (
          <div className='py-12'>
            <Empty 
              description='Aucun article trouvé' 
              imageStyle={{ height: 60 }}
            />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className='py-12 flex justify-center'>
            <Spinner />
          </div>
        )}

        {/* Pagination */}
        {!loading && articles.data.length > 0 && (
          <div className='px-4 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='text-sm text-gray-700'>
              Page {articles.current_page} sur {articles.last_page}
            </div>
            
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
              size='small'
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanyStock