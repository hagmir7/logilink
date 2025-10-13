import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { Badge, message, Spin } from 'antd'
import { Circle, CircleCheckBig, Loader, Truck, User } from 'lucide-react'
import { getExped, getStatus, uppercaseFirst } from '../utils/config'
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
    } catch (error) {
      console.error('Failed to fetch palette:', error)
      message.error(error.response.data.message)
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
    <div className=''>
       <div className='bg-gradient-to-r bg-[#eff5fe] px-3 py-1 md:py-2 border-b border-gray-200'>
        <div className='flex items-center justify-between flex-wrap gap-4'>
          <div className='flex items-center space-x-4'>
            <div className='rounded-full border border-gray-300'>
              <BackButton />
            </div>
            <div>
              <h2 className='text-md font-semibold text-gray-900'>
                {document.ref}
              </h2>
              <p className='text-sm text-gray-600'>
                <strong>{document.piece}</strong>
              </p>
            </div>
          </div>
          <div >
          
          </div>
        </div>
      </div>

      <div className='grid  grid-cols-2 md:grid-cols-3 gap-3 mb-3 px-3  border-b border-gray-200 py-2.5'>
        <div className='space-y-1'>
          <p className='text-sm font-medium text-gray-500'>Client</p>
          <p className='text-sm text-gray-900 flex gap-2 font-black'>
            <User className='w-5 h-5 text-gray-600' />
            {document.client_id}
          </p>
        </div>
        <div className='space-y-1'>
          <p className='text-sm font-medium text-gray-500'>Expedition</p>
          <p className='text-sm text-gray-900 flex gap-2 font-black'>
            <Truck className='w-5 h-5 text-gray-600' />{' '}
            {getExped(document.expedition)}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 p-4 md:p-6'>
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
                      <h3 className='text-xl font-semibold text-gray-700'>
                        {item?.docligne?.Nom ||
                          item?.docligne?.article?.Nom ||
                          item?.docligne.DL_Design ||
                          '__'}{' '}
                        {item?.docligne?.article?.Description || null}{' '}
                        {item?.docligne?.Poignée}
                        <span>
                          {(() => {
                            const height = item?.docligne?.Hauteur > 0 || item?.docligne?.article?.Hauteur
                            const width = item?.docligne?.Largeur > 0 || item?.docligne?.article?.Largeur
                            console.log(item);
                            

                            if (!height && !width) return null // nothing to display

                            if (height && width) {
                              return (
                                <>
                                  {' '}
                                  <strong>{Math.floor(height)}</strong> *{' '}
                                  <strong>{Math.floor(width)}</strong>
                                </>
                              )
                            }

                            // Only one exists
                            return (
                              <strong>{Math.floor(height ?? width)}</strong>
                            )
                          })()}
                        </span>
                      </h3>
                      {(() => {
                        const invalidValues = [null, undefined, '', '0', 0]

                        const couleur = !invalidValues.includes(
                          item.docligne?.Couleur
                        )
                          ? item.docligne.Couleur
                          : !invalidValues.includes(
                              item.docligne?.article?.Couleur
                            )
                          ? item.docligne.article.Couleur
                          : null

                        return couleur ? (
                          <span className='inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full mt-2 text-lg'>
                            {couleur}
                          </span>
                        ) : null
                      })()}
                    </div>
                    <span className='text-2xl font-bold text-gray-700 mt-4'>
                      {item.pivot?.quantity
                        ? Math.floor(item.pivot.quantity)
                        : 0}
                    </span>
                  </div>

                  {/* Details & Button */}
                  <div className='flex justify-between items-center'>
                    <div className='text-xl flex justify-between text-gray-600 w-full me-5'>
                      <div>
                        Profondeur:{' '}
                        <strong>
                          {Math.floor(
                            item?.docligne.Profondeur
                              ? item?.docligne?.Profondeur
                              : item?.docligne?.article?.Profonduer
                          ) || '__'}
                        </strong>
                      </div>

                      <div>
                        Épaisseur:{' '}
                        <strong>
                          {Math.floor(
                            item?.docligne?.Episseur > 0 || 
                              item?.docligne?.article?.Episseur
                          ) || '__'}
                        </strong>
                      </div>

                      <div>
                        Chant:{' '}
                        <strong>
                          {(item?.docligne?.article ? item?.docligne?.article?.Chant : item?.Chant) || '__'}
                        </strong>
                      </div>
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
