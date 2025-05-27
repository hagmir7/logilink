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

export default function Preparation() {
  const [article, setArticle] = useState({
    ref: '',
    design: '',
    profondeur: '',
    episseur: '',
    chant: '',
    qte: 0,
    color: '',
    height: '',
    width: '',
  })

  const { id } = useParams()
  const [palette, setPalette] = useState(null)
  const [line, setLine] = useState('')
  const [lines, setLines] = useState([])
  const [palettes, setPalettes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Loading states for each API operation
  const [loadingStates, setLoadingStates] = useState({
    createPalette: false,
    scan: false,
    submit: false,
    remove: false,
    create: false,
  })

  const currentPalette = palettes[currentIndex]

  const setLoading = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }))
  }

  const openNotificationWithIcon = (type) => {
    console.log(`${type}: Notification`)
  }

  const goNext = () => {
    const nextIndex =
      currentIndex === palettes.length - 1 ? 0 : currentIndex + 1
    const nextPalette = palettes[nextIndex]
    setCurrentIndex(nextIndex)
    setPalette(nextPalette)
    createPalette(nextPalette?.code)
  }

  const goPrevious = () => {
    const prevIndex = currentIndex === 0 ? palettes.length - 1 : currentIndex - 1
    const prevPalette = palettes[prevIndex]
    setCurrentIndex(prevIndex)
    setPalette(prevPalette)
    createPalette(prevPalette?.code)
  }

  const createPalette = async (paletteCode = null) => {
    setLoading('createPalette', true)
    try {
      const { data } = await api.post('palettes/generate', {
        document_id: id,
        palette: paletteCode ?? currentPalette?.code,
      })

      setPalette(data.palette)
      setLines(data.palette.lines || [])
      setPalettes(data.palettes)
      console.log(data)
    } catch (err) {
      console.error('Error creating palette:', err)
      openNotificationWithIcon('error')
    } finally {
      setLoading('createPalette', false)
    }
  }

  useEffect(() => {
    if (id) createPalette()
  }, [id])

  const handleScan = async (value) => {
    if (!palette) return

    const payload = { line: value, document: id, palette: palette.code }
    setLine(value)
    setLoading('scan', true)

    try {
      const { data } = await api.post('palettes/scan', payload)
      console.log(data)

      const dimensions =
        data.docligne?.Hauteur && data.docligne?.Largeur
          ? Math.floor(data.docligne.Hauteur) +
            ' * ' +
            Math.floor(data.docligne.Largeur)
          : ''

      setArticle({
        id: data.id,
        ref: data.ref ?? '',
        design:
          (data.docligne?.Nom ? data.docligne.Nom + ' ' + dimensions : '') +
          data.docligne?.Couleur,
        profondeur: data.docligne?.Profondeur ?? '',
        episseur: data.docligne?.Episseur
          ? Math.floor(data.docligne.Episseur).toString()
          : '',
        chant: data.docligne?.Chant ?? '',
        qte: data.quantity ? Math.floor(data.quantity) : 0,
        color: data.docligne?.Couleur ?? '',
        height: data.docligne?.Hauteur
          ? Math.floor(data.docligne.Hauteur).toString()
          : '',
        width: data.docligne?.Largeur
          ? Math.floor(data.docligne.Largeur).toString()
          : '',
      })
    } catch (err) {
      console.error('Error scanning:', err)
      openNotificationWithIcon('error')
    } finally {
      setLoading('scan', false)
    }
  }

  const handleSubmit = async () => {
    setLoading('submit', true)
    try {
      const { data } = await api.post('palettes/confirm', {
        quantity: article.qte,
        palette: palette?.code,
        line: article.id,
      })
      console.log(data);
      

      setLines(data.lines ||  [])

      setArticle({
        ref: '',
        design: '',
        profondeur: '',
        episseur: '',
        chant: '',
        qte: 0,
        color: '',
        height: '',
        width: '',
      })

      setLine(null)
    } catch (err) {
      console.error('Error confirming:', err)
      openNotificationWithIcon('error')
    } finally {
      setLoading('submit', false)
    }
  }

  const remove = async (ln) => {
    setLoading('remove', true)
    try {
      const { data } = await api.post('palettes/detach', {
        line: ln,
        palette: palette.code,
      })
      setPalette(data)
      setLines(data?.lines || [])
    } catch (err) {
      console.error('Error removing line:', err)
    } finally {
      setLoading('remove', false)
    }
  }

  const create = async () => {
    setLoading('create', true)
    try {
      const { data } = await api.post('palettes/create', { document_id: id })
      console.log(data)
    } catch (err) {
      console.error('Error creating new palette:', err)
    } finally {
      setLoading('create', false)
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
              Préparation des Palettes
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
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className='w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base'
              placeholder='Code-barres...'
              disabled={loadingStates.scan}
            />
            <button
              onClick={() => handleScan(line)}
              disabled={!palette || !line || loadingStates.scan}
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
          <div className='flex items-center justify-between mb-4 sm:mb-6'>
            <button
              onClick={goPrevious}
              disabled={loadingStates.createPalette}
              className='p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50'
            >
              <ArrowLeftCircle className='w-6 h-6 sm:w-8 sm:h-8 text-gray-600' />
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
                  <h3 className='text-xl sm:text-2xl font-bold text-gray-900 truncate'>
                    {palette ? currentPalette?.code : 'Aucune palette'}
                  </h3>
                  <p className='text-xs sm:text-sm text-gray-500'>
                    #{currentIndex + 1} sur {palettes.length}
                  </p>
                </>
              )}
            </div>

            <button
              onClick={goNext}
              disabled={loadingStates.createPalette}
              className='p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50'
            >
              <ArrowRightCircle className='w-6 h-6 sm:w-8 sm:h-8 text-gray-600' />
            </button>
          </div>

          {/* Article Details */}
          <div className='space-y-3 sm:space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1 sm:mb-2'>
                Désignation
              </label>
              <input
                type='text'
                value={article.design}
                readOnly
                className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900'
                placeholder='Aucun article scanné'
              />
            </div>

            <div className='grid grid-cols-3 gap-2 sm:gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1 sm:mb-2'>
                  Profondeur
                </label>
                <input
                  type='text'
                  value={article.profondeur}
                  readOnly
                  className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base'
                  placeholder='-'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1 sm:mb-2'>
                  Chant
                </label>
                <input
                  type='text'
                  value={article.chant}
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
                  value={article.episseur}
                  readOnly
                  className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base'
                  placeholder='-'
                />
              </div>
            </div>

            {/* Quantity Controls */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1 sm:mb-2'>
                Quantité
              </label>
              <div className='flex items-center gap-2 sm:gap-3 w-full'>
                <button
                  onClick={() =>
                    setArticle((prev) => ({
                      ...prev,
                      qte: Math.max(prev.qte - 1, 0),
                    }))
                  }
                  disabled={article.qte <= 0}
                  className='p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1'
                >
                  <Minus className='w-4 h-5 sm:w-5 sm:h-5 mx-auto' />
                </button>

                <input
                  type='number'
                  value={article.qte}
                  min={0}
                  onChange={(e) =>
                    setArticle((prev) => ({
                      ...prev,
                      qte: Math.max(0, Number(e.target.value)),
                    }))
                  }
                  className='w-full max-w-[100px] px-3 py-2 text-center border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base'
                />

                <button
                  onClick={() =>
                    setArticle((prev) => ({
                      ...prev,
                      qte: prev.qte + 1,
                    }))
                  }
                  className='p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 flex-1'
                >
                  <Plus className='w-4 h-5 sm:w-5 sm:h-5 mx-auto' />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'>
          <button
            onClick={handleSubmit}
            disabled={!palette || !article.id || loadingStates.submit}
            className='px-4 py-3 sm:px-6 sm:py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base'
          >
            {loadingStates.submit ? (
              <>
                <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 animate-spin' /> Validation...
              </>
            ) : (
              "Valider l'article"
            )}
          </button>
          <button
            onClick={create}
            disabled={loadingStates.create}
            className='px-4 py-3 sm:px-6 sm:py-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base'
          >
            {loadingStates.create ? (
              <>
                <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 animate-spin' />
                Création...
              </>
            ) : (
              <>
                <Package className='w-4 h-4 sm:w-5 sm:h-5' />
                Nouvelle Palette
              </>
            )}
          </button>
        </div>

        {/* Lines List */}
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-emerald-100 rounded-lg'>
              <Package className='w-5 h-5 sm:w-6 sm:h-6 text-emerald-600' />
            </div>
            <h2 className='text-base sm:text-lg font-semibold text-gray-900'>
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

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {lines?.map((item, index) => (
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
                          {item.article_stock?.name || 'N/A'}
                        </h3>
                        {item.article_stock?.width &&
                          item.article_stock?.height && (
                            <p className='text-xs text-gray-600 mt-1'>
                              {Math.floor(item.article_stock.height)} ×{' '}
                              {Math.floor(item.article_stock.width)} mm
                            </p>
                          )}
                        <span className='inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mt-2'>
                          {item.article_stock?.color || 'N/A'}
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
                        <div>Prof: <strong>{item.article_stock?.depth || 'N/A'}</strong></div>
                        <div>Ép: <strong>{item.article_stock?.thickness || 'N/A'}</strong></div>
                        <div>Chant: <strong>{item.article_stock?.chant || 'N/A'}</strong></div>
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

          {lines?.length === 0 && !loadingStates.remove && (
            <div className='text-center py-12'>
              <Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500 text-lg'>
                Aucun article dans cette palette
              </p>
              <p className='text-gray-400 text-sm'>
                Scannez un code-barres pour ajouter des articles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
