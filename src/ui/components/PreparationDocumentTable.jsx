import { Table, Tag, Typography, Space } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getExped, getStatus } from '../utils/config'
import { Edit, Printer, Settings } from 'lucide-react'

const { Text } = Typography

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

function PreparationDocumentTable({ documents = [], loading, setOrderBy, setOrderDir, orderBy }) {
  const { roles, user } = useAuth()
  const navigate = useNavigate()

  const company = (data) => data?.companies?.find(c => c.id === Number(user?.company_id))

  const expColor = (e) => ({ 1: 'red', 2: 'orange', 3: 'green' }[e] || 'default')

  const handleShow = async (piece) => {
    if (window.electron?.openShow) {
      await window.electron.openShow({ width: 1200, height: 700, url: `/document/${piece}`, resizable: true })
    } else {
      navigate(`/layout/document/${piece}`)
    }
  }

  const columns = [
    {
      title: 'Document',
      key: 'piece',
      sorter: true,
      width: 160,
      render: (_, rec) => (
        <Space size={4}>
          <Text strong>{rec.piece}</Text>
          <Text>{roles('fabrication') ?  "- " + rec.code : ''}</Text>

          {rec?.docentete?.DO_Reliquat === '1' && (
            <Tag style={{ fontSize: 10, padding: '0 4px' }}><Settings size={16} /></Tag>
          )}
          {parseInt(rec?.urgent) ? '🚨' : null}
        </Space>
      )
    },
    {
      title: 'Statut',
      key: 'status',
      sorter: true,
      width: 120,
      render: (_, rec) => {
        if (roles('fabrication')) {
          return <Tag color={rec.complation_date ? 'success' : 'default'}>
            {rec.complation_date ? 'En cours' : 'En attente'}
          </Tag>
        }
        const s = company(rec)?.pivot?.status_id
        const st = s ? getStatus(Number(s)) : null
        return <Tag color={st?.color || 'default'}>{st?.name || 'En attente'}</Tag>
      }
    },
    {
      title: 'Expédition',
      key: 'expedition',
      sorter: true,
      width: 110,
      render: (_, rec) => <Tag color={expColor(rec.expedition)}>{getExped(rec.expedition)}</Tag>
    },
    {
      title: 'Client',
      dataIndex: 'client_id',
      key: 'client',
      sorter: true,
      width: 150,
    },
    {
      title: 'Référence',
      dataIndex: 'ref',
      key: 'ref',
      width: 110,
      render: (v) => <Text type="secondary">{v || '—'}</Text>
    },
    {
      title: 'Date doc.',
      key: 'date',
      sorter: true,
      width: 100,
      render: (_, rec) => formatDate(rec?.docentete?.DO_Date)
    },
    {
      title: 'Date prévue',
      key: 'delivery',
      width: 130,
      render: (_, rec) => (
        <Space size={4}>
          <span>{formatDate(rec?.docentete?.DO_DateLivr || rec.delivery_date)}</span>
          {/* {Number(rec.has_user_printer) > 0 && <span title="Imprimé"><Printer size={20} /></span>}
          {parseInt(company(rec)?.pivot?.updated ?? 0) === 1 && (
            <span title="Modifié" style={{ color: '#cf1322' }}><Edit size={20} /></span>
          )} */}
        </Space>
      )
    },

    {
      title: 'Prévue Fabrication',
      key: 'complation_date',
      width: 130,
      render: (_, rec) => (
        <Space size={4}>
          <span>
            {rec.complation_date
              ? formatDate(rec.complation_date)
              : ''}
          </span>

          {Number(rec.has_user_printer) > 0 && (
            <span title="Imprimé">
              <Printer size={20} />
            </span>
          )}

          {parseInt(company(rec)?.pivot?.updated ?? 0) === 1 && (
            <span title="Modifié" style={{ color: '#cf1322' }}>
              <Edit size={20} />
            </span>
          )}
        </Space>
      )
    }
  ]

  const handleChange = (_, __, sorter) => {
    if (sorter?.field) {
      setOrderBy(sorter.field)
      setOrderDir(prev =>
        orderBy === sorter.field ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'
      )
    }
  }

  return (
    <Table
      columns={columns}
      dataSource={documents.map((d, i) => ({ ...d, key: i }))}
      loading={loading}
      
      size="small"
      className='whitespace-nowrap'
      onChange={handleChange}
      onRow={(rec) => ({
        onClick: () => handleShow(rec.docentete.DO_Piece),
        style: { cursor: 'pointer' }
      })}
      pagination={{ pageSize: 20, size: 'small', showTotal: (t) => `${t} documents` }}
      scroll={{ x: 800 }}
    />
  )
}

export default PreparationDocumentTable