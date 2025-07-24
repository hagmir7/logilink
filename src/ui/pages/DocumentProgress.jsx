import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { message, Progress, Skeleton } from 'antd'
import { uppercaseFirst } from '../utils/config'

export const DocumentProgress = () => {
  const [data, setData] = useState({ lines: [] })
  const [loading, setLoading] = useState(true)
  const { piece } = useParams()

  useEffect(() => {
    const getDocuments = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`documents/${piece}`)
        setData(data)
      } catch (error) {
        console.error(error)
        message.error(error?.response?.data?.message || 'Erreur')
      } finally {
        setLoading(false)
      }
    }
    getDocuments()
  }, [piece])

  const companyColorMap = {
    1: 'bg-red-400 text-white',
    2: 'bg-green-300 text-green-700',
    3: 'bg-blue-400',
  }

  return (
    <div className='bg-white border border-gray-200 h-full flex flex-col overflow-hidden'>
      <div className='flex-1 overflow-hidden'>
        {!loading && data && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-2 py-4  sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-300'>
            {[
              {
                label: 'Piece',
                value: data.document?.piece,
              },
              {
                label: 'Client',
                value: data.document?.client_id,
              },

              {
                label: 'Référence',
                value: data.document?.ref,
              },

              {
                label: 'Type ',
                value: data.document?.type,
              },
            ].map(({ label, value }, idx) => (
              <div
                key={idx}
                className='bg-white border border-gray-200 rounded-lg p-2 shadow-sm'
              >
                <div className='flex flex-col gap-2'>
                  <span className='text-xs text-gray-500 uppercase tracking-wider font-medium'>
                    {label}
                  </span>
                  <span className='text-sm font-semibold text-gray-900'>
                    {value || <Skeleton />}
                  </span>
                </div>
              </div>
            ))}

            <div className='bg-white border border-gray-200 rounded-lg p-2 shadow-sm'>
              <div className='flex justify-center items-center gap-2'>
                <div className=''>
                  <Progress
                    type='circle'
                    percent={data.progress} // data.progress is already a percentage (0-100)
                    size={50}
                    strokeColor='#52c41a'
                  />
                </div>
                {/* Optional: Show additional info */}
                <div className='text-center text-md text-gray-600'>
                  {data.current_qte} / {data.required_qte}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='h-full overflow-auto'>
          <table className='w-full border-collapse'>
            <thead className='sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-300 shadow-sm z-10'>
              <tr>
                {[
                  'État',
                  'Ref Article',
                  'Désignation',
                  'Hauteur',
                  'Largeur',
                  'Couleur',

                  'Société',
                  'Quantité',
                ].map((h) => (
                  <th
                    key={h}
                    className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className='bg-white'>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className='px-6 py-4'>
                        <div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse'></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.document.lines?.length ? (
                data.document.lines.map((item, idx) => {
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150 ${
                        idx % 2 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className='px-2 py-1 text-sm border-r border-gray-100'>
                        <span
                          className='px-2 py-1 rounded-md text-sm font-medium'
                          style={{
                            backgroundColor: item.status?.color + '20',
                            color: item.status?.color,
                            border: `1px solid ${item.status?.color}`,
                          }}
                        >
                          {item.status?.name || 'N/A'}
                        </span>
                      </td>
                      <td className='px-2 py-1 whitespace-nowrap border-r border-gray-100 font-semibold text-sm text-gray-900'>
                        {item.ref}
                      </td>
                      <td className='px-2 py-1 text-sm border-r border-gray-100'>
                        {uppercaseFirst(item.docligne.DL_Design)}
                      </td>
                      <td className='px-2 py-1 text-sm border-r border-gray-100'>
                        {item.docligne?.Hauteur |
                          item.article_stock?.height |
                          '__'}
                      </td>
                      <td className='px-2 py-1 text-sm border-r border-gray-100'>
                        {Math.floor(
                          item.docligne?.Langeur | item.article_stock?.width
                        ) || '__'}
                      </td>

                      <td className='px-2 py-1 text-sm border-r border-gray-100 capitalize'>
                        {item.docligne?.Couleur |
                          item?.article_stock?.color |
                          '__'}
                      </td>

                      <td className='px-2 py-1 text-sm border-r border-gray-100 capitalize'>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-md font-medium ${
                            companyColorMap[item.company.id] || 'bg-gray-400'
                          }`}
                        >
                          {item.company.name}
                        </span>
                      </td>

                      <td className='px-2 py-1 text-sm'>
                        <span className='inline-flex justify-center px-2 py-1 w-full rounded-md text-sm font-semibold bg-green-50 text-green-700 border border-green-200'>
                          {Number(item.quantity)}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className='p-8 text-center text-gray-400'>
                    Aucun article trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
