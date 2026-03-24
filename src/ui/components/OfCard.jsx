import { Button, Select, Tag, Tooltip, message } from "antd"
import { Check, ChevronDown, Loader2, Pencil, Printer, X } from "lucide-react"
import { useState } from "react"
import dayjs from 'dayjs'
import printOf from '../components/printOf'
import { api } from "../utils/api"

/* ─── Config ─────────────────────────────────────────────────── */
const STATUTS = [
  { value: 'brouillon', label: 'Brouillon', color: 'default' },
  { value: 'lancé',     label: 'Lancé',     color: 'blue'    },
  { value: 'en_cours',  label: 'En cours',  color: 'orange'  },
  { value: 'terminé',   label: 'Terminé',   color: 'success' },
  { value: 'annulé',    label: 'Annulé',    color: 'error'   },
]


const STATUT_MAP = Object.fromEntries(STATUTS.map(s => [s.value, s]))


function OFCard({ of: initialOf }) {
  const [of, setOf]                   = useState(initialOf)
  const [expanded, setExpanded]       = useState(false)
  const [editStatus, setEditStatus]   = useState(false)
  const [newStatus, setNewStatus]     = useState(of.statut)
  const [savingStatus, setSavingStatus] = useState(false)

  const cfg      = STATUT_MAP[of.statut] || STATUT_MAP.brouillon
  const totalQte = of.lines?.reduce((s, l) => s + parseFloat(l.quantity  || 0), 0) ?? 0
  const totalProd= of.lines?.reduce((s, l) => s + parseFloat(l.quantity_produite || 0), 0) ?? 0
  const pct      = totalQte > 0 ? Math.min((totalProd / totalQte) * 100, 100) : 0

  const handleSaveStatus = async () => {
    if (newStatus === of.statut) { setEditStatus(false); return }
    setSavingStatus(true)
    try {
      const response = await api.put(`ordres-fabrication/${of.id}`, { statut: newStatus })
      setOf(prev => ({ ...prev, statut: newStatus }))
      message.success(response.data.message)
      setEditStatus(false)
      console.log(of.id);
      
    } catch(err) {
      
      message.error('Erreur lors de la mise à jour')
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-2 hover:shadow-md transition-shadow duration-200">

      {/* ── Header row ── */}
      <div className="flex items-center gap-3 px-4 py-3">

        {/* Reference — clickable to expand */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => setExpanded(v => !v)}
        >
          <span className="font-mono text-sm font-bold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 shrink-0">
            {of.reference}
          </span>

          {/* Meta chips */}
          <div className="flex items-center gap-2 flex-wrap text-sm text-gray-500 min-w-0">
            <span className="flex items-center gap-1">
              <span className="text-gray-400">📅</span>
              {dayjs(of.date_lancement).format('DD/MM/YY')}
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1">
              <span className="text-gray-400">🚀</span>
              {dayjs(of.date_demarrage).format('DD/MM/YY')}
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
            <Tag
              color={of.type_commande === 'speciale' ? 'purple' : 'cyan'}
              className="!text-sm !m-0"
            >
              {of.type_commande === 'speciale' ? 'Spéciale' : 'Standard'}
            </Tag>
          </div>


          {/* Lines count */}
          <span className="hidden md:inline text-sm text-gray-400 shrink-0">
            {of.lines?.length ?? 0} article{(of.lines?.length ?? 0) !== 1 ? 's' : ''}
          </span>

          <ChevronDown
            size={15}
            className="text-gray-400 shrink-0 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2 shrink-0">
          {editStatus ? (
            <div className="flex items-center gap-0.5">
              <Select
                value={newStatus}
                onChange={setNewStatus}
                size="small"
                style={{ width: 130 }}
                options={STATUTS.map(s => ({ value: s.value, label: s.label }))}
              />
              <Tooltip title="Confirmer">
                <Button
                  size="small"
                  type="primary"
                  icon={savingStatus ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  onClick={handleSaveStatus}
                  disabled={savingStatus}
                  className="!px-2"
                />
              </Tooltip>
              <Tooltip title="Annuler">
                <Button
                  size="small"
                  danger
                  icon={<X size={12} />}
                  onClick={() => { setEditStatus(false); setNewStatus(of.statut) }}
                  className="!px-2"
                />
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-0.5">
              <Tag color={cfg.color} className="!m-0">{cfg.label}</Tag>
              <Tooltip title="Modifier le statut">
                <Button
                  size="small"
                  icon={<Pencil size={12} />}
                  onClick={() => setEditStatus(true)}
                  className="!px-2"
                />
              </Tooltip>
            </div>
          )}

          <Tooltip title="Imprimer">
            <Button
              size="small"
              icon={<Printer size={13} />}
              onClick={() => printOf(of)}
              className="!px-2"
            />
          </Tooltip>
        </div>
      </div>

      {/* ── Expanded lines ── */}
      {expanded && (
        <div className="border-t border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Réf article ', 'Désignation', 'Nom', 'Qté a produite'].map(h => (
                  <th
                    key={h}
                    className={`px-4 py-2 text-sm  text-gray-500 uppercase tracking-wide text-start`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {of.lines?.map((line, i) => {
                const lineCfg = STATUT_MAP[line.statut] || STATUT_MAP.brouillon
                return (
                  <tr
                    key={line.id}
                    className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="px-4 py-2">
                      <span className="font-mono text-sm font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded px-2 py-0.5">
                        {line.article_code}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                      {line.article?.description ||  (
                        <span className="text-gray-300 italic">—</span>
                      )}
                    </td>

                    <td className="px-4 py-2 text-gray-600 max-w-xs truncate">
                      {line.article?.name ||  (
                        <span className="text-gray-300 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-start">
                      <span className="inline-flex items-center justify-center min-w-[52px] px-2.5 py-0.5 rounded-md text-sm bg-blue-50 text-blue-700 border border-blue-200">
                        {parseFloat(line.quantity).toFixed(2)}
                      </span>
                    </td>
     
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default OFCard;