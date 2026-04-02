import { ArrowLeftCircle, ArrowRightCircle, Loader2, Plus, Minus } from 'lucide-react'

export default function PaletteNavigator({
  palette,
  currentPalette,
  currentIndex,
  palettes,
  article,
  setArticle,
  loadingStates,
  quantityInput,
  onNext,
  onPrevious,
}) {
  return (
    <div className='bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6'>
      {/* Navigation arrows */}
      <div className='flex items-center justify-between mb-4 sm:mb-6'>
        <button
          onClick={onPrevious}
          disabled={loadingStates.createPalette}
          className='p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50'
        >
          <ArrowLeftCircle className='w-10 h-10 text-gray-600' />
        </button>

        <div className='text-center flex-1 px-2'>
          {loadingStates.createPalette ? (
            <div className='flex items-center justify-center gap-2'>
              <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600' />
              <span className='text-sm sm:text-lg font-semibold text-gray-900'>
                Chargement...
              </span>
            </div>
          ) : (
            <>
              <h3 className='text-3xl font-bold text-gray-900 truncate'>
                {palette ? currentPalette?.code : 'Aucune palette'}
              </h3>
              <p className='text-3xl text-gray-500'>
                {currentIndex + 1} sur {palettes.length}
              </p>
            </>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={loadingStates.createPalette}
          className='p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50'
        >
          <ArrowRightCircle className='w-10 h-10 text-gray-600' />
        </button>
      </div>

      {/* Article Details */}
      <div className='space-y-3 sm:space-y-4'>
        <div>
          <label className='block text-lg font-medium text-gray-700 mb-1 sm:mb-2'>
            Désignation
          </label>
          <input
            type='text'
            value={article.design}
            style={{ fontSize: '30px', fontWeight: 500 }}
            readOnly
            className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-2xl h-14 text-gray-900'
            placeholder='Aucun article scanné'
          />
        </div>

        <div className='grid grid-cols-3 gap-2 sm:gap-4'>
          {[
            { label: 'Profondeur', key: 'profondeur' },
            { label: 'Chant', key: 'chant' },
            { label: 'Épaisseur', key: 'epaisseur' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className='block text-lg font-medium text-gray-700 mb-1 sm:mb-2'>
                {label}
              </label>
              <input
                type='text'
                value={article[key]}
                style={{ fontSize: '30px', fontWeight: 500 }}
                readOnly
                className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-2xl h-14'
                placeholder='-'
              />
            </div>
          ))}
        </div>

        {/* Quantity Controls */}
        <div>
          <label className='block text-lg font-medium text-gray-700 mb-1 sm:mb-2'>
            Quantité
          </label>
          <div className='flex items-center gap-2 sm:gap-3 w-full'>
            <button
              style={{ fontSize: '30px', fontWeight: 500 }}
              onClick={() =>
                setArticle((prev) => ({ ...prev, qte: Math.max(prev.qte - 1, 0) }))
              }
              disabled={article.qte <= 0}
              className='p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-2xl h-14'
            >
              <Minus className='w-4 h-5 sm:w-5 sm:h-5 mx-auto' />
            </button>

            <input
              type='number'
              value={article.qte}
              min={0}
              ref={quantityInput}
              style={{ fontSize: '30px', fontWeight: 600 }}
              onChange={(e) =>
                setArticle((prev) => ({
                  ...prev,
                  qte: Math.max(0, Number(e.target.value)),
                }))
              }
              className='w-full max-w-[100px] px-3 py-2 text-center border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl h-14'
            />

            <button
              onClick={() =>
                setArticle((prev) => ({ ...prev, qte: prev.qte + 1 }))
              }
              style={{ fontSize: '30px', fontWeight: 600 }}
              className='p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 flex-1 text-2xl h-14'
            >
              <Plus className='w-4 h-5 sm:w-5 sm:h-5 mx-auto' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}