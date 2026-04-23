import { Edit, Printer, Settings } from 'lucide-react'
import { Button, Tag } from 'antd'
import Spinner from './ui/Spinner'

import { getExped, getStatus } from '../utils/config';
import { useAuth } from '../contexts/AuthContext'
import {useNavigate } from 'react-router-dom';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

function PreparationDocumentTable({ documents = [], loading, orderBy, setOrderBy, orderDir, setOrderDir }) {
  const { roles } = useAuth();
  const { user } = useAuth();

  const company = (data) => {
    return data?.companies?.find(item => item.id === Number(user?.company_id))
  }

  const navigate = useNavigate();

  

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
        navigate(`/layout/document/${id}`)
      }
    } catch (error) {
      console.error('Error navigating to article:', error)
    }
  }

  const reOrder = (order_by) => {
    setOrderDir(prev =>
      orderBy === order_by
        ? (prev === 'asc' ? 'desc' : 'asc')
        : 'asc'
    );
    setOrderBy(order_by);
  };


  return (
    <div className='w-full h-full flex flex-col pb-12'>
      {/* Desktop Table View */}
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-auto hidden lg:block'>
          <table className='w-full border-collapse '>
            <thead className='sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-300 shadow-sm z-10'>
              <tr>
                <th onClick={()=> reOrder('piece')} className='cursor-pointer px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>
                  Document <span className='text-gray-500'>{orderBy == 'piece'? "▲" : "▼"}</span>
                </th>
                <th onClick={()=> reOrder('status')} className='cursor-pointer px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>
                  Statut <span className='text-gray-500'>{orderBy == 'status'? "▲" : "▼"}</span>
                </th>
                <th onClick={()=> reOrder('expedition')} className='cursor-pointer px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>
                  Expédition <span className='text-gray-500'>{orderBy == 'expedition'? "▲" : "▼"}</span>
                </th>
                <th onClick={()=> reOrder('client')} className='cursor-pointer px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>
                  Client <span className='text-gray-500'>{orderBy == 'client'? "▲" : "▼"}</span>
                </th>
                <th className='cursor-pointer px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>
                  Référence 
                </th>
                <th onClick={()=> reOrder('date')} className='cursor-pointer px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0 whitespace-nowrap'>
                  Date Document <span className='text-gray-500'>{orderBy == 'date'? "▲" : "▼"}</span>
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
                  onClick={() => handleShow(data.docentete.DO_Piece)}
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

                      
                      {parseInt(data?.urgent) ? (
                        <span className='ml-2 p-1 bg-red-100 text-red-600 rounded border border-red-300 shadow-sm'>
                          🚨
                        </span>
                      ) : ''}

                    </div>
                  </td>

                  {
                    roles('fabrication') ? (<td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
                      <Tag
                        color={data.complation_date
                          ? 'success'
                          : 'gray'}
                        className='text-xs font-medium'
                      >
                        {data.complation_date
                          ? 'En cours'
                          : 'En attente'}
                      </Tag>
                    </td>) : (<td className='px-4 py-3 whitespace-nowrap border-r border-gray-100 last:border-r-0'>
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
                    </td>)
                  }
                  


                  

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
                    {formatDate(new Date(data?.docentete?.DO_Date))}
                  </td>

                  <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600 border-r border-gray-100 last:border-r-0 flex gap-2 items-center'>
                     <span>{formatDate(data?.docentete?.DO_DateLivr || data.delivery_date)}</span>
                    {/* {data.has_user_printer} */}
                    <span>{Number(data.has_user_printer) > 0 && <Printer />}</span>
                    <span className="text-md">
                      {parseInt(
                        data?.companies?.find(
                          (company) => parseInt(company.id) === parseInt(user?.company_id)
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

    {/* Mobile Card View */}
      <div className='lg:hidden px-3 py-2 space-y-3'>
        {documents.map((data, index) => (
          <div
            key={index}
            onClick={()=> navigate(`/layout/document/${data.id}`)}
            className='bg-white rounded-xl border border-gray-200 p-4 cursor-pointer active:border-blue-400 active:bg-blue-50/30 transition-all duration-150 shadow-sm'
          >
            {/* Top Row: Piece + Status */}
            <div className='flex justify-between items-start mb-3 gap-2'>
              <div className='flex items-center gap-2 min-w-0'>
                <span className='text-base font-bold text-gray-900 truncate'>
                  {data.piece || '—'}
                </span>
                {data?.docentete?.DO_Reliquat === '1' && (
                  <span className='p-1 bg-gray-100 text-gray-600 rounded border border-gray-300 shrink-0'>
                    <Settings size={13} />
                  </span>
                )}
                {parseInt(data?.urgent) ? (
                  <span className='p-1 bg-red-100 rounded border border-red-300 shrink-0'>
                    🚨
                  </span>
                ) : null}
              </div>

              {roles('fabrication') ? (
                <Tag
                  color={data.complation_date ? 'success' : 'gray'}
                  className='!m-0 !text-sm !px-2 !py-0.5 shrink-0'
                >
                  {data.complation_date ? 'En cours' : 'En attente'}
                </Tag>
              ) : (
                <Tag
                  color={
                    company(data)?.pivot?.status_id
                      ? getStatus(Number(company(data).pivot.status_id)).color
                      : 'gray'
                  }
                  className='!m-0 !text-sm !px-2 !py-0.5 shrink-0'
                >
                  {company(data)?.pivot?.status_id
                    ? getStatus(Number(company(data).pivot.status_id)).name
                    : 'En attente'}
                </Tag>
              )}
            </div>

            {/* Expedition + Client */}
            <div className='flex flex-wrap gap-2 mb-3'>
              <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold ${getExpeditionColor(data.expedition)}`}>
                {getExped(data.expedition)}
              </span>
              <span className='inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200'>
                {data.client_id}
              </span>
              {Number(data.has_user_printer) > 0 && (
                <span className='inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-gray-50 text-gray-600 border border-gray-200 gap-1'>
                  <Printer size={14} /> Imprimé
                </span>
              )}
              {parseInt(data?.companies?.find(c => parseInt(c.id) === parseInt(user?.company_id))?.pivot?.updated ?? 0) === 1 && (
                <span className='inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-red-50 text-red-600 border border-red-200 gap-1'>
                  <Edit size={14} /> Modifié
                </span>
              )}
            </div>

            {/* Details Grid */}
            <div className='grid grid-cols-3 gap-2 mb-3'>
              {[
                { label: 'Référence', value: data.ref },
                { label: 'Date doc.', value: formatDate(new Date(data?.docentete?.DO_Date)) },
                { label: 'Date prévue', value: formatDate(data?.docentete?.DO_DateLivr || data.delivery_date) },
              ].map(({ label, value }) => (
                <div key={label} className='bg-gray-50 rounded-lg p-2 text-center'>
                  <span className='block text-gray-400 text-xs uppercase tracking-wide font-medium mb-0.5'>{label}</span>
                  <span className='block text-gray-900 text-sm font-bold'>{value || '—'}</span>
                </div>
              ))}
            </div>

            {/* Controle Button */}
            {(Number(company(data)?.pivot?.status_id) === 8 || Number(company(data)?.pivot?.status_id) === 9) && roles('controleur') && (
              <Button
                color='cyan'
                variant='solid'
                className='w-full !mt-1'
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/document/palettes/${data?.piece}`)
                }}
              >
                Contrôle
              </Button>
            )}
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