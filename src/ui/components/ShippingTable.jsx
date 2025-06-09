import React from 'react'
import { Settings } from 'lucide-react'
import { Empty, Tag } from 'antd'
import { getExped } from '../utils/config'
import { useAuth } from '../contexts/AuthContext'
import Spinner from './ui/Spinner'

// Mock utility functions for demo
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

function ShippingTable({ documents = [], onSelectOrder, loading }) {
  // Sample data for demonstration  

  const { roles } = useAuth();

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
              {roles('commercial') && (
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Document
                </th>
              )}

              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Préparation
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
            {documents.map((item, index) => (
              <tr
                key={index}
                className='hover:bg-gray-50 cursor-pointer transition-colors duration-200'
                onClick={() =>
                  onSelectOrder && onSelectOrder(item.piece_bl || item.docentete.DO_Piece)
                }
              >
                {roles('commercial') && (
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-bold text-gray-900'>
                      {item.piece_bl || item?.docentete?.DO_Piece || '__'}
                    </div>
                  </td>
                )}

                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-bold text-gray-900'>
                    {item.piece || '__'}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <Tag
                    color={item?.status?.color || item?.document?.status?.color}
                    className='text-xl'
                  >
                    {item?.status?.name ||
                      item?.document?.status?.name ||
                      'En attente'}
                  </Tag>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpeditionColor(
                      item.expedition || item.DO_Expedit
                    )}`}
                  >
                    {getExped(item.expedition || item.DO_Expedit)}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900 font-medium'>
                    {item.client_id || item.DO_Tiers}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {item.ref || item.DO_Ref}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {formatDate(
                    new Date(item?.docentete?.DO_Date || item.DO_Date)
                  )}
                </td>

                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {formatDate(
                    new Date(item?.docentete?.DO_DateLivr || item.DO_DateLivr)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className='lg:hidden'>
        {documents.map((item, index) => {
          const pieceBL = item.piece_bl || item?.docentete?.DO_Piece || '__'
          const piecePL = item?.piece || '__'

          return (
            <div
              key={index}
              className='border-b border-gray-200 p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200'
              onClick={() => onSelectOrder(piecePL)}
            >
              {/* Header with document number and status */}
              <div className='flex justify-between items-start mb-3'>
                <div className='flex items-center'>
                  <span className='text-lg font-bold text-gray-900'>
                    {roles('commercial') ? pieceBL : piecePL}
                  </span>
                  {(item.DO_Reliquat === 1 || item.reliquat === 1) && (
                    <span className='ml-2 p-1 bg-gray-100 text-gray-600 rounded'>
                      <Settings size={14} />
                    </span>
                  )}
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                    item?.status?.color || item?.document?.status?.color
                  )}`}
                >
                  {item?.status?.name ||
                    item?.document?.status?.name ||
                    'En attente'}
                </span>
              </div>

              {/* Expedition and Client badges */}
              <div className='flex flex-wrap gap-2 mb-3'>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpeditionColor(
                    item.expedition || item.DO_Expedit
                  )}`}
                >
                  {getExped(item.expedition || item.DO_Expedit)}
                </span>
                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                  {item.client_id || item.DO_Tiers}
                </span>
              </div>

              {/* Details */}
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Référence:</span>
                  <span className='font-medium text-gray-900'>
                    {item.ref || item.DO_Ref}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Date du document:</span>
                  <span className='font-medium text-gray-900'>
                    {formatDate(
                      new Date(item?.docentete?.DO_Date || item.DO_Date)
                    )}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500'>Date prévue:</span>
                  <span className='font-medium text-gray-900'>
                    {formatDate(
                      new Date(item?.docentete?.DO_DateLivr || item.DO_DateLivr)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        documents.length === 0 && (
          <Empty className='mt-10' description='Aucun document à afficher' />
        )
      )}
    </div>
  )
}

export default ShippingTable;