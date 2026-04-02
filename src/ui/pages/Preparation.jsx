import { useState, useEffect, useRef } from 'react'
import { List } from 'lucide-react'
import { api } from '../utils/api'
import { useParams } from 'react-router-dom'
import BackButton from '../components/ui/BackButton'
import { Button, message, notification } from 'antd'
import { PalettesModal } from '../components/PalettesModal'
import { useAuth } from '../contexts/AuthContext'
import TicketPrinter from '../components/TicketPrinter'

import ScannerSection from '../components/ScannerSection'
import PaletteNavigator from '../components/PaletteNavigator'
import PreparationActions from '../components/PreparationActions'
import LinesList from '../components/LinesList'
import ArticleSelectModal from './ArticleSelectModal'

const EMPTY_ARTICLE = {
  ref: '', design: '', profondeur: '', epaisseur: '',
  chant: '', qte: 0, color: '', height: '', width: '',
}

export default function Preparation() {
  const [article, setArticle] = useState(EMPTY_ARTICLE)

  const { id } = useParams()
  const [palette, setPalette] = useState(null)
  const [line, setLine] = useState('')
  const [lines, setLines] = useState([])
  const [palettes, setPalettes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lineError, setLineError] = useState('')
  const quantityInput = useRef()
  const lineInput = useRef()
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [checkedPalette, setCheckedPalette] = useState(null)
  const { roles, user } = useAuth()

  const [empalcementCode, setEmpalcementCode] = useState('')
  const [empalcementCodeLoading, setEmpalcementCodeLoading] = useState(false)
  const [empalcementCodeError, setEmpalcementCodeError] = useState('')
  const [scannedEmplacement, setScannedEmplacement] = useState(null)
  const paletteCodeInput = useRef()

  const [modalOptions, setModalOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [defaultOptions, setDefaultOptions] = useState([])

  const [docenteteData, setDocenteteData] = useState(null)

  const [loadingStates, setLoadingStates] = useState({
    createPalette: false, scan: false, submit: false, remove: false, create: false,
  })

  const currentPalette = palettes[currentIndex]

  const setLoading = (key, value) =>
    setLoadingStates((prev) => ({ ...prev, [key]: value }))

  const [notificationApi, contextHolder] = notification.useNotification()

  const openNotificationWithIcon = (type) => {
    notificationApi[type]({
      description: (
        <strong className='text-md'>Cet élément est en cours d'utilisation</strong>
      ),
    })
  }

  // ─── Data Fetching ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const res = await api.get(`documents/${id}`)
        setDocenteteData(res.data)
      } catch (error) {
        console.error('Error fetching document:', error)
      }
    }
    fetchData()
  }, [id])

  useEffect(() => {
    if (id) createPalette()
  }, [id, checkedPalette])

  // ─── Palette Helpers ─────────────────────────────────────────────────────────

  const createPalette = async (emplacementCode = null) => {
    setLoading('createPalette', true)
    try {
      const { data } = await api.post('palettes/generate', {
        document_id: id,
        palette: emplacementCode ?? currentPalette?.code,
      })
      setPalette(data.palette)
      setLines(data.palette.lines || [])
      setPalettes(data.palettes)
    } catch (err) {
      console.error('Error creating palette:', err)
      message.error(err?.response?.data?.message)
    } finally {
      setLoading('createPalette', false)
    }
  }

  const goNext = () => {
    const nextIndex = currentIndex === palettes.length - 1 ? 0 : currentIndex + 1
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

  const selectPalette = (selectedPalette) => {
    const index = palettes.findIndex((p) => p.code === selectedPalette.code)
    if (index !== -1) {
      setCurrentIndex(index)
      setPalette(palettes[index])
      setCheckedPalette(palettes[index])
    } else {
      setPalette(selectedPalette)
      setCheckedPalette(selectedPalette)
    }
  }

  const create = async () => {
    setLoadingCreate(true)
    try {
      const { data } = await api.post('palettes/create', { document_id: id })
      if (!data || !Array.isArray(data.palettes) || data.palettes.length === 0) {
        message.warning("La nouvelle palette n'a pas été récupérée.")
        return
      }
      setPalettes(data.palettes)
      const lastPalette = data.palettes[data.palettes.length - 1]
      setPalette(lastPalette)
      setCheckedPalette(lastPalette)
      setCurrentIndex(data.palettes.length - 1)
      setLines(lastPalette.lines || [])
      message.success(`Palette ${lastPalette.code} créée avec succès.`)
    } catch (error) {
      console.error('Erreur lors de la création de la palette:', error)
      message.error(error?.response?.data?.message || 'Erreur lors de la création.')
    } finally {
      setLoadingCreate(false)
      lineInput.current.focus()
    }
  }

  // ─── Scan ────────────────────────────────────────────────────────────────────

  const lineNameGenerator = (data) => {
    console.log(data);
    
    const height =
      Math.floor(data?.docligne?.Hauteur) ||
      Math.floor(data?.docligne?.article?.Hauteur) ||
      0
    const width =
      Math.floor(data?.docligne?.Largeur) ||
      Math.floor(data?.docligne?.article?.Largeur) ||
      0

    let dimensions = ''
    if (height && width) dimensions = `${height} × ${width}`
    else if (height) dimensions = `${height}`
    else if (width) dimensions = `${width}`

    const pickColor = (c) => (c !== '' && c !== 0 ? c : null)
    const color =
      pickColor(data?.docligne?.Couleur) ??
      pickColor(data?.docligne?.article?.Couleur) ??
      ''

    const depth = Math.floor(
      data.docligne?.Profondeur ?? data?.docligne?.article?.Profonduer ?? ''
    )

    let arName
    if (data?.docligne?.article?.Nom && data?.docligne?.article?.Nom !== 'NULL') {
      arName = `${data.docligne.article.Nom} ${dimensions} ${color}`.trim()
    } else {
      arName = data?.docligne?.article?.AR_Design ?? ''
    }

    return {
      label: arName,
      value: data?.id,
      details: {
        id: data.id,
        ref: data.ref ?? '',
        design: arName,
        profondeur: depth,
        epaisseur:
          Math.floor(data.docligne?.Epaisseur || data?.docligne?.article?.Episseur || 0) || '',
        chant: data.docligne?.Chant || data?.docligne?.article?.Chant || '',
        qte: data.quantity ? Math.floor(data.quantity) : 0,
        color: data.article?.Couleur || '',
        height: height || '',
        width: width || '',
      },
    }
  }

  const debouncedScanRef = useRef(null)

  const handleScan = async (value, all = false) => {
    setLine(value)
    if (!palette || value === '') return

    if (debouncedScanRef.current) clearTimeout(debouncedScanRef.current)

    debouncedScanRef.current = setTimeout(async () => {
      const payload = { line: value, document: id, palette: palette.code }
      setLoading('scan', true)
      setLineError('')

      try {
        const url = all ? 'palettes/scan?all=true' : 'palettes/scan'
        const { data } = await api.post(url, payload)
        setDefaultOptions(data)

        if (data.length === 0) {
          message.warning("L'article pas valid ou déjà préparé")
          return
        }

        if (data.length === 1) {
          setArticle(lineNameGenerator(data[0]).details)
        } else if (data.length > 1) {
          setModalOptions(data.map((item) => lineNameGenerator(item)))
          setIsModalOpen(true)
        }

        paletteCodeInput.current?.focus()
      } catch (err) {
        console.error('Error scanning:', err)
        setArticle(EMPTY_ARTICLE)
        setLineError(err.response?.data?.message || 'Erreur lors du scan')
      } finally {
        setLoading('scan', false)
      }
    }, 600)
  }

  const handleScanEmplacement = async (value) => {
    setEmpalcementCodeLoading(true)
    if (value === '') {
      setScannedEmplacement(null)
      setEmpalcementCodeLoading(false)
      return
    }
    try {
      const { data } = await api.get(`emplacement/${value}`)
      setScannedEmplacement(data)
      quantityInput.current.focus()
      setEmpalcementCodeError(null)
    } catch (error) {
      console.error(error)
      setEmpalcementCodeError(error.response?.data?.message || 'An error occurred')
    }
    setEmpalcementCodeLoading(false)
  }

  // ─── Submit / Remove ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading('submit', true)

    if (
      roles(['magasinier', 'preparation_cuisine']) &&
      !scannedEmplacement &&
      1 === Number(user?.company_id)
    ) {
      setEmpalcementCodeError('Emplacement requis')
      message.error('Emplacement requis')
      setLoading('submit', false)
      return
    }

    try {
      await api.post('palettes/confirm', {
        quantity: article.qte,
        palette: palette?.code,
        line: article.id,
        emplacement: scannedEmplacement?.code || false,
      })
      createPalette()
      setArticle(EMPTY_ARTICLE)
      setLine('')
      message.success('Article ajouté avec succès')
      lineInput.current.focus()
    } catch (err) {
      console.error('Error confirming:', err)
      const errorMessage = err?.response?.data?.message ?? ''
      if (errorMessage.includes('en cours')) {
        openNotificationWithIcon('warning')
      } else {
        message.error(errorMessage || 'Une erreur est survenue')
      }
    } finally {
      setLoading('submit', false)
    }
  }

  const remove = async (lineId, pivot_id) => {
    setLoading('remove', true)
    try {
      await api.post('palettes/detach', {
        line: lineId,
        palette: palette.code,
        pivot_id,
      })
      createPalette()
      setArticle(EMPTY_ARTICLE)
      setLine('')
      message.success('Article supprimé avec succès')
    } catch (err) {
      console.error('Error removing line:', err)
    } finally {
      setLoading('remove', false)
    }
  }

  const confirmAll = async () => {
    try {
      await api.get(`palettes/stock/confirm/${id}`)
      message.success('Préparation réussie')
    } catch (error) {
      console.error('Error confirming all:', error)
      const errorMessage = error?.response?.data?.message ?? ''
      if (errorMessage.includes('en cours')) {
        openNotificationWithIcon('warning')
      } else {
        message.error(errorMessage || 'Une erreur est survenue')
      }
    }
  }

  // ─── Modal ───────────────────────────────────────────────────────────────────

  const changeSelectedLine = (e) => {
    const selectedId = e.target.value
    setSelectedOption(selectedId)
    const selected = defaultOptions.find((opt) => opt.id === selectedId)

    const height =
      Math.floor(selected.docligne?.Hauteur) ||
      Math.floor(selected?.docligne?.article?.Hauteur) ||
      0
    const width =
      Math.floor(selected.docligne?.Largeur) ||
      Math.floor(selected?.docligne?.article?.Largeur) ||
      0

    const dimensions = height && width ? `${height} * ${width}` : height || width || ''

    const pickColor = (c) => (c !== '' && c !== 0 ? c : null)
    const color =
      pickColor(selected?.docligne?.Couleur) ??
      pickColor(selected?.docligne?.article?.Couleur) ??
      ''

    let arName
    if (selected.docligne?.article?.Nom && selected?.docligne?.article?.Nom !== 'NULL') {
      arName = `${selected?.docligne?.article?.Nom} ${dimensions} ${color}`.trim()
    } else {
      arName = selected?.docligne?.article?.AR_Design ?? ''
    }

    setLine(selected.ref)
    setArticle({
      id: selected.id,
      ref: selected.ref ?? '',
      design: arName,
      profondeur:
        Math.floor(
          selected.docligne?.Profondeur ?? selected?.docligne?.article?.Profondeur ?? 0
        ) || '',
      epaisseur:
        Math.floor(
          selected.docligne?.Epaisseur || selected?.docligne?.article?.Epaisseur || 0
        ) || '',
      chant: selected.docligne?.Chant || selected?.docligne?.article?.Chant || '',
      qte: selected.quantity ? Math.floor(selected.quantity) : 0,
      color,
      height: height || '',
      width: width || '',
    })
    setIsModalOpen(false)
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-10'>
      {contextHolder}

      <ArticleSelectModal
        isOpen={isModalOpen}
        modalOptions={modalOptions}
        selectedOption={selectedOption}
        onSelect={changeSelectedLine}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      />

      {/* Header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='mx-auto px-4 py-3 sm:py-4'>
          <div className='flex justify-between'>
            <div className='flex items-center gap-3'>
              <BackButton className='w-8 h-8' />
              <div className='w-px h-6 bg-gray-300' />
              <h1 className='text-xl font-bold text-gray-900 truncate'>
                Préparation
              </h1>
            </div>

            <div className='flex gap-3'>
              <Button color='cyan' variant='solid' size='large' onClick={() => handleScan(1, true)}>
                <List />
              </Button>
              <PalettesModal
                countPalettes={palettes.length}
                documentPiece={id}
                selectPalette={selectPalette}
                checkedPalette={palette}
              />
              <TicketPrinter
                docentete={{ DO_Piece: id, DO_Tiers: docenteteData?.document.client_id }}
                palettes={[{ code: palette?.code }]}
                btnSize='large'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className='mx-auto p-2 md:p-4 space-y-3 sm:space-y-8 max-w-7xl'>
        <ScannerSection
          line={line}
          setLine={setLine}
          handleScan={handleScan}
          lineError={lineError}
          loadingStates={loadingStates}
          empalcementCode={empalcementCode}
          setEmpalcementCode={setEmpalcementCode}
          handleScanEmplacement={handleScanEmplacement}
          empalcementCodeLoading={empalcementCodeLoading}
          empalcementCodeError={empalcementCodeError}
          scannedEmplacement={scannedEmplacement}
          paletteCodeInput={paletteCodeInput}
          lineInput={lineInput}
          onConfirmAll={confirmAll}
        />

        <PaletteNavigator
          palette={palette}
          currentPalette={currentPalette}
          currentIndex={currentIndex}
          palettes={palettes}
          article={article}
          setArticle={setArticle}
          loadingStates={loadingStates}
          quantityInput={quantityInput}
          onNext={goNext}
          onPrevious={goPrevious}
        />

        <PreparationActions
          palette={palette}
          article={article}
          loadingStates={loadingStates}
          loadingCreate={loadingCreate}
          onSubmit={handleSubmit}
          onCreate={create}
        />

        <LinesList
          lines={lines}
          loadingStates={loadingStates}
          onRemove={remove}
        />
      </div>
    </div>
  )
}