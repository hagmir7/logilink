import { Settings } from 'lucide-react'
import { Tag } from 'antd'
import { getExped } from '../utils/config'
import Spinner from './ui/Spinner'

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}


function DocumentTable({ documents = [], onSelectOrder, loading }) {


  const getStatusBadgeColor = (color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colorMap[color] || colorMap.gray
  }

  const getExpeditionColor = (expedit) => {
    const colorMap = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-green-100 text-green-800',
    }
    return colorMap[expedit] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className='w-full '>
      {/* Desktop Table View */}
      <div className='hidden lg:block overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Document
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Statut
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Expédition
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Client
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Référence
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date Document
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date Prévue
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {documents.map((data, index) => (
              <tr
                key={index}
                className='hover:bg-gray-50 cursor-pointer transition-colors duration-200'
                onClick={() => onSelectOrder && onSelectOrder(data.DO_Piece)}
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <span className='text-sm font-bold text-gray-900'>
                      {data.DO_Piece || '__'}
                    </span>
                    {data.DO_Reliquat === 1 && (
                      <span className='ml-2 p-1 bg-gray-100 text-gray-600 rounded'>
                        <Settings size={12} />
                      </span>
                    )}
                  </div>
                </td>

                <td className='px-6 py-4 whitespace-nowrap'>
                  <Tag color={data?.document?.status?.color} className='text-xl'>
                    {data?.document?.status?.name || 'En attente'}
                  </Tag>
                </td>

                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpeditionColor(data.DO_Expedit)}`}>
                    {getExped(data.DO_Expedit)}
                  </span>
                </td>

                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900 font-medium'>
                    {data.DO_Tiers}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {data.DO_Ref}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {formatDate(new Date(data.DO_Date)) }
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {formatDate(new Date(data.DO_DateLivr))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className='lg:hidden'>
        {documents.map((data, index) => (
          <div
            key={index}
            className='border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200'
            onClick={() => onSelectOrder && onSelectOrder(data.DO_Piece)}
          >
            {/* Header with document number and status */}
            <div className='flex justify-between items-start mb-3'>
              <div className='flex items-center'>
                <span className='text-lg font-bold text-gray-900'>
                  {data.DO_Piece || '__'}
                </span>
                {data.DO_Reliquat === 1 && (
                  <span className='ml-2 p-1 bg-gray-100 text-gray-600 rounded'>
                    <Settings size={14} />
                  </span>
                )}
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                  data?.document?.status?.color
                )}`}
              >
                {data?.document?.status?.name || 'En attente'}
              </span>
            </div>

            {/* Expedition and Client badges */}
            <div className='flex flex-wrap gap-2 mb-3'>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpeditionColor(
                  data.DO_Expedit
                )}`}
              >
                {getExped(data.DO_Expedit)}
              </span>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                {data.DO_Tiers}
              </span>
            </div>

            {/* Details */}
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Référence:</span>
                <span className='font-medium text-gray-900'>{data.DO_Ref}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Date du document:</span>
                <span className='font-medium text-gray-900'>
                  {data.DO_Date}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Date prévue:</span>
                <span className='font-medium text-gray-900'>
                  {formatDate(new Date(data.DO_DateLivr))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <Spinner />}
    </div>
  )
}

export default DocumentTable
