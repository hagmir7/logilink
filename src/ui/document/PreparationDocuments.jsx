import { useEffect, useState } from 'react'
import { Button, message } from 'antd'
import { Loader2, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import DocumentCard from '../components/ui/DocumentCard'
import DocumentFilters from '../components/filters/DocumentFilters'

const TYPE_OPTIONS = [
  { value: 'Cuisine', label: 'Cuisine' },
  { value: 'Placard', label: 'Placard' },
  { value: 'Laca', label: 'Laca' },
  { value: 'Polilaminado', label: 'Polilaminado' },
  { value: 'Stock', label: 'Stock' },
]

const LIST_URL = 'documents/preparation'

export default function PreparationDocuments() {
  const navigate = useNavigate()
  const { roles = () => false, user } = useAuth()
  const [data, setData] = useState({ data: [], next_page_url: null, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [moreSpinner, setMoreSpinner] = useState(false)
  const [filters, setFilters] = useState({ search: '', date: '', type: '', company: '' })

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))

  const hideExport = roles('preparation_cuisine') || roles('preparation_trailer')
  const canExport = !hideExport || Number(user?.company_id) !== 1

  // empty values are dropped so the backend ignores them
  const buildParams = (pageNumber) => ({
    ...Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v != null)
    ),
    page: pageNumber,
  })

  const fetchData = async (pageNumber = 1) => {
    setLoading(true)
    try {
      const res = await api.get(LIST_URL, { params: buildParams(pageNumber) })
      setData(res.data)
      setPage(pageNumber)
    } catch (err) {
      const raw = localStorage.getItem('user')
      if (!raw || raw === 'undefined' || raw === 'null') {
        navigate('/login', { replace: true })
      }
      message.error(err?.response?.data?.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const run = async () => {
      await fetchData(1)
      window.electron?.notifyPrintReady?.()
    }
    run()
    const id = setInterval(run, 40000)
    return () => clearInterval(id)
  }, [filters])

  const loadMore = async () => {
    if (!data.next_page_url) return
    setMoreSpinner(true)
    const nextPage = page + 1
    try {
      const res = await api.get(LIST_URL, { params: buildParams(nextPage) })
      setData({
        data: [...data.data, ...res.data.data],
        next_page_url: res.data.next_page_url,
        total: res.data.total,
      })
      setPage(nextPage)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setMoreSpinner(false)
    }
  }

  const handleSelectOrder = (orderId) => {
    navigate(`/layout/document/${orderId}`)
  }

  return (
    <div className='min-h-screen pt-3'>
      {/* Header */}
      <div className='flex flex-wrap items-center gap-4 mb-2 px-2 md:px-4'>
        <DocumentFilters
          filters={filters}
          setFilter={setFilter}
          typeOptions={TYPE_OPTIONS}
          showType={canExport}
        />

        <Button onClick={() => fetchData(1)}>
          {loading ? (
            <Loader2 className='animate-spin text-blue-500' size={17} />
          ) : (
            <RefreshCcw size={17} />
          )}
        </Button>
      </div>

      {/* Cards (used for every role) */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 md:p-4'>
        {data.data.map((item, index) => (
          <DocumentCard
            key={item.id ?? index}
            data={item}
            loading={loading}
            onSelectOrder={handleSelectOrder}
            companyId={filters.company}
          />
        ))}
      </div>

      {data.next_page_url && (
        <div className='flex justify-center py-6'>
          <Button onClick={loadMore} type='primary' loading={moreSpinner}>
            Charger Plus
          </Button>
        </div>
      )}
    </div>
  )
}