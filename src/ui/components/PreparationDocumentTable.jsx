import { Edit, Printer, Settings } from 'lucide-react'
import { Button, Tag } from 'antd'
import Spinner from './ui/Spinner'

import { getExped, getStatus } from '../utils/config';
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

function PreparationDocumentTable({ documents = [], loading }) {
  const { roles } = useAuth();

  const { user } = useAuth();

  const company = (data) => {
    return data?.companies?.find(item => item.id === Number(user.company_id))
  }



  const navigate = useNavigate()



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
      const url = `/document/${id}`
      if (window.electron && typeof window.electron.openShow === 'function') {
        await window.electron.openShow({
          width: 1200,
          height: 700,
          url,
          resizable: true
        })
      } else {
        navigate(`/document/${id}`)
      }
    } catch (error) {
      console.error('Error navigating to article:', error)
    }
  }



  return (
    <div className='w-full h-full flex flex-col bg-white'>
      {/* Desktop Table View */}
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-auto hidden lg:block'>
          <table className='w-full border-collapse '>
            <thead className='sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-300 shadow-sm z-10'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'>
                  Document
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'>
                  Statut
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'>
                  Expédition
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'>
                  Client
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'>
                  Référence
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>
                  Date Document
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>
                  Date Prévue
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {documents.map((data, index) => (
                <tr
                  key={index}
                  className={`
                    border-b border-gray-200 
                    hover:bg-blue-50 
                    active:bg-blue-100 
                    cursor-pointer 
                    transition-colors 
                    duration-150 
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  `}
                  onClick={() => handleShow(data.piece)}
                >
                  <td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
                    <div className='flex items-center'>
                      <span className='text-sm font-semibold text-gray-900'>
                        {data.piece || '__'}
                      </span>

                      {data?.docentete?.DO_Reliquat === "1" && (
                        <span className='ml-2 p-1 bg-gray-100 text-gray-600 rounded border border-gray-300 shadow-sm'>
                          <Settings size={12} />
                        </span>
                      )}
                    </div>
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
                    <Tag
                      color={company(data)?.pivot?.status_id
                        ? getStatus(Number(company(data).pivot.status_id)).color
                        : 'gray'}
                      className='text-xs font-medium'
                    >
                      {company(data)?.pivot?.status_id
                        ? getStatus(Number(company(data).pivot.status_id)).name
                        : 'En attente'}
                    </Tag>
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
                    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${getExpeditionColor(data.expedition)}`}>
                      {getExped(data.expedition)}
                    </span>
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
                    <span className='text-sm text-gray-900 font-medium'>
                      {data.client_id}
                    </span>
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 last:border-r-0'>
                    {data.ref}
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 last:border-r-0'>
                    {formatDate(new Date(data.created_at))}
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 last:border-r-0 flex gap-2 items-center'>
                    <span>{formatDate(new Date(data?.docentete?.DO_DateLivr))}</span>
                    {/* {data.has_user_printer} */}
                    <span>{Number(data.has_user_printer) > 0 && <Printer />}</span>
                    <span className="text-md">
                      {parseInt(
                        data?.companies?.find(
                          (company) => parseInt(company.id) === parseInt(user.company_id)
                        )?.pivot?.updated ?? 0
                      ) === 1 && <Edit className='text-red-600' size={17} />}

                    </span>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (if needed for smaller windows) */}
      <div className='lg:hidden px-3'>
        {documents.map((data, index) => (
          <div
            key={index}
            className='border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 bg-white shadow-sm mb-2 rounded-lg border'

          >
            {/* Header with document number and status */}
            <div className='flex justify-between items-start mb-3'>
              <div className='flex items-center'>
                <span className='text-lg font-bold text-gray-900'>
                  {data.piece || '__'}
                </span>
                {data.DO_Reliquat === 1 && (
                  <span className='ml-2 p-1 bg-gray-100 text-gray-600 rounded border border-gray-300'>
                    <Settings size={14} />
                  </span>
                )}
              </div>
              <Tag
                color={company(data)?.pivot?.status_id
                  ? getStatus(Number(company(data).pivot.status_id)).color
                  : 'gray'}
                className='text-xs font-medium shadow-sm p-4 border m-0'
                style={{ margin: 0, fontSize: "20px", padding: "4px" }}
              >
                {company(data)?.pivot?.status_id
                  ? getStatus(Number(company(data).pivot.status_id)).name
                  : 'En attente'}
              </Tag>
            </div>

            {/* Expedition and Client badges */}
            <div className='flex flex-wrap gap-2 mb-3'>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold ${getExpeditionColor(data.DO_Expedit)}`}
              >
                {getExped(data.expedition)}
              </span>
              <span className='inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200'>
                {data.client_id}
              </span>
            </div>

            {/* Details */}
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500 font-medium text-xl'>Référence:</span>
                <span className='font-semibold text-lg text-gray-900'>{data.ref}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 font-medium text-xl'>Date du document:</span>
                <span className='font-semibold text-lg text-gray-900'>
                  {formatDate(new Date(data?.docentete?.DO_Date))}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500 font-medium text-xl'>Date prévue:</span>
                <span className='font-semibold text-gray-900 text-lg'>
                  {formatDate(new Date(data?.docentete?.DO_DateLivr))}
                </span>
              </div>
            </div>
            {
              (Number(data.status_id) === 8 || Number(data.status_id) === 9) && roles('controleur') ? <Button style={{ fontSize: "20px", padding: "20px", width: '100%', marginTop: '12px' }}
                color="cyan"
                variant="solid"
                onClick={() => navigate(`/document/palettes/${data?.piece}`)}
              >
                Controle
              </Button> : ''
            }

          </div>
        ))}
      </div>

      {loading && (
        <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center'>
          <Spinner />
        </div>
      )}
    </div>
  )
}

export default PreparationDocumentTable