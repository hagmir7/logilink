import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { uppercaseFirst } from '../utils/config'
import BackButton from '../components/ui/BackButton'

export default function InventoryMovement() {
  const {id} = useParams()

  const [emplacementCode, setEmplacementCode] = useState('')
  const [articleCode, setArticleCode] = useState('')
  const [quantity, setQuantity] = useState('')

  const [emplacementData, setEmplacementData] = useState(null)
  const [articleData, setArticleData] = useState(null)

  const [loadingEmplacement, setLoadingEmplacement] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(false)

  const [emplacementError, setEmplacementError] = useState('')
  const [articleError, setArticleError] = useState('')

  const fetchEmplacementData = async (code) => {
    if (!code.trim()) return

    setLoadingEmplacement(true)
    // setEmplacementError('')

    try {
      const response = await api.get(`inventory/emplacement/${code}`)
      const data = await response.data
      setEmplacementData(data)
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
    setArticleError('')

    try {
      const response = await api.get(`inventory/article/${code}`)
    //   if (!response.ok) {
    //     throw new Error('Article not found')
    //   }
      const data = await response.data;
      setArticleData(data)
    } catch (error) {
      setArticleError(error.message)
      setArticleData(null)
    } finally {
      setLoadingArticle(false)
    }
  }

  const handleEmplacementSubmit = () => {
    fetchEmplacementData(emplacementCode)
  }

  const handleArticleSubmit = () => {
    fetchArticleData(articleCode)
  }

  const handleFinalSubmit = () => {
    if (!emplacementData || !articleData || !quantity) {
      alert(
        'Please fill all fields and fetch both emplacement and article data'
      )
      return
    }

    const movementData = {
      movement_id: id,
      emplacement: emplacementData,
      article: articleData,
      quantity: parseFloat(quantity),
    }

    console.log('Submitting movement data:', movementData)
    // Here you would typically send this data to your API
    alert('Movement data ready for submission (check console)')
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* <h1 className='text-2xl font-bold text-gray-800 mb-6'>{id}</h1> */}

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
        <h2 className='text-md font-semibold text-gray-700 mb-4'>
          Emplacement
        </h2>

        <div className='flex gap-3 mb-4'>
          <input
            type='text'
            value={emplacementCode}
            onChange={(e) => setEmplacementCode(e.target.value)}
            placeholder='Enter emplacement code (e.g., K-1A1-01)'
            className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            onClick={handleEmplacementSubmit}
            disabled={loadingEmplacement || !emplacementCode.trim()}
            className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400'
          >
            {loadingEmplacement ? 'Loading...' : 'Fetch'}
          </button>
        </div>

        {emplacementError && (
          <div className='text-red-600 text-sm mb-3'>{emplacementError}</div>
        )}

        {emplacementData && (
          <div className='bg-gray-100 p-2 rounded-md'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='font-medium'>Code:</span>{' '}
                <strong>{emplacementData.code}</strong>
              </div>
              <div>
                <span className='font-medium'>Depot:</span>{' '}
                <strong>
                  {emplacementData?.depot?.name | emplacementData.depot_id}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Article Section */}
      <div className='px-5'>
        <h2 className='text-md font-semibold text-gray-700 mb-4'>Article</h2>

        <div className='flex gap-3 mb-4'>
          <input
            type='text'
            value={articleCode}
            onChange={(e) => setArticleCode(e.target.value)}
            placeholder='Enter article code (e.g., AC011015)'
            className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <button
            onClick={handleArticleSubmit}
            disabled={loadingArticle || !articleCode.trim()}
            className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400'
          >
            {loadingArticle ? 'Loading...' : 'Fetch'}
          </button>
        </div>

        {articleError && (
          <div className='text-red-600 text-sm mb-3'>{articleError}</div>
        )}

        {articleData && (
          <div className='bg-gray-100 p-2 rounded-md'>
            <div className='mb-3'>
              {/* <span className='font-medium'>Désignation:</span>{' '} */}
              <strong>
                {' '}
                {uppercaseFirst(articleData.description)}{' '}
                {articleData.name && <span> ({articleData.name})</span>}
              </strong>
            </div>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='font-medium'>Ref:</span>{' '}
                <strong>{articleData.code}</strong>
              </div>

              {articleData.color && (
                <>
                  <span className='font-medium'>
                    Couleur: <strong>{articleData.color}</strong>
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quantity and Submit Section */}
      <div className='px-5'>
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='quantity'
              className='text-md font-semibold text-gray-700 mb-4'
            >
              Quantity
            </label>
            <input
              id='quantity'
              type='number'
              step='0.1'
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder='Enter quantity'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>

          <button
            onClick={handleFinalSubmit}
            disabled={!emplacementData || !articleData || !quantity}
            className='w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            Submit Movement
          </button>
        </div>
      </div>

      {/* Summary Section */}
      {emplacementData && articleData && quantity && (
        <div className='bg-blue-50 rounded-lg p-6'>
          <h2 className='text-lg font-semibold text-blue-800 mb-4'>
            Movement Summary
          </h2>
          <div className='text-sm text-blue-700 space-y-1'>
            <div>
              <span className='font-medium'>Movement ID:</span> {id}
            </div>
            <div>
              <span className='font-medium'>From Emplacement:</span>{' '}
              {emplacementData.code} (Depot: {emplacementData.depot_id})
            </div>
            <div>
              <span className='font-medium'>Article:</span> {articleData.name} (
              {articleData.code})
            </div>
            <div>
              <span className='font-medium'>Quantity:</span> {quantity}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
