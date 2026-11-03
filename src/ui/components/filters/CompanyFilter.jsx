import { useEffect, useState } from 'react'
import { Select } from 'antd'
import { api } from '../../utils/api'
// import api from '../../utils/api' // adjust: your axios instance

export default function CompanyFilter({ value, onChange }) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get('/companies')
      .then((res) => active && setCompanies(res.data?.data ?? res.data ?? []))
      .catch(() => active && setCompanies([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <Select
      allowClear
      showSearch
      optionFilterProp='label'
      loading={loading}
      value={value || undefined}
      onChange={(v) => onChange(v ?? '')}
      placeholder='Société'
      style={{ width: 180 }}
      options={companies.map((c) => ({ value: c.id, label: c.name }))}
    />
  )
}