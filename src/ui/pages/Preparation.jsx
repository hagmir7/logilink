import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  X,
  Loader2,
  Search,
  Package,
  Plus,
  Minus,
  List,
} from 'lucide-react'
import QScanner from '../components/QScanner'
import { api } from '../utils/api'
import { useParams } from 'react-router-dom'
import BackButton from '../components/ui/BackButton'
import { uppercaseFirst } from '../utils/config'
import { Alert, Button, Input, message, Modal, Radio, Space } from 'antd'
import { PalettesModal } from '../components/PalettesModal';
import { CloseOutlined } from '@ant-design/icons';



export default function Preparation() {
  const [article, setArticle] = useState({
    ref: '',
    design: '',
    profondeur: '',
    episseur: '',
    chant: '',
    qte: '',
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
  const [lineError, setLineError] = useState('');
  const quantityInput = useRef();
  const lineInput = useRef();
  const [loadingCreate, setLoadingCreate] = useState(false)
  const [checkedPalette, setCheckedPalette] = useState(null)


  const [empalcementCode, setEmpalcementCode] = useState("");
  const [empalcementCodeLoading, setEmpalcementCodeLoading] = useState(false);
  const [empalcementCodeError, setEmpalcementCodeError] = useState('');
  const [scannedEmplacement, setScannedEmplacement] = useState(null);
  const paletteCodeInput = useRef();


  const [modalOptions, setModalOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultOptions, setDefaultOptins] = useState([]);

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };




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
      quantityInput.current.focus();
      setEmpalcementCodeError(null)
    } catch (error) {
      console.error(error)
      setEmpalcementCodeError(
        error.response?.data?.message || 'An error occurred'
      )
    }

    setEmpalcementCodeLoading(false)
  }




  const goNext = () => {
    const nextIndex = currentIndex === palettes.length - 1 ? 0 : currentIndex + 1
    const nextPalette = palettes[nextIndex]
    setCurrentIndex(nextIndex)
    setPalette(nextPalette)
    createPalette(nextPalette?.code)
  }

  const selectPalette = (selectedPalette) => {
    const index = palettes.findIndex((p) => p.code === selectedPalette.code)
    if (index !== -1) {
      setCurrentIndex(index)
      setPalette(palettes[index])
      setCheckedPalette(palettes[index])
    } else {
      setPalette(selectedPalette);
      setCheckedPalette(selectedPalette)
    }
  }


  const goPrevious = () => {
    const prevIndex = currentIndex === 0 ? palettes.length - 1 : currentIndex - 1
    const prevPalette = palettes[prevIndex]
    setCurrentIndex(prevIndex)
    setPalette(prevPalette)
    createPalette(prevPalette?.code)
  }

  const createPalette = async (EmpalcementCode = null) => {
    setLoading('createPalette', true)
    try {
      const { data } = await api.post('palettes/generate', {
        document_id: id,
        palette: EmpalcementCode ?? currentPalette?.code,
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

  useEffect(() => {
    if (id) createPalette()
  }, [id, checkedPalette])


  const lineNameGenerator = (data) => {
    const height = Math.floor(data?.docligne?.Hauteur) || Math.floor(data?.docligne?.article?.Hauteur) || 0;
    const width = Math.floor(data?.docligne?.Largeur) || Math.floor(data?.docligne?.article?.Largeur) || 0;




    let dimensions = '';
    if (height && width) {
      dimensions = `${height} × ${width}`;
    } else if (height) {
      dimensions = `${height}`;
    } else if (width) {
      dimensions = `${width}`;
    }

    const pickColor = (c) => (c !== '' && c !== 0 ? c : null);
    const color = pickColor(data?.docligne?.Couleur)
      ?? pickColor(data?.docligne?.article?.Couleur)
      ?? '';

    const depth = Math.floor(data.docligne?.Profondeur ?? data?.docligne?.article?.Profonduer ?? "")


    let arName;
    if (data?.docligne?.article?.Nom && data?.docligne?.article?.Nom !== "NULL") {
      arName = `${data.docligne.article.Nom} ${dimensions} ${color}`.trim();
    } else {
      arName = data?.docligne?.article?.AR_Design ?? '';
    }
    
    
    return {
      label: arName,
      value: data?.id,
      details: {
        id: data.id,
        ref: data.ref ?? '',
        design: arName,
        profondeur: depth,
        epaisseur: Math.floor(data.docligne?.Epaisseur || data?.docligne?.article?.Episseur || 0) || '',
        chant: data.docligne?.Chant || data?.docligne?.article?.Chant || '',
        qte: data.quantity ? Math.floor(data.quantity) : 0,
        color: data.article?.Couleur || '',
        height: height || '',
        width: width || '',
      },
    };
  };




  const handleScan = async (value, all = false) => {
    setLine(value);
    if (!palette || value === '') return;

    const payload = { line: value, document: id, palette: palette.code };
    setLoading('scan', true);
    setLineError('');


    try {
      const url = all ? ('palettes/scan' + '?all=true') : 'palettes/scan';

      let { data } = await api.post(url, payload);
      setDefaultOptins(data);

      if (data.length === 0) {
        message.warning("L’article pas valid ou déjà préparé")
        return;
      }

      if (data.length === 1) {
        const line = lineNameGenerator(data[0]);
        setArticle(line.details);
        
      } else if (data.length > 1) {
        const options = data.map(item => lineNameGenerator(item));
        setModalOptions(options);
        setIsModalOpen(true);
      }

      paletteCodeInput.current?.focus();
    } catch (err) {
      console.error('Error scanning:', err);
      setArticle({
        ref: '',
        design: '',
        profondeur: '',
        epaisseur: '',
        chant: '',
        qte: 0,
        color: '',
        height: '',
        width: '',
      });
      setLineError(err.response?.data?.message || 'Erreur lors du scan');
    } finally {
      setLoading('scan', false);
    }
  };



  const handleSubmit = async () => {
    setLoading('submit', true)
    try {
      const { data } = await api.post('palettes/confirm', {
        quantity: article.qte,
        palette: palette?.code,
        line: article.id,
        emplacement: scannedEmplacement?.code || false
      })

      createPalette()


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

      setLine('')
      message.success('Article ajouté avec succès')
      lineInput.current.focus()
    } catch (err) {
      console.error('Error confirming:', err)
      message.error(err.response.data.message)
    } finally {
      setLoading('submit', false)
    }
  }

  const remove = async (line, pivot_id) => {
    setLoading('remove', true)
    try {
      const { data } = await api.post('palettes/detach', {
        line,
        palette: palette.code,
        pivot_id
      })
      createPalette()


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

      setLine('')
      message.success('Article ajouté avec succès')
    } catch (err) {
      console.error('Error removing line:', err)
    } finally {
      setLoading('remove', false)
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
      message.error(
        error?.response?.data?.message || 'Erreur lors de la création.'
      )
    } finally {
      setLoadingCreate(false);
      lineInput.current.focus()
    }
  }



  const changeSelectedLine = (e) => {
    const selectedId = e.target.value;
    setSelectedOption(selectedId);
    const selected = defaultOptions.find(opt => opt.id === selectedId);

    const height = Math.floor(selected.docligne?.Hauteur) || Math.floor(selected?.docligne?.article?.Hauteur) || 0;

    const width = Math.floor(selected.docligne?.Largeur) || Math.floor(selected?.docligne?.article?.Largeur) || 0;


    const dimensions = height && width ? `${height} * ${width}` : height || width || '';

    const pickColor = (c) => (c !== '' && c !== 0 ? c : null);
    const color = pickColor(selected?.docligne?.Couleur)
      ?? pickColor(selected?.docligne?.article?.Couleur)
      ?? '';

    let arName;

    
    if (selected.docligne?.article?.Nom && selected?.docligne?.article?.Nom !== "NULL") {
      arName = `${selected?.docligne?.article?.Nom} ${dimensions} ${color}`.trim();
    } else {
      arName = selected?.docligne?.article?.AR_Design ?? '';
    }

    setLine(selected.ref)

    setArticle({
      id: selected.id,
      ref: selected.ref ?? '',
      design: arName,
      profondeur: Math.floor(selected.docligne?.Profondeur ?? selected?.docligne?.article?.Profondeur ?? 0) || '',
      epaisseur: Math.floor(selected.docligne?.Epaisseur || selected?.docligne?.article?.Epaisseur || 0) || '',
      chant: selected.docligne?.Chant || selected?.docligne?.article?.Chant || '',
      qte: selected.quantity ? Math.floor(selected.quantity) : 0,
      color,
      height: height || '',
      width: width || '',
    });

    setIsModalOpen(false)

  };



  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50'>
      {/* Header */}
      <Modal
        title="Sélectionnez une option"
        closable={true}
        closeIcon={<CloseOutlined aria-label="Close Modal" />}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        width={600}
        styles={{ padding: '24px' }}
      >
        <div style={{ padding: '16px 0' }}>
          <Radio.Group
            onChange={changeSelectedLine}
            value={selectedOption}

            size="large"
            style={{ width: '100%' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {modalOptions.map((option) => (
                <Radio.Button
                  key={option.value}
                  value={option.value}
                  style={{
                    height: '60px',
                    lineHeight: '60px',
                    fontSize: '20px',
                    fontWeight: '500',
                    width: '100%',
                    border: '2px solid #d9d9d9',
                    borderRadius: '8px',
                  }}
                >
                  {option.label}
                </Radio.Button>
              ))}
            </Space>
          </Radio.Group>
        </div>
      </Modal>
      <div className='bg-white border-b border-gray-200'>
        <div className='mx-auto px-4 py-3 sm:py-4'>
          <div className='flex justify-between'>
            <div className='flex items-center gap-3'>
              <BackButton className='w-8 h-8' />
              <div className='w-px h-6 bg-gray-300' />
              <h1 className='text-xl font-bold text-gray-900 truncate'>
                Préparation des Palettes
              </h1>
            </div>

            <div className='flex gap-3'>
            <Button color="cyan" variant="solid" size='large' onClick={() => handleScan(1, true)}>
                <List />
            </Button>

              <PalettesModal
                countPalettes={palettes.length}
                documentPiece={id}
                selectPalette={selectPalette}
                checkedPalette={palette}
              />
            </div>
            

            
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

          <div className='flex-row gap-3'>
            <Input
              type='text'
              value={line}
              onChange={(e) => {
                const newValue = e.target.value
                setLine(newValue)
                handleScan(newValue)
              }}
              autoFocus={true}
              ref={lineInput}
              className={window.electron && 'h-[60px]'}
              style={window.electron ? { fontSize: '30px' } : {}}
              placeholder='Article Code...'
              allowClear
              suffix={
                loadingStates.scan ? (
                  <Loader2 className='w-8 h-8 animate-spin' />
                ) : null
              }
            />
            {lineError && lineError !== '' && line !== '' ? (
              <Alert
                message={lineError}
                type='error'
                className='mt-2 p-2'
                style={{ fontSize: '18px', color: 'red' }}
              />
            ) : (
              ''
            )}
          </div>

          <div className='flex-row gap-3 mt-4'>
            <Input
              type='text'
              value={empalcementCode}
              onChange={(e) => {
                const newValue = e.target.value
                setEmpalcementCode(newValue)
                handleScanEmplacement(e.target.value)
              }}
              ref={paletteCodeInput}
              className={window.electron && 'h-[60px]'}
              style={window.electron ? { fontSize: '30px' } : {}}
              placeholder='Emplacement code...'
              allowClear
              suffix={
                empalcementCodeLoading ? (
                  <Loader2 className='w-8 h-8 animate-spin' />
                ) : null
              }
            />
            {empalcementCodeError &&
              empalcementCodeError !== '' &&
              line !== '' ? (
              <Alert
                message={empalcementCodeError}
                type='error'
                className='mt-2 p-2'
                style={{ fontSize: '18px', color: 'red' }}
              />
            ) : (
              ''
            )}
          </div>

          {scannedEmplacement && (
            <div className='bg-gray-100 p-3 rounded-md mt-2'>
              <div className='grid grid-cols-2 gap-2 text-lg'>
                <div className='font-medium'>Dépôt:</div>
                <div className='font-bold'>
                  {scannedEmplacement?.depot?.code ||
                    scannedEmplacement.depot_id}
                </div>
              </div>
            </div>
          )}
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
                  <p className='text-lg text-gray-500'>
                    {currentIndex + 1} sur {palettes.length}
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
              <label className='block text-lg font-medium text-gray-700 mb-1 sm:mb-2'>
                Désignation
              </label>
              <input
                type='text'
                value={article.design}
                readOnly
                className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-2xl h-14 text-gray-900'
                placeholder='Aucun article scanné'
              />
            </div>

            <div className='grid grid-cols-3 gap-2 sm:gap-4'>
              <div>
                <label className='block text-lg font-medium text-gray-700 mb-1 sm:mb-2'>
                  Profondeur
                </label>
                <input
                  type='text'
                  value={article.profondeur}
                  readOnly
                  className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-2xl h-14'
                  placeholder='-'
                />
              </div>
              <div>
                <label className='block text-lg font-medium text-gray-700 mb-1 sm:mb-2'>
                  Chant
                </label>
                <input
                  type='text'
                  value={article?.chant}
                  readOnly
                  className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-2xl h-14'
                  placeholder='-'
                />
              </div>
              <div>
                <label className='block text-lg font-medium text-gray-700 mb-1 sm:mb-2'>
                  Épaisseur
                </label>
                <input
                  type='text'
                  value={article.epaisseur}
                  readOnly
                  className='w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-2xl h-14'
                  placeholder='-'
                />
              </div>
            </div>

            {/* Quantity Controls */}
            <div>
              <label className='block text-lg font-medium text-gray-700 mb-1 sm:mb-2'>
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
                  className='p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-2xl h-14'
                >
                  <Minus className='w-4 h-5 sm:w-5 sm:h-5 mx-auto' />
                </button>

                <input
                  type='number'
                  value={article.qte}
                  min={0}
                  ref={quantityInput}
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
                    setArticle((prev) => ({
                      ...prev,
                      qte: prev.qte + 1,
                    }))
                  }
                  className='p-2 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 flex-1 text-2xl h-14'
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
            className='px-4 py-3 sm:px-6 sm:py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xl'
          >
            {loadingStates.submit ? (
              <>
                <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 animate-spin' />{' '}
                Validation...
              </>
            ) : (
              "Valider l'article"
            )}
          </button>
          <button
            onClick={create}
            disabled={loadingStates.create}
            className='px-4 py-3 sm:px-6 sm:py-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xl'
          >
            {loadingStates.create || loadingCreate ? (
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
            {lines?.map((item, index) => {

              const lineHeight = Math.floor(item.docligne?.Hauteur) || Math.floor(item.docligne?.article?.Hauteur) || false
              const lineWidth = Math.floor(item.docligne?.Largeur) || Math.floor(item.docligne?.article?.Largeur) || false
              return (<div key={item.id || index} className='relative'>
                <div className='absolute -top-2 -right-2 z-10'>
                  <span className='px-3 py-1 bg-cyan-500 text-white text-lg font-medium rounded-full'>
                    {item.ref}
                  </span>
                </div>

                <div className='bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow'>
                  <div className='p-4 bg-gradient-to-r from-amber-50 to-orange-50'>
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex-1 pr-2'>
                        <h3 className='text-xl font-bold text-gray-900 truncate whitespace-normal'>
                          {uppercaseFirst(item?.docligne?.Nom || item?.docligne?.article?.Nom || item?.docligne?.article?.AR_Design || '__')}
                          {" "}
                          {item?.docligne?.Poignée}
                          {" "}
                          {item?.docligne?.Rotation}
                          {" "}
                          {item?.docligne?.Description}
                        </h3>

                        <p className='text-xl text-gray-600 mt-1'>
                          {Math.floor(lineHeight)} {(lineHeight && lineWidth) && " * "}
                          {Math.floor(lineWidth)} mm
                        </p>
                        {(item.docligne?.Couleur || item.docligne?.article?.Couleur) ? (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full mt-2 text-lg">
                            {item.docligne?.Couleur || item.docligne?.article?.Couleur}
                          </span>
                        ) : null}



                      </div>
                      <div className='text-right'>
                        <div className='text-xl font-bold text-gray-900'>
                          {item.pivot?.quantity
                            ? Math.floor(item.pivot.quantity)
                            : 0}
                        </div>
                        <div className='text-xs text-gray-500'>Unités</div>
                      </div>
                    </div>

                    <div className='flex justify-between items-center pt-4 border-t border-gray-200'>
                      <div className='text-xl md:text-md text-gray-600 space-y-1 flex justify-between w-full mr-5'>
                        <div>
                          Ép:{' '}
                          <strong>
                            {
                              Math.floor(
                                item.docligne?.Episseur > 0
                                  ? item.docligne.Episseur
                                  : item.docligne?.article?.Episseur ?? '__'
                              ) || '__'
                            }
                          </strong>
                        </div>
                        <div>
                          Chant:{' '}
                          <strong>
                            {
                              item.docligne?.Chant ??
                              item.docligne?.article?.Chant
                            }
                          </strong>
                        </div>

                      </div>

                      <button
                        onClick={() => remove(item.id, item.pivot.id)}
                        disabled={loadingStates.remove}
                        className='p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>)
            })}
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
