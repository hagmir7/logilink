import { useState, useEffect } from 'react'
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  X,
  Loader2,
  Search,
  Package,
  Plus,
  Minus,
} from 'lucide-react'
import { Badge } from 'antd'
import QScanner from '../components/QScanner'
import { api } from '../utils/api'
import { useParams } from 'react-router-dom'
import BackButton from '../components/ui/BackButton'

export default function Chargement() {

  const [palette, setPalette] = useState({
    document_piece: '',
    code: '',
    company: '',
    articles: '',
    episseur: '',
  })


  const [paletteCode, setPaletteCode] = useState();

  const { id } = useParams()

  const [palettes, setPalettes] = useState([])

  // Loading states for each API operation
  const [loadingStates, setLoadingStates] = useState({
    // createPalette: false,
    scan: false,
    submit: false,
    remove: false,
    create: false,
  })


  const setLoading = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }))
  }


  useEffect(() => {
    // if (id) createPalette()
  }, [id])

  const handleScan = async (value) => {
    setLoading('scan', true)
    try {
      const { data } = await api.get(`palettes/scan/${value}`)
      setPalette({
        document_piece: data?.document?.piece,
        code: data.code,
        company: data?.company?.name,
        articles: data.lines_count,
        quantity: data.quantity,
      })
      console.log(data)

    } catch (err) {
      console.error('Error scanning:', err)
    } finally {
      setLoading('scan', false)
    }
  }

  const handleSubmit = async () => {
    setLoading('submit', true)
    try {
      const { data } = await api.post(`palettes/confirm/${paletteCode}`);
      console.log(data)
    } catch (err) {
      console.error('Error confirming:', err)
    } finally {
      setLoading('submit', false)
    }
  }



  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='mx-auto px-4 py-3 sm:py-4'>
          <div className='flex items-center gap-3'>
            <BackButton className='w-8 h-8' />
            <div className='w-px h-6 bg-gray-300' />
            <h1 className='text-sm md:text-xl font-bold text-gray-900 truncate'>
              {id}
            </h1>
          </div>
        </div>
      </div>

      <div className='mx-auto p-2 md:p-4 space-y-3 sm:space-y-8 max-w-7xl'>
        {/* Scanner Section */}
        <div className='bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6'>
          <div className='flex justify-center items-center gap-3 mb-4 sm:mb-6'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <QScanner onScan={handleScan} />
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-3'>
            <input
              type='text'
              value={paletteCode}
              onChange={(e) => setPaletteCode(e.target.value)}
              className='w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base'
              placeholder='Code-barres...'
              disabled={loadingStates.scan}
            />
            <button
              onClick={() => handleScan(paletteCode)}
              disabled={!palette || !paletteCode || loadingStates.scan}
              className='px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium text-sm sm:text-base'
            >
              {loadingStates.scan ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  <span className='hidden sm:inline'>Scan...</span>
                </>
              ) : (
                <>
                  <Search className='w-4 h-4' />
                  <span className='hidden sm:inline'>Scanner</span>
                  <span className='sm:hidden'>OK</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Palette Navigation */}
        <div className='bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6'>
          {/* Article Details */}
          <div className='space-y-3 sm:space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1 sm:mb-2'>
                Document Piece
              </label>
              <input
                type='text'
                value={palette.document_piece}
                readOnly
                className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900'
                placeholder='Aucun palette scanné'
              />
            </div>

            <div className='grid grid-cols-3 gap-2 sm:gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1 sm:mb-2'>
                  Entreprise
                </label>
                <input
                  type='text'
                  value={palette.company}
                  readOnly
                  className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base'
                  placeholder='-'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1 sm:mb-2'>
                  Articles
                </label>
                <input
                  type='text'
                  value={palette.articles}
                  readOnly
                  className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base'
                  placeholder='-'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1 sm:mb-2'>
                  Épaisseur
                </label>
                <input
                  type='text'
                  value={palette.quantity}
                  readOnly
                  className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base'
                  placeholder='-'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='gap-3 sm:grid-cols-2 sm:gap-4'>
          <button
            onClick={handleSubmit}
            disabled={!palette || !palette.document_piece || loadingStates.submit}
            className='px-4 py-3 sm:px-6 sm:py-4 bg-emerald-600 text-white rounded-xl w-full hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base'
          >
            {loadingStates.submit ? (
              <>
                <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 animate-spin' />{' '}
                Validation...
              </>
            ) : (
              "Valider la palette"
            )}
          </button>
        </div>

        {/* palettes List */}
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-emerald-100 rounded-lg'>
              <Package className='w-5 h-5 sm:w-6 sm:h-6 text-emerald-600' />
            </div>
            <h2 className='text-base sm:text-lg font-semibold text-gray-900'>
              Palettes ({palettes.length})
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

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {palettes?.map((item, index) => (
              <div key={item.id || index} className='relative'>
                <div className='absolute -top-2 -right-2 z-10'>
                  <span className='px-3 py-1 bg-cyan-500 text-white text-xs font-medium rounded-full'>
                    {item.ref}
                  </span>
                </div>

                <div className='bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow'>
                  <div className='p-4 bg-gradient-to-r from-amber-50 to-orange-50'>
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex-1 pr-2'>
                        <h3 className='text-sm sm:text-base font-bold text-gray-900 truncate'>
                          {item.palette_stock?.name || 'N/A'}
                        </h3>
                        {item.palette_stock?.width &&
                          item.palette_stock?.height && (
                            <p className='text-xs text-gray-600 mt-1'>
                              {Math.floor(item.palette_stock.height)} ×{' '}
                              {Math.floor(item.palette_stock.width)} mm
                            </p>
                          )}
                        <span className='inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mt-2'>
                          {item.palette_stock?.color || 'N/A'}
                        </span>
                      </div>
                      <div className='text-right'>
                        <div className='text-xl sm:text-2xl font-bold text-gray-900'>
                          {item.pivot?.quantity
                            ? Math.floor(item.pivot.quantity)
                            : 0}
                        </div>
                        <div className='text-xs text-gray-500'>Unités</div>
                      </div>
                    </div>

                    <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                      <div className='text-xs md:text-md text-gray-600 space-y-1 flex justify-between w-full mr-5'>
                        <div>
                          Prof:{' '}
                          <strong>{item.palette_stock?.depth || 'N/A'}</strong>
                        </div>
                        <div>
                          Ép:{' '}
                          <strong>
                            {item.palette_stock?.thickness || 'N/A'}
                          </strong>
                        </div>
                        <div>
                          Chant:{' '}
                          <strong>{item.palette_stock?.chant || 'N/A'}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => remove(item.id)}
                        disabled={loadingStates.remove}
                        className='p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {palettes?.length === 0 && !loadingStates.remove && (
            <div className='text-center py-12'>
              <Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500 text-lg'>
                Aucun palette dans cette livraison
              </p>
              <p className='text-gray-400 text-sm'>
                Scannez un code-barres pour ajouter des palettes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
