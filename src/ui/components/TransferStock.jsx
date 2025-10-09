import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { uppercaseFirst } from '../utils/config'
import BackButton from '../components/ui/BackButton'
import { Button, Input, message, Modal, Radio, Select, Switch } from 'antd'
import { Building2, Package, Hash, AlertCircle, ArrowRightLeft, ArrowDown, Building } from 'lucide-react'
import { debounce } from 'lodash'
import InputField from '../components/ui/InputField'

export default function TransferStock() {


    const [quantity, setQuantity] = useState('')
    const [emplacementCode, setEmplacementCode] = useState('')
    const [secondEmplacementCode, setSecondEmplacementCode] = useState('')
    const [articleCode, setArticleCode] = useState('')
    const [emplacementData, setEmplacementData] = useState(null)
    const [secondEmplacementData, setSecondEmplacementData] = useState(null)

    const [articleData, setArticleData] = useState(null)
    const [type, setType] = useState(null)
    const [loadingEmplacement, setLoadingEmplacement] = useState(false)
    const [loadingSecondEmplacement, setLoadingSecondEmplacement] = useState(false)
    const [loadingArticle, setLoadingArticle] = useState(false)
    const [condition, setCondition] = useState(null)
    const [emplacementError, setEmplacementError] = useState('')
    const [secondEmplacementError, setSecondEmplacementError] = useState('')
    const [articleError, setArticleError] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [conditionList, setConditionList] = useState([])
    const [totalQuantity, setTotalQuantity] = useState(0)
    const [companies, setCompanies] = useState([])
    const [company, setCompany] = useState(null);
    const [showCompany, setShowCompany] = useState(false)


    const location = useLocation();

    const articleInput = useRef()
    const quantityInput = useRef()
    const conditionInput = useRef()
    const emplacemenInput = useRef()
    const secondEmplacemenInput = useRef()

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
        debounce(async (code, second) => {
            if (!code.trim()) return

            // Set correct loading state
            if (second) {
                setLoadingSecondEmplacement(true)
                setSecondEmplacementData(null)
                setSecondEmplacementError('')
            } else {
                setLoadingEmplacement(true)
                setEmplacementData(null)
                setEmplacementError('')
            }

            try {
                const response = await api.get(`emplacement/${code}`)

                if (second) {
                    setSecondEmplacementData(response.data)
                } else {
                    setEmplacementData(response.data)
                    articleInput.current?.focus()
                }

            } catch (error) {
                const message = error.response?.data?.message || 'Emplacement introuvable'
                if (second) {
                    setSecondEmplacementError(message)
                } else {
                    setEmplacementError(message)
                }

            } finally {
                // Stop loading correctly
                if (second) {
                    setLoadingSecondEmplacement(false)
                } else {
                    setLoadingEmplacement(false)
                }
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

        if (!company && !secondEmplacementCode) {
            message.error('Veuillez sélectionner Société ou Emplacement')
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
                company: showCompany ? company : '',
                second_emplacement_code: showCompany ? '' :  secondEmplacementCode
            }

            

            const { data } = await api.post('stock/transfer', payload)

            setQuantity('')
            setArticleCode('')
            setArticleData(null)
            setType(null)
            setCondition(null)
            setCompany(null)
            setTotalQuantity(0)
            articleInput?.current?.focus()
            message.success('Opération effectuée avec succès')
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
        if (result.length >= 3) fetchEmplacementData(result, false)
    }

    const changeSecondEmplacement = (value) => {
        const result = sanitizeInput(value)
        setSecondEmplacementCode(result)
        setSecondEmplacementData(null)
        setSecondEmplacementError('')
        if (result.length >= 3) fetchEmplacementData(result, true)
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

    return (
        <div className='max-w-4xl mx-auto space-y-6'>
            {/* Header Section */}
            <div className={`border-b bg-gray-50 border-gray-200`} >
                <div className="mx-auto px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-3">
                        <div className="border border-gray-400 rounded-3xl">
                            <BackButton className="w-8 h-8" />
                        </div>
                        <div className="w-px h-6 bg-gray-300" />

                        <h1 className={`text-2xl font-bold truncate flex gap-3 items-center text-gray-600`}>

                            <>
                                <span>Mouvement de transfer</span>
                                <ArrowRightLeft className="w-6 h-6 text-gray-600" />
                            </>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Emplacement Section */}
            <div className='px-5'>
                <h2 className='text-xl font-semibold text-gray-700 mb-2'>
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

<div className='px-5'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-gray-700'>
          {showCompany ? 'À Société' : "À Emplacement"}
        </h2>
        <div className='flex items-center gap-2'>
          <span className='text-gray-600 text-xl'>
            {showCompany ? 'Transférer vers Emplacement' : 'Transférer vers Société'}
          </span>
          <Switch
            size='large'
            checked={showCompany}
            onChange={(checked) => setShowCompany(checked)}
          />
        </div>
      </div>

      {!showCompany ? (
        // === EMPLACEMENT SECTION ===
        <>
          <div className='flex gap-2'>
            <Input
              placeholder='Saisir le code emplacement'
              size='large'
              className={is_electron && 'h-[60px]'}
              style={is_electron ? { fontSize: '30px' } : {}}
              autoFocus={true}
              ref={secondEmplacemenInput}
              value={secondEmplacementCode}
              onChange={(e) => changeSecondEmplacement(e.target.value)}
              allowClear={true}
              suffix={
                loadingSecondEmplacement ? (
                  <span className='text-gray-400'>Chargement...</span>
                ) : null
              }
            />
            <InputField
              value={secondEmplacementCode}
              onChange={(e) => changeSecondEmplacement(e.target.value)}
              onScan={(value) => changeSecondEmplacement(value)}
            />
          </div>

          {secondEmplacementError && (
            <div className='text-red-600 text-lg mb-3'>
              {secondEmplacementError}
            </div>
          )}

          {secondEmplacementData && (
            <div className='bg-gray-100 p-3 rounded-md mt-2'>
              <div className='grid grid-cols-2 gap-2 text-lg'>
                <div className='font-medium'>Dépôt:</div>
                <div className='font-bold'>
                  {secondEmplacementData?.depot?.code ||
                    secondEmplacementData.depot_id}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // === COMPANY SECTION ===
        (companies.length > 0 || company) && (
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
        )
      )}
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
                        <div className='flex items-start gap-4 mb-4 w-full'>
                            <Building2 className='w-7 h-7 text-blue-600 mt-1 flex-shrink-0' />
                            <div className='w-full'>
                                <div className='text-xl font-medium text-gray-700 flex justify-between'>
                                    <span>Dépôt :</span> <span className='font-black  text-black text-2xl'>{emplacementData?.depot?.code}</span>
                                </div>
                                <div className='text-xl font-medium text-gray-700 flex justify-between mt-4'>
                                    <span>Emplacement :</span> <span className='font-black text-2xl text-black'>{emplacementData?.code}</span>
                                </div>
                                 
                            </div>
                        </div>

                        <div className='flex justify-center '>
                            <ArrowDown size={35} className='text-center text-green-600'/>
                        </div>

                        {
                            !showCompany ? <div className='flex items-start gap-4 mb-4 w-full'>
                                <Building2 className='w-7 h-7 text-yellow-600 mt-1 flex-shrink-0' />
                                <div className='w-full'>
                                    <div className='text-xl font-medium text-gray-700 flex justify-between'>
                                        <span>Dépôt :</span> <span className='font-black  text-black text-2xl'>{secondEmplacementData?.depot?.code}</span>
                                    </div>
                                    <div className='text-xl font-medium text-gray-700 flex justify-between mt-4'>
                                        <span>Emplacement :</span> <span className='font-black text-2xl text-black'>{secondEmplacementData?.code}</span>
                                    </div>

                                </div>
                            </div> : <div className='flex items-start gap-4 mb-4 w-full'>
                                <Building className='w-7 h-7 text-yellow-600 mt-1 flex-shrink-0' />
                                <div className='w-full'>
                                    <div className='text-xl font-medium text-gray-700 flex justify-between'>
                                        <span>Société :</span> <span className='font-black  text-black text-2xl'>{companies.find(c => c.value == company)?.label}</span>
                                    </div>
                                </div>
                            </div>
                        }
                        

                        {/* Article Summary */}
                        <div className='flex items-start gap-4 mb-4 mt-4'>
                            <Package className='w-7 h-7 text-green-600 mt-1 flex-shrink-0' />
                            <div className='space-y-2 w-full'>
                                <div className='text-xl font-medium text-gray-700 flex justify-between'>
                                    <span>Article :</span> 
                                    <span className='font-black text-black text-2xl'>{articleData?.code}</span>
                                </div>

                                <div className='font-bold text-xl'>
                                    <div>{articleData?.name}</div>
                                    {uppercaseFirst(articleData?.description)}
                                </div>
        
                                <div className='flex justify-between w-full mt-4'>
                                    <span className='text-xl'>Dimensions: </span>
                                    <span className='text-2xl font-bold text-black'> {articleData?.height} × {articleData?.width} ×{' '} {articleData?.depth}</span>
                                </div>

                                {
                                    articleData?.color ? <div className='flex justify-between w-full mt-4'>
                                        <span className='text-xl'>Couleur:</span>
                                        <strong className='text-2xl font-bold text-black'>{articleData?.color}</strong>
                                    </div> : ''
                                }
                               

                                {
                                    articleData?.code_supplier || articleData?.code_supplier_2 ?
                                        <div className='flex justify-between w-full mt-4'>
                                            <span className='text-xl'>Fournisseur Ref:{' '}</span>
                                            <strong className='text-2xl font-bold text-black'>
                                                {articleData?.code_supplier || articleData?.code_supplier_2}
                                            </strong>
                                        </div>
                                        : ""
                                }

                            </div>
                        </div>

                        {/* Quantity Summary */}
                        <div className='flex items-start gap-4'>
                            <Hash className='w-7 h-7 text-purple-600 mt-1 flex-shrink-0' />
                            <div>
                                <div className='text-lg font-medium text-gray-700'>
                                    Quantité
                                </div>
                                <div className='text-2xl'>
                                    {quantity} {type && `(${type})`}
                                    {condition && ` × ${condition} = `}
                                    {condition && (
                                        <span className='font-bold text-green-600'>
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