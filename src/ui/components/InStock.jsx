import { Button, Flex, Input, message, Modal, Radio, Select } from 'antd';
import { Minus, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { upperFirst } from 'lodash';



const InStock = () => {

    const [article, setArticle] = useState({
      id: 1,
      code: 'A012308',
      description: 'Panneau Arctic White',
      name: 'Salva costado',
      color: 'Mat',
      qte_inter: '100.0',
      qte_serie: '100.0',
      quantity: '103.0',
      stock_min: '213.0',
      price: '1.0',
      thickness: '22.0',
      height: null,
      width: '0.0',
      depth: '0.0',
      chant: 'C',
      family_id: '1',
      article_id: '1',
      condition: null,
      code_supplier: null,
      qr_code: 'Test',
      created_at: null,
      updated_at: '2025-06-21T17:22:12.910000Z',
      palette_condition: '20|15',
      unit: null,
      gamme: 'kjkh',
      category: null,
    })

    const [openResponsive, setOpenResponsive] = useState(false);
    const [colisType, setColisType] = useState(null);
    const [quantity, setQuantity] = useState(0)

    const getArticle = async (article_code)=>{
        try {
            const { data } = await api.get(`articles/${article_code}`)
            setArticle(data)
        } catch (error) {
            console.error(error);
            message.error(error.response.data.message);
            
        }
    }

    useEffect(()=>{
        if(!article.code) return;
        getArticle(article.code)
    }, [article.code])

    return (
      <div className='px-3 space-y-4'>
        <input
          type='text'
          className='w-full font-black px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-base'
          placeholder='Rèf. Article'
          value={article.code}
          onChange={(e) => setArticle({ ...article, code: e.target.value })}
        />
        <input
          type='text'
          disabled={true}
          readOnly={true}
          value={upperFirst(article.description)}
          className='w-full font-black px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-base'
          placeholder='Dèsignation'
        />

        <div className='flex gap-3'>
          <input
            type='text'
            className='w-full font-black px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-base'
            placeholder='Couleur'
            value={upperFirst(article.color)}
            disabled={true}
            readOnly={true}
          />

          <input
            type='text'
            className='w-full font-black px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-base'
            placeholder='Profondeur'
            value={article.depth || ''}
            disabled={true}
            readOnly={true}
          />
        </div>

        <div className='mb-4'></div>

        {(article.palette_condition || article.condition) && (
          <div>
            <Radio.Group
              optionType='button'
              buttonStyle='solid'
              className='w-full flex'
              onChange={(e) => setColisType(e.target.value)}
              style={{ display: 'flex' }}
            >
              <Radio.Button
                value='Piece'
                style={{
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '17px',
                }}
                className='w-1/3 text-center font-black'
              >
                Pièce
              </Radio.Button>

              <Radio.Button
                value='Carton'
                disabled={!article.condition}
                className='w-1/3 text-center font-black'
                style={{
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '17px',
                }}
              >
                Carton
              </Radio.Button>
              <Radio.Button
                value='Palette'
                disabled={!article.palette_condition}
                className='w-1/3 font-black'
                style={{
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '17px',
                }}
              >
                Palette
              </Radio.Button>
            </Radio.Group>
            <div className='mb-4'></div>
            {(colisType === 'Palette' || colisType === 'Carton') && (
              <Select
                placeholder='Quantité Cdolisée'
                className='font-black w-full border rounded-lg border-gray-300'
                size='large'
                style={{ height: 50 }}
                options={[
                  { label: <span className='text-xl'>100</span>, value: 100 },
                ]}
              />
            )}
          </div>
        )}

        <div className='mb-4'></div>

        <div>
          <label className='block font-medium text-gray-700 mb-1 sm:mb-2'>
            Quantité
          </label>
          <div className='flex items-center gap-2 sm:gap-3 w-full'>
            <button
              onClick={() => setQuantity(quantity - 1)}
              disabled={quantity <= 0}
              className='p-2 sm:p-3 border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1'
            >
              <Minus className='w-4 h-5 sm:w-5 sm:h-5 mx-auto' />
            </button>

            <input
              type='number'
              value={quantity}
              content={false}
              min={0}
              onChange={(e) => setQuantity(e.target.value)}
              className='w-full font-black h-[49px] max-w-[200px] px-3 py-2 text-center border-2 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base'
            />

            <button
              onClick={() => setQuantity(quantity + 1)}
              className='p-2 sm:p-3 border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 flex-1'
            >
              <Plus className='w-4 h-5 sm:w-5 sm:h-5 mx-auto' />
            </button>
          </div>

          <button
            onClick={() => setOpenResponsive(true)}
            className='px-4 py-3 mt-6 w-full sm:px-6 sm:py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:text-base'
          >
            Valider l'article
          </button>

          <Modal
            title='Modal responsive width'
            centered
            open={openResponsive}
            onOk={() => setOpenResponsive(false)}
            onCancel={() => setOpenResponsive(false)}
            width={{
              xs: '90%',
              sm: '80%',
              md: '70%',
              lg: '60%',
              xl: '50%',
              xxl: '40%',
            }}
          >
            <Select
              placeholder='Sociéte'
              className='font-black w-full border rounded-lg border-gray-300'
              size='large'
              style={{ height: 50 }}
              options={[
                {
                  label: <span className='text-xl'>Intercocina</span>,
                  value: 1,
                },
              ]}
            />
            <div className='mb-4'></div>
            <input
              type='text'
              className='w-full font-black px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-base'
              placeholder='Emplacement'
            />
          </Modal>
        </div>
      </div>
    )
}

export default InStock;

