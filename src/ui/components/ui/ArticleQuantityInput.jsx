import React, { useState } from 'react'
import { Input, Tooltip } from 'antd'
const formatNumber = (value) => new Intl.NumberFormat().format(value)

const NumericInput = (props) => {
  const { value, onChange } = props
  const handleChange = (e) => {
    const { value: inputValue } = e.target
    const reg = /^-?\d*(\.\d*)?$/
    if (reg.test(inputValue) || inputValue === '' || inputValue === '-') {
      onChange(inputValue)
    }
  }
  // '.' at the end or only '-' in the input box.
  const handleBlur = () => {
    let valueTemp = value
    if (value.charAt(value.length - 1) === '.' || value === '-') {
      valueTemp = value.slice(0, -1)
    }
    onChange(valueTemp.replace(/0*(\d+)/, '$1'))
  }
  const title = value ? (
    <span className='numeric-input-title'>
      {value !== '-' ? formatNumber(Number(value)) : '-'}
    </span>
  ) : (
    'Quantity'
  )
  return (
    <Tooltip
      trigger={['focus']}
      title={title}
      placement='topLeft'
      classNames={{ root: 'numeric-input' }}
    >
      <Input
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder='Quantity'
        maxLength={16}
      />
    </Tooltip>
  )
}
const ArticleQuantityInput = ({ defaultValue, code }) => {
  const [value, setValue] = useState(defaultValue)
  return (
    <NumericInput style={{ width: 120, color: "black" }} value={value} onChange={setValue} />
  )
}
export default ArticleQuantityInput
