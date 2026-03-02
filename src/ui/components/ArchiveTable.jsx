import { Settings } from 'lucide-react'
import { Tag } from 'antd'
import { getExped } from '../utils/config'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

function ArchiveTable({ documents = [], documentType = 1 }) {
  const navigate = useNavigate();
  const { user, roles } = useAuth()

  const isFabrication = roles(['fabrication'])

  const getExpeditionColor = (expedit) => {
    const colorMap = {
      1: 'bg-red-50 text-red-700 border border-red-200',
      2: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      3: 'bg-green-50 text-green-700 border border-green-200',
    }
    return colorMap[expedit] || 'bg-gray-50 text-gray-700 border border-gray-200'
  }

  const handleShow = async (id) => {
    try {
      const url = `/document/${id}?type=archive`
      if (window.electron && typeof window.electron.openShow === 'function') {
        await window.electron.openShow({ width: 1200, height: 700, url, resizable: true })
      } else {
        navigate(`/document/${id}?type=archive`)
      }
    } catch (error) {
      console.error('Error navigating to article:', error)
    }
  }

  return (
    <div className='w-full h-full flex flex-col bg-white'>
      <div className='flex-1 overflow-hidden hidden lg:block'>
        <div className='h-full overflow-auto'>
          <table className='w-full border-collapse'>
            <thead className='sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-300 shadow-sm z-10'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'>Document</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'>Statut</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'>Expédition</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'>Client</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'>Référence</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>Date Document</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>Date Prévue</th>
                {isFabrication && (
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>
                    Date de libération
                  </th>
                )}
                {isFabrication && (
                  <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>
                    Date prévue "fabrication"
                  </th>
                )}
              </tr>
            </thead>
            <tbody className='bg-white'>
              {documents.map((data, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-200 hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  onClick={() => handleShow(data.piece_fa || data.piece_bl || data.piece)}
                >
                  <td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
                    <div className='flex items-center'>
                      <span className='text-sm font-semibold text-gray-900'>
                        {documentType == 1 ? data?.piece : data?.piece_bl}
                      </span>
                      {data.DO_Reliquat === "1" && (
                        <span className='ml-2 p-1 bg-gray-100 text-gray-600 rounded border border-gray-300 shadow-sm'>
                          <Settings size={12} />
                        </span>
                      )}
                    </div>
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
                    <Tag color={data?.status?.color} className='text-xs font-medium shadow-sm border'>
                      {data?.status?.name || 'En attente'}
                    </Tag>
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
                    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${getExpeditionColor(data?.docentete?.DO_Expedit || data.expedition)}`}>
                      {getExped(data?.docentete?.DO_Expedit || data.expedition)}
                    </span>
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
                    <span className='text-sm text-gray-900 font-medium'>
                      {data?.docentete?.DO_Tiers || data.client_id}
                    </span>
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 last:border-r-0'>
                    {data?.docentete?.DO_Ref || data.ref}
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 last:border-r-0'>
                    {formatDate(new Date(data?.docentete?.DO_Date || data.created_at))}
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 last:border-r-0'>
                    {formatDate(new Date(data?.docentete?.DO_DateLivr || data.delivery_date))}
                  </td>

                  {isFabrication && (
                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 last:border-r-0'>
                      {data.lines[0]?.fabricated_at ? formatDate(new Date(data.lines[0].fabricated_at)) : ''}
                    </td>
                  )}

                  {isFabrication && (
                    <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 last:border-r-0'>
                      {data.lines[0]?.complation_date ? formatDate(new Date(data.lines[0].complation_date)) : ''}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ArchiveTable;