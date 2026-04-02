import { Settings, Clock, CheckCircle, AlertCircle, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getExped } from '../utils/config'
import { Tag } from 'antd'

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

  // Normalize to date only (remove time)
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

function ArchiveTable({ documents = [], documentType = 1 }) {
  const navigate = useNavigate()
  const { roles } = useAuth()
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

  const columns = [
    { label: 'Document', key: 'document' },
    { label: 'Statut', key: 'statut' },
    { label: 'Expédition', key: 'expedition' },
    { label: 'Client', key: 'client' },
    { label: 'Référence', key: 'reference' },
    { label: 'Date Document', key: 'date_doc' },
    { label: 'Date Prévue', key: 'date_prev' },
    ...(isFabrication ? [
      { label: 'Date de libération', key: 'date_lib' },
      { label: 'Date prévue fabrication', key: 'date_fab' },
    ] : []),
  ]

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex-1 overflow-hidden hidden lg:flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400 text-sm">
                    Aucun document trouvé
                  </td>
                </tr>
              ) : (
                documents.map((data, index) => {
                  const piece = documentType === 1 ? data?.piece : data?.piece_bl
                  const navId = data.piece_fa || data.piece_bl || data.piece
                  const expedit = data?.docentete?.DO_Expedit || data.expedition
                  const client = data?.docentete?.DO_Tiers || data.client_id
                  const ref = data?.docentete?.DO_Ref || data.ref
                  const dateDoc = data?.docentete?.DO_Date || data.created_at
                  const datePrev = data?.docentete?.DO_DateLivr || data.delivery_date
                  const fabricatedAt = data.lines?.[0]?.fabricated_at
                  const complationDate = data.lines?.[0]?.complation_date

                  return (
                    <tr
                      key={index}
                      onClick={() => handleShow(navId)}
                      className="border-b border-gray-100 hover:bg-blue-50/60 cursor-pointer transition-colors duration-100 group"
                    >
                      {/* Document */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                            {piece}
                          </span>
                          {data.DO_Reliquat === '1' && (
                            <span className="p-1 rounded bg-gray-100 text-gray-400 border border-gray-200">
                              <Settings size={11} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Statut */}
                      {
                        roles('fabrication') ? (<td className="px-4 py-3 whitespace-nowrap">
                          <FabricationStatusBadge
                            fabricatedAt={fabricatedAt}
                            complationDate={complationDate}
                          />
                        </td>) : (<td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
                          <Tag color={data?.status?.color} className='text-xs font-medium shadow-sm border'>
                            {data?.status?.name || 'En attente'}
                          </Tag>
                        </td>)
                      }
                      

                      {/* Expédition */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ExpeditionBadge value={expedit} />
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-gray-700">{client || '—'}</span>
                      </td>

                      {/* Référence */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {ref || '—'}
                      </td>

                      {/* Date Document */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(dateDoc)}
                      </td>

                      {/* Date Prévue */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(datePrev)}
                      </td>

                      {isFabrication && (
                        <>
                          {/* Date de libération */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                            {formatDate(fabricatedAt)}
                          </td>

                          {/* Date prévue fabrication */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                            {formatDate(complationDate)}
                          </td>

                          {/* Statut fabrication */}
                       
                        </>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {documents.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 bg-gray-50">
            {documents.length} document{documents.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArchiveTable