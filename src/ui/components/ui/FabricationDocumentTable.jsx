import { Table, Tag, Typography, Space, Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Edit, Printer, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getExped } from '../../utils/config'

const { Text } = Typography

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—')

function FabricationDocumentTable({
  documents = [],
  loading,
  setOrderBy,
  setOrderDir,
  orderBy,
}) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const getCompanyItem = (rec) =>
    rec?.companies?.find((item) => Number(item.id) === Number(user?.company_id))

  const expColor = (e) => ({ 1: 'red', 2: 'orange', 3: 'green' }[e] || 'default')

  const handleShow = async (piece) => {
    if (window.electron?.openShow) {
      await window.electron.openShow({
        width: 1200,
        height: 700,
        url: `/document/${piece}`,
        resizable: true,
      })
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
      render: (_, rec) => {
        const companyItem = getCompanyItem(rec)
        return (
          <Space size={4}>
            <Text strong>{rec.piece}</Text>
            {rec?.code && Number(user?.company_id) === 1 ? (
              <Text>{'- ' + rec.code}</Text>
            ) : (
              ''
            )}
            {rec?.docentete?.DO_Reliquat === '1' && (
              <Tag style={{ fontSize: 10, padding: '0 4px' }}>
                <Settings size={16} />
              </Tag>
            )}

            {rec?.shipping && (
              <span className='p-1 rounded bg-gray-100 text-gray-400 border border-gray-200'>
                <CheckCircle size={11} />
              </span>
            )}

            {parseInt(rec?.urgent) ? '🚨' : null}
            {companyItem?.pivot?.note ? (
              <Tooltip title={companyItem.pivot.note}>
                <Tag
                  color='red'
                  style={{ padding: 0 }}
                  className='cursor-help text-[10px] py-0 px-0 leading-4 m-0 animate-pulse'
                >
                  ❓
                </Tag>
              </Tooltip>
            ) : (
              ''
            )}
          </Space>
        )
      },
    },
    {
      title: 'Statut',
      key: 'status',
      sorter: true,
      width: 120,
      render: (_, rec) => {
        const done = getCompanyItem(rec)?.pivot?.complation_date
        return (
          <Tag color={done ? 'success' : 'default'}>
            {done ? 'En cours' : 'En attente'}
          </Tag>
        )
      },
    },
    {
      title: 'Expédition',
      key: 'expedition',
      sorter: true,
      width: 110,
      render: (_, rec) => (
        <Tag color={expColor(rec.expedition)}>{getExped(rec.expedition)}</Tag>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'client_id',
      key: 'client_id',
      sorter: true,
      width: 150,
    },
    {
      title: 'Référence',
      dataIndex: 'ref',
      key: 'ref',
      width: 110,
      render: (v) => <Text type='secondary'>{v || '—'}</Text>,
    },
    {
      title: 'Date doc.',
      key: 'date',
      sorter: true,
      width: 100,
      render: (_, rec) => formatDate(rec?.docentete?.DO_Date),
    },
    {
      title: 'Date prévue',
      key: 'DO_DateLivr',
      sorter: true,
      width: 130,
      render: (_, rec) => (
        <Space size={4}>
          <span>
            {formatDate(rec?.docentete?.DO_DateLivr || rec.delivery_date)}
          </span>
        </Space>
      ),
    },
    {
      title: 'Prévue Fabrication',
      key: 'complation_date',
      sorter: true,
      width: 130,
      render: (_, rec) => {
        const companyItem = getCompanyItem(rec)
        return (
          <Space size={4}>
            <span>
              {companyItem?.pivot?.complation_date
                ? formatDate(companyItem.pivot.complation_date)
                : ''}
            </span>
            {Number(rec.has_user_printer) > 0 && (
              <span title='Imprimé'>
                <Printer size={20} />
              </span>
            )}
            {parseInt(companyItem?.pivot?.updated ?? 0) === 1 && (
              <span title='Modifié' style={{ color: '#cf1322' }}>
                <Edit size={20} />
              </span>
            )}
          </Space>
        )
      },
    },
  ]

  const handleChange = (_, __, sorter) => {
    if (sorter?.columnKey) {
      setOrderBy(sorter.columnKey)
      setOrderDir((prev) =>
        orderBy === sorter.columnKey ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'
      )
    }
  }

  return (
    <Table
      columns={columns}
      dataSource={documents.map((d, i) => ({ ...d, key: i }))}
      loading={loading}
      size='small'
      className='whitespace-nowrap'
      onChange={handleChange}
      onRow={(rec) => ({
        onClick: () => handleShow(rec.docentete.DO_Piece),
        style: { cursor: 'pointer' },
      })}
      pagination={false}
      scroll={{ x: 800 }}
    />
  )
}

export default FabricationDocumentTable