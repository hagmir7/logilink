import { Loader2, RefreshCcw, ChevronRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'

function getExped(exp) {
  const expedMap = {
    1: 'EX-WORK',
    2: 'LA VOIE EXPRESS',
    3: 'SDTM',
    4: 'LODIVE',
    5: 'MTR',
    6: 'CARRE',
    7: 'MAROC EXPRESS',
    8: 'GLOG MAROC',
    9: 'AL JAZZERA',
    10: 'C YAHYA',
    11: 'C YASSIN',
    12: 'GHAZALA',
    13: 'GISNAD',
  }

  return expedMap[exp] || ''
}

const OrderCard = ({ data, onSelectOrder }) => {
  return (
    <div
      className='bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all'
      onClick={() => onSelectOrder(data.cbMarq)}
    >
      <div className='flex justify-between items-center mb-2'>
        <div className='flex items-center'>
          <span className='text-gray-800 font-medium'>
            {data.DO_Piece || '__'}
          </span>
          <span className='text-xs ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded'>
            {data.DO_Reliquat || '__'}
          </span>
        </div>
        <ChevronRight size={18} className='text-gray-400' />
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
          <span className='font-medium'>{data.DO_DateLivr}</span>
        </div>
      </div>
    </div>
  )
}

function Document() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true)
    try {
      // Replace with actual API when integrating
      const response = await api.get('docentetes/2')
      setData(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setLoading(false)
    }
  }

  const handleSelectOrder = (orderId) => {
    navigate(`/document/${orderId}`)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className='px-4 py-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-800'>
          Gestion des commandes
        </h2>
        <button
          type='button'
          onClick={fetchData}
          className='py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50'
        >
          {loading ? (
            <Loader2 className='animate-spin text-blue-500' size={17} />
          ) : (
            <RefreshCcw size={17} />
          )}
          <span className='hidden sm:inline'>Rafraîchir</span>
        </button>
      </div>

      {/* Cards Container */}
      <div className='space-y-4'>
        {loading ? (
          <div className='flex flex-col items-center justify-center h-64'>
            <Loader2 className='animate-spin text-blue-500 mb-2' size={32} />
            <span className='text-gray-600'>Chargement...</span>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {data.length > 0
                ? data.map((item, index) => (
                    <OrderCard
                      key={index}
                      data={item}
                      onSelectOrder={handleSelectOrder}
                    />
                  ))
                : null}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Document
