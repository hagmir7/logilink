import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { uppercaseFirst } from '../utils/config'
import BackButton from './ui/BackButton'
import { Button, Input, message, Modal, Radio, Select, Space, Tag } from 'antd'
import { Building2, Package, Hash, AlertCircle, PlaneLanding, List } from 'lucide-react'
import { debounce } from 'lodash'
import InputField from './ui/InputField'

export default function ReceptionMovement() {


  const [quantity, setQuantity] = useState('')
  const [emplacementCode, setEmplacementCode] = useState('')
  const [containerCode, setContainerCode] = useState('')
  const [articleCode, setArticleCode] = useState('')
  const [emplacementData, setEmplacementData] = useState(null)
  const [articleData, setArticleData] = useState(null)
  const [type, setType] = useState(null)
  const [loadingEmplacement, setLoadingEmplacement] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(false)
  const [condition, setCondition] = useState(null)
  const [emplacementError, setEmplacementError] = useState('')
  const [articleError, setArticleError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [conditionList, setConditionList] = useState([])
  const [totalQuantity, setTotalQuantity] = useState(0)
  const [companies, setCompanies] = useState([])
  const [company, setCompany] = useState(null);

  const { id, company_db } = useParams();

  const [isListModalOpen, setListIsModalOpen] = useState(false);

  const [modalOptions, setModalOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState({});


  const showModal = () => {
    setListIsModalOpen(true);
  };

  const handleListModalCancel = () => {
    setListIsModalOpen(false);
  };


  const articleInput = useRef()
  const quantityInput = useRef()
  const conditionInput = useRef()
  const emplacemenInput = useRef()

  useEffect(() => {
    if (!articleCode) {
      setArticleData(null)
      setType(null)
      setCondition(null)
      setConditionList([])
      getCompanies()
    }

  }, [articleCode])

  useEffect(() => {
    if (quantity && condition) {
      setTotalQuantity(quantity * parseFloat(condition.replace(',', '.')))
    } else if (quantity) {
      setTotalQuantity(quantity)
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
        const response = await api.get(`emplacement/${code}`)
        setEmplacementData(response.data)
        articleInput.current?.focus()
        setEmplacementError('')
      } catch (error) {
        setEmplacementError(
          error.response?.data?.message || 'Emplacement introuvable'
        )
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
        quantityInput.current?.focus()
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
    if (type === 'Palette' && articleData.palette_condition) {
      conditionInput?.current?.focus()
      return articleData.palette_condition.split('|').map((cond) => ({
        label: cond,
        value: cond,
      }))
    } else if (articleData.condition) {
      conditionInput?.current?.focus()
      return articleData.condition.split('|').map((cond) => ({
        label: cond,
        value: cond,
      }))
    }
    return []
  }

  const getCompanies = async () => {
    try {
      const { data } = await api.get('companies')
      const options = data.map((company) => ({
        label: company.name,
        value: company.id,
      }))
      setCompanies(options)
    } catch (error) {
      console.error(error)
      message.error('Erreur lors du chargement des sociétés')
    }
  }

  // Generate options from articleData
  const getCompanyOptions = () => {
    if (!articleData?.companies?.length) return []

    return articleData.companies.map((company) => ({
      label: company.name,
      value: company.id,
    }))
  }

  useEffect(() => {
    if (!articleData) return

    const options = getConditionOptions()
    setConditionList(options)

    if (options.length === 1 && (type === 'Carton' || type === 'Palette')) {
      setCondition(options[0].value)
    } else {
      setCondition(null)
    }

    const companyOptions = getCompanyOptions()

    if (articleData.companies.length === 1) {
      setCompany(articleData.companies[0].id)
    }

    if (articleData.companies.length === 0) {
      setCompany(null)
      getCompanies()
    } else {
      setCompanies(companyOptions)
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

    if ((type === 'Carton' || type === 'Palette') && !condition) {
      message.error('Veuillez sélectionner une condition')
      return
    }

    if (!company) {
      message.error('Veuillez sélectionner la Société')
      return
    }

    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const payload = {
        emplacement_code: emplacementData.code,
        code_article: articleData.code,
        quantity: quantity,
        type_colis: type,
        condition: condition ? parseFloat(condition.replace(',', '.')) : null,
        palettes: Number(quantity),
        company: company,
        piece: id,
        container_code: containerCode
      }

      const { data } = await api.post(`receptions/movement/${id}?company_db=${company_db}`, payload);

      setQuantity('')
      setArticleCode('')
      setArticleData(null)
      setType(null)
      setCondition(null)
      setCompany(null)
      setTotalQuantity(0)
      articleInput?.current?.focus()
      message.success('Opération effectuée avec succès');
      setContainerCode(null)
      fetchArticles()
    } catch (error) {
      console.error(error)

      message.error(
        error.response?.data?.message || "Erreur lors de l'opération"
      )
    } finally {
      setIsModalOpen(false)
    }
  }



  const changeEmplacement = (value) => {
    const result = sanitizeInput(value)
    setEmplacementCode(result)
    setEmplacementData(null)
    setEmplacementError('')
    if (result.length >= 3) fetchEmplacementData(result)
  }

   const changeContainerCode = (value) => {
    const result = sanitizeInput(value)
    setContainerCode(result)
  }



  const sanitizeInput = (value) => value.replace(/[\[\]]/g, '')


  const changeArticle = (value) => {
    const cleaned = sanitizeInput(value)
    setArticleCode(cleaned)
    setArticleError('')
    setArticleData(null)

    if (cleaned.length >= 3) {
      fetchArticleData(cleaned)
    }
  }



  const handleTypeChange = (e) => {
    if (quantityInput.current) {
      quantityInput.current.focus()
    }

    setType(e.target.value)

    if (articleData) {
      setConditionList(getConditionOptions())
    }
  }
  const is_electron = window.electron;



  const fetchArticles = async () => {
    try {
      const response = await api.get(`/receptions/${id}?company=${company_db}`);
      setModalOptions(response.data.doclignes)
      return response.data;

    } catch (error) {
      message.error(error.response.data?.message || "Une erreur est survenue !");
      console.error("API Error:", error.response);
    }
  };


  const changeSelectedLine = (e) => {
    const newCode = e.target.value;
    setArticleCode(newCode);
    fetchArticleData(newCode);
    setListIsModalOpen(false)
  };


  useEffect(() => {
    fetchArticles();
  }, [])



  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header Section */}
      <div
        className={`border-b bg-blue-50 border-blue-200`}
      >
        <div className="mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className='border border-gray-400 rounded-3xl'><BackButton className="w-8 h-8" /></div>
            <div className="w-px h-6 bg-gray-300 flex justify-between" />

            <div className="flex items-center justify-between w-full">
              <h1 className={'text-2xl font-bold truncate flex gap-3 items-center text-blue-700'}>
                <>
                  <span>Reception </span>
                  <PlaneLanding className="w-6 h-6 text-blue-600" />
                  - {id}
                </>
              </h1>


              <div>
                <Button type="primary" onClick={showModal} style={{ padding: 20 }}>
                  <List size={25} />
                </Button>
                <Modal
                  title="List de Reception"
                  closable={{ 'aria-label': 'Custom Close Button' }}
                  open={isListModalOpen}
                  onCancel={handleListModalCancel}
                  width={{
                    xs: '90%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '40%',
                  }}
                >
                  <Radio.Group
                    onChange={changeSelectedLine}
                    value={selectedOption}
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      {modalOptions.map((option) => (
                        <Radio.Button
                          key={option.AR_Ref}
                          value={option.AR_Ref}
                          disabled={option.EU_Qte === option.DL_QteBL}
                          style={{
                            width: "100%",
                            padding: "16px 20px",
                            height: "110px",
                            textAlign: "left",
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            background: "#fff",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                            justifyContent: "space-between",
                            alignItems: "center",
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          <div className='w-full'>
                            <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: 4 }}>
                              {option.AR_Ref} – {option.DL_Design}
                            </div>
                            <div className='flex gap-4 w-full'>
                              <Tag color="blue" style={{fontSize: "20px", padding: '10px'}}>Qté: {Math.round(option.DL_Qte)}</Tag>
                              <Tag color="orange" style={{fontSize: "20px", padding: '10px'}}>Qté Réceptionné: {Math.round(option.DL_QteBL)}</Tag>
                            </div>
                          </div>
                        </Radio.Button>
                      ))}
                    </Space>
                  </Radio.Group>

                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Emplacement Section */}
      <div className='px-5'>
        <h2 className='text-md font-semibold text-gray-700 mb-2'>
          Emplacement
        </h2>

        <div className='flex gap-2'>
          <Input
            placeholder='Saisir le code emplacement'
            size='large'
            className={is_electron && 'h-[60px]'}
            style={is_electron ? { fontSize: '30px' } : {}}
            autoFocus={true}
            ref={emplacemenInput}
            value={emplacementCode}
            onChange={(e) => changeEmplacement(e.target.value)}
            allowClear={true}
            suffix={
              loadingEmplacement ? (
                <span className='text-gray-400'>Chargement...</span>
              ) : null
            }
          />
          <InputField
            value={emplacementCode}
            onChange={(e) => changeEmplacement(e.target.value)}
            onScan={(value) => changeEmplacement(value)}
          />
        </div>
        {emplacementError && (
          <div className='text-red-600 text-lg mb-3'>{emplacementError}</div>
        )}
        {emplacementData && (
          <div className='bg-gray-100 p-3 rounded-md mt-2'>
            <div className='grid grid-cols-2 gap-2 text-lg'>
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
        <h2 className='text-md font-semibold text-gray-700 mb-2'>
          Réf Article{' '}
        </h2>
        <div className='flex gap-2'>
          <Input
            placeholder='Saisir Réf Article'
            size='large'
            className={is_electron && 'h-[60px]'}
            style={is_electron ? { fontSize: '30px' } : {}}
            ref={articleInput}
            value={articleCode}
            onChange={(e) => changeArticle(e.target.value)}
            allowClear={true}
            suffix={
              loadingArticle ? (
                <span className='text-gray-400'>Chargement...</span>
              ) : null
            }
          />

          <InputField
            value={articleCode}
            onChange={(e) => changeArticle(e.target.value)}
            onScan={(value) => changeArticle(value)}
          />
        </div>

        {articleError && (
          <div className='text-red-600 text-sm mb-3'>{articleError}</div>
        )}

        {articleData && (
          <div className='bg-gray-100 p-3 rounded-md mt-2'>
            <div className='mb-2 font-bold text-lg'>
              {uppercaseFirst(articleData.description)}
              {articleData.name && ` (${articleData.name})`}
            </div>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='font-medium'>Couleur:</div>
              <div className='font-bold text-lg'>{articleData.color}</div>
              <div className='font-medium'>Dimensions:</div>
              <div className='font-bold text-lg'>
                {articleData.height || 0} × {articleData.width} ×{' '}
                {articleData.depth}
              </div>
              {articleData.thickness && (
                <>
                  <div className='font-medium'>Épaisseur:</div>
                  <div className='font-bold text-lg'>
                    {articleData.thickness}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Condition Type Selection */}
      {articleData &&
        (conditionList.length > 0 || articleData.palette_condition) && (
          <div className='px-5'>
            <Radio.Group
              value={type}
              onChange={handleTypeChange}
              optionType='button'
              buttonStyle='solid'
              className='w-full'
              style={{ display: 'flex' }}
            >
              <Radio.Button
                value='Piece'
                style={is_electron && { fontSize: '25px', height: '50px', display: 'flex' }}
                className='w-1/3 text-center h-[30px] text-2xl items-center justify-center'
              >
                Pièce
              </Radio.Button>

              <Radio.Button
                disabled={!articleData?.condition}
                value='Carton'
                style={is_electron && { fontSize: '25px', height: '50px', display: 'flex' }}

                className='w-1/3 text-center h-[30px] text-2xl items-center justify-center'
              >
                Carton
              </Radio.Button>
              <Radio.Button
                disabled={!articleData?.palette_condition}
                value='Palette'
                style={is_electron && { fontSize: '25px', height: '50px', display: 'flex' }}
                className='w-1/3 text-center h-[30px] text-2xl items-center justify-center'
              >
                Palette
              </Radio.Button>
            </Radio.Group>
          </div>
        )}

      {/* Condition Selection */}
      {articleData && type && type !== 'Piece' && conditionList.length > 0 && (
        <div className='px-5'>
          <h2 className='text-md font-semibold text-gray-700 mb-2'>
            Condition
          </h2>
          <Select
            placeholder='Sélectionner une condition'
            size='large'
            className={`w-full ${is_electron ? 'custom-select h-[60px]' : ''}`}
            style={is_electron ? { height: '60px' } : {}}
            dropdownClassName={is_electron ? 'custom-select-dropdown' : ''}
            ref={conditionInput}
            value={condition}
            onChange={(value) => {
              setCondition(value)
              quantityInput.current?.focus()
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
          className={is_electron && 'h-[60px]'}
          style={is_electron ? { fontSize: '30px' } : {}}
          onChange={(e) => {
            const value = e.target.value
            const isPaletteOrCarton = type === 'Palette' || type === 'Carton'

            if (isPaletteOrCarton) {
              if (/^\d*$/.test(value)) {
                setQuantity(parseFloat(value.replace(',', '.')))
              }
            } else {
              if (/^\d*\.?\d*$/.test(value)) {
                setQuantity(parseFloat(value.replace(',', '.')))
              }
            }
          }}
        />
      </div>
      {(companies.length > 0 || company) && (
        <div className='px-5'>
          <h2 className='text-md font-semibold text-gray-700 mb-2'>Société</h2>
          <Select
            placeholder='Sélectionner une société'
            size='large'
            className={`w-full ${is_electron ? 'custom-select h-[60px]' : ''}`}
            style={is_electron ? { fontSize: '30px' } : {}}
            dropdownClassName={is_electron ? 'custom-select-dropdown' : ''}
            value={company}
            onChange={setCompany}
            options={companies}
            allowClear={true}
          />
        </div>
      )}



      <div className='px-5 mt-2'>
        <h2 className='text-md font-semibold text-gray-700 mb-2'>
          Ref conteneur
        </h2>

        <div className='flex gap-2'>
          <Input
            placeholder='Saisir le code conteneur'
            size='large'
            className={is_electron && 'h-[60px]'}
            style={is_electron ? { fontSize: '30px' } : {}}
            autoFocus={true}
            value={containerCode}
            onChange={(e) => changeContainerCode(e.target.value)}
            allowClear={true}
          />
          <InputField
            value={containerCode}
            onChange={(e) => changeContainerCode(e.target.value)}
            onScan={(value) => changeContainerCode(value)}
          />
        </div>

      </div>

      {/* Submit Button */}
      <div className='px-5 my-3 mt-10'>
        <Button
          className='w-full'
          style={is_electron && { fontSize: '30px', padding: '30px', height: '60px' }}
          size='large'
          type='primary'
          onClick={handleSubmit}
          disabled={!emplacementData || !articleData || !quantity}
        >
          Valider le mouvement
        </Button>

      </div>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className='flex items-center gap-2'>
            <AlertCircle className='w-8 h-8 text-amber-600' />
            <span className='text-2xl font-semibold'>
              Confirmer le transfert
            </span>
          </div>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText='Confirmer'
        cancelText='Annuler'
        okButtonProps={{
          className:
            'bg-blue-600 hover:bg-blue-700 px-8 py-4 h-auto min-h-[60px]',
          style: { fontSize: '30px' },
        }}
        cancelButtonProps={{
          className: 'px-8 py-4 h-auto min-h-[60px]',
          style: { fontSize: '30px' },
        }}
        className='[&_.ant-modal-content]:text-lg'
      >
        <div className='py-4 space-y-4'>
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-6'>
            {/* Emplacement Summary */}
            <div className='flex items-start gap-4 mb-4'>
              <Building2 className='w-7 h-7 text-blue-600 mt-1 flex-shrink-0' />
              <div>
                <div className='text-lg font-medium text-gray-700'>
                  Emplacement
                </div>
                <div className='font-bold text-xl'>{emplacementData?.code}</div>
                <div className='text-lg'>
                  Dépôt: {emplacementData?.depot?.code}
                </div>
              </div>
            </div>

            {/* Article Summary */}
            <div className='flex items-start gap-4 mb-4'>
              <Package className='w-7 h-7 text-green-600 mt-1 flex-shrink-0' />
              <div className='space-y-2'>
                <div className='text-xl font-medium text-gray-700'>Article</div>
                <div className='font-bold text-lg'>{articleData?.name}</div>
                <div className='font-bold text-lg'>
                  {uppercaseFirst(articleData?.description)}
                </div>
                <div className='text-lg'>
                  Réf: <strong>{articleData?.code}</strong>
                </div>
                <div className='text-lg'>
                  Dimensions: {articleData?.height} × {articleData?.width} ×{' '}
                  {articleData?.depth}
                </div>

                <div className='text-lg'>
                  Couleur: <strong>{articleData?.color || '__'}</strong>
                </div>

                <div className='text-lg'>
                  Fournisseur Ref:{' '}
                  <strong>
                    {articleData?.code_supplier ||
                      articleData?.code_supplier_2 ||
                      '__'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Quantity Summary */}
            <div className='flex items-start gap-4'>
              <Hash className='w-7 h-7 text-purple-600 mt-1 flex-shrink-0' />
              <div>
                <div className='text-lg font-medium text-gray-700'>
                  Quantité
                </div>
                <div className='text-lg'>
                  {quantity} {type && `(${type})`}
                  {condition && ` × ${condition} = `}
                  {condition && (
                    <span className='font-bold text-green-600 text-xl'>
                      {totalQuantity} {articleData?.unit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className='text-gray-600 text-lg'>
            Veuillez vérifier les informations avant de confirmer le transfert.
          </p>
        </div>
      </Modal>
    </div>
  )
}