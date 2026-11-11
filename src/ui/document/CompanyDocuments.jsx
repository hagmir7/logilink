import { Download, Loader2, RefreshCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { Button, message } from 'antd'
import PreparationDocumentTable from '../components/PreparationDocumentTable'
import DocumentFilters from '../components/filters/DocumentFilters'

function CompanyDocuments() {
  const navigate = useNavigate()

  const [data, setData] = useState({ data: [], next_page_url: null, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [moreSpinner, setMoreSpinner] = useState(false)
  const [exportSpin, setExportSpin] = useState(false)
  const [orderBy, setOrderBy] = useState('')
  const [orderDir, setOrderDir] = useState('asc')
  const [filters, setFilters] = useState({ search: '', date: '', type: '', company: '' })

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))

  // empty values are dropped so the backend ignores them
  const buildParams = () =>
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null))

  const requestParams = (pageNumber) => ({
    ...buildParams(),
    order_by: orderBy || undefined,
    order_dir: orderDir,
    page: pageNumber,
  })

  const fetchData = async (pageNumber = 1) => {
    setLoading(true)
    try {
      const res = await api.get('documents/company', { params: requestParams(pageNumber) })
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

  // refetch on filter / order change, then poll every 40s
  useEffect(() => {
    const run = async () => {
      await fetchData(1)
      window.electron?.notifyPrintReady?.()
    }
    run()
    const id = setInterval(run, 40000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, orderBy, orderDir])

  const loadMore = async () => {
    if (!data.next_page_url) return
    setMoreSpinner(true)
    const nextPage = page + 1
    try {
      const res = await api.get('documents/company', { params: requestParams(nextPage) })
      setData({
        data: [...data.data, ...res.data.data],
        next_page_url: res.data.next_page_url,
        total: res.data.total,
      })
      setPage(nextPage)
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to load more')
    } finally {
      setMoreSpinner(false)
    }
  }

  const handleExport = async () => {
    setExportSpin(true)
    try {
      const res = await api.get('documents/company/export', {
        params: buildParams(),
        responseType: 'blob',
      })
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'company_documents.xlsx'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      message.error('Export failed')
    } finally {
      setExportSpin(false)
    }
  }

  const handleSelectOrder = (orderId) => navigate(`/layout/document/${orderId}`)

  return (
    <div className='min-h-screen'>
      <div className='flex gap-4 pe-2 mb-2'>
        <DocumentFilters filters={filters} setFilter={setFilter} />

        <div className='flex items-center gap-2'>
          <Button
            color='green'
            variant='solid'
            size='middle'
            loading={exportSpin}
            onClick={handleExport}
            icon={<Download size={17} />}
          >
            Export
          </Button>

          <Button onClick={() => fetchData(1)} size='middle'>
            {loading ? (
              <Loader2 className='animate-spin text-blue-500' size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
          </Button>
        </div>
      </div>

      <PreparationDocumentTable
        documents={data.data}
        onSelectOrder={handleSelectOrder}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        orderDir={orderDir}
        setOrderDir={setOrderDir}
        loading={loading}
        companyId={filters.company}
      />

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

export default CompanyDocuments