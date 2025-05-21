import React from 'react';
// import { Loader2, RefreshCcw, ChevronRight } from 'lucide-react'
import { formatDate, getExped } from '../../utils/config';
import { Badge } from 'antd'
import { Settings } from 'lucide-react';

function DocumentCard({ data, onSelectOrder }) {

  return (
    <Badge.Ribbon
      color={data?.document?.status?.color == 1 ? 'green' : 'gray'}
      text={`${data?.document?.status?.name}`}
    >
      <div
        className='bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all'
        onClick={() => onSelectOrder(data.DO_Piece)}
      >
        <div className='flex justify-between items-center mb-2'>
          <div className='flex items-center'>
            <span className='text-gray-800 font-bold'>
              {data.DO_Piece || '__'}
            </span>
            {data.DO_Reliquat === 1 ? (
              <span className='text-xs ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                <Settings />
              </span>
            ) : null}
          </div>
        </div>

        <div className='mb-2'>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2'>
            {getExped(data.DO_Expedit)}
          </span>
          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            {data.DO_Tiers}
          </span>
        </div>

        <div className='text-sm text-gray-600'>
          <div className='flex justify-between mb-1'>
            <span>Référence:</span>
            <span className='font-medium'>{data.DO_Ref}</span>
          </div>
          <div className='flex justify-between mb-1'>
            <span>Date du document:</span>
            <span className='font-medium'>{data.DO_Date}</span>
          </div>
          <div className='flex justify-between'>
            <span>Date prévue:</span>
            <span className='font-medium'>
              {formatDate(new Date(data.DO_DateLivr))}
            </span>
          </div>
        </div>
      </div>
    </Badge.Ribbon>
  )
}

export default DocumentCard;