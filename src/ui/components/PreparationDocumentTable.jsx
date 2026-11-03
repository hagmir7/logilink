import { useMemo } from 'react'
import { Table, Tag, Typography, Space, Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Edit, Printer, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getExped, getStatus } from '../utils/config'

const { Text } = Typography

const DEFAULT_STATUS_LABEL = 'En attente'
const EXPEDITION_COLORS = { 1: 'red', 2: 'orange', 3: 'green' }

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—')

// Accepts either a numeric status id (from pivot.status_id)
// or a full status object (from rec.status) and normalises it.
const resolveStatus = (statusOrId) => {
  if (statusOrId == null || statusOrId === '') return null
  if (typeof statusOrId === 'object') return statusOrId
  const n = Number(statusOrId)
  return Number.isFinite(n) ? getStatus(n) : null
}

const renderStatusTag = (statusOrId) => {
  const status = resolveStatus(statusOrId)
  return (
    <Tag color={status?.color || 'default'}>
      {status?.name || DEFAULT_STATUS_LABEL}
    </Tag>
  )
}

function PreparationDocumentTable({
  documents = [],
  loading,
  orderBy,
  setOrderBy,
  setOrderDir,
  // Controls which status is shown when the user has NO company_id:
  //   company = true  -> document.status  (rec.status)
  //   company = false -> company status   (pivot.status_id)
  // When the user HAS a company_id, this prop is ignored and the
  // pivot status of that company is always used.
  company = true,
}) {
  const { roles, user } = useAuth()
  const navigate = useNavigate()

  const companyId = user?.company_id ? Number(user.company_id) : null
  const isFabrication = roles(['fabrication'])

  // Company entry (with its pivot data) attached to a document for the current user
  const getCompany = (rec) =>
    companyId ? rec?.companies?.find((c) => Number(c.id) === companyId) : undefined

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

  const handleChange = (_, __, sorter) => {
    if (!sorter?.columnKey) return
    setOrderBy(sorter.columnKey)
    setOrderDir((prev) =>
      orderBy === sorter.columnKey ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'
    )
  }

  const renderDocument = (_, rec) => {
    const companyItem = getCompany(rec)
    const showCode = rec?.code && companyId === 1 && isFabrication

    return (
      <Space size={4}>
        <Text strong>{rec.piece}</Text>

        {showCode && <Text>{`- ${rec.code}`}</Text>}

        {rec?.docentete?.DO_Reliquat === '1' && (
          <Tag style={{ fontSize: 10, padding: '0 4px' }}>
            <Settings size={16} />
          </Tag>
        )}

        {rec?.shipping && (
          <span className="p-1 rounded bg-gray-100 text-gray-400 border border-gray-200">
            <CheckCircle size={11} />
          </span>
        )}

        {parseInt(rec?.urgent) ? '🚨' : null}

        {companyItem?.pivot?.note && (
          <Tooltip title={companyItem.pivot.note}>
            <Tag
              color="red"
              style={{ padding: 0 }}
              className="cursor-help text-[10px] py-0 px-0 leading-4 m-0 animate-pulse"
            >
              ❓
            </Tag>
          </Tooltip>
        )}
      </Space>
    )
  }

  const renderStatus = (_, rec) => {
    const pivot = getCompany(rec)?.pivot

    // ── No company on user ───────────────────────────────────────────
    // Let the `company` prop decide which status to display.
    if (!companyId) {
      if (company) {
        // company = true  -> document.status
        return renderStatusTag(rec?.status)
      }

      // company = false -> company (pivot) status.
      // Since the user has no company_id, use the first company on the
      // document that actually carries a pivot status.
      const anyPivot = rec?.companies?.find((c) => c.pivot?.status_id)?.pivot
      return renderStatusTag(anyPivot?.status_id ?? rec?.status)
    }

    // ── User has a company ───────────────────────────────────────────
    // Fall back to the document's own status if this company isn't
    // attached to the document.
    if (!pivot?.status_id) {
      return renderStatusTag(rec?.status)
    }

    if (isFabrication) {
      const started = Boolean(pivot.complation_date)
      return (
        <Tag color={started ? 'success' : 'default'}>
          {started ? 'En cours' : DEFAULT_STATUS_LABEL}
        </Tag>
      )
    }

    return renderStatusTag(pivot.status_id)
  }

  const renderFabricationDate = (_, rec) => {
    const pivot = getCompany(rec)?.pivot

    // Prefer pivot value, fall back to the document-level date
    const complationDate = pivot?.complation_date ?? rec?.complation_date
    const isUpdated = parseInt(pivot?.updated ?? 0) === 1

    return (
      <Space size={4}>
        <span>{complationDate ? formatDate(complationDate) : ''}</span>

        {Number(rec.has_user_printer) > 0 && (
          <span title="Imprimé">
            <Printer size={20} />
          </span>
        )}

        {isUpdated && (
          <span title="Modifié" style={{ color: '#cf1322' }}>
            <Edit size={20} />
          </span>
        )}
      </Space>
    )
  }

  const columns = [
    {
      title: 'Document',
      key: 'piece',
      sorter: true,
      width: 160,
      render: renderDocument,
    },
    {
      title: 'Statut',
      key: 'status',
      sorter: true,
      width: 120,
      render: renderStatus,
    },
    {
      title: 'Expédition',
      key: 'expedition',
      sorter: true,
      width: 110,
      render: (_, rec) => (
        <Tag color={EXPEDITION_COLORS[rec.expedition] || 'default'}>
          {getExped(rec.expedition)}
        </Tag>
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
      render: (v) => <Text type="secondary">{v || '—'}</Text>,
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
      render: (_, rec) =>
        formatDate(rec?.docentete?.DO_DateLivr || rec.delivery_date),
    },
    {
      title: 'Prévue Fabrication',
      key: 'complation_date',
      sorter: true,
      width: 130,
      render: renderFabricationDate,
    },
  ]

  const dataSource = useMemo(
    () => documents.map((d, i) => ({ ...d, key: i })),
    [documents]
  )

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      size="small"
      className="whitespace-nowrap"
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

export default PreparationDocumentTable