import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useParams, useNavigate } from 'react-router-dom'
import { Info, MapPin, Package, Ruler } from 'lucide-react'
import { Form, Input, InputNumber, message, Select, Tabs, Button } from 'antd'
import { categories } from '../utils/config'
import BackButton from '../components/ui/BackButton'
import ArticleEmpacement from './ArticleEmpacement'

const ViewArticle = () => {
  const [activeKey, setActiveKey] = useState('1')
  const [form] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Load product if editing
  const getArticle = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`articles/${id}`)

      // Set form values
      form.setFieldsValue({
        ...data,
        category: data.category?.id || data.category
      })
    } catch (error) {
      console.error('❌ Erreur lors du chargement du produit:', error)
      message.error('Erreur lors du chargement du produit.')
    } finally {
      setLoading(false)
    }
  }

  // Handle create / update
  const handleSave = async (values) => {
    try {
      setLoading(true)
      const url = id !== 'null' ? `articles/update/${id}` : `articles/store`

      // Clean payload
      const payload = {
        ...values,
        category_id: values.category
      }
      delete payload.category

      if (id !== 'null') {
        await api.put(url, payload)
        message.success('Produit modifié avec succès.')
      } else {
        const response = await api.post(url, payload)
        navigate(`/articles/${response.data.id}`)
        message.success('Produit créé avec succès.')
      }
    } catch (error) {
      console.error('❌ Error saving article:', error)
      message.error(
        error.response?.data?.message ||
        "Erreur lors de l'enregistrement du produit."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id !== 'null') {
      getArticle()
    }
  }, [id])

  const handleTabChange = (key) => {
    setActiveKey(key)
  }

  const tabs = [
    {
      label: (
        <span className='flex items-center gap-2 ml-3'>
          <Info size={16} />
          Article
        </span>
      ),
      key: '1',
      children: (
        <div className='px-3 grid grid-cols-2 gap-x-4'>
          <Form.Item
            name='description'
            label='Désignation'
            className='col-span-2'
            rules={[
              { required: true, message: 'La désignation est obligatoire' }
            ]}
          >
            <Input placeholder='Entrer la désignation' />
          </Form.Item>

          <Form.Item
            name='code'
            label='Référence'
            rules={[
              { required: true, message: 'La référence est obligatoire' }
            ]}
          >
            <Input placeholder='Référence' />
          </Form.Item>

          <Form.Item
            name='name'
            label='Nom'
            rules={[{ required: true, message: 'Le nom est obligatoire' }]}
          >
            <Input placeholder='Entrer le nom' />
          </Form.Item>

          <Form.Item name='color' label='Couleur'>
            <Input placeholder='Sélectionner la couleur' />
          </Form.Item>

          <Form.Item name='chant' label='Chant'>
            <Input placeholder='Type de chant' />
          </Form.Item>

          <Form.Item name='gamme' label='Gamme'>
            <Input placeholder='Sélectionner la gamme' />
          </Form.Item>

          <Form.Item
            name='price'
            label={
              <span>
                Prix de vente <span className='text-gray-500'>(MAD)</span>
              </span>
            }

            rules={[
              { required: true, message: 'Le prix est obligatoire' },
              { min: 0, message: 'Le prix doit être positif' }
            ]}
          >
            <InputNumber
              className='w-full'
              placeholder='Ex: 125.50'
              style={{ width: "100%" }}
              step={0.01}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name='category'
            label='Catégorie'
            rules={[
              { required: true, message: 'La catégorie est obligatoire' }
            ]}
          >
            <Select
              placeholder='Catégorie du produit'
              options={categories}
            />
          </Form.Item>

          <Form.Item name='unit' label='Unité'>
            <Input placeholder='m, m², g, kg' />
          </Form.Item>
        </div>
      )
    },
    {
      label: (
        <span className='flex items-center gap-2'>
          <Ruler size={16} />
          Dimensions
        </span>
      ),
      key: '2',
      children: (
        <div className='px-3 grid grid-cols-2 gap-x-4'>
          {[
            { name: 'height', label: 'Hauteur' },
            { name: 'width', label: 'Largeur' },
            { name: 'depth', label: 'Profondeur' },
            { name: 'thickness', label: 'Épaisseur' }
          ].map((dim) => (
            <Form.Item
              key={dim.name}
              name={dim.name}
              className='w-full'
              style={{ width: "100%" }}
              label={
                <span>
                  {dim.label} <span className='text-gray-500'>(mm)</span>
                </span>
              }
              rules={[
                {
                  min: 0,
                  message: 'La valeur doit être positive'
                }
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                className='w-full'
                placeholder='Ex: 600'
              />
            </Form.Item>
          ))}
        </div>
      )
    },

     {
      label: (
        <span className='flex items-center gap-2'>
          <MapPin size={16} />
          Emplacements
        </span>
      ),
      key: '6',
      children: (
        <div>
          <ArticleEmpacement code={id} />
        </div>
      )
    },
    {
      label: (
        <span className='flex items-center gap-2'>
          <Package size={16} />
          Inventaire
        </span>
      ),
      key: '3',
      children: (
        <div className='px-3 grid grid-cols-2 gap-x-4'>
          <Form.Item
            name='quantity'
            label='Quantité'

            initialValue={0}
            rules={[
              {
                min: 0,
                message: 'La quantité doit être positive'
              }
            ]}
          >
            <InputNumber
              className='w-full'
              style={{ width: "100%" }}
              placeholder='Quantité en stock'
            />
          </Form.Item>

          <Form.Item
            name='stock_min'
            label='Stock minimum'
            initialValue={0}
            rules={[
              {
                min: 0,
                message: 'Le stock minimum doit être positif'
              }
            ]}
          >
            <InputNumber
              className='w-full'
              style={{ width: "100%" }}
              placeholder='Ex: 600'
            />
          </Form.Item>

          <Form.Item name='condition' label='Condition'>
            <Input placeholder='Carton, Sac...' />
          </Form.Item>

          <Form.Item name='palette_condition' label='Condition palette'>
            <Input placeholder='État de la palette' />
          </Form.Item>

          <Form.Item name='code_supplier' label='Référence du fournisseur'>
            <Input placeholder='Code du fournisseur' />
          </Form.Item>

          <Form.Item name='qr_code' label='QR / BAR Code'>
            <Input placeholder='QR ou BAR Code' />
          </Form.Item>
        </div>
      )
    }
  ]

  return (
    <div className='min-h-screen flex flex-col max-w-4xl mx-auto bg-white'>
      {!window.electron && <BackButton />}

      <Form
        form={form}
        layout='vertical'
        onFinish={handleSave}
        initialValues={{
          quantity: 0,
          stock_min: 0,
          qte_inter: 0,
          qte_serie: 0
        }}
      >
        <Tabs
          activeKey={activeKey}
          onChange={handleTabChange}
          size='middle'
          type='line'
          items={tabs}
          style={{ marginBottom: 32 }}
        />

        <div className='mt-8 flex justify-end space-x-3 px-4 pb-4'>
          <Button
            onClick={() => form.resetFields()}
          >
            Réinitialiser
          </Button>

          <Button
            type='primary'
            htmlType='submit'
            loading={loading}
          >
            {id !== 'null' ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default ViewArticle