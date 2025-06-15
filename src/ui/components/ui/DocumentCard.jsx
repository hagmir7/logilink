import React from 'react';
// import { Loader2, RefreshCcw, ChevronRight } from 'lucide-react'
import { formatDate, getExped, getStatus } from '../../utils/config';
import { Badge } from 'antd'
import { Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from './Spinner';

function DocumentCard({ data, onSelectOrder, loading }) {

  const { user } = useAuth();

  const company = data?.companies?.find(item => item.id === Number(user.company_id))
  
  return (
    <div>
      <Badge.Ribbon
        color={
          company?.pivot?.status_id
            ? getStatus(Number(company.pivot.status_id)).color
            : 'gray'
        }
        text={
          company?.pivot?.status_id
            ? getStatus(Number(company.pivot.status_id)).name
            : 'En attente'
        }
      >
        <div
          className='bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all'
          onClick={() => onSelectOrder(data.piece)}
        >
          <div className='flex justify-between items-center mb-2'>
            <div className='flex items-center'>
              <span className='text-gray-800 font-bold'>
                {data.piece || '__'}
              </span>
              {Number(data?.docentete?.DO_Reliquat) === 1 ? (
                <span className='text-xs ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                  <Settings />
                </span>
              ) : null}
            </div>
          </div>

          <div className='mb-2'>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2'>
              {getExped(data.expedition)}
            </span>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
              {data.client_id}
            </span>
          </div>

          <div className='text-sm text-gray-600'>
            <div className='flex justify-between mb-1'>
              <span>Référence:</span>
              <span className='font-medium'>{data.ref}</span>
            </div>
            <div className='flex justify-between mb-1'>
              <span>Date du document:</span>
              <span className='font-medium'>
                {formatDate(new Date(data?.docentete?.DO_Date))}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Date prévue:</span>
              <span className='font-medium'>
                {formatDate(new Date(data?.docentete?.DO_DateLivr))}
              </span>
            </div>
          </div>
        </div>
      </Badge.Ribbon>
      {loading && <Spinner />}
    </div>
  )
}

export default DocumentCard;