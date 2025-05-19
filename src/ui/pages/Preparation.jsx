import { useState, useEffect } from 'react'
import { ArrowLeftCircle, ArrowRightCircle, X } from 'lucide-react'
import { Badge, notification } from 'antd'
import { api } from '../utils/api'
import { useParams } from 'react-router-dom'
import BarcodeScanner from '../components/BarcodeScanner'

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
  const [notificationApi, contextHolder] = notification.useNotification()
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentPalette = palettes[currentIndex]

  const goNext = () => {
    const nextIndex =
      currentIndex === palettes.length - 1 ? 0 : currentIndex + 1
    const nextPalette = palettes[nextIndex]
    setCurrentIndex(nextIndex)
    setPalette(nextPalette)
    createPalette(nextPalette?.code)
  }

  const goPrevious = () => {
    const prevIndex =
      currentIndex === 0 ? palettes.length - 1 : currentIndex - 1
    const prevPalette = palettes[prevIndex]
    setCurrentIndex(prevIndex)
    setPalette(prevPalette)
    createPalette(prevPalette?.code)
  }

  const openNotificationWithIcon = (type) => {
    notificationApi[type]({
      message: 'Notification',
      description: 'Une erreur est survenue.',
    })
  }

  const createPalette = async (paletteCode = null) => {
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
    }
  }

  useEffect(() => {
    if (id) createPalette()
  }, [id])

  const handleScan = async () => {
    if (!palette) return

    const payload = { line, document: id, palette: palette.code }

    try {
      const { data } = await api.post('palettes/scan', payload)
      console.log(data);
      
      const dimensions =
        data.docligne?.Hauteur && data.docligne?.Largeur
          ? Math.floor(data.docligne.Hauteur) +
            ' * ' +
            Math.floor(data.docligne.Largeur)
          : ''

      setArticle({
        id: data.id,
        ref: data.ref ?? '',
        design: data.docligne?.Nom ? data.docligne.Nom + ' ' + dimensions : '',
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
    }
  }

  const handleSubmit = async () => {
    try {
      const { data } = await api.post('palettes/confirm', {
        quantity: article.qte,
        palette: palette?.code,
        line: article.id,
      })

      console.log(data);
      
      setLines(data.lines || [])
      openNotificationWithIcon('success')
    } catch (err) {
      console.error('Error confirming:', err)
      openNotificationWithIcon('error')
    }
  }

  const remove = async (ln) => {
    try {
      const { data } = await api.post('palettes/detach', {
        line: ln,
        palette: palette.code,
      })
      setPalette(data)
      setLines(data?.lines || [])
    } catch (err) {
      console.error('Error removing line:', err)
    }
  }

  const create = async () => {
    try {
      const { data } = await api.post('palettes/create', { document_id: id })
      console.log(data)
    } catch (err) {
      console.error('Error creating new palette:', err)
    }
  }

  return (
    <div className='min-h-screen md:p-4'>
      {contextHolder}

      {/* Scanner input */}
      <div className='mb-8 flex justify-center'>
        <div className='border-2 p-3 gap-3 border-gray-300 rounded-lg flex items-center bg-gray-50'>
          <input
            type='text'
            value={line}
            onChange={(e) => setLine(e.target.value)}
            className='border-2 w-full border-gray-300 text-lg py-2 px-4 rounded-md focus:outline-none focus:ring-2 bg-gray-200 focus:ring-blue-500'
            placeholder='Enter barcode or scan'
          />
          <button
            onClick={handleScan}
            className='py-2 px-4 border-gray-300 border-2 rounded-md hover:bg-gray-100'
            disabled={!palette || !line.trim()}
          >
            Scanner
          </button>
        </div>
      </div>

      {/* Navigation and article info */}
      <div className='space-y-4 mb-10'>
        <div className='flex justify-between py-4 items-center'>
          <button onClick={goPrevious} className='cursor-pointer'>
            <ArrowLeftCircle />
          </button>
          <p className='text-md font-bold'>
            {palette ? currentPalette?.code : 'Loading palette...'} (#
            {currentIndex + 1})
          </p>
          <button onClick={goNext} className='cursor-pointer'>
            <ArrowRightCircle />
          </button>
        </div>

        <input
          type='text'
          placeholder='Designation'
          readOnly
          value={article.design}
          className='border-2 w-full border-gray-300 text-lg py-2 px-4 rounded-md bg-gray-200'
        />

        <div className='grid grid-cols-3 gap-3'>
          <input
            className='border-2 py-2 border-gray-300 text-lg px-4 rounded-md bg-gray-200'
            placeholder='Profondeur'
            type='text'
            value={article.profondeur}
            readOnly
          />
          <input
            className='border-2 py-2 border-gray-300 text-lg px-4 rounded-md bg-gray-200'
            type='text'
            placeholder='Chant'
            value={article.chant}
            readOnly
          />
          <input
            className='border-2 py-2 border-gray-300 text-lg px-4 rounded-md bg-gray-200'
            type='text'
            placeholder='Epaisseur'
            value={article.episseur}
            readOnly
          />
        </div>

        <div className='flex items-center gap-3'>
          <button
            onClick={() =>
              setArticle((prev) => ({
                ...prev,
                qte: Math.max(prev.qte - 1, 0),
              }))
            }
            className='text-xl py-2 px-8 border-2 border-gray-300 rounded-md hover:bg-gray-100'
            disabled={article.qte <= 0}
          >
            -
          </button>

          <input
            type='number'
            className='border-2 w-full border-gray-300 text-lg py-2 px-4 text-center rounded-md'
            value={article.qte}
            min={0}
            onChange={(e) =>
              setArticle({
                ...article,
                qte: Math.max(0, Number(e.target.value)),
              })
            }
          />

          <button
            onClick={() =>
              setArticle((prev) => ({ ...prev, qte: prev.qte + 1 }))
            }
            className='text-xl py-2 px-8 border-2 border-gray-300 rounded-md hover:bg-gray-100'
          >
            +
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className='grid grid-cols-2 gap-4 mb-10'>
        <button
          onClick={create}
          className='text-lg py-3 border-2 border-gray-300 rounded-md bg-white hover:bg-gray-100'
        >
          NV Palette
        </button>
        <button
          onClick={handleSubmit}
          className='text-lg py-3 rounded-md bg-cyan-600 text-white hover:bg-cyan-700'
          disabled={!palette || !article.id}
        >
          Valider
        </button>
      </div>

      {/* Lines list */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {lines.map((item, index) => (
          <Badge.Ribbon key={item.id || index} text={item.ref} color='cyan'>
            <div className='rounded-2xl overflow-hidden bg-gray-20 shadow-sm hover:shadow-md'>
              <div className='p-4 bg-amber-50'>
                <div className='flex justify-between items-center mt-4'>
                  <div>
                    <h3 className='text-md font-bold text-gray-600'>
                      {item.article_stock?.name || 'N/A'}{' '}
                      {item.article_stock?.width && item.article_stock?.height
                        ? Math.floor(item.article_stock.height) +
                          ' * ' +
                          Math.floor(item.article_stock.width)
                        : ''}
                    </h3>
                    <span className='text-sm text-gray-600'>
                      ‑ {item.article_stock?.color || 'N/A'}
                    </span>
                  </div>
                  <span className='text-3xl font-bold text-gray-600'>
                    {item.quantity ? Math.floor(item.pivot.quantity) : 0}
                  </span>
                </div>

                <div className='flex justify-between items-center mt-4'>
                  <span className='text-sm text-gray-600'>
                    Profondeur : {item.article_stock?.depth || 'N/A'} |
                    Epaisseur : {item.article_stock?.thickness || 'N/A'} | Chant
                    : {item.article_stock?.chant || 'N/A'}
                  </span>
                  <button
                    onClick={() => remove(item.id)}
                    className='bg-red-500 hover:bg-red-700 p-2 rounded-full text-white'
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          </Badge.Ribbon>
        ))}
      </div>
    </div>
  )
}
