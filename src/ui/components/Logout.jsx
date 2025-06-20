import { ArrowRightCircle } from 'lucide-react'
import { useNavigate } from 'react-router'

export default function Logout() {
  const navigate = useNavigate();


  const handelLogout = async () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    if (window.electron) {
      await window.electron.logout();
    } else {
      navigate('/login')
    }
  }

  return (
    <button
      onClick={handelLogout}
      title='Déconnexion'
      className='hover:bg-gray-300 flex items-center justify-center w-12 h-12 transition-transform rounded-full active:scale-95 hover:bg-primary/5 hover:dark:bg-primary-dark/5 outline-link cursor-pointer'
      to='/register'
    >
      <ArrowRightCircle />
    </button>
  )
}
