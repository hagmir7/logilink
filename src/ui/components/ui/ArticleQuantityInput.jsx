import { useState } from 'react'
import { Button, Input, Tooltip, Space, message } from 'antd'
import { CircleCheck } from 'lucide-react'
import { api } from '../../utils/api'
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

  const handleUpdate = async () => {
    try {
      await api.put(`palettes/${props.palette_code}/article/${props.article_id}/update`, {
        'quantity': value
      })
      message.success("Quantité modifiée avec succès.")
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message)
    }

  }

 return (
    <Tooltip
      title={title}
      placement="topLeft"
      trigger={['focus']}

    >
      <Space.Compact className="numeric-input w-full">
        <Input
          {...props}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Quantity"
          maxLength={16}
        />
        <Button
          onClick={handleUpdate}
          color="cyan" variant="solid"
          icon={<CircleCheck size={16} />}
          className="flex items-center justify-center"
        />
      </Space.Compact>
    </Tooltip>)
}
const ArticleQuantityInput = ({ defaultValue, article_id, palette_code  }) => {
  const [value, setValue] = useState(defaultValue)
  return (
    <NumericInput 
      style={{ width: 120, color: "black" }}
      value={value}
      onChange={setValue}
      article_id={article_id}
      palette_code={palette_code}
    />
  )
}
export default ArticleQuantityInput
