import { useCallback, useMemo, useState } from 'react'
import { api } from '../utils/api'
import {
  getExped, getDocumentType, locale, formatDate, formatShortDate, TRANSFER_OPTIONS,
  isLineDisabled,
  isLineDone,
  getLineSelectDisplay,
} from '../utils/config'
import { useLocation, useParams } from 'react-router-dom'
import { Button, Checkbox, DatePicker, Empty, message, Select, Tag, Table, Skeleton } from 'antd'
import { RefreshCw, ArrowRight, Check, PaintBucket } from 'lucide-react'
import PrintDocument from '../components/PrintDocument'
import FacadDocumentPrint from '../components/FacadDocumentPrint'
import { useAuth } from '../contexts/AuthContext'
import FabricationNote from '../components/FabricationNote'
import { useDocEntet } from '../hooks/useDocEntete'

/** Small presentational badge for "done" / "sent to painting" line states. */
function LineStatusBadge({ status }) {
  if (status === 'painting') {
    return (
      <div className="bg-blue-200 rounded-full py-1 flex items-center justify-center ml-2">
        <PaintBucket size={16} className="text-blue-600" />
      </div>
    )
  }
  return (
    <div className="bg-green-200 rounded-full py-1 flex items-center justify-center ml-2">
      <Check size={16} className="text-green-600" />
    </div>
  )
}

/** One tile in the "Client / Référence / Expédition / Type" summary row. */
function SummaryCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 border-solid rounded-lg p-2 shadow-sm">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</span>
        <span className="text-sm font-semibold text-gray-900">
          {value || <Skeleton.Button active size="small" shape="default" block />}
        </span>
      </div>
    </div>
  )
}

function Fabrication() {
  const { id } = useParams()
  const location = useLocation()
  const type = new URLSearchParams(location.search).get('type')

  const { data, loading, refetch } = useDocEntet(id, type)
  const { roles, user } = useAuth()

  const [selected, setSelected] = useState([])
  const [transferValue, setTransferValue] = useState(null)
  const [completionSpin, setCompletionSpin] = useState(false)
  const [transferSpin, setTransferSpin] = useState(false)

  const company = useMemo(
    () => data?.docentete?.document?.companies?.find(
      (c) => Number(c.id) === Number(user.company_id)
    ),
    [data, user.company_id]
  )

  const isLaca = data?.docentete?.Type === 'Laca'

  const currentLineRole = roles('fabrication')
    ? 'fabrication'
    : roles('montage')
      ? 'montage'
      : roles('peinture')
        ? 'peinture'
        : null

  // Lines that are actually selectable right now for the current role:
  // not locked (isLineDisabled) and not already completed (isLineDone).
  const selectableIds = useMemo(() => (
    data.doclignes
      .map((item) => item.line)
      .filter((line) => line?.id && !isLineDisabled(currentLineRole, line) && !isLineDone(currentLineRole, line))
      .map((line) => line.id)
  ), [data.doclignes, currentLineRole])

  const selectedRowsFull = useMemo(
    () => data.doclignes.filter((l) => selected.includes(l.line?.id)),
    [data.doclignes, selected]
  )

  const handleSelect = useCallback((lineId) => {
    setSelected((prev) => (
      prev.includes(lineId) ? prev.filter((i) => i !== lineId) : [...prev, lineId]
    ))
  }, [])

  const handleSelectAll = useCallback((checked) => {
    setSelected(checked ? selectableIds : [])
  }, [selectableIds])

  const onDateChange = useCallback(async (_date, dateString) => {
    if (selected.length === 0) return
    try {
      await api.post('docentetes/start', { complation_date: dateString, lines: selected, piece: id })
      message.success('Date modifiée avec succès')
      setSelected([])
      refetch()
    } catch (error) {
      message.error(error?.response?.data?.message)
    }
  }, [selected, id, refetch])

  // Safety net: even though selectableIds/isDisabled already keep already-done
  // lines out of the checkboxes, this drops them again right before we submit,
  // in case isLineDone doesn't (yet) match every backend field for a role.
  const dropAlreadyDoneLines = useCallback((ids) => (
    ids.filter((lineId) => {
      const item = data.doclignes.find((d) => d.line?.id === lineId)
      return item && !isLineDone(currentLineRole, item.line)
    })
  ), [data.doclignes, currentLineRole])

  const complete = useCallback(async () => {
    if (selected.length === 0) return message.warning('Aucun article sélectionné')
    const safeSelected = dropAlreadyDoneLines(selected)
    if (safeSelected.length === 0) return message.warning('Ces articles sont déjà validés')

    setCompletionSpin(true)
    try {
      await api.post('docentetes/complation', { lines: safeSelected, piece: id })
      message.success('Fabrication terminée avec succès', 6)
      setSelected([])
      refetch()
    } catch (error) {
      message.error(error?.response?.data?.message || 'server error ⚠️')
    } finally {
      setCompletionSpin(false)
    }
  }, [selected, dropAlreadyDoneLines, id, refetch])

  const transfer = useCallback(async () => {
    if (selected.length === 0) return message.warning('Aucun article sélectionné')
    if (!transferValue) return message.warning('Veuillez sélectionner une destination de transfert')
    const safeSelected = dropAlreadyDoneLines(selected)
    if (safeSelected.length === 0) return message.warning('Ces articles sont déjà validés')

    setTransferSpin(true)
    try {
      await api.post('docentetes/transfer', { lines: safeSelected, piece: id, roles: transferValue })
      message.success('Transfert effectué avec succès', 6)
      setSelected([])
      setTransferValue(null)
      refetch()
    } catch (error) {
      message.error(error?.response?.data?.message || 'server error ⚠️')
    } finally {
      setTransferSpin(false)
    }
  }, [selected, transferValue, dropAlreadyDoneLines, id, refetch])

  const handleValidation = () => (transferValue ? transfer() : complete())

  const columns = useMemo(() => (
    [
      currentLineRole && {
        title: (
          <Checkbox
            disabled={roles('production_operateur') || selectableIds.length === 0}
            checked={selectableIds.length > 0 && selected.length === selectableIds.length}
            indeterminate={selected.length > 0 && selected.length < selectableIds.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
        ),
        key: 'select',
        width: 50,
        render: (_, item) => {
          const line = item?.line
          const display = getLineSelectDisplay(currentLineRole, line)
          if (!display) return null

          if (display.kind === 'checkbox') {
            return (
              <Checkbox
                disabled={isLineDisabled(currentLineRole, line) || roles('production_operateur')}
                checked={selected.includes(line?.id)}
                onChange={() => handleSelect(line?.id)}
              />
            )
          }
          return <LineStatusBadge status={display.status} />
        },
      },
      { title: 'Piece', key: 'piece', render: (_, item) => item?.Nom || item.article?.Nom || item?.DL_Design || '__' },
      { title: 'Ref Article', key: 'ref', render: (_, item) => item.AR_Ref || '__' },
      {
        title: 'Date Livraison',
        key: 'date',
        render: (_, item) => <Tag>{formatShortDate(item.line?.complation_date)}</Tag>,
      },
      { title: 'Hauteur', key: 'hauteur', render: (_, item) => Math.floor(item.Hauteur > 0 ? item.Hauteur : item.article?.Hauteur) || '__' },
      { title: 'Largeur', key: 'largeur', render: (_, item) => Math.floor(item.Largeur > 0 ? item.Largeur : item?.article?.Largeur) || '__' },
      { title: 'Profondeur', key: 'profondeur', render: (_, item) => Math.floor(item.Profondeur || item?.article?.Profonduer) || '__' },
      { title: 'Couleur', key: 'couleur', render: (_, item) => item.Couleur || item?.article?.Couleur || '__' },
      { title: 'Chant', key: 'chant', render: (_, item) => item.Chant || item?.article?.Chant || '__' },
      { title: 'Epaisseur', key: 'epaisseur', render: (_, item) => Math.floor(item.Episseur > 0 ? item.Episseur : item?.article?.Episseur) || '__' },
      {
        title: 'Quantité',
        key: 'quantite',
        render: (_, item) => (
          <span className="px-3 py-1 w-full justify-center border border-green-500 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            {Math.floor(type === 'archive' ? item.DL_QtePL : item.EU_Qte)}
          </span>
        ),
      },
    ]
      .filter(Boolean)
      .map((col) => ({ ...col, ellipsis: false, onCell: () => ({ style: { whiteSpace: 'nowrap' } }) }))
  ), [currentLineRole, roles, selectableIds, selected, handleSelect, handleSelectAll, type])

  const summaryItems = [
    { label: 'Client', value: data.docentete?.DO_Tiers },
    { label: 'Référence', value: data.docentete?.DO_Ref },
    { label: 'Expédition', value: getExped(data.docentete?.DO_Expedit) },
    { label: 'Type de document', value: data.docentete?.DO_Piece && getDocumentType(data.docentete?.DO_Piece) },
  ]

  const title = data?.docentete?.DO_Piece
    ? `Commande ${type === 'archive' ? `${id} -> ${data.docentete.DO_Piece}` : data.docentete.DO_Piece}`
    : 'Chargement...'



  const canTransfer = useMemo(() => {
    if (!transferValue) return true

    return selected.length > 0 &&
      selected.every((lineId) => {
        const item = data.doclignes.find(
          (d) => Number(d.line?.id) === Number(lineId)
        )

        return !!item?.line?.complation_date
      })
  }, [transferValue, selected, data.doclignes])

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold text-gray-800">{title}</h1>
        <div className="flex gap-2">
          <Button onClick={refetch}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
          {Number(user.company_id) === 1 ? (
            <FacadDocumentPrint docentete={data.docentete} doclignes={selected.length > 0 ? selectedRowsFull : data.doclignes} />
          ) : (
            <PrintDocument docentete={data?.docentete} doclignes={selected.length > 0 ? selectedRowsFull : data.doclignes} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {summaryItems.map(({ label, value }) => (
          <SummaryCard key={label} label={label} value={value} />
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <DatePicker
            onChange={onDateChange}
            format="YYYY-MM-DD"
            locale={locale}
            className="border-2"
            placeholder="Date de livraison"
            disabled={roles('production_operateur') || company?.pivot?.complation_date}
          />
          <FabricationNote company={company?.pivot} onUpdated={refetch} />
          {company?.pivot?.complation_date && ` Prévue le ${formatDate(company?.pivot?.complation_date)}`}
        </div>

        <div className="flex gap-3">
          {isLaca && !roles('peinture') && (
            <Select
              className="w-40"
              placeholder="Transférer vers"
              options={TRANSFER_OPTIONS}
              value={transferValue}
              onChange={setTransferValue}
              allowClear
            />
          )}

          <Button
            onClick={handleValidation}
            disabled={
              roles('production_operateur') ||
              selected.length === 0 ||
              (!transferValue && !company?.pivot?.complation_date)
            }
            color="green"
            variant="solid"
            loading={transferValue ? transferSpin : completionSpin}
          >
            {transferValue ? 'Transférer' : 'Validation'}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data.doclignes}
        rowKey={(item, i) => item.line?.id ?? i}
        loading={loading}
        size="small"
        className="border border-solid border-gray-200 rounded-lg overflow-hidden border-b-0"
        pagination={false}
        scroll={{ x: true }}
        locale={{ emptyText: <Empty description="Aucun article trouvé" /> }}
      />
    </div>
  )
}

export default Fabrication