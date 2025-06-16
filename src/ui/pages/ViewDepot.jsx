import { Button, message, Tag } from 'antd'
import { Edit, PlusCircle, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import Spinner from '../components/ui/Spinner'

export default function ViewDepot() {
  const { id } = useParams()
  const [depot, setDepot] = useState({emplacements: []});
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    

    try {
      const { data } = await api.get(`depots/${id}`)
      setLoading(false)
      setDepot(data)
    } catch (error) {
      setLoading(false)
      message.error(error.response.data.message)
      console.error(error.response)
    }
  }

  useEffect(() => {
    if (id) fetchData();
  }, [id])

  return (
    <div className='w-full '>
      <div className='flex justify-between p-2 md:p-4 md:pb-0'>
        <h2 className='text-xl font-semibold text-gray-800'>
          {depot.code} ({depot.emplacements.length})
        </h2>
        <Button size='large' className='flex'>
          <PlusCircle size={20} />
          <span className='text-md'>Créer</span>
        </Button>
      </div>
      {/* Desktop Table View */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Emplacment Code
              </th>
              <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Depot
              </th>
              <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Entreprise
              </th>
              <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {depot.emplacements.map((data, index) => (
              <tr
                key={index}
                className='hover:bg-gray-50 cursor-pointer transition-colors duration-200'
              >
                <td className='px-6 py-2 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <span className='text-sm font-bold text-gray-900'>
                      {data.code || '__'}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-2 whitespace-nowrap'>
                  <Tag className='text-xl'>{depot?.code}</Tag>
                </td>

                <td className='px-6 py-2 whitespace-nowrap'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium'>
                    {depot?.company?.name}
                  </span>
                </td>
                <td className='px-6 py-2 whitespace-nowrap flex gap-3'>
                  <Button>
                    <Trash size={15} />
                  </Button>

                  <Button>
                    <Edit size={15} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {loading && <Spinner />}
      {!loading && depot.emplacements.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>Aucun document à afficher</p>
        </div>
      )}
    </div>
  )
}
