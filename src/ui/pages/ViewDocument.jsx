import { RefreshCcw, User2 } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { Button, Descriptions, Tag } from 'antd'
import { getDocumentType } from '../utils/config'

// Helper function to get shipping method label
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



const TableRow = ({ data }) => {
  const navigate = useNavigate()

  return (
    <tr
      className='hover:bg-gray-100'
    >
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
  const [items, setItems ]= useState([]);

  const fetchData = async () => {
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
          children:  <Tag color='#f50'>{getExped(response.data.DO_Expedit)}</Tag>,
        },
        {
          key: '4',
          label: 'Type de documment',
          children: getDocumentType(response.data.DO_Piece),
        },
        {
          key: '5',
          label: 'Discount',
          children: '$20.00',
        },
        {
          key: '6',
          label: 'Official',
          children: '$60.00',
        },
      ]);
    } catch (err) {
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
                title={`Bon de command ${data.DO_Piece}`}
                extra={<Button type="primary"><RefreshCcw size={17} />Rafraîchir</Button>}
                items={items}
              />
             
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewDocument
