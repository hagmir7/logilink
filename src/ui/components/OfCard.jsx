import { Button, Select, Tag, Tooltip, message, Modal, InputNumber } from "antd"
import { Check, ChevronDown, Copy, GripVertical, Loader2, Pencil, Plus, Printer, Trash, X } from "lucide-react"
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useState, useEffect } from "react"
import dayjs from 'dayjs'
import printOf from '../components/printOf'
import { api } from "../utils/api"

import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import AchatProductSearch from "./AchatProductSearch"
import OFDuplicateModal from "./OFDuplicateModal"
import { useAuth } from "../contexts/AuthContext"

/* ─── Config ─────────────────────────────────────────────────── */
const STATUTS = [
  { value: 'brouillon', label: 'Brouillon', color: 'default' },
  { value: 'lancé',     label: 'Lancé',     color: 'blue'    },
  { value: 'en_cours',  label: 'En cours',  color: 'orange'  },
  { value: 'terminé',   label: 'Terminé',   color: 'success' },
  { value: 'annulé',    label: 'Annulé',    color: 'error'   },
]
const STATUT_MAP = Object.fromEntries(STATUTS.map(s => [s.value, s]))
const { confirm } = Modal

/* ─── Sortable row ───────────────────────────────────────────── */
function SortableLineRow({
  line, index, isEditingThisLine, editingQty, savingLineQty,
  setEditingQty, handleStartEditQty, handleCancelEditQty,
  handleSaveLineQty, handleDeleteLine, isSavingOrder,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: line.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#eff6ff' : undefined,
    position: isDragging ? 'relative' : undefined,
    zIndex: isDragging ? 10 : undefined,
  }

  const { roles } = useAuth()

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
    >
      {/* Drag handle */}
      <td className="px-2 py-2 w-8">
        {!roles('production_operateur') && (
          <span
            {...attributes}
            {...listeners}
            className="flex items-center justify-center text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
          >
            {isSavingOrder
              ? <Loader2 size={14} className="animate-spin text-blue-400" />
              : <GripVertical size={15} />
            }
          </span>
        )}
      </td>

      <td className="px-4 py-2">
        <span className="font-mono text-sm font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded px-2 py-0.5">
          {line.article_code}
        </span>
      </td>

      <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
        {line.article?.description || <span className="text-gray-300 italic">—</span>}
      </td>

      <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
        {line.article?.name || <span className="text-gray-300 italic">—</span>}
      </td>

      <td className="px-4 py-2 text-start">
        {isEditingThisLine ? (
          <div className="flex items-center gap-1">
            <InputNumber
              size="small" min={0} step={0.01}
              value={editingQty} onChange={setEditingQty}
              style={{ width: 100 }} autoFocus
              onPressEnter={() => handleSaveLineQty(line.id)}
              disabled={roles('production_operateur')}
            />
            <Tooltip title="Confirmer">
              <Button
                size="small" type="primary"
                icon={savingLineQty ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                onClick={() => handleSaveLineQty(line.id)}
                disabled={savingLineQty || roles('production_operateur')} className="!px-1.5"
              />
            </Tooltip>
            <Tooltip title="Annuler">
              <Button size="small" danger icon={<X size={12} />} onClick={handleCancelEditQty} className="!px-1.5" />
            </Tooltip>
          </div>
        ) : (
          <span
            className="inline-flex items-center justify-center min-w-[52px] px-2.5 py-0.5 rounded-md text-sm bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => handleStartEditQty(line)}
          >
            {parseInt(line.quantity)}
          </span>
        )}
      </td>

      <td className="px-4 py-2">
        <div className="flex items-center gap-1">
          {!isEditingThisLine && (
            <Tooltip title="Modifier la quantité">
              <Button disabled={roles('production_operateur')} size="small" icon={<Pencil size={12} />} onClick={() => handleStartEditQty(line)} className="!px-1.5" />
            </Tooltip>
          )}
          <Tooltip title="Supprimer l'article">
            <Button disabled={roles('production_operateur')} size="small" danger icon={<Trash size={12} />} onClick={() => handleDeleteLine(line.id)} className="!px-1.5" />
          </Tooltip>
        </div>
      </td>
    </tr>
  )
}

/* ─── Main card ──────────────────────────────────────────────── */
function OFCard({ of: initialOf, refresh }) {
  const [of, setOf]                         = useState(initialOf)
  const [expanded, setExpanded]             = useState(false)
  const [editStatus, setEditStatus]         = useState(false)
  const [newStatus, setNewStatus]           = useState(of.statut)
  const [savingStatus, setSavingStatus]     = useState(false)

  // Ordered lines
  const [orderedLines, setOrderedLines]     = useState(of.lines ?? [])
  const [savingOrder, setSavingOrder]       = useState(false)

  // Duplicate modal
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [duplicating, setDuplicating]               = useState(false)

  // Qty edit
  const [editingLineId, setEditingLineId]   = useState(null)
  const [editingQty, setEditingQty]         = useState(null)
  const [savingLineQty, setSavingLineQty]   = useState(false)

  // Article search modal
  const [searchModal, setSearchModal]       = useState({ open: false, lineIndex: null, value: "" })

  const { roles } = useAuth()

  useEffect(() => {
    setOrderedLines(initialOf.lines ?? [])
  }, [initialOf])

  const cfg = STATUT_MAP[of.statut] || STATUT_MAP.brouillon

  /* ── DnD ── */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return

    const oldIndex  = orderedLines.findIndex(l => l.id === active.id)
    const newIndex  = orderedLines.findIndex(l => l.id === over.id)
    const reordered = arrayMove(orderedLines, oldIndex, newIndex)

    setOrderedLines(reordered)

    setSavingOrder(true)
    try {
      await api.put(`ordres-fabrication/${of.id}/reorder`, {
        lines: reordered.map((l, i) => ({ id: l.id, position: i + 1 }))
      })
    } catch (error) {
      console.error(error)
      message.error('Erreur lors de la sauvegarde de l\'ordre')
      setOrderedLines(orderedLines)
    } finally {
      setSavingOrder(false)
    }
  }

  /* ── Add article ── */
  const handleArticleSelect = async (articles) => {
    setSearchModal({ open: false, lineIndex: null, value: "" })
    try {
      const response = await api.post(`ordres-fabrication/${of.id}/lines`, {
        articles: articles.map(a => ({ code: a.code, quantity: 1 }))
      })
      const newLines = response.data.data
      const updated  = [...orderedLines, ...newLines]
      setOrderedLines(updated)
      setOf(prev => ({ ...prev, lines: updated }))
      message.success(response.data.message)
    } catch (err) {
      message.error(err?.response?.data?.message || "Erreur lors de l'ajout des articles")
    }
  }

  /* ── Status ── */
  const handleSaveStatus = async () => {
    if (newStatus === of.statut) { setEditStatus(false); return }
    setSavingStatus(true)
    try {
      const response = await api.put(`ordres-fabrication/${of.id}`, { statut: newStatus })
      setOf(prev => ({ ...prev, statut: newStatus }))
      message.success(response.data.message)
      setEditStatus(false)
    } catch {
      message.error('Erreur lors de la mise à jour')
    } finally {
      setSavingStatus(false)
    }
  }

  /* ── Delete OF ── */
  const handleDelete = (id) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet OF ?',
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Supprimer', okType: 'danger', cancelText: 'Annuler',
      onOk: async () => {
        try {
          await api.delete(`ordres-fabrication/${id}`)
          message.success('OF supprimé avec succès')
          refresh(1, false, [])
        } catch { message.error('Erreur lors de la suppression') }
      },
    })
  }

  /* ── Delete line ── */
  const handleDeleteLine = (id) => {
    confirm({
      title: 'Êtes-vous sûr de vouloir supprimer cet Article ?',
      icon: <ExclamationCircleOutlined />,
      content: 'Cette action est irréversible.',
      okText: 'Supprimer', okType: 'danger', cancelText: 'Annuler',
      onOk: async () => {
        try {
          await api.delete(`of-line/${id}`)
          message.success('Article supprimé avec succès')
          const updated = orderedLines.filter(l => l.id !== id)
          setOrderedLines(updated)
          setOf(prev => ({ ...prev, lines: updated }))
        } catch { message.error('Erreur lors de la suppression') }
      },
    })
  }

  /* ── Qty edit ── */
  const handleStartEditQty  = (line) => { setEditingLineId(line.id); setEditingQty(parseFloat(line.quantity)) }
  const handleCancelEditQty = ()     => { setEditingLineId(null); setEditingQty(null) }

  const handleSaveLineQty = async (lineId) => {
    if (editingQty === null || editingQty < 0) { message.warning('Veuillez saisir une quantité valide'); return }
    setSavingLineQty(true)
    try {
      await api.put(`of-line/${lineId}`, { quantity: editingQty })
      const updated = orderedLines.map(l => l.id === lineId ? { ...l, quantity: editingQty } : l)
      setOrderedLines(updated)
      setOf(prev => ({ ...prev, lines: updated }))
      message.success('Quantité mise à jour avec succès')
      setEditingLineId(null)
      setEditingQty(null)
    } catch {
      message.error('Erreur lors de la mise à jour de la quantité')
    } finally {
      setSavingLineQty(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-2 hover:shadow-md transition-shadow duration-200">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => setExpanded(v => !v)}
        >
          <span className="font-mono text-sm font-bold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 shrink-0">
            {of.reference}
          </span>
          <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500 min-w-0">
            <span className="flex items-center gap-1">
              <span className="text-gray-400">📅</span>
              {dayjs(of.date_lancement).format('DD/MM/YY')}
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <span className="text-gray-400">🚀</span>
              {of.date_demarrage ? dayjs(of.date_demarrage).format('DD/MM/YY') : 'N/C'}
            </span>
            {of.reference_machine && (
              <>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1">
                  <span className="text-gray-400">⚙️</span>
                  {of.reference_machine}
                </span>
              </>
            )}
            <span className="text-gray-300">·</span>
            <Tag color={of.type_commande === 'speciale' ? 'purple' : 'cyan'} className="!text-sm !m-0">
              {of.type_commande === 'speciale' ? 'Spéciale' : 'Standard'}
            </Tag>
          </div>
          <span className="hidden md:inline text-sm text-gray-400 shrink-0">
            {orderedLines.length} article{orderedLines.length !== 1 ? 's' : ''}
          </span>
          <ChevronDown
            size={15}
            className="text-gray-400 shrink-0 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {editStatus ? (
            <div className="flex items-center gap-0.5">
              <Select
                value={newStatus} onChange={setNewStatus} size="small" style={{ width: 130 }}
                options={STATUTS.map(s => ({ value: s.value, label: s.label }))}
              />
              <Tooltip title="Confirmer">
                <Button size="small" type="primary"
                  icon={savingStatus ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  onClick={handleSaveStatus} disabled={savingStatus} className="!px-2"
                />
              </Tooltip>
              <Tooltip title="Annuler">
                <Button size="small" danger icon={<X size={12} />}
                  onClick={() => { setEditStatus(false); setNewStatus(of.statut) }} className="!px-2"
                />
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-0.5">
              <Tag color={cfg.color} className="!m-0">{cfg.label}</Tag>
              <Tooltip title="Modifier le statut">
                <Button disabled={roles('production_operateur')} size="small" icon={<Pencil size={12} />} onClick={() => setEditStatus(true)} className="!px-2" />
              </Tooltip>
            </div>
          )}

          <Tooltip title="Dupliquer">
            <Button
              size="small" type="primary"
              icon={duplicating ? <Loader2 size={12} className="animate-spin" /> : <Copy size={12} />}
              onClick={() => setDuplicateModalOpen(true)}
              disabled={duplicating || roles('production_operateur')}
              className="!px-2"
            />
          </Tooltip>

          <Tooltip title="Imprimer">
            <Button size="small" icon={<Printer size={13} />} onClick={() => printOf(of)} className="!px-2" />
          </Tooltip>

          <Tooltip title="Supprimer">
            <Button disabled={roles('production_operateur')} danger size="small" icon={<Trash size={13} />} onClick={() => handleDelete(of.id)} className="!px-2" />
          </Tooltip>
        </div>
      </div>

      {/* ── Expanded lines ── */}
      {expanded && (
        <div className="border-t border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-8 px-2 py-2" />
                {['Réf article', 'Désignation', 'Nom', 'Qté à produire', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2 text-sm text-gray-500 uppercase tracking-wide text-start">{h}</th>
                ))}
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={orderedLines.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y divide-gray-50">
                  {orderedLines.map((line, i) => (
                    <SortableLineRow
                      key={line.id}
                      line={line}
                      index={i}
                      isEditingThisLine={editingLineId === line.id}
                      editingQty={editingQty}
                      savingLineQty={savingLineQty}
                      setEditingQty={setEditingQty}
                      handleStartEditQty={handleStartEditQty}
                      handleCancelEditQty={handleCancelEditQty}
                      handleSaveLineQty={handleSaveLineQty}
                      handleDeleteLine={handleDeleteLine}
                      isSavingOrder={savingOrder}
                    />
                  ))}

                  {/* ── Add article row ── */}
                  <tr className="bg-white">
                    <td colSpan={6} className="px-4 py-2">
                      <Button
                        type="dashed" size="small"
                        disabled={roles('production_operateur')}
                        icon={<Plus size={13} />}
                        onClick={() => setSearchModal({ open: true, lineIndex: orderedLines.length, value: "" })}
                        className="w-full !text-gray-400 hover:!text-blue-500 hover:!border-blue-400"
                      >
                        Ajouter un article
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      )}

      {/* ── Duplicate modal ── */}
      <OFDuplicateModal
        ofId={of.id}
        open={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        onSuccess={() => refresh(1, false, [])}
      />

      {/* ── Article search modal ── */}
      <AchatProductSearch
        searchModalOpen={searchModal.open}
        lineId={searchModal.lineIndex}
        inputValue={searchModal.value}
        onCancel={() => setSearchModal({ open: false, lineIndex: null, value: "" })}
        onSelect={handleArticleSelect}
      />
    </div>
  )
}

export default OFCard