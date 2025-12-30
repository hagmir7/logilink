import React, { useEffect, useState } from 'react'
import {
  ArrowDownIcon,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  Download,
  Edit,
  Loader2,
  RefreshCcw,
  Trash,
} from 'lucide-react'
import {
  Badge,
  Button,
  Empty,
  Input,
  Popconfirm,
  Select,
  Space,
  DatePicker,
  message,
  Modal,
} from 'antd'
import { api } from '../utils/api'
import Spinner from '../components/ui/Spinner'
import { categories, locale, uppercaseFirst } from '../utils/config'
import { Link, useParams } from 'react-router-dom'
import InputField from '../components/ui/InputField'
const { RangePicker } = DatePicker

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
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const { Search } = Input


function InventoryMovements() {
  const [loading, setLoading] = useState(false)
  const [searchSpinner, setSearchSpinner] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { id } = useParams()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [openConfirmId, setOpenConfirmId] = useState(null)
  const [types, setTypes] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [depots, setDepots] = useState([])
  const [selectedDepots, setSelectedDepots] = useState([])
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [emplacementSearch, setEmplacementSearch] = useState([])
  const [controlleBtnLoading, setControlleBtnLoading] = useState(null);

  const [page, setPage] = useState(30)


  const [movments, setMovments] = useState({
    data: [],
    next_page_url: null,
    total: 0,
  })

  const params = new URLSearchParams({
    types,
    dates: dateFilter,
    search: searchQuery,
    category: categoryFilter,
    depots: selectedDepots,
    users: selectedUsers,
    emplacement: emplacementSearch,
    per_page: page
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`inventory/${id}?${params.toString()}`)

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

    if (depots.length == 0) getDepots()
    if (users.length == 0) getUser()
  }, [
    searchQuery,
    types,
    dateFilter,
    categoryFilter,
    selectedDepots,
    selectedUsers,
    emplacementSearch,
    page
  ])

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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState(null)
  const [newQuantity, setNewQuantity] = useState('')
  const [newEmplacement, setNewEmplacement] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)


  const handleEditQuantity = (movement) => {
    setSelectedMovement(movement)
    setNewQuantity((Number(movement.quantity) || 0).toFixed(3))
    setNewEmplacement(movement.emplacement_code)
    setIsEditModalOpen(true)
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setSelectedMovement(null)
    setNewQuantity('')
    setNewEmplacement('')
  }

  const handleUpdateQuantity = async () => {
    if (!selectedMovement || !newQuantity) return


    setUpdateLoading(true)
    try {
      await api.put(`inventory-movement/update/${selectedMovement.id}`, {
        quantity: newQuantity,
        emplacement: newEmplacement,
        code_article: selectedMovement.code_article
      })
      message.success('Quantité mise à jour avec succès')
      handleCancelEdit()
      fetchData()
    } catch (error) {
      message.error(error.response.data.message)
      console.error('Update error:', error)
    } finally {
      setUpdateLoading(false)
    }
  }

  const exportMovements = async () => {
    try {
      let api_url = `inventory/${id}/movements/export?depots=${selectedDepots}&user=${selectedUsers}`
      if (categoryFilter) {
        api_url += `&category=${categoryFilter}`
      }
      const response = await api.get(api_url, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      const contentDisposition = response.headers['content-disposition']
      const fileNameMatch =
        contentDisposition && contentDisposition.match(/filename="?([^"]+)"?/)
      const fileName = fileNameMatch
        ? fileNameMatch[1]
        : 'inventaier_movements.xlsx'

      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()

      link.remove()
      window.URL.revokeObjectURL(url)

      message.success('Exported successfully')
    } catch (error) {
      console.error(error)
      message.error(error?.response?.data?.message || 'Export failed')
    }
  }

  const getDepots = async () => {
    try {
      const { data } = await api.get('depots')
      setDepots(data.data.map((item) => ({ label: item.code, value: item.id })))
    } catch (error) {
      console.error(error)
      message.error(error.response?.data?.message || 'Failed to load depots')
    }
  }

  const getUser = async () => {
    try {
      const { data } = await api.get('users')
      setUsers(data.map((item) => ({ label: item.full_name, value: item.id })))
    } catch (error) {
      console.error(error)
      message.error(error.response?.data?.message || 'Failed to load depots')
    }
  }

  const sanitizeInput = (value) => value.replace(/[\[\]]/g, '')


  const controllMovement = async (movement_id) => {
    setControlleBtnLoading(movement_id)
    try {
      await api.get(`inventory/movements/controlle/${movement_id}`)
      message.success("Mouvement contrôlé avec succès")
      setControlleBtnLoading(false)
      fetchData()
    } catch (error) {
      console.error(error)
      message.error(error.response?.data?.message || 'Failed to load depots')
      setControlleBtnLoading(false)

    }
  }

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='flex flex-wrap justify-between items-center gap-4 mb-4 px-2 md:px-4'>
        <div className='flex items-center gap-4'>
          <div className='hidden lg:block w-full'>
            <Search
              placeholder='Recherch'
              loading={searchSpinner}
              size='middle'
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className='hidden'>
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
          </div>

          <div className='hidden lg:block w-full'>
            <Select
              mode='multiple'
              style={{ width: '100%' }}
              placeholder='Depot filter'
              onChange={(value) => setSelectedDepots(value)}
              options={depots}
            />
          </div>

          <div className='hidden lg:block w-full'>
            <Select
              mode='multiple'
              style={{ width: '100%' }}
              placeholder='Utilisateur'
              onChange={(value) => setSelectedUsers(value)}
              options={users}
            />
          </div>

          <div className='hidden lg:block w-full'>
            <RangePicker
              locale={locale}
              className='w-full'
              style={{ width: '100%' }}
              placeholder={['Date début', 'Date fin']}
              onChange={(dates, dateStrings) => {
                setDateFilter(dateStrings)
              }}
            />
          </div>

          <div className='hidden lg:block w-full'>
            <Select
              placeholder='Famille'
              size='middle'
              onChange={(value) => setCategoryFilter(value)}
              style={{ width: '100%' }}
              options={categories}
            />
          </div>

          <div className='hidden lg:block w-full'>
            <Button
              onClick={exportMovements}
              size='middle'
              style={{ width: '100%' }}
            >
              <Download size={17} />
              <span className='hidden sm:inline'>Export</span>
            </Button>
          </div>

          <div className='hidden lg:block w-full'>
            <Button onClick={fetchData} size='middle' style={{ width: '100%' }}>
              {loading ? (
                <Loader2 className='animate-spin text-blue-500' size={17} />
              ) : (
                <RefreshCcw size={17} />
              )}
              <span className='hidden sm:inline'>Rafraîchir</span>
            </Button>
          </div>
        </div>
        <div className='flex lg:hidden w-full gap-2'>
          <Input
            placeholder='Emplacement, Article ref'
            value={emplacementSearch}
            size='large'
            allowClear={true}
            styles={{
              input: window.electron ? {
                fontSize: '25px',
                height: '50px',
              } : {},
            }}
            autoFocus={true}
            onChange={(e) =>
              setEmplacementSearch(sanitizeInput(e.target.value))
            }
          />
          <InputField
            btnClass='h-[70px]'
            value={emplacementSearch}
            onChange={(e) => setEmplacementSearch(e.target.value)}
            onScan={(value) => setEmplacementSearch(value)}
          />
        </div>
      </div>

      {/* Table View */}
      <div className='overflow-x-auto'>
        {/* Desktop Table View */}
        <div className='hidden md:block overflow-x-auto'>
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
                    {movement.emplacement_code}
                  </td>
                  <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                    {(Number(movement.quantity) || 0).toFixed(3)}
                  </td>
                  <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                    {movement?.user?.full_name}
                  </td>
                  <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500'>
                    {formatDate(movement.created_at)}
                  </td>
                  <td className='px-6 py-2 whitespace-nowrap text-sm text-gray-500 space-x-2 flex gap-3 items-center'>
                    {
                      movement.controlled_by ? <CheckCircle size={20} className='text-green-700' />
                        : <Button onClick={() => controllMovement(movement.id)} loading={controlleBtnLoading === movement.id} size={window.electron ? 'large' : 'small'}>Contrôlé</Button>
                    }

                    <Button
                      type='primary'
                      size='large'
                      onClick={() => handleEditQuantity(movement)}
                    >
                      <Edit size={20} />
                    </Button>


                    <Popconfirm
                      title='Supprimer'
                      description='Etes-vous sûr de vouloir Supprimer'
                      open={openConfirmId === movement.id}
                      onConfirm={() => handleOk(movement.id)}
                      okButtonProps={{ loading: confirmLoading }}
                      onCancel={handleCancel}
                      cancelText='Annuler'
                      okText='Supprimer'
                      color='danger'
                      okType='danger'
                    >
                      <Button
                        color='danger'
                        variant='solid'
                        size='large'
                        className='bg-red-500 hover:bg-red-600 text-white'
                        onClick={() => setOpenConfirmId(movement.id)}
                      >
                        <Trash size={15} />
                      </Button>
                    </Popconfirm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className='md:hidden space-y-4'>
          {movments?.data.map((movement, index) => (
            <div
              key={movement.id || index}
              className='bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200'
            >
              {/* Header with Reference and Actions */}
              <div className='flex justify-between items-start mb-3'>
                <div>
                  <span className='text-xs font-semibold text-gray-500 uppercase'>
                    Référence
                  </span>
                  <p className='text-sm font-bold text-gray-900'>
                    <Link to={`/articles/${movement.code_article}`}>
                      {movement.code_article}
                    </Link>
                  </p>
                </div>
                <div className='flex space-x-2 gap-2'>
                  <Button
                    type='primary'
                    size={window.electron ? 'middle' : 'large'}
                    onClick={() => handleEditQuantity(movement)}
                  >
                    <Edit size={20} />
                  </Button>
                  <Popconfirm
                    title='Supprimer'
                    description='Etes-vous sûr de vouloir Supprimer'
                    open={openConfirmId === movement.id}
                    onConfirm={() => handleOk(movement.id)}
                    okButtonProps={{ loading: confirmLoading }}
                    onCancel={handleCancel}
                    cancelText='Annuler'
                    okText='Supprimer'
                    color='danger'
                    okType='danger'
                  >
                    <Button
                      color='danger'
                      variant='solid'
                      size={window.electron ? 'middle' : 'large'}
                      className='bg-red-500 hover:bg-red-600 text-white'
                      onClick={() => setOpenConfirmId(movement.id)}
                    >
                      <Trash size={20} />
                    </Button>
                  </Popconfirm>
                </div>
              </div>

              {/* Designation */}
              <div className='mb-3'>
                <span className='text-xs font-semibold text-gray-500 uppercase'>
                  Désignation
                </span>
                <p className='text-sm text-gray-900 font-medium'>
                  <Link to={`/articles/${movement.code_article}`}>
                    {uppercaseFirst(movement.designation)}
                  </Link>
                </p>
              </div>

              {/* Grid for other fields */}
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <span className='text-xs font-semibold text-gray-500 uppercase'>
                    Type
                  </span>
                  <p className='text-sm text-gray-700'>
                    {getLabelWithIcon(movement.type)}
                  </p>
                </div>
                <div>
                  <span className='text-xs font-semibold text-gray-500 uppercase'>
                    Emplacement
                  </span>
                  <p className='text-sm text-gray-700'>
                    {movement.emplacement_code}
                  </p>
                </div>
                <div>
                  <span className='text-xs font-semibold text-gray-500 uppercase'>
                    Quantité
                  </span>
                  <p className='text-sm text-gray-700'>
                    {(Number(movement.quantity) || 0).toFixed(3)}
                  </p>
                </div>
                <div>
                  <span className='text-xs font-semibold text-gray-500 uppercase'>
                    Personnel
                  </span>
                  <p className='text-sm text-gray-700'>
                    {movement?.user?.full_name}
                  </p>
                </div>
              </div>

              {/* Date at bottom */}
              <div className='mt-3 pt-3 border-t border-gray-100 flex justify-between items-center'>
                <div>
                  <span className='text-xs font-semibold text-gray-500 uppercase'>
                    Date
                  </span>
                  <p className='text-sm text-gray-700'>
                    {formatDate(movement.created_at)}
                  </p>
                </div>
                <div>
                  {
                    movement.controlled_by ? <CheckCircle size={20} className='text-green-700' /> : <Button onClick={() => controllMovement(movement.id)} loading={controlleBtnLoading === movement.id} size={window.electron ? 'large' : 'small'}>Contrôlé</Button>
                  }
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='m-5'>
          <Select
            onChange={(value) => setPage(value)}
            className='min-w-3/8'
            defaultValue={page}
            style={window.electron && { height: '35px', fontSize: '24px' }}
            options={[
              {
                value: 30,
                label: 30
              },
              {
                value: 100,
                label: 100
              },
              {
                value: 200,
                label: 200
              },
              {
                value: 300,
                label: 300
              },
              {
                value: 500,
                label: 500
              }
              , {
                value: 700,
                label: 700
              },
              {
                value: 800,
                label: 800
              }
            ]}

          />
        </div>

        {/* Update Quantity Modal */}
        <Modal
          title='Modifier la quantité'
          open={isEditModalOpen}
          onOk={handleUpdateQuantity}
          onCancel={handleCancelEdit}
          confirmLoading={updateLoading}
          okText='Modifier'
          cancelText='Annuler'
          okButtonProps={{ type: 'primary' }}
        >
          {selectedMovement && (
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Référence
                </label>
                <Input value={selectedMovement.code_article} onChange={(e) => setSelectedMovement({ ...selectedMovement, code_article: e.target.value })} />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Désignation
                </label>
                <Input
                  value={uppercaseFirst(selectedMovement.designation)}
                  disabled
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Quantité actuelle
                </label>
                <Input
                  type='number'
                  step='0.001'
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  placeholder='Entrer la nouvelle quantité'
                  autoFocus
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Emplacement actuelle
                </label>
                <Input
                  value={newEmplacement}
                  onChange={(e) => setNewEmplacement(e.target.value)}
                  placeholder='Entrer la nouvelle quantité'
                  autoFocus
                />
              </div>
              <div className='bg-gray-50 p-3 rounded'>
                <p className='text-sm text-gray-600'>
                  <strong>Type:</strong>{' '}
                  {getLabelWithIcon(selectedMovement.type)}
                </p>
                <p className='text-sm text-gray-600'>
                  <strong>Emplacement:</strong>{' '}
                  {selectedMovement.emplacement_code}
                </p>
                <p className='text-sm text-gray-600'>
                  <strong>Personnel:</strong>{' '}
                  {selectedMovement?.user?.full_name}
                </p>
              </div>
            </div>
          )}
        </Modal>
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
