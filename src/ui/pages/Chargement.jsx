import { useState, useEffect } from 'react'
import {
  X,
  Loader2,
  Search,
  Package,

} from 'lucide-react'
import { message } from 'antd'
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
  const [document, setDocument] = useState({})

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

  const loadPalettes = async () => {
    try {
      const response = await api.get(`documents/${id}/delivered-palettes`);
      setDocument(response.data)
      setPalettes(response.data?.palettes || [])
    } catch (error) {
      message.error(error.response.data.message + id, 5)
      console.error('Error confirming:', error.response.data.error)
    }

  }


  useEffect(() => {
    if (id) loadPalettes();
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
    } catch (err) {
      message.error(err.response.data.message)
      console.error('Error scanning:', err)
    } finally {
      setLoading('scan', false)
    }
  }

  const handleSubmit = async () => {
    setLoading('submit', true)
    try {
      const { data } = await api.post(`palettes/confirm/${paletteCode}/${id}`);
      console.log(data);
      message.success("La palette est livrée")
      loadPalettes()
    } catch (err) {
      message.error(err.response.data.message + id, 5)
      console.error('Error confirming:', err.response.data.error)
    } finally {
      setLoading('submit', false)
    }
  }
  

  const resetPalette = async (code) =>{
    try {
      const response = await api.put(`palettes/reset/${code}`);
      message.success(response.data.message);
    } catch (error) {
      message.error(error.response.data.message + id, 5)
      console.error('Error confirming:', error.response.data.error)
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
              {id} - {document?.palettes_count}
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
                  Quantity
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

          <div className='grid grid-cols-1 gap-4'>
            {palettes?.map((item, index) => (
              <div key={item.id || index} className='relative'>
                {/* Status Badge - Mobile Optimized */}
                <div className='absolute -top-2 -right-2 z-10'>
                  <div className='px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-md flex items-center gap-1'>
                    <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                    </svg>
                    Livré
                  </div>
                </div>

                {/* Main Card - Mobile First */}
                <div className='bg-white rounded-lg border border-gray-200 shadow-sm active:shadow-md transition-shadow duration-200'>

                  {/* Header Section */}
                  <div className='p-4 bg-gradient-to-r  rounded-t-lg'>
                    <div className='flex items-center justify-between'>

                      {/* Left Content */}
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-base font-semibold text-gray-900 truncate mb-2'>
                          {item.code}
                        </h3>

                        <div className='flex items-center gap-2 mb-3'>
                          <span className='inline-flex items-center gap-1 px-2 py-1 bg-white/70 text-gray-600 text-xs font-medium rounded-md border'>

                            {id || 'N/A'}
                          </span>
                        </div>

                        {/* Status Info */}
                        <div className='flex items-center gap-2 text-xs text-gray-500'>
                          <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                          <span>Livraison terminée</span>
                        </div>
                      </div>

                      {/* Right Action - Large Touch Target */}
                      <div className='ml-4 flex-shrink-0'>
                        <button
                          onClick={() => resetPalette(item.code)}
                          disabled={loadingStates.remove}
                          className='flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95'
                        >
                          {loadingStates.remove ? (
                            <svg className='w-4 h-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                              <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                              <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                          ) : (
                            <X className='w-4 h-4' />
                          )}
                        </button>
                      </div>
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
