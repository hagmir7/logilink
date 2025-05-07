import { useState, useEffect } from 'react'
import { Mail, Phone, Save, Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const [userData, setUserData] = useState({
    name: '',
    full_name: '',
    email: '',
    phone: '',
    roles: [],
  })
  const [userRoles, setUserRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const { id } = useParams()
  const { roles } = useAuth()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const url = `user/${id || ''}`
        const response = await api.get(url)
        const data = response.data
        setUserRoles(data.roles)
        
        // Extract just the role names from the user's roles array
        const userRoleNames = Array.isArray(data.user.roles) 
          ? data.user.roles.map(role => role.name.toString())
          : []

        setUserData({
          name: data.user.name || '',
          full_name: data.user.full_name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          roles: userRoleNames,
        })
      } catch (err) {
        setMessage(
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
            <div className="font-medium">Impossible de charger les données du profil</div>
            <div className="text-sm">{err.message || "Une erreur s'est produite"}</div>
          </div>
        )
        console.error('Erreur de chargement:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id])

  // Handle standard field changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData({
      ...userData,
      [name]: value,
    })
  }

  // Handle role checkbox changes
  const handleRoleChange = (roleName) => {
    setUserData(prevData => {
      const updatedRoles = prevData.roles.includes(roleName)
        ? prevData.roles.filter(r => r !== roleName)
        : [...prevData.roles, roleName]
      
      return {
        ...prevData,
        roles: updatedRoles
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
    
      const payload = {
        ...userData,
      }
      
      const token = localStorage.getItem('authToken')
      const url = `user/update/${id || ''}`
      await api.post(url, payload, {
        headers: {
          ContentType: 'application/json',
          Authorization: 'Bearer ' + token,
        },
      })

      setMessage(
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm">
          <div className="font-medium">Succès!</div>
          <div className="text-sm">Profil mis à jour avec succès</div>
        </div>
      )
    } catch (err) {
      setMessage(
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
          <div className="font-medium">Échec de la mise à jour</div>
          <div className="text-sm">{err.message || "Une erreur s'est produite"}</div>
        </div>
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading && !userData.name) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="ml-2 text-gray-600">Chargement du profil...</span>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto bg-white overflow-hidden">
      <div className="bg-gradient-to-r py-6 px-8">
        <h1 className="text-2xl font-bold text-gray-600">
          Profil de {userData.full_name || 'l\'utilisateur'}
        </h1>
        <p className="text-gray-600 mt-1">Gérer vos informations personnelles et préférences</p>
      </div>
      
      <div className="p-8">
        {message}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Nom d'utilisateur<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  placeholder="Ex. BonnieG"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Nom complet<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={userData.full_name}
                  onChange={handleChange}
                  placeholder="Ex. Bonnie Green"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Votre email<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="nom@exemple.com"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    placeholder="01-23-45-67-89"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {roles('edit:roles') && (
            <div className="mt-6">
              <div className="flex items-center mb-4">
                <h3 className="font-medium text-gray-800 text-lg">Rôles utilisateur</h3>
                <div className="ml-2 text-xs text-white bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center cursor-help" title="Sélectionnez les rôles pour cet utilisateur">
                  ?
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {userRoles.map((role) => (
                    <div key={role.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        checked={userData.roles.includes(role.name)}
                        onChange={() => handleRoleChange(role.name)}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor={`role-${role.id}`} className="ml-2 text-gray-700 cursor-pointer">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}