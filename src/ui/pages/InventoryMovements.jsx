import React, { useEffect, useState } from 'react'
import {
  ArrowDownIcon,
  ArrowUp,
  ArrowUpDown,
  Edit,
  Loader2,
  RefreshCcw,
  Trash,
} from 'lucide-react'
import { Badge, Button, Empty, Input, Popconfirm, Select, Space, DatePicker } from 'antd'
import { api } from '../utils/api'
import Spinner from '../components/ui/Spinner'
import { locale, uppercaseFirst } from '../utils/config'
import { useParams } from 'react-router-dom'
const { RangePicker } = DatePicker;

const options = [
  {
    label: 'Entrée',
    value: 'IN',
    emoji: <ArrowDownIcon size={18} color='green' />,
    desc: 'Entrée',
  },
  {
    label: 'Sortie',
    value: 'OUT',
    emoji: <ArrowUp size={18} color='red' />,
    desc: 'Sortie',
  },
  {
    label: 'Transfert',
    value: 'TRANSFER',
    emoji: <ArrowUpDown size={18} color='orange' />,
    desc: 'Transfert',
  },
]

const getLabelWithIcon = (value) => {
  const option = options.find((opt) => opt.value === value)
  return option ? (
    <span className='flex items-center gap-1'>
      {option.emoji}
      {option.label}
    </span>
  ) : null
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

const { Search } = Input

function InventoryMovements() {
  const [loading, setLoading] = useState(false)
  const [searchSpinner, setSearchSpinner] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { id } = useParams()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [openConfirmId, setOpenConfirmId] = useState(null)
  const [types, setTypes] = useState('');
  const [dateFilter, setDateFilter] = useState('')

  const [movments, setMovments] = useState({
    data: [],
    next_page_url: null,
    total: 0,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`inventory/${id}?types=${types}&dates=${dateFilter}&search=${searchQuery}`)
      setMovments(data.movements)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (value) => {

    setTypes(value)
  }

  useEffect(() => {
    fetchData()
  }, [searchQuery, types, dateFilter])

  const handleOk = async (movementId) => {
    setConfirmLoading(true)
    try {
      await api.delete(`inventory/delete/movement/${movementId}`)
      fetchData()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setConfirmLoading(false)
      setOpenConfirmId(null)
    }
  }

  const handleCancel = () => {
    setOpenConfirmId(null)
  }


  return (
    <div className='w-full'>
      {/* Header */}
      <div className='flex flex-wrap justify-between items-center gap-4 mb-4 px-2 md:px-4'>
        <div className='flex items-center gap-4'>
          <Search
            placeholder='Recherch'
            loading={searchSpinner}
            size='middle'
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            mode='multiple'
            style={{ width: '100%' }}
            placeholder='Filtre'
            onChange={handleChange}
            options={options}
            optionRender={(option) => (
              <Space>
                <span role='img' aria-label={option.data.label}>
                  {option.data.emoji}
                </span>
                {option.data.desc}
              </Space>
            )}
          />

            <RangePicker
                locale={locale}
                className='w-full'
                placeholder={['Date début', 'Date fin']}
                onChange={(dates, dateStrings) => {
                    setDateFilter(dateStrings)
                }} />

          <Button onClick={fetchData} size='middle'>
            {loading ? (
              <Loader2 className='animate-spin text-blue-500' size={17} />
            ) : (
              <RefreshCcw size={17} />
            )}
            <span className='hidden sm:inline'>Rafraîchir</span>
          </Button>
        </div>
      </div>

      {/* Table View */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Référence
              </th>
              <th className='px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Désignation
              </th>
              <th className='px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Type
              </th>
              <th className='px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Emplacement
              </th>
              <th className='px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Quantité
              </th>
              <th className='px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Personnel
              </th>
              <th className='px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Date
              </th>
              <th className='px-6 py-4 text-left text-[13px] font-semibold text-gray-500 uppercase whitespace-nowrap'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {movments?.data.map((movement, index) => (
              <tr
                key={movement.id || index}
                className='hover:bg-gray-50 cursor-pointer transition-colors duration-200'
              >
                <td className='px-6 py-2 whitespace-nowrap'>
                  <span className='text-sm font-bold text-gray-900'>
                    {movement.code_article}
                  </span>
                </td>
                <td className='px-6 py-2 whitespace-nowrap'>
                  <span className='text-sm text-gray-900 font-medium'>
                    {uppercaseFirst(movement.designation)}
                  </span>
                </td>
                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                  {getLabelWithIcon(movement.type)}
                </td>
                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                  {movement.emplacement_code}
                </td>
                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                  {movement.quantity}
                </td>
                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                  {movement?.user?.full_name}
                </td>
                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                  {formatDate(movement.created_at)}
                </td>
                <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500 space-x-2'>
                  <Popconfirm
                    title='Supprimer'
                    description='Etes-vous sûr de vouloir Supprimer'
                    open={openConfirmId === movement.id}
                    onConfirm={() => handleOk(movement.id)}
                    okButtonProps={{ loading: confirmLoading }}
                    onCancel={handleCancel}
                    cancelText='Annuler'
                    okText='Supprimer'
                    color="danger"
                    okType='danger'
                  >
                    <Button
                      color="danger" variant="solid"
                      className='bg-red-500 hover:bg-red-600 text-white'
                      onClick={() => setOpenConfirmId(movement.id)}
                    >
                      <Trash size={15} />
                    </Button>
                  </Popconfirm>
                  {/* <Button>
                    <Edit size={15} />
                  </Button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        movments.data.length === 0 && (
          <Empty className='mt-10' description='Aucun article à afficher' />
        )
      )}
    </div>
  )
}

export default InventoryMovements
