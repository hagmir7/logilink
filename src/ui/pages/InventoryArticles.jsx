import React, { useEffect, useState } from 'react'
import { Loader2, RefreshCcw, Settings } from 'lucide-react'
import { Button, Empty, Input, Select } from 'antd'
import { api } from '../utils/api'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../contexts/AuthContext'
import { categories, uppercaseFirst } from '../utils/config'
import { useParams } from 'react-router-dom'
import ContextMenu from '../components/ui/RightClick'

// Utility to format date (if needed elsewhere)
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const { Search } = Input

function InventoryArticles() {


  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [moreSpinner, setMoreSpinner] = useState(false)
  const [searchSpinner, setSearchSpinner] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { roles } = useAuth()
  const { id } = useParams();

  const [articles, setArticles] = useState({
    data: [],
    next_page_url: null,
    total: 0,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`inventory/articles/${id}?search=${searchQuery}`)
      setArticles({
        data: response.data.data,
        next_page_url: response.data.next_page_url,
        total: response.data.total,
      })
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [searchQuery])

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='flex flex-wrap justify-between items-center gap-4 mb-4 px-2 md:px-4'>
        <div className='flex items-center gap-4'>
          <Search
            placeholder='Recherch'
            loading={searchSpinner}
            size='middle'
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={fetchData} size='middle'>
            {loading ? (
              <Loader2 className='animate-spin text-blue-500' size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
            <span className='hidden sm:inline'>Rafraîchir</span>
          </Button>

          <Select
            defaultValue='panneaux'
            placeholder='Filter'
            size='middle'
            style={{ width: 300 }}
            options={categories}
          />
        </div>
      </div>
      {/* Desktop Table View */}

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-4 text-left text-md font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Référence
              </th>
              <th className='px-6 py-4 text-left text-md font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Désignation
              </th>
              <th className='px-6 py-4 text-left text-md font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Quantity
              </th>
              <th className='px-6 py-4 text-left text-md font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Couleur
              </th>
              <th className='px-6 py-4 text-left text-md font-semibold text-gray-500 uppercase whitespace-nowrap'>
                H / L / P
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {articles?.data?.map((article, index) => (
              <tr
                key={index}
                className='hover:bg-gray-50 cursor-pointer transition-colors duration-200'
              >
                <td className='px-6 py-2 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <span className='text-sm font-bold text-gray-900'>
                      {article.code}
                    </span>
                  </div>
                </td>

                {roles('commercial') || roles('admin') ? (
                  <td className='px-6 py-2 whitespace-nowrap'>
                    {uppercaseFirst(article.description)}
                  </td>
                ) : article.name ? (
                  <td className='px-6 py-2 whitespace-nowrap'>
                    <span className='text-sm text-gray-900 font-medium'>
                      {uppercaseFirst(article.name)}
                    </span>
                  </td>
                ) : (
                  <td className='px-6 py-2 whitespace-nowrap'>
                    <span className='text-sm text-gray-900 font-medium'>
                      {uppercaseFirst(article.description)}
                    </span>
                  </td>
                )}

                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                  {(Number(article.inventory_quantity) || 0).toFixed(3)}
                </td>
                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                  {article.color || '_'}
                </td>
                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                  {`${article.height || '_'} / ${article.width || '_'} / ${
                    article.depth || '_'
                  }`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        articles.data.length === 0 && (
          <Empty className='mt-10' description='Aucun article à afficher' />
        )
      )}
    </div>
  )
}

export default InventoryArticles