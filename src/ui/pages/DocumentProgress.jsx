import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { message } from 'antd'
import { uppercaseFirst } from '../utils/config'

export const DocumentProgress = () => {
  const [document, setDocument] = useState({ lines: [] })
  const [loading, setLoading] = useState(true)
  const { piece } = useParams()

  useEffect(() => {
    const getDocuments = async () => {
      try {
        setLoading(true)
        const { data } = await api.get(`documents/${piece}`)
        setDocument(data)
      } catch (error) {
        console.error(error)
        message.error(error?.response?.data?.message || 'Erreur')
      } finally {
        setLoading(false)
      }
    }
    getDocuments()
  }, [piece])

  /* ----------------------------------------------------------
   * Helpers
   * -------------------------------------------------------- */
  const parseDim = (str = '') => {
    // "arriere cassrolier à frein 900 blanc 130*780"
    // => ["130","780"]
    const m = str.match(/(\d+)\*(\d+)(?:\*(\d+))?/)
    if (!m) return { h: null, l: null, p: null }
    const [, h, l, p] = m
    return { h: +h, l: +l, p: p ? +p : null }
  }

  const parseColor = (str = '') => {
    const colors = ['blanc', 'noir', 'black', 'white', 'arctic white']
    return colors.find(c => str.toLowerCase().includes(c)) || '__'
  }

  return (
    <div className='bg-white border border-gray-200 rounded-lg h-full flex flex-col overflow-hidden'>
      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-auto'>
          <table className='w-full border-collapse'>
            <thead className='sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-300 shadow-sm z-10'>
              <tr>
                {[
                  'Ref Article',
                  'Désignation',
                  'Hauteur',
                  'Largeur',
                  'Profondeur',
                  'Couleur',
                  'État',
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
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className='px-6 py-4'>
                        <div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse'></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : document.lines?.length ? (
                document.lines.map((item, idx) => {
                  const { h, l, p } = parseDim(item.design)
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150 ${
                        idx % 2 ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <td className='px-2 py-1 whitespace-nowrap border-r border-gray-100 font-semibold text-sm text-gray-900'>
                        {item.ref}
                      </td>
                      <td className='px-2 py-1 text-sm border-r border-gray-100'>
                        {uppercaseFirst(item.docligne.DL_Design || item.name)}
                      </td>
                      <td className='px-2 py-1 text-sm border-r border-gray-100'>
                        { item.docligne?.Hauteur || item.article_stock?.height || '__'}
                      </td>
                      <td className='px-2 py-1 text-sm border-r border-gray-100'>
                        {Math.floor(
                          item.docligne?.Langeur || item.article_stock?.width
                        ) || '__'}
                      </td>
                      <td className='px-2 py-1 text-sm border-r border-gray-100'>
                        {p ?? '__'}
                      </td>
                      <td className='px-2 py-1 text-sm border-r border-gray-100 capitalize'>
                        {item.docligne?.Couleur ||
                          item?.article_stock.color ||
                          '__'}
                      </td>

                      <td className='px-2 py-1 text-sm border-r border-gray-100'>
                        <span
                          className='px-2 py-1 rounded-md text-xs font-medium'
                          style={{
                            backgroundColor: item.status?.color + '20',
                            color: item.status?.color,
                            border: `1px solid ${item.status?.color}`,
                          }}
                        >
                          {item.status?.name || 'N/A'}
                        </span>
                      </td>

                      <td className='px-2 py-1 text-sm border-r border-gray-100 capitalize'>
                        {item.company.name}
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