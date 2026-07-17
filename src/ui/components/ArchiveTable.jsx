import { useMemo } from 'react'
import { Settings, Clock, CheckCircle, AlertCircle, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getExped } from '../utils/config'
import { Table, Tag, Tooltip, Empty } from 'antd'

const formatDate = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('fr-FR')
}

const StatusBadge = ({ complationDate }) => {
  if (!complationDate) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
        <Clock size={11} />
        En attente
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">
      <Package size={11} />
      En cours
    </span>
  )
}

const FabricationStatusBadge = ({ fabricatedAt, complationDate }) => {
  if (!fabricatedAt || !complationDate) {
    return <span className="text-gray-300 text-xs">—</span>
  }

  const fabDate = new Date(fabricatedAt)
  const compDate = new Date(complationDate)

  fabDate.setHours(0, 0, 0, 0)
  compDate.setHours(0, 0, 0, 0)

  const isLate = fabDate > compDate

  if (isLate) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
        <AlertCircle size={11} />
        Libéré en retard
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200">
      <CheckCircle size={11} />
      Libéré à temps
    </span>
  )
}

const ExpeditionBadge = ({ value }) => {
  const styles = {
    1: 'bg-red-50 text-red-600 border-red-200',
    2: 'bg-amber-50 text-amber-600 border-amber-200',
    3: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  }
  const cls = styles[value] || 'bg-gray-50 text-gray-500 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      {getExped(value)}
    </span>
  )
}

function ArchiveTable({ documents = [], documentType = 1, loading = false }) {
  const navigate = useNavigate()
  const { roles, user } = useAuth()
  const isFabrication = roles(['fabrication'])

  const handleShow = async (id) => {
    try {
      const url = `/document/${id}?type=archive`
      if (window.electron && typeof window.electron.openShow === 'function') {
        await window.electron.openShow({ width: 1200, height: 700, url, resizable: true })
      } else {
        navigate(url)
      }
    } catch (error) {
      console.error('Error navigating to document:', error)
    }
  }

  // Pre-compute derived values once per document instead of inline during render,
  // so both the columns' render functions and the row key can reuse them.
  const dataSource = useMemo(() => {
    return documents.map((data, index) => {
      const company = data?.companies?.find(
        (item) => Number(item.id) === Number(user.company_id)
      )

      return {
        ...data,
        key: data.id ?? data.piece_fa ?? data.piece_bl ?? data.piece ?? index,
        _piece: documentType === 1 ? data?.piece : data?.piece_bl,
        _navId: data.piece_fa || data.piece_bl || data.piece,
        _expedit: data?.docentete?.DO_Expedit || data.expedition,
        _client: data?.docentete?.DO_Tiers || data.client_id,
        _ref: data?.docentete?.DO_Ref || data.ref,
        _dateDoc: data?.docentete?.DO_Date || data.created_at,
        _datePrev: data?.docentete?.DO_DateLivr || data.delivery_date,
        _fabricatedAt: data.lines?.[0]?.fabricated_at,
        _complationDate: company?.pivot?.complation_date,
        _note: company?.pivot?.note,
        _showFabCode: Boolean(data?.code) && Number(user.company_id) === 1,
      }
    })
  }, [documents, documentType, user.company_id])

  const columns = useMemo(() => {
    const cols = [
      {
        title: 'Document',
        dataIndex: '_piece',
        key: 'document',
        fixed: 'left',
        width: 200,
        sorter: (a, b) => String(a._piece ?? '').localeCompare(String(b._piece ?? '')),
        render: (piece, record) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{piece || '—'}</span>

            {record?.docentete?.DO_Reliquat === '1' && (
              <span className="p-1 rounded bg-gray-100 text-gray-400 border border-gray-200">
                <Settings size={11} />
              </span>
            )}

            {record._showFabCode && roles('fabrication') ? (
              <span className="text-gray-400 text-xs">- {record.code}</span>
            ) : null}

            {record._note ? (
              <Tooltip title={record._note}>
                <Tag
                  color="red"
                  style={{ padding: 0 }}
                  className="cursor-help text-[10px] py-0 px-0 leading-4 m-0 animate-pulse"
                >
                  ❓
                </Tag>
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: 'Statut',
        key: 'statut',
        width: 170,
        filters: !isFabrication
          ? undefined
          : [
              { text: 'Libéré à temps', value: 'on_time' },
              { text: 'Libéré en retard', value: 'late' },
              { text: 'En attente', value: 'pending' },
            ],
        onFilter: !isFabrication
          ? undefined
          : (value, record) => {
              if (!record._fabricatedAt || !record._complationDate) return value === 'pending'
              const fab = new Date(record._fabricatedAt)
              const comp = new Date(record._complationDate)
              fab.setHours(0, 0, 0, 0)
              comp.setHours(0, 0, 0, 0)
              const isLate = fab > comp
              return value === (isLate ? 'late' : 'on_time')
            },
        render: (_, record) =>
          isFabrication ? (
            <FabricationStatusBadge
              fabricatedAt={record._fabricatedAt}
              complationDate={record._complationDate}
            />
          ) : (
            <Tag color={record?.status?.color} className="text-xs font-medium shadow-sm border">
              {record?.status?.name || 'En attente'}
            </Tag>
          ),
      },
      {
        title: 'Expédition',
        dataIndex: '_expedit',
        key: 'expedition',
        width: 140,
        filters: [1, 2, 3].map((v) => ({ text: getExped(v), value: v })),
        onFilter: (value, record) => Number(record._expedit) === Number(value),
        render: (expedit) => <ExpeditionBadge value={expedit} />,
      },
      {
        title: 'Client',
        dataIndex: '_client',
        key: 'client',
        width: 140,
        sorter: (a, b) => String(a._client ?? '').localeCompare(String(b._client ?? '')),
        render: (client) => <span className="font-medium text-gray-700">{client || '—'}</span>,
      },
      {
        title: 'Référence',
        dataIndex: '_ref',
        key: 'reference',
        width: 160,
        ellipsis: true,
        render: (ref) => <span className="text-gray-500">{ref || '—'}</span>,
      },
      {
        title: 'Date Document',
        dataIndex: '_dateDoc',
        key: 'date_doc',
        width: 140,
        sorter: (a, b) => new Date(a._dateDoc || 0) - new Date(b._dateDoc || 0),
        render: (date) => <span className="text-gray-500">{formatDate(date)}</span>,
      },
      {
        title: 'Date Prévue',
        dataIndex: '_datePrev',
        key: 'date_prev',
        width: 140,
        sorter: (a, b) => new Date(a._datePrev || 0) - new Date(b._datePrev || 0),
        render: (date) => <span className="text-gray-500">{formatDate(date)}</span>,
      },
    ]

    if (isFabrication) {
      cols.push(
        {
          title: 'Date de libération',
          dataIndex: '_fabricatedAt',
          key: 'date_lib',
          width: 160,
          sorter: (a, b) => new Date(a._fabricatedAt || 0) - new Date(b._fabricatedAt || 0),
          render: (date) => <span className="text-gray-500">{formatDate(date)}</span>,
        },
        {
          title: 'Date prévue fabrication',
          dataIndex: '_complationDate',
          key: 'date_fab',
          width: 180,
          sorter: (a, b) => new Date(a._complationDate || 0) - new Date(b._complationDate || 0),
          render: (date) => <span className="text-gray-500">{formatDate(date)}</span>,
        }
      )
    }

    return cols
  }, [isFabrication, roles])

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        
        pagination={false}
        scroll={{ x: 'max-content', y: '100%' }}
        size="small"
        sticky
        onRow={(record) => ({
          onClick: () => handleShow(record._navId),
          className: 'cursor-pointer',
        })}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Aucun document trouvé"
              className="py-10"
            />
          ),
        }}
        rowClassName="hover:!bg-blue-50/60 transition-colors duration-100"
        className="flex-1"
        footer={
          documents.length > 0
            ? () => (
                <div className="text-xs text-gray-400">
                  {documents.length} document{documents.length > 1 ? 's' : ''}
                </div>
              )
            : undefined
        }
      />
    </div>
  )
}

export default ArchiveTable