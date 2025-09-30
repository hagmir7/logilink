import { Button, message, Tag, Popconfirm } from 'antd'
import { Edit, PlusCircle, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import Spinner from '../components/ui/Spinner'
import CreateEmplacement from '../components/CreateEmplacement'

export default function ViewDepot() {
  const { id } = useParams()
  const [depot, setDepot] = useState({ emplacements: [] })
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`depots/${id}`)
      setDepot(data)
    } catch (error) {
      message.error(error?.response?.data?.message || 'Erreur lors du chargement')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (emplacementId) => {
    try {
      await api.delete(`emplacement/delete/${emplacementId}`)
      message.success('Emplacement supprimé')
      fetchData()
    } catch (error) {
      message.error(error?.response?.data?.message || 'Suppression échouée')
    }
  }

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  return (
    <div className='w-full'>
      <div className='flex justify-between p-2 md:p-4 md:pb-0'>
        <h2 className='text-xl font-semibold text-gray-800'>
          {depot?.depot?.code} ({depot.emplacements.length})
        </h2>
        <div className='flex gap-2'>
          <CreateEmplacement onCreated={fetchData} />
          <Button onClick={fetchData} loading={loading} className='items-center flex'>
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Code Emplacement
              </th>
              <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Dépôt
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
            {depot.emplacements.map((item) => (
              <tr
                key={item.id}
                className='hover:bg-gray-50 cursor-pointer transition-colors duration-200'
              >
                <td className='px-6 py-2 whitespace-nowrap font-bold'>
                  {item.code || '__'}
                </td>
                <td className='px-6 py-2 whitespace-nowrap'>
                  <Tag>{depot?.depot?.code}</Tag>
                </td>
                <td className='px-6 py-2 whitespace-nowrap'>
                  {depot?.depot?.company?.name || '—'}
                </td>
                <td className='px-6 py-2 whitespace-nowrap flex gap-3'>
                  <Popconfirm
                    title='Supprimer cet emplacement ?'
                    onConfirm={() => handleDelete(item.code)}
                    okText='Oui'
                    cancelText='Non'
                  >
                    <Button icon={<Trash size={15} />} danger />
                  </Popconfirm>

                  <Button icon={<Edit size={15} />} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* States */}
      {loading && <Spinner />}
      {!loading && depot.emplacements.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>Aucun emplacement à afficher</p>
        </div>
      )}
    </div>
  )
}
