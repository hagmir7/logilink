import React, { useEffect, useState } from 'react'
import { Button, message, Modal, Table } from 'antd'
import { ArrowDownUp } from 'lucide-react'
import { api } from '../utils/api'

const ReceptionMovmentsModal = ({ piece, company }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [receptions, setReceptions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`documents/${piece}/receptions?company=${company || 'sqlsrv_inter'}`)
      setReceptions(response.data || [])
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isModalOpen) fetchData()
  }, [isModalOpen])

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
      width: 350,
      render: (text) => (
        <div
          style={{
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            lineHeight: 1.4,
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Quantité',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: 'Emplacement',
      dataIndex: 'emplacement_code',
      key: 'emplacement_code',
      width: 150,
    },
    {
      title: 'Dépôt',
      dataIndex: 'depot_code',
      key: 'depot_code',
      width: 120,
      render: (value) => value || '—',
    },
    {
      title: 'Conteneur',
      dataIndex: 'container_code',
      key: 'container_code',
      width: 120,
      render: (value) => value || '—',
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
        width={900}
        destroyOnClose
      >
        <Table
          columns={columns}
          dataSource={receptions}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          size="middle"
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'Aucun mouvement trouvé' }}
        />
      </Modal>
    </>
  )
}

export default ReceptionMovmentsModal
