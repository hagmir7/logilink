import { Space } from 'antd'
import SearchFilter from './SearchFilter'
import DateFilter from './DateFilter'
import TypeFilter from './TypeFilter'
import CompanyFilter from './CompanyFilter'

export default function DocumentFilters({
  filters,
  setFilter,
  showCompany = true,
  showType = true,
}) {
  return (
    <Space wrap style={{ margin: '12px 0 16px 12px' }}>
      <SearchFilter value={filters.search} onChange={(v) => setFilter('search', v)} />
      <DateFilter value={filters.date} onChange={(v) => setFilter('date', v)} />
      {showType && (
        <TypeFilter
          value={filters.type}
          onChange={(v) => setFilter('type', v)}
        />
      )}
      {showCompany && (
        <CompanyFilter value={filters.company} onChange={(v) => setFilter('company', v)} />
      )}
    </Space>
  )
}