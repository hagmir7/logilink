import { Button, message, Tag, Popconfirm, Input } from 'antd'
import { Edit, RotateCw, Trash, Search as SearchIcon, Package } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import Spinner from '../components/ui/Spinner'
import CreateEmplacement from '../components/CreateEmplacement'
import { useAuth } from '../contexts/AuthContext'
import BackButton from '../components/ui/BackButton'
import EmplacementArticles from '../components/EmplacementArticles'
import EmplacementModal from '../components/ui/EmplacementModal'
const { Search } = Input

export default function InventoryDepotEmplacmentList() {
  const { id, inventory_id } = useParams()
  const [depot, setDepot] = useState({ emplacements: [] })
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const { roles } = useAuth()
  const [open, setOpen] = useState(false)
  const [emplacement, setEmplacement] = useState(null);
  const [selectedEmplacement, setSelectedEmplacement] = useState(null);
    const handleOk = () => {
        setIsModalOpen(false);
    };

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`depots/${id}`)
      setDepot(data)
    } catch (error) {
      message.error(
        error?.response?.data?.message || 'Erreur lors du chargement'
      )
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

  // Filter emplacements based on search text
  const filteredEmplacements = depot.emplacements.filter((item) => {
    if (!searchText) return true
    const searchLower = searchText.toLowerCase()
    return (
      item.code?.toLowerCase().includes(searchLower) ||
      depot?.depot?.code?.toLowerCase().includes(searchLower) ||
      depot?.depot?.company?.name?.toLowerCase().includes(searchLower)
    )
  })

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  return (
    <div className='w-full'>
      <div className='flex justify-between p-2 md:p-4 md:pb-0 bg-gray-50'>
        <div className='flex items-center gap-2 justify-center'>
          <BackButton />
          <h2 className='text-sm md:text-md font-black text-gray-800 pt-2'>
            {depot?.depot?.code} ({filteredEmplacements.length})
          </h2>
        </div>
        <div className='flex gap-2'>
          <Search
            placeholder='Rechercher par code, dépôt ou entreprise...'
            prefix={<SearchIcon size={14} className='text-gray-400' />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <CreateEmplacement onCreated={fetchData} depot_code={depot?.depot?.code} />
          <Button
            onClick={fetchData}
            icon={<RotateCw size={18} />}
            loading={loading}
            className='items-center flex'
          >
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className='p-1 bg-gray-50'></div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-y border-gray-200'>
            <tr>
              <th className='px-6 py-2 text-left text-sm font-black text-gray-500 uppercase tracking-wider'>
                Code
              </th>
              <th className='px-6 py-2 text-left text-sm font-black text-gray-500 uppercase tracking-wider'>
                Dépôt
              </th>
              <th className='px-6 py-2 text-left text-sm font-black text-gray-500 uppercase tracking-wider'>
                Entreprise
              </th>
              {roles('admin') && (
                <th className='px-6 py-2 text-left text-sm font-black text-gray-500 uppercase tracking-wider'>
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredEmplacements.map((item) => (
              <tr
              onClick={() => setSelectedEmplacement(item.code)}
                key={item.id}
                className='hover:bg-gray-50 cursor-pointer transition-colors duration-200'
              >
                <td className='px-6 py-1 whitespace-nowrap font-bold'>
                  {item.code || '__'}
                </td>
                <td className='px-6 py-1 whitespace-nowrap'>
                  <Tag>{depot?.depot?.code}</Tag>
                </td>
                <td className='px-6 py-1 whitespace-nowrap'>
                  {depot?.company?.name || '—'}

                </td>


                <td className='px-6 py-1 whitespace-nowrap flex gap-3'>
                  <Button icon={<Package size={15} />} onClick={() => {
                    setOpen(true)
                    setEmplacement(item.code)
                  }}>
                  </Button>
                  {(roles('admin') || (roles('production') && depot?.depot?.code.toUpperCase() === 'FABRICA')) && (
                    <Popconfirm
                      title='Supprimer cet emplacement ?'
                      onConfirm={() => handleDelete(item.code)}
                      okText='Oui'
                      cancelText='Non'
                    >
                      <Button icon={<Trash size={15} />} danger />
                    </Popconfirm>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EmplacementArticles
        emplacement_code={emplacement}
        open={open}
        onClose={() => setOpen(false)}
      />

      <EmplacementModal
        selectedEmplacement={selectedEmplacement}
        setSelectedEmplacement={setSelectedEmplacement}
        handleOk={handleOk}
        parseEmplacement={setSelectedEmplacement}
        inventory_id={inventory_id}
      />

      {/* States */}
      {loading && <Spinner />}
      {!loading && filteredEmplacements.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>
            {searchText
              ? 'Aucun résultat trouvé'
              : 'Aucun emplacement à afficher'}
          </p>
        </div>
      )}
    </div>
  )
}