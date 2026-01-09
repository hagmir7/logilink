import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  message,
  Tag,
  Avatar,
  Space,
  Card,
  Modal,
  Descriptions,
  Divider,
} from 'antd'
import {
  User,
  Building,
  Calendar,
  RotateCcw,
  Eye,
  Package,
  FileText,
  MapPin,
} from 'lucide-react'
import { api } from '../utils/api'
import { getCompany } from '../utils/config'

const TransferOrdersList = () => {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: false,
  })

  const getTransfers = async (page = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get(`transfer?page=${page}`)
      setTransfers(data.data)
      setPagination((prev) => ({
        ...prev,
        current: data.current_page,
        total: data.total,
        pageSize: data.per_page,
      }))
    } catch (error) {
      console.error(error)
      message.error(
        error.response?.data?.message || 'Échec du chargement des transferts'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTransfers()
  }, [])

  const handleTableChange = (paginationInfo) => {
    getTransfers(paginationInfo.current)
  }

  const showTransferDetails = (transfer) => {
    setSelectedTransfer(transfer)
    setModalVisible(true)
  }

  const handleModalClose = () => {
    setModalVisible(false)
    setSelectedTransfer(null)
  }

  const columns = [
    {
      title: 'Document',
      dataIndex: 'palette',
      key: 'palette',
      render: (palette) => (
        <div className='flex flex-col'>
          <span className='font-medium text-gray-900'>
            {palette?.document?.piece || 'N/A'}
          </span>
          <span className='text-xs text-gray-500'>
            Palette : {palette?.code}
          </span>
        </div>
      ),
    },
    {
      title: "De l'entreprise",
      dataIndex: 'form_company',
      key: 'form_company',
      render: (company) => (
        <div className='flex items-center gap-2'>
          <Avatar size='small' icon={<Building className='w-3 h-3' />} />
          <span className='font-medium'>{company.name}</span>
        </div>
      ),
    },
    {
      title: "À l'entreprise",
      dataIndex: 'to_company',
      key: 'to_company',
      render: (company) => (
        <div className='flex items-center gap-2'>
          <Avatar size='small' icon={<Building className='w-3 h-3' />} />
          <span className='font-medium'>{company.name}</span>
        </div>
      ),
    },
    {
      title: 'Transféré par',
      dataIndex: 'transfer_by',
      key: 'transfer_by',
      render: (transferBy) => (
        <div className='flex items-center gap-2'>
          <Avatar size='small' icon={<User className='w-3 h-3' />} />
          <div className='flex flex-col'>
            <span className='font-medium text-gray-900'>
              {transferBy.full_name}
            </span>
            <span className='text-xs text-gray-500'>
              {transferBy.phone }
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <div className='flex items-center space-x-1'>
          <Calendar className='w-4 h-4 text-gray-400' />
          <span className='text-sm'>
            {new Date(date).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type='primary'
          size='small'
          icon={<Eye className='w-4 h-4' />}
          onClick={() => showTransferDetails(record)}
        >
          Détails
        </Button>
      ),
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case '1':
        return 'green'
      case '0':
        return 'red'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case '1':
        return 'Actif'
      case '0':
        return 'Inactif'
      default:
        return 'Inconnu'
    }
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-6 px-2 pt-2'>
        <div>
          <h1 className='text-xl font-bold text-gray-900'>
            Transferts des commandes
          </h1>
          <p className='text-gray-600 mt-1'>
            Gérer et suivre tous les transferts des commandes de palettes
          </p>
        </div>
        <Button
          icon={<RotateCcw className='w-4 h-4' />}
          onClick={() => getTransfers(pagination.current)}
          loading={loading}
          className='flex items-center'
        >
          Rafraîchir
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={transfers}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} sur ${total} transferts`,
          className: 'mt-4',
        }}
        onChange={handleTableChange}
        rowKey='id'
        className='bg-white'
        scroll={{ x: 1200 }}
        size='middle'
      />

      <Modal
        title={
          <div className='flex items-center gap-2'>
            <Package className='w-5 h-5 text-blue-600' />
            <span>Détails du Transfert #{selectedTransfer?.id}</span>
          </div>
        }
        open={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key='close' onClick={handleModalClose}>
            Fermer
          </Button>,
        ]}
        width={800}
      >
        {selectedTransfer && (
          <div className='space-y-6'>
            {/* Transfer Information */}
            <Card
              size='small'
              title={
                <div className='flex items-center gap-2'>
                  <FileText className='w-4 h-4' />
                  <span>Informations du Transfert</span>
                </div>
              }
            >
              <Descriptions column={2} size='small'>
                <Descriptions.Item label='Référence Transfert'>
                  #{selectedTransfer.id}
                </Descriptions.Item>
                <Descriptions.Item label='Date de transfert'>
                  {new Date(selectedTransfer.created_at).toLocaleDateString(
                    'fr-FR',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Palette Information */}
            <div className='mb-2'></div>
            <Card
              size='small'
              title={
                <div className='flex items-center gap-2'>
                  <Package className='w-4 h-4' />
                  <span>Informations de la Palette</span>
                </div>
              }
            >
              <Descriptions column={2} size='small'>
                <Descriptions.Item label='Référence Palette'>
                  <Tag color='blue'>{selectedTransfer.palette?.code}</Tag>
                </Descriptions.Item>
                 <Descriptions.Item label='N° Client'>
                  {selectedTransfer.palette?.document.client_id || 'Non spécifié'}
                </Descriptions.Item>
               
                <Descriptions.Item label='Contrôlé'>
                  <Tag
                    color={
                      selectedTransfer.palette?.controlled === '1'
                        ? 'green'
                        : 'red'
                    }
                  >
                    {selectedTransfer.palette?.controlled === '1'
                      ? 'Oui'
                      : 'Non'}
                  </Tag>
                </Descriptions.Item>
                 <Descriptions.Item label='Type'>
                  <Tag color='green'>{selectedTransfer.palette?.type}</Tag>
                </Descriptions.Item>
               
                <Descriptions.Item label='Document'>
                  {selectedTransfer.palette?.document.piece}
                </Descriptions.Item>
                <Descriptions.Item label='Entreprise de Preparation'>
                  {getCompany(selectedTransfer.palette?.first_company_id)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Company Information */}
            <div className='mb-2'></div>
            <Card
              size='small'
              title={
                <div className='flex items-center gap-2'>
                  <Building className='w-4 h-4' />
                  <span>Informations des Entreprises</span>
                </div>
              }
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Entreprise Expéditrice
                  </h4>
                  <Descriptions column={1} size='small'>
                    <Descriptions.Item label='Nom'>
                      {selectedTransfer.form_company.name}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Entreprise Destinataire
                  </h4>
                  <Descriptions column={1} size='small'>
                    <Descriptions.Item label='Nom'>
                      {selectedTransfer.to_company.name}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>
            </Card>

            {/* People Information */}
            <div className='mb-2'></div>
            <Card
              size='small'
              title={
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4' />
                  <span>Informations des Personnes</span>
                </div>
              }
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 '>
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>Livreur</h4>
                  <Descriptions column={1} size='small'>
                    <Descriptions.Item label='Nom Complet'>
                      {selectedTransfer.transfer_by.full_name}
                    </Descriptions.Item>

                    <Descriptions.Item label='Téléphone'>
                      {selectedTransfer.transfer_by.phone || 'Non spécifié'}
                    </Descriptions.Item>
                    <Descriptions.Item label='Statut'>
                      <Tag
                        color={getStatusColor(
                          selectedTransfer.transfer_by.status
                        )}
                      >
                        {getStatusText(selectedTransfer.transfer_by.status)}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    Transféré par
                  </h4>
                  <Descriptions column={1} size='small'>
                    <Descriptions.Item label='Nom Complet'>
                      {selectedTransfer.user.full_name}
                    </Descriptions.Item>

                    <Descriptions.Item label='Téléphone'>
                      {selectedTransfer.user.phone || 'Non spécifié'}
                    </Descriptions.Item>
                    <Descriptions.Item label='Statut'>
                      <Tag color={getStatusColor(selectedTransfer.user.status)}>
                        {getStatusText(selectedTransfer.user.status)}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default TransferOrdersList
