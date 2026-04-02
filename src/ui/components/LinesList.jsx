import { Loader2, Package, X } from 'lucide-react'
import { uppercaseFirst } from '../utils/config'

export default function LinesList({ lines, loadingStates, onRemove }) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <div className='p-2 bg-emerald-100 rounded-lg'>
          <Package className='w-6 h-6 sm:w-6 sm:h-6 text-emerald-600' />
        </div>
        <h2 className='text-2xl font-semibold text-gray-900 mb-0 pb-0'>
          Articles ({lines.length})
        </h2>
      </div>

      {loadingStates.remove && (
        <div className='flex items-center justify-center py-8'>
          <div className='flex items-center gap-2 text-gray-600'>
            <Loader2 className='w-5 h-5 animate-spin' />
            <span>Suppression en cours...</span>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
        {lines?.map((item, index) => {
          const lineHeight =
            Math.floor(item.docligne?.Hauteur) ||
            Math.floor(item.docligne?.article?.Hauteur) ||
            false

          const lineWidth =
            Math.floor(item.docligne?.Largeur) ||
            Math.floor(item.docligne?.article?.Largeur) ||
            false

          return (
            <div key={item.id || index} className='relative'>
              {/* Badge Reference */}
              <div className='absolute -top-2 -right-2 z-20'>
                <span className='px-3 py-1 bg-cyan-600 text-white text-base font-semibold rounded-full shadow'>
                  {item.ref}
                </span>
              </div>

              {/* Card */}
              <div className='bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all overflow-hidden'>
                <div className='p-5 bg-gradient-to-r from-amber-50 to-orange-50'>
                  {/* Title & Qty */}
                  <div className='flex justify-between items-start mb-4'>
                    <div className='flex-1 pr-4'>
                      <h3 className='text-2xl font-semibold text-gray-900 leading-snug break-words'>
                        {uppercaseFirst(
                          item?.docligne?.Nom ||
                            item?.docligne?.article?.Nom ||
                            item?.docligne?.article?.AR_Design ||
                            '__'
                        )}{' '}
                        {item?.docligne?.Poignée} {item?.docligne?.Rotation}{' '}
                        {item?.docligne?.Description}
                      </h3>

                      <p className='text-2xl text-gray-700 mt-2'>
                        {lineHeight ? `${lineHeight}` : '__'}
                        {lineHeight && lineWidth ? ' × ' : ''}
                        {lineWidth ? `${lineWidth}` : '__'} mm
                      </p>

                      {(item.docligne?.Couleur || item.docligne?.article?.Couleur) && (
                        <span className='inline-block mt-2 px-3 py-1 bg-gray-200 rounded-full text-gray-700 text-base font-medium'>
                          {item.docligne?.Couleur || item.docligne?.article?.Couleur}
                        </span>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className='text-right'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {item.pivot?.quantity ? Math.floor(item.pivot.quantity) : 0}
                      </div>
                      <div className='text-sm text-gray-500'>Unités</div>
                    </div>
                  </div>

                  {/* Divider + Footer */}
                  <div className='pt-4 mt-3 border-t border-gray-300 flex items-center justify-between'>
                    <div className='flex-1 flex justify-between text-lg text-gray-700 pr-4'>
                      <div>
                        Ép:{' '}
                        <strong className='font-semibold text-gray-900'>
                          {Math.floor(
                            item.docligne?.Episseur > 0
                              ? item.docligne?.Episseur
                              : item.docligne?.article?.Episseur ?? '__'
                          ) || '__'}
                        </strong>
                      </div>
                      <div>
                        Chant:{' '}
                        <strong className='font-semibold text-gray-900'>
                          {item.docligne?.Chant || item.docligne?.article?.Chant || '__'}
                        </strong>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemove(item.id, item.pivot.id)}
                      disabled={loadingStates.remove}
                      className='p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition disabled:opacity-50'
                    >
                      <X className='w-6 h-6 text-white' />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {lines?.length === 0 && !loadingStates.remove && (
        <div className='text-center py-12'>
          <Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500 text-lg'>Aucun article dans cette palette</p>
          <p className='text-gray-400 text-sm'>
            Scannez un code-barres pour ajouter des articles
          </p>
        </div>
      )}
    </div>
  )
}