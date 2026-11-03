import { Select } from 'antd'

// options: [{ value: 1, label: 'Commande' }, ...] (adjust to your `de.Type` values)
export default function TypeFilter({ value, onChange, }) {
  const options = [
    { value: 'Cuisine', label: 'Cuisine' },
    { value: 'Placard', label: 'Placard' },
    { value: 'Laca', label: 'Laca' },
    { value: 'Polilaminado', label: 'Polilaminado' },
    { value: 'Stock', label: 'Stock' },
  ];
  return (
    <Select
      allowClear
      value={value || undefined}
      onChange={(v) => onChange(v ?? '')}
      options={options}
      placeholder='Type'
      style={{ width: 150 }}
    />
  )
}