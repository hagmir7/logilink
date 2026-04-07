import React, { useEffect, useState } from 'react'
import { Button, InputNumber, message, Modal, Popconfirm, Space, Table } from 'antd'
import { ArrowDownUp, Check, Pencil, Trash2, X } from 'lucide-react'
import { api } from '../utils/api'

const ReceptionMovmentsModal = ({ piece, company, reload }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [receptions, setReceptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingQuantity, setEditingQuantity] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const companyParam = company || 'sqlsrv_inter'

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`documents/${piece}/receptions?company=${companyParam}`)
      setReceptions(response.data || [])
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isModalOpen) {
      setEditingId(null)
      fetchData()
    }
  }, [isModalOpen])

  const handleEditStart = (record) => {
    setEditingId(record.id)
    setEditingQuantity(record.quantity)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingQuantity(null)
  }

  const handleEditSave = async (record) => {
    if (editingQuantity === null || editingQuantity === record.quantity) {
      handleEditCancel()
      return
    }
    setActionLoading(record.id)
    try {
      await api.put(`documents/${piece}/receptions/${record.id}?company=${companyParam}`, {
        quantity: editingQuantity,
      })
      message.success('Quantité mise à jour')
      setEditingId(null)
      setEditingQuantity(null)
      fetchData()
      reload()
      
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erreur lors de la mise à jour')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (record) => {
    setActionLoading(record.id)
    try {
      await api.delete(`documents/${piece}/receptions/${record.id}?company=${companyParam}`)
      message.success('Ligne supprimée')
      fetchData()
      reload();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erreur lors de la suppression')
    } finally {
      setActionLoading(null)
    }
  }

  const columns = [
    {
      title: 'Référence',
      dataIndex: 'article_code',
      key: 'article_code',
      width: 140,
    },
    {
      title: 'Désignation',
      dataIndex: 'description',
      key: 'description',
      width: 280,
      render: (text) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.4 }}>
          {text}
        </div>
      ),
    },
    {
      title: 'Quantité',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      width: 130,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (value, record) => {
        if (editingId === record.id) {
          return (
            <InputNumber
              value={editingQuantity}
              onChange={(val) => setEditingQuantity(val)}
              min={0}
              size="small"
              style={{ width: 90 }}
              autoFocus
              onPressEnter={() => handleEditSave(record)}
            />
          )
        }
        return value
      },
    },
    {
      title: 'Emplacement',
      key: 'emplacement',
      width: 180,
      render: (_, record) => {
        const depot = record.depot_code
        const emplacement = record.emplacement_code
        if (depot && emplacement) return `${depot} - ${emplacement}`
        return depot || emplacement || '—'
      },
    },
    {
      title: 'Conteneur',
      dataIndex: 'container_code',
      key: 'container_code',
      width: 120,
      render: (value) => value || '—',
    },
    {
      title: 'Date création',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (value) => {
        if (!value) return '—'
        return new Date(value).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      },
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_, record) => {
        const isEditing = editingId === record.id
        const isLoading = actionLoading === record.id

        if (isEditing) {
          return (
            <Space size={4}>
              <Button
                type="primary"
                size="small"
                icon={<Check size={14} />}
                loading={isLoading}
                onClick={() => handleEditSave(record)}
              />
              <Button
                size="small"
                icon={<X size={14} />}
                onClick={handleEditCancel}
                disabled={isLoading}
              />
            </Space>
          )
        }

        return (
          <Space size={4}>
            <Button
              size="small"
              icon={<Pencil size={14} />}
              onClick={() => handleEditStart(record)}
              disabled={actionLoading !== null}
            />
            <Popconfirm
              title="Supprimer cette ligne ?"
              description="Cette action est irréversible."
              onConfirm={() => handleDelete(record)}
              okText="Supprimer"
              cancelText="Annuler"
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                danger
                icon={<Trash2 size={14} />}
                loading={isLoading}
                disabled={actionLoading !== null && !isLoading}
              />
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <>
      <Button color="green" variant="solid" onClick={() => setIsModalOpen(true)}>
        <ArrowDownUp size={18} />
      </Button>

      <Modal
        title="Mouvements de réception"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={1050}
        destroyOnClose
      >
        <Table
          columns={columns}
          dataSource={receptions}
          rowKey={(record, index) => record.id ?? index}
          loading={loading}
          pagination={{
            pageSize: 8,
            showSizeChanger: false,
            showTotal: (total) => `Total: ${total}`,
          }}
          size="middle"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'Aucun mouvement trouvé' }}
        />
      </Modal>
    </>
  )
}

export default ReceptionMovmentsModal