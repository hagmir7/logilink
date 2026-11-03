import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import FabricationDocumentTable from '../components/ui/FabricationDocumentTable'
import DocumentFilters from '../components/filters/DocumentFilters'

export default function FabricationDocuments() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [orderBy, setOrderBy] = useState('')
  const [orderDir, setOrderDir] = useState('asc')
  const [filters, setFilters] = useState({ search: '', date: '', type: '', company: '' })

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))

  useEffect(() => {
    setLoading(true)
    api.get('/documents/fabrication', {
        params: {
          // empty values are dropped so the backend ignores them
          ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null)),
          order_by: orderBy || undefined,
          order_dir: orderDir,
        },
      })
      .then((res) => setDocuments(res.data.data))
      .finally(() => setLoading(false))
  }, [filters, orderBy, orderDir])

  return (
    <>
      <DocumentFilters filters={filters} setFilter={setFilter} />
      <FabricationDocumentTable
        documents={documents}
        loading={loading}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        setOrderDir={setOrderDir}
        companyId={filters.company}
      />
    </>
  )
}