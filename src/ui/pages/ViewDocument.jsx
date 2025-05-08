import { RefreshCcw, Loader2 } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { Badge, Button, Descriptions, Radio, Tag } from 'antd'
import { getExped, getDocumentType } from '../utils/config'

// Table row component
const TableRow = ({ data }) => {
  return (
    <tr className='hover:bg-gray-100'>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2 flex items-center gap-x-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            {data.AR_Ref || '__'}
          </span>
        </div>
      </td>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            {data.DL_Design || '__'}
          </span>
        </div>
      </td>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            {Math.floor(data.DL_Qte)}
          </span>
        </div>
      </td>

      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            {data.DO_Type}
          </span>
        </div>
      </td>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            {Math.floor(data.DL_MontantTTC)}
          </span>
        </div>
      </td>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            <Tag color='#f50'>{data.DO_Piece}</Tag>
          </span>
        </div>
      </td>
    </tr>
  )
}

// Main component
function ViewDocument() {
  const labels = [
    'Ref Article',
    'Désignation',
    'Quantity',
    'Doc Type',
    'Montant TTC',
    'Ref Document',
  ]

  const [data, setData] = useState({ doclignes: [] })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get('docentete/40685')
      setData(response.data)
      setItems([
        {
          key: '1',
          label: 'Client',
          children: response.data.DO_Tiers,
        },
        {
          key: '2',
          label: 'Référence',
          children: response.data.DO_Ref,
        },
        {
          key: '3',
          label: 'Expédition',
          children: getExped(response.data.DO_Expedit),
        },
        {
          key: '4',
          label: 'Articles',
          children: <Tag>{response.data.doclignes.length}</Tag>,
        },
        {
          key: '5',
          label: 'Total TTC',
          children: (
            <Tag color='green-inverse'>
              {Math.floor(response.data.DO_TotalTTC)} MAD
            </Tag>
          ),
        },
        {
          key: '6',
          label: 'Document Type',
          children: getDocumentType(response.data.DO_Piece),
        },
      ])

      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error('Failed to fetch data:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className='flex flex-col'>
      <div className='-m-1.5 overflow-x-auto'>
        <div className='p-1.5 min-w-full inline-block align-middle'>
          <div className='bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:bg-neutral-900 dark:border-neutral-700'>
            {/* Header */}
            <div className='px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-neutral-700'>
              <Descriptions
                title={
                  data.DO_Piece ? (
                    `Bon de command ${data.DO_Piece}`
                  ) : (
                    <>
                      Bon de command{' '}
                      <Loader2
                        className='inline animate-spin text-blue-500'
                        size={17}
                      />
                    </>
                  )
                }
                extra={
                  <button
                    type='button'
                    onClick={fetchData}
                    className='py-2 px-3 cursor-pointer inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700'
                  >
                    {loading ? (
                      <Loader2
                        className='animate-spin text-blue-500'
                        size={17}
                      />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Rafraîchir
                  </button>
                }
                items={items}
              />
              <h2 className='text-xl font-semibold text-gray-800 dark:text-neutral-200'>
                {/* Bon de command {data.} */}
              </h2>
              {/* <div className='inline-flex gap-x-2'>
                
              </div> */}
            </div>
            {/* Table */}
            <table className='min-w-full divide-y divide-gray-200 dark:divide-neutral-700'>
              <thead className='bg-gray-50 dark:bg-neutral-900'>
                <tr>
                  {labels.map((label) => (
                    <th
                      scope='col'
                      key={label}
                      className='px-6 py-3 text-start'
                    >
                      <div className='flex items-center gap-x-2'>
                        <span className='text-xs font-semibold uppercase text-gray-800 whitespace-nowrap dark:text-neutral-200'>
                          {label}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 dark:divide-neutral-700'>
                {data?.doclignes?.map((item, index) => (
                  <TableRow key={index} data={item} />
                ))}
              </tbody>
            </table>
            {loading && (
              <div className='flex justify-center items-center h-64'>
                <Loader2 className='animate-spin text-blue-500' size={32} />
                <span className='ml-2 text-gray-600'>Chargement...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewDocument
