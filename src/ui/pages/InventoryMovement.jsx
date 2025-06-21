import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { uppercaseFirst } from '../utils/config'
import BackButton from '../components/ui/BackButton'
import { Button, Input, message, Modal, Radio, Select } from 'antd'
import { Building2, Package, Hash, AlertCircle, Menu } from 'lucide-react'
import { debounce } from 'lodash'

export default function InventoryMovement() {
  const { id } = useParams()
  const [quantity, setQuantity] = useState('')
  const [emplacementCode, setEmplacementCode] = useState('')
  const [articleCode, setArticleCode] = useState('')
  const [emplacementData, setEmplacementData] = useState(null)
  const [articleData, setArticleData] = useState(null)
  const [type, setType] = useState(null)
  const [loadingEmplacement, setLoadingEmplacement] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(false)
  const [condition, setCondition] = useState(null)
  const [conditionPalette, setConditionPalette] = useState(null)
  const [emplacementError, setEmplacementError] = useState('')
  const [articleError, setArticleError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [conditionList, setConditionList] = useState([])
  const [totalQuantity, setTotalQuantity] = useState(0)

  const articleInput = useRef();
  const quantityInput = useRef();
  const conditionInput = useRef();
  const emplacemenInput = useRef();


  useEffect(() => {
    if (!articleCode) {
      setArticleData(null)
      setType(null)
      setCondition(null)
      setConditionList([])
    }
  }, [articleCode])


  useEffect(() => {
    if (quantity && condition) {
      setTotalQuantity(Number(quantity) * condition)
    } else if (quantity) {
      setTotalQuantity(Number(quantity))
    } else {
      setTotalQuantity(0)
    }
  }, [quantity, condition])

  const fetchEmplacementData = useCallback(
    debounce(async (code) => {
      if (!code.trim()) return

      setLoadingEmplacement(true)
      setEmplacementData(null)
      try {
        const response = await api.get(`inventory/emplacement/${code}`)
        setEmplacementData(response.data)
        articleInput.current?.focus();
        setEmplacementError('')
      } catch (error) {
        setEmplacementError(error.response?.data?.message || 'Emplacement introuvable')
      } finally {
        setLoadingEmplacement(false)
      }
    }, 500),
    []
  )

  const fetchArticleData = useCallback(
    debounce(async (code) => {
      if (!code.trim()) return

      setLoadingArticle(true)
      setArticleData(null)
      try {
        const response = await api.get(`inventory/article/${code}`)
        quantityInput.current?.focus();
        setArticleData(response.data)
        setArticleError('')
      } catch (error) {
        setArticleError(error.response?.data?.message || 'Article introuvable')
      } finally {
        setLoadingArticle(false)
      }
    }, 500),
    [] 
  )

  const getConditionOptions = () => {
    if (!articleData) return []
    
    if (type === "Palette" && articleData.palette_condition) {
      conditionInput?.current?.focus();
      return articleData.palette_condition.split('|').map(cond => ({
        label: cond,
        value: Number(cond)
      }))
      
    } else if (articleData.condition) {
      conditionInput?.current?.focus();
      return articleData.condition.split('|').map(cond => ({
        label: cond,
        value: Number(cond)
      }))
      
    }
    return []
  }

  useEffect(() => {
    if (articleData) {
      setConditionList(getConditionOptions())
    }
  }, [articleData, type])

  const handleSubmit = () => {
    if (!emplacementData) {
      setEmplacementError('Veuillez sélectionner un emplacement valide')
      return
    }
    
    if (!articleData) {
      setArticleError('Veuillez sélectionner un article valide')
      return
    }
    
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      message.error('Veuillez saisir une quantité valide')
      return
    }
    
    if ((type === "Carton" || type === "Palette")  && !condition) {
      message.error('Veuillez sélectionner une condition')
      return
    }
    
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const payload = {
        emplacement_code: emplacementData.code,
        article_code: articleData.code,
        quantity: condition ? totalQuantity : Number(quantity),
        type_colis: type,
        condition,
        palettes: Number(quantity)
      }

      await api.post(`inventory/insert/${id}`, payload)
      
      // Reset form
      setQuantity("")
      setEmplacementCode("")
      setArticleCode("")
      setEmplacementData(null)
      setArticleData(null)
      setType(null)
      setCondition(null)
      setTotalQuantity(0)
      emplacemenInput.current.focus();
      message.success("Opération effectuée avec succès")
    } catch (error) {
      console.error(error);
      
      message.error(error.response?.data?.message || 'Erreur lors de l\'opération')
    } finally {
      setIsModalOpen(false)
    }
  }

  const changeEmplacement = (e) => {
    const value = e.target.value
    setEmplacementCode(value)
    setEmplacementData(null)
    setEmplacementError('')
    if (value.length >= 3) fetchEmplacementData(value)
  }

  const changeArticle = (e) => {
    const value = e.target.value
    setArticleCode(value)
    setArticleData(null)
    setArticleError('')
    if (value.length >= 3) fetchArticleData(value)
  }

  const handleTypeChange = (e) => {
    quantityInput.current.focus();
    setType(e.target.value)
    setCondition(null);
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header Section */}
      <div className='bg-white border-b border-gray-200'>
        <div className='mx-auto px-4 py-3 sm:py-4'>
          <div className='flex items-center gap-3'>
            <BackButton className='w-8 h-8' />
            <div className='w-px h-6 bg-gray-300' />
            <h1 className='text-sm md:text-xl font-bold text-gray-900 truncate'>
              Mouvement des stocks
            </h1>
          </div>
        </div>
      </div>

      {/* Emplacement Section */}
      <div className='px-5'>
        <h2 className='text-md font-semibold text-gray-700 mb-2'>Emplacement</h2>
        <Input
          placeholder='Saisir le code emplacement'
          autoFocus
          size='large'
          ref={emplacemenInput}
          value={emplacementCode}
          onChange={changeEmplacement}
          allowClear={true}
          suffix={loadingEmplacement ? <span className='text-gray-400'>Chargement...</span> : null}
        />
        {emplacementError && (
          <div className='text-red-600 text-sm mb-3'>{emplacementError}</div>
        )}
        {emplacementData && (
          <div className='bg-gray-100 p-3 rounded-md mt-2'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='font-medium'>Dépôt:</div>
              <div className='font-bold'>
                {emplacementData?.depot?.code || emplacementData.depot_id}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Article Section */}
      <div className='px-5'>
        <h2 className='text-md font-semibold text-gray-700 mb-2'>Article</h2>
        <Input
          placeholder='Saisir le code article'
          size='large'
          value={articleCode}
          onChange={changeArticle}
          ref={articleInput}
          allowClear={true}
          suffix={loadingArticle ? <span className='text-gray-400'>Chargement...</span> : null}
        />
        {articleError && (
          <div className='text-red-600 text-sm mb-3'>{articleError}</div>
        )}

        {articleData && (
          <div className='bg-gray-100 p-3 rounded-md mt-2'>
            <div className='mb-2 font-bold'>
              {uppercaseFirst(articleData.description)}
              {articleData.name && ` (${articleData.name})`}
            </div>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='font-medium'>Couleur:</div>
              <div className='font-bold'>{articleData.color}</div>
              <div className='font-medium'>Dimensions:</div>
              <div className='font-bold'>
                {articleData.height || 0} × {articleData.width} × {articleData.depth}
              </div>
              {articleData.thickness && (
                <>
                  <div className='font-medium'>Épaisseur:</div>
                  <div className='font-bold'>{articleData.thickness}</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Condition Type Selection */}
      {articleData && conditionList.length > 0  && (
        <div className='px-5'>
          <Radio.Group
            value={type}
            onChange={handleTypeChange}
            optionType="button"
            buttonStyle="solid"
            className='w-full'
          >
            <Radio.Button value="Piece" className='w-1/3 text-center'>Pièce</Radio.Button>
            <Radio.Button value="Palette" className='w-1/3 text-center'>Palette</Radio.Button>
            <Radio.Button value="Carton" className='w-1/3 text-center'>Carton</Radio.Button>
          </Radio.Group>
        </div>
      )}

      {/* Condition Selection */}
      {articleData && type && (type !== "Piece" ) && conditionList.length > 0 && (
        <div className='px-5'>
          <h2 className='text-md font-semibold text-gray-700 mb-2'>Condition</h2>
          <Select
            placeholder='Sélectionner une condition'
            size='large'
            className='w-full'
            ref={conditionInput}
            value={condition}
            onChange={(value) => {
              setCondition(value);
              quantityInput.current?.focus();
            }}
            options={conditionList}
            allowClear={true}
          />
        </div>
      )}

      {/* Quantity Input */}
      <div className='px-5'>
        <h2 className='text-md font-semibold text-gray-700 mb-2'>Quantité</h2>
        <Input
          placeholder='Saisir la quantité'
          size='large'
          type='number'
          ref={quantityInput}
          min={0.1}
          allowClear={true}
          value={quantity}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value)) {
              setQuantity(value);
            }
          }}

        />
      </div>

      {/* Submit Button */}
      <div className='px-5 mb-3'>
        <Button
          className='w-full mt-4'
          size='large'
          type='primary'
          onClick={handleSubmit}
          disabled={!emplacementData || !articleData || !quantity}
        >
          Valider le mouvement
        </Button>
        <div className='mt-28'>
          <Button className='w-full' size='large'>
            <Menu />
            Liste des mouvements
          </Button>
      </div>

      </div>

      
      {/* Confirmation Modal */}
      <Modal
        title={(
          <div className='flex items-center gap-2'>
            <AlertCircle className='w-6 h-6 text-amber-600' />
            <span className='text-lg font-semibold'>Confirmer le transfert</span>
          </div>
        )}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Confirmer"
        cancelText="Annuler"
        okButtonProps={{ className: 'bg-blue-600 hover:bg-blue-700' }}
      >
        <div className='py-4 space-y-4'>
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-4'>
            {/* Emplacement Summary */}
            <div className='flex items-start gap-3 mb-3'>
              <Building2 className='w-5 h-5 text-blue-600 mt-1 flex-shrink-0' />
              <div>
                <div className='text-sm font-medium text-gray-700'>Emplacement</div>
                <div className='font-bold'>{emplacementData?.code}</div>
                <div className='text-sm'>Dépôt: {emplacementData?.depot?.code}</div>
              </div>
            </div>

            {/* Article Summary */}
            <div className='flex items-start gap-3 mb-3'>
              <Package className='w-5 h-5 text-green-600 mt-1 flex-shrink-0' />
              <div>
                <div className='text-sm font-medium text-gray-700'>Article</div>
                <div className='font-bold'>{articleData?.name}</div>
                <div className='text-sm'>Réf: {articleData?.code}</div>
                <div className='text-sm'>Dimensions: {articleData?.height} × {articleData?.width} × {articleData?.depth}</div>
              </div>
            </div>

            {/* Quantity Summary */}
            <div className='flex items-start gap-3'>
              <Hash className='w-5 h-5 text-purple-600 mt-1 flex-shrink-0' />
              <div>
                <div className='text-sm font-medium text-gray-700'>Quantité</div>
                <div>
                  {quantity} {type && `(${type})`}
                  {condition && ` × ${condition} = `}
                  {condition && <span className='font-bold text-green-600'>{totalQuantity} {articleData?.unit}</span>}
                </div>
              </div>
            </div>
          </div>
          
          <p className='text-gray-600 text-sm'>
            Veuillez vérifier les informations avant de confirmer le transfert.
          </p>
        </div>
      </Modal>
    </div>
  )
}