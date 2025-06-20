import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useParams } from 'react-router-dom'
import { uppercaseFirst } from '../utils/config'

const ViewArticle = () => {
  const [activeTab, setActiveTab] = useState('basic')
  const {id} = useParams();

  // Données d'exemple - vous pouvez les passer en tant que props
  const [productData, setProductData] = useState({
    id: 1,
    code: 'A012308',
    description: 'protecteur panneau de couverture latérale 22mm mat',
    name: 'Salva costado ',
    color: 'Mat',
    qte_inter: '0.0',
    qte_serie: '0.0',
    quantity: '0.0',
    stock_min: '0.0',
    price: '1.0',
    thickness: '22.0',
    height: '0.0',
    width: '0.0',
    depth: '0.0',
    chant: '',
    family_id: '1',
    article_id: '1',
    condition: null,
    code_supplier: null,
    qr_code: null,
    created_at: null,
    updated_at: null,
    palette_condition: null,
    unit: null,
    gamme: null,
  })


  const getArticle = async ()=>{
    const {data} = await api.get(`articles/${id}`)
    setProductData(data);
  }

  useEffect(()=>{
    getArticle()
  }, [])

  const tabs = [
    {
      key: 'basic',
      label: 'Informations',
      fields: ['id', 'code', 'name', 'description', 'color'],
    },
    {
      key: 'inventory',
      label: 'Inventaire',
      fields: [
        'quantity',
        'qte_inter',
        'qte_serie',
        'stock_min',
        'price',
        'unit',
      ],
    },
    {
      key: 'dimensions',
      label: 'Dimensions',
      fields: ['thickness', 'height', 'width', 'depth', 'chant'],
    },
    {
      key: 'references',
      label: 'Références',
      fields: ['family_id', 'article_id', 'code_supplier', 'qr_code', 'gamme'],
    },
    {
      key: 'metadata',
      label: 'Métadonnées',
      fields: ['condition', 'palette_condition', 'created_at', 'updated_at'],
    },
  ]

  const formatFieldName = (field) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleInputChange = (field, value) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getInputType = (field) => {
    if (
      [
        'price',
        'thickness',
        'height',
        'width',
        'depth',
        'quantity',
        'qte_inter',
        'qte_serie',
        'stock_min',
      ].includes(field)
    ) {
      return 'number'
    }
    if (field === 'id' || field.includes('_id')) {
      return 'number'
    }
    if (field.includes('_at')) {
      return 'datetime-local'
    }
    return 'text'
  }

  const FormField = ({ label, field, value }) => (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>
      <input
        type={getInputType(field)}
        value={value || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        placeholder={`Entrez ${label.toLowerCase()}`}
        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
      />
    </div>
  )

  return (
    <div className='max-w-4xl mx-auto p-6 bg-white'>
      <div className='mb-6'>
        <h1 className='text-lg font-black mb-3'>
          {productData.name} - {productData.code}
        </h1>
        <p className='text-md text-gray-600'>
          {uppercaseFirst(productData.description)}
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className='border-b border-gray-200 mb-6'>
        <nav className='-mb-px flex space-x-8'>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className='bg-white'>
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`${activeTab === tab.key ? 'block' : 'hidden'}`}
          >
            <div className='grid grid-cols-2 gap-4'>
              {tab.fields.map((field) => (
                <FormField
                  key={field}
                  label={formatFieldName(field)}
                  field={field}
                  value={productData[field]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Boutons d'action */}
      <div className='mt-8 flex justify-end space-x-3'>
        <button className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          Réinitialiser
        </button>
        <button className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}

export default ViewArticle
