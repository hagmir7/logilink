import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import {
  Button,
  Input,
  Modal,
  DatePicker,
  Card,
  Tag,
  Space,
  message,
  Spin,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { locale } from '../utils/config'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function InventoryList() {
  const [inventories, setInventories] = useState([])
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState({
    name: '',
    date: null,
    description: '',
  })

  useEffect(() => {
    fetchInventories()
  }, [])

  const fetchInventories = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('inventory/list')
      setInventories(data?.data || [])
    } catch (error) {
      console.error('Error fetching inventory list:', error)
      message.error('Erreur lors du chargement des inventaires')
    } finally {
      setLoading(false)
    }
  }

  const showModal = () => {
    setOpen(true)
  }

  const handleOk = async () => {
    // Validation
    if (!inventory.name.trim()) {
      message.error('Veuillez saisir un intitulé')
      return
    }
    if (!inventory.date) {
      message.error('Veuillez sélectionner une date')
      return
    }

    try {
      setConfirmLoading(true)
      const response = await api.post('inventory/create', {
        ...inventory,
        date: inventory.date.format('YYYY-MM-DD'),
      })

      message.success('Inventaire créé avec succès')
      fetchInventories()
      setOpen(false)
      // Reset form
      setInventory({
        name: '',
        date: null,
        description: '',
      })
    } catch (error) {
      console.error('Error creating inventory:', error)
      message.error("Erreur lors de la création de l'inventaire")
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    // Reset form on cancel
    setInventory({
      name: '',
      date: null,
      description: '',
    })
  }

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm')
  }

  const getStatusColor = (status) => {
    return status === '1' ? 'success' : 'default'
  }

  const getStatusText = (status) => {
    return status === '1' ? 'Actif' : 'Inactif'
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex justify-between items-centerp-2 p-4'>
          <div className=''>
            {/* Title */}
            <h1 className='text-xl font-semibold text-gray-800 mb-2'>
              Gestion de la préparation
            </h1>
            <p className='text-gray-600'>
              Gérez vos inventaires et suivez leur statut
            </p>
          </div>
          <Button
            // type='primary'
            size='large'
            icon={<PlusOutlined />}
            onClick={showModal}
            // className='shadow-lg hover:shadow-xl transition-shadow'
          >
            Nouvel inventaire
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='px-6'>
        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <Spin size='large' />
          </div>
        ) : inventories.length === 0 ? (
          <div className='flex justify-center items-center py-20'>
            <Empty
              description='Aucun inventaire trouvé'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6'>
            {inventories.map((item) => (
              <Card
                key={item.id}
                className='hover:border-red-500 border-4'
                bodyStyle={{ padding: '24px' }}
              >
                <div className='flex justify-between items-start mb-4'>
                  <h3 className='text-lg font-semibold text-gray-900 truncate flex-1 mr-2'>
                    {item.name}
                  </h3>
                  <Tag
                    color={getStatusColor(item.status)}
                    icon={item.status === '1' ? <CheckCircleOutlined /> : null}
                  >
                    {getStatusText(item.status)}
                  </Tag>
                </div>

                <Space direction='vertical' size='small' className='w-full'>
                  <div className='flex items-center text-gray-600'>
                    <CalendarOutlined className='mr-2' />
                    <span className='text-sm'>{formatDate(item.date)}</span>
                  </div>

                  {item.description && (
                    <div className='flex items-start text-gray-600'>
                      <FileTextOutlined className='mr-2 mt-1 flex-shrink-0' />
                      <span className='text-sm line-clamp-2'>
                        {item.description}
                      </span>
                    </div>
                  )}

                  <div className='text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100'>
                    <Button
                      href={`/#/inventories/${item.id}`}
                      className='w-full'
                      color='green'
                    >
                      Traitement
                    </Button>
                  </div>
                </Space>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          title={
            <div className='flex items-center'>
              <PlusOutlined className='mr-2' />
              Nouvel inventaire
            </div>
          }
          open={open}
          onOk={handleOk}
          confirmLoading={confirmLoading}
          okText="Créer l'inventaire"
          cancelText='Annuler'
          onCancel={handleCancel}
          width={600}
          centered
        >
          <div className='space-y-6 py-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Intitulé de l'inventaire *
              </label>
              <Input
                placeholder="Saisissez l'intitulé de l'inventaire"
                size='large'
                value={inventory.name}
                onChange={(e) =>
                  setInventory({ ...inventory, name: e.target.value })
                }
                className='rounded-lg'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Date *
              </label>
              <DatePicker
                size='large'
                className='w-full rounded-lg'
                locale={locale}
                showTime
                format='DD/MM/YYYY HH:mm'
                placeholder='Sélectionnez une date'
                value={inventory.date}
                onChange={(date) => setInventory({ ...inventory, date })}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description
              </label>
              <TextArea
                onChange={(e) =>
                  setInventory({ ...inventory, description: e.target.value })
                }
                placeholder='Ajoutez une description (optionnel)'
                autoSize={{ minRows: 3, maxRows: 5 }}
                value={inventory.description}
                className='rounded-lg'
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
