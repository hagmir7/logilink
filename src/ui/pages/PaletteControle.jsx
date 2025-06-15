import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { Badge, Spin } from 'antd'
import { Circle, CircleCheckBig, Loader } from 'lucide-react'
import { getExped, getStatus } from '../utils/config'
import BackButton from '../components/ui/BackButton'

export default function PaletteControle() {
  const { code } = useParams()
  const [palette, setPalette] = useState({ lines: [] })
  const [loadingLines, setLoadingLines] = useState({});
  const [document, setDocument] = useState({});

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data } = await api.get(`palettes/${code}`)
      setPalette(data)
      setDocument(data.document)
      // console.log(data);
      
    } catch (error) {
      console.error('Failed to fetch palette:', error)
    }
  }

  const confirm = async (lineId) => {
    setLoadingLines((prev) => ({ ...prev, [lineId]: true }))
    try {
      await api.get(`/palettes/${code}/line/${lineId}`);
      await fetchData()
    } catch (error) {
      console.error('Confirmation failed:', error)
    } finally {
      setLoadingLines((prev) => ({ ...prev, [lineId]: false }))
    }
  }

  return (
    <div className='p-4 md:p-6'>
      <div className='bg-white rounded-2xl shadow-sm p-4 mb-8 border border-gray-100'>
        <div className='mx-auto py-3 sm:py-4'>
          <div className='flex items-center gap-3'>
            <BackButton className='w-8 h-8' />
            <div className='w-px h-6 bg-gray-300' />
            <h1 className='text-sm md:text-xl font-bold text-gray-900 truncate'>
              Document <span className='text-blue-600'>{document.piece}</span>
            </h1>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-[15px] text-gray-700'>
          <div>
            <p className='font-medium text-gray-500'>Référence</p>
            <p className='font-bold'>{document.ref}</p>
          </div>
          <div>
            <p className='font-medium text-gray-500'>Client</p>
            <p className='font-bold'>{document.client_id}</p>
          </div>
          <div>
            <p className='font-medium text-gray-500'>Expédition</p>
            <p className='font-bold'>{getExped(document.expedition)}</p>
          </div>
          <div>
            <p className='font-medium text-gray-500'>Type</p>
            <p className='font-bold'>{document.type}</p>
          </div>

          <div>
            <p className='font-medium text-gray-500'>Date de transfert</p>
            <p className='font-bold'>
              {new Date(document.created_at).toLocaleString('fr-FR')}
            </p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
        {palette?.lines?.map((item, index) => {
          const isConfirmed = !!item?.pivot?.controlled_at
          const loading = loadingLines[item.id] || false

          return (
            <Badge.Ribbon key={item.id || index} text={item.ref} color='cyan'>
              <div className='rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-300 overflow-hidden'>
                <div className='p-5 bg-amber-50 space-y-4'>
                  {/* Header */}
                  <div className='flex justify-between items-start'>
                    <div>
                      <h3 className='text-base font-semibold text-gray-700'>
                        {item.article_stock?.name || 'N/A'}{' '}
                        {item.article_stock?.width && item.article_stock?.height
                          ? `${Math.floor(
                              item.article_stock.height
                            )} × ${Math.floor(item.article_stock.width)}`
                          : ''}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        ‑ {item.article_stock?.color || 'N/A'}
                      </p>
                    </div>
                    <span className='text-2xl font-bold text-gray-700 mt-4'>
                      {item.pivot?.quantity
                        ? Math.floor(item.pivot.quantity)
                        : 0}
                    </span>
                  </div>

                  {/* Details & Button */}
                  <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-600'>
                      Profondeur: {item.article_stock?.depth || 'N/A'} |{' '}
                      Épaisseur: {item.article_stock?.thickness || 'N/A'} |{' '}
                      Chant: {item.article_stock?.chant || 'N/A'}
                    </div>
                    <button
                      onClick={() => confirm(item.id)}
                      disabled={isConfirmed || loading}
                      className={`p-2 rounded-full text-white transition ${
                        isConfirmed
                          ? 'bg-green-500 hover:bg-green-600 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-600 cursor-pointer'
                      }`}
                    >
                      {loading ? (
                        <Spin
                          indicator={
                            <Loader className='animate-spin text-white' />
                          }
                          // size='small'
                        />
                      ) : isConfirmed ? (
                        <CircleCheckBig size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Badge.Ribbon>
          )
        })}
      </div>
    </div>
  )
}
