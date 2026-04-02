import { Loader2, Package } from 'lucide-react'

export default function PreparationActions({
  palette,
  article,
  loadingStates,
  loadingCreate,
  onSubmit,
  onCreate,
}) {
  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
      <button
        onClick={onSubmit}
        style={{ fontSize: '30px', fontWeight: 500 }}
        disabled={!palette || !article.id || loadingStates.submit}
        className='px-4 py-3 sm:px-6 sm:py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xl'
      >
        {loadingStates.submit ? (
          <div className='text-white flex gap-2 items-center'>
            <Loader2 className='w-8 h-8 sm:w-5 sm:h-5 animate-spin' />
            <span>Validation...</span>
          </div>
        ) : (
          "Valider l'article"
        )}
      </button>

      <button
        onClick={onCreate}
        disabled={loadingStates.create || loadingCreate}
        style={{ fontSize: '25px', fontWeight: 500 }}
        className='px-4 py-3 sm:px-6 sm:py-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xl'
      >
        {loadingStates.create || loadingCreate ? (
          <>
            <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 animate-spin' />
            Création...
          </>
        ) : (
          <>
            <Package className='w-8 h-8 sm:w-5 sm:h-5' />
            Nouvelle Palette
          </>
        )}
      </button>
    </div>
  )
}