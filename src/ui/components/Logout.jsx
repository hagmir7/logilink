import { ArrowRightCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext';

export default function Logout() {
  const {logout} = useAuth()
  return (
    <button
      onClick={logout}
      title='Déconnexion'
      className='hover:bg-gray-300 flex items-center justify-center w-12 h-12 transition-transform rounded-full active:scale-95 hover:bg-primary/5 outline-link cursor-pointer'
      to='/register'
    >
      <ArrowRightCircle />
    </button>
  )
}
