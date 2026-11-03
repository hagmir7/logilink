import { useEffect, useState } from 'react'
import { Input } from 'antd'
import { Search } from 'lucide-react'

export default function SearchFilter({ value, onChange, delay = 400 }) {
  const [local, setLocal] = useState(value ?? '')

  // debounce so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== (value ?? '')) onChange(local)
    }, delay)
    return () => clearTimeout(t)
  }, [local])

  return (
    <Input
      allowClear
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      placeholder='Rechercher...'
      prefix={<Search size={14} />}
      style={{ width: 220 }}
    />
  )
}