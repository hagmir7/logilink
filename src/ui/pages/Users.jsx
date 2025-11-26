import { useEffect, useState } from 'react'
import { Search, Plus, Edit, Loader2, Trash } from 'lucide-react'
import CModal from '../components/ui/CModal'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import RegisterForm from '../components/RegisterForm'
import { useAuth } from '../contexts/AuthContext'
import { message, Popconfirm } from 'antd'

export default function Users() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { roles, permissions } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getUsers()
  }, [])

  const getUsers = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('users')
      setUsers(response.data)
      setFilteredUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    const query = search.toLowerCase()
    const results = users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    )
    setFilteredUsers(results)
  }, [search, users])

  const handleShow = async (id) => {
    if (!roles('admin')) {
      return;
    }
    try {
      const url = `profile/${id}`
      if (window.electron && typeof window.electron.openShow === 'function') {
        await window.electron.openShow({
          width: 1100,
          height: 750,
          url,
          resizable: true,
        })
      } else {
        navigate(`layout/profile/${id}`)
      }
    } catch (error) {
      console.error('Error navigating :', error)
    }
  }

  const deleteUser = async(user_id) => {
    try {
      const response = await api.delete(`user/${user_id}/destroy`)
      message.success('Utilisateur supprimé avec succès');
      getUsers()
    } catch (error) {
      message.error(error.response.data.message  || "Erreur de supprimer l'utilisateur")
    }
  }

  return (
    <div className='relative overflow-x-auto'>
      <div className='flex flex-col sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between p-4 bg-gray-200'>
        {/* Add User Modal */}
        <div className='relative'>
          <div className='flex'>
            <CModal
              label='Ajouter'
              title='Ajouter un utilisateur'
              icon={
                <Plus className='w-4 h-4 mt-1 text-gray-500 dark:text-gray-400 mr-1' />
              }
              btnClass='ms-3 inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700'
            >
              <RegisterForm fetchData={getUsers} />
            </CModal>
          </div>
        </div>

        {/* Search Input */}
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <Search className='w-5 h-5 text-gray-500 dark:text-gray-400' />
          </div>
          <input
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            placeholder='Rechercher un utilisateur...'
          />
        </div>
      </div>

      {/* Table */}
      <table className='w-full text-sm text-left text-gray-500 dark:text-gray-400'>
        <thead className='text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
          <tr>
            <th scope='col' className='px-6 py-3 font-bold whitespace-nowrap'>
              Nom et prénom
            </th>
            <th scope='col' className='px-6 py-3 font-bold whitespace-nowrap'>
              Code (Username)
            </th>
            <th scope='col' className='px-6 py-3 font-bold whitespace-nowrap'>
              Email
            </th>
            <th scope='col' className='px-6 py-3 font-bold whitespace-nowrap'>
              Téléphone
            </th>
            <th scope='col' className='px-6 py-3 font-bold whitespace-nowrap'>
              Créé le
            </th>
            <th scope='col' className='px-6 py-3 font-bold whitespace-nowrap'>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr
              key={user.id}

              className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
            >
              <th
                scope='row'
                className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'
              >
                {user.full_name}
              </th>
              <td className='px-6 py-4'>{user.name}</td>
              <td className='px-6 py-4'>{user.email}</td>
              <td className='px-6 py-4'>{user.phone || '__'}</td>
              <td className='px-6 py-4'>
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className='px-6 py-4 flex gap-4'>
                {roles('admin') ? (
                  <button
                    onClick={() => handleShow(user.id)}
                    className='font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer'
                  >
                    <Edit size={19} />
                  </button>
                ) : (
                  ''
                )}

                {roles('admin') ? (
                  <Popconfirm
                    title="Supprimer l'utilisateur"
                    description='Êtes-vous sûr de supprimer cet utilisateur ?'
                    onConfirm={() => deleteUser(user.id)}
                    okText='Supprimer'
                    cancelText='Annuler'
                  >
                    <button
                      danger
                      className='font-medium text-red-600 dark:text-red-500 hover:underline cursor-pointer'
                    >
                      <Trash size={19} className='text-red-600' />
                    </button>
                  </Popconfirm>

                ) : (
                  '__'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isLoading && (
        <div className='flex flex-col items-center justify-center h-64'>
          <Loader2 className='animate-spin text-blue-500 mb-2' size={32} />
          <span className='text-gray-600'>Chargement...</span>
        </div>
      )}

      {!isLoading && filteredUsers.length === 0 && (
        <div className='flex flex-col items-center justify-center h-48 text-gray-500'>
          Aucun utilisateur trouvé.
        </div>
      )}
    </div>
  )
}
