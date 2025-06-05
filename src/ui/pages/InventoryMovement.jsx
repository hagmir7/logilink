import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { uppercaseFirst } from '../utils/config'
import BackButton from '../components/ui/BackButton'
import { Button, Input, Modal, Select } from 'antd'
import {
  AlertTriangle,
  Building2,
  Package,
  Hash,
  AlertCircle
} from 'lucide-react'

export default function InventoryMovement() {
  const { id } = useParams()

  const [quantity, setQuantity] = useState('')
  const [emplacementCode, setEmplacementCode] = useState('');
  const [articleCode, setArticleCode] = useState('');

  const [emplacementData, setEmplacementData] = useState(null)
  const [articleData, setArticleData] = useState(null)

  const [loadingEmplacement, setLoadingEmplacement] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(false)
  const [condition, setCondition] = useState(null);

  const [emplacementError, setEmplacementError] = useState('')
  const [articleError, setArticleError] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchEmplacementData = async (code) => {
    if (!code.trim()) return

    setLoadingEmplacement(true)
    try {
      const response = await api.get(`inventory/emplacement/${code}`)
      const data = response.data
      setEmplacementData(data)
      setEmplacementError('')
    } catch (error) {
      setEmplacementError(error.message)
      setEmplacementData(null)
    } finally {
      setLoadingEmplacement(false)
    }
  }

  const fetchArticleData = async (code) => {
    if (!code.trim()) return

    setLoadingArticle(true)
    try {
      const response = await api.get(`inventory/article/${code}`)
      const data = response.data
      setArticleData(data)
      
      setArticleError('')
    } catch (error) {
      setArticleError(error.message)
      setArticleData(null)
    } finally {
      setLoadingArticle(false)
    }
  }

  const handleFinalSubmit = () => {
    if (!emplacementData || !articleData || !quantity) {
      alert('Please fill all fields and fetch both emplacement and article data')
      return
    }
    // Final logic here
  }

  const showModal = () => setIsModalOpen(true)
  const handleOk = () => {
    handleFinalSubmit()
    setIsModalOpen(false)
  }
  const handleCancel = () => setIsModalOpen(false)

  const changeEmplacement = (e) => {
    const { value } = e.target;
    setEmplacementCode(value);
    if (value !== '' && value.length > 3) {
      fetchEmplacementData(value);
    }
  }

  const changeArticle = (e) => {
    const { value } = e.target;
    setArticleCode(value);
    if (value !== '' && value.length > 3) {
      fetchArticleData(value);
    }
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
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
        <h2 className='text-md font-semibold text-gray-700 mb-4'>Emplacement</h2>
        <Input placeholder="Emplacement"
          autoFocus
          size='large'
          value={emplacementCode}
          onChange={changeEmplacement}
        />
        {emplacementError && <div className='text-red-600 text-sm mb-3'>{emplacementError}</div>}
        {emplacementData && (
          <div className='bg-gray-100 p-2 rounded-md'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='font-medium'>Code:</span> <strong>{emplacementData.code}</strong>
              </div>
              <div>
                <span className='font-medium'>Depot:</span>{' '}
                <strong>{emplacementData?.depot?.name || emplacementData.depot_id}</strong>
              </div>
              
            </div>
          </div>
        )}
      </div>

      {/* Article Section */}
      <div className='px-5'>
        <h2 className='text-md font-semibold text-gray-700 mb-4'>Article</h2>
        <Input placeholder="Article"
          size='large'
          value={articleCode}
          onChange={changeArticle}
        />
        {articleError && <div className='text-red-600 text-sm mb-3'>{articleError}</div>}

        {(articleData && articleCode !== '') && (
          <div className='bg-gray-100 p-2 rounded-md'>
            <div className='mb-3'>
              <strong>
                {uppercaseFirst(articleData.description)}
                {articleData.name && <span> ({articleData.name})</span>}
              </strong>
            </div>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='font-medium'>Ref:</span> <strong>{articleData.code}</strong>
              </div>
              <div>
                <span className='font-medium'>Couleur:</span> <strong>{articleData.color}</strong>
              </div>
              <div>
                <span className='font-medium'>Hauteur:</span> <strong>{articleData.height}</strong>
              </div>
              <div>
                <span className='font-medium'>Largeure:</span> <strong>{articleData.height}</strong>
              </div>
              <div>
                <span className='font-medium'>Profondeur:</span> <strong>{articleData.depth}</strong>
              </div>

              {articleData.color && (
                <div>
                  <span className='font-medium'>Couleur:</span>{' '}
                  <strong>{articleData.color}</strong>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

    {
      articleData && articleData?.condition ? (
        <div className='px-5'>
          <h2 className='text-md font-semibold text-gray-700 mb-4'>Condition</h2>
          <Select
            placeholder="Qte Condition"
            size='large'
            className='w-full'
            onChange={(value)=> setCondition(value)}
            options={articleData.condition.split("|").map(cond => ({
              label: cond,
              value: cond
            }))}
          />
        </div>
      ) : null
    }

      {/* Quantity and Submit Section */}
      <div className='px-5'>
        <div className='space-y-4'>
          <h2 className='text-md font-semibold text-gray-700 mb-4'>Quantité</h2>
          <Input
            placeholder="Quantité"
            id='quantity'
            size='large'
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <div className='mt-3'></div>
          <Button className='w-full mt-3' size='large' disabled={!emplacementData || !articleData || !quantity} type='primary' onClick={showModal}>
            Vérifier
          </Button>

          <Modal
            title={
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 border-amber-300 border-1 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-lg font-semibold text-gray-800">Confirmer le Transfert</span>
              </div>
            }
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            closable={true}
            width={520}
            okText="Confirmer le Transfert"
            cancelText="Annuler"
            okButtonProps={{
              className: "bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
            }}
          >
            <div className="py-2">
              {emplacementData && articleData && quantity ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-6">
                    Veuillez vérifier les détails du transfert ci-dessous et confirmer pour continuer :
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                    <div className="space-y-4">
                      {/* Source Location */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700 mb-1">Emplacement Source</div>
                          <div className="text-base font-semibold text-gray-900">
                            {emplacementData.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            Dépôt : {emplacementData.depot_id}
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-blue-200"></div>

                      {/* Article Details */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Package className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700 mb-1">Article</div>
                          <div className="text-base font-semibold text-gray-900">
                            {articleData.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            <div>Réf : <span className="font-medium">{articleData.code}</span></div>
                            <div>Couleur : <span className="font-medium">{articleData.color}</span></div>
                            <div>Hauteur : <span className="font-medium">{articleData.height}</span></div>
                            <div>Largeur : <span className="font-medium">{articleData.width}</span></div>
                            <div>Profondeur : <span className="font-medium">{articleData.depth}</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-blue-200"></div>

                      {/* Quantity */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Hash className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700 mb-1">Quantité</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {quantity} {condition ? " x " + condition : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Chargement des détails du transfert...</p>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </div>
  )
}
