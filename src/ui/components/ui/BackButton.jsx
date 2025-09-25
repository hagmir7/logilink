import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowLeftCircle } from 'lucide-react'

function BackButton() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <>
      <button
        onClick={handleBack}
        className='flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100  text-gray-600 hover:text-gray-900 transition-all duration-200 ease-in-out group cursor-pointer'
      >
        <ArrowLeftCircle className='w-6 h-6 transition-transform duration-200 group-hover:-translate-x-0.5' />
        <span className='font-medium'>Retour</span>
      </button>
    </>
  )
}

export default BackButton;
