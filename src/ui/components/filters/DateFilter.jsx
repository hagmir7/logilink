import { DatePicker } from 'antd'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

// value / onChange use the backend format: "YYYY-MM-DD,YYYY-MM-DD" or ''
export default function DateFilter({ value, onChange }) {
  const range = value ? value.split(',').map((d) => dayjs(d)) : null

  return (
    <RangePicker
      value={range}
      format='DD/MM/YYYY'
      onChange={(dates) =>
        onChange(
          dates
            ? `${dates[0].format('YYYY-MM-DD')},${dates[1].format('YYYY-MM-DD')}`
            : ''
        )
      }
    />
  )
}