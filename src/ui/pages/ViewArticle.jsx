import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useParams } from 'react-router-dom'
import { ArrowDownUp, ChartBar, Diamond, Info, Package, Ruler } from 'lucide-react'
import { Input, message, Select, Tabs } from 'antd'
import { categories } from '../utils/config'
import BackButton from '../components/ui/BackButton'

const ViewArticle = () => {
  const [activeKey, setActiveKey] = useState('1')
  const { id } = useParams();

  const [product, setProduct] = useState({
    code: "",
    description: "",
    name: "",
    color: "",
    qte_inter: "",
    qte_serie: "",
    quantity: "",
    stock_min: "",
    price: "",
    thickness: "",
    height: "",
    width: "",
    depth: "",
    chant: "",
    condition: '',
    code_supplier: '',
    qr_code: '',
    palette_condition: '',
    unit: '',
    gamme: '',
    category: ''
  });

  const getArticle = async () => {
    const { data } = await api.get(`articles/${id}`)
    setProduct(data);
  }

  const handleTabChange = (key) => {
    setActiveKey(key);
  };


  const handleSave = async () => {
    try {
      try {
        await api.put(`articles/update/${id}`, product)
        message.success('Produit modifié avec succès.')
      } catch (error) {
        message.error(error.response.data.message);
      }
    } catch (error) {
      console.error('Error saving article:', error);
    }
  }

  useEffect(() => {
    getArticle()
  }, [])

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
        <div className='px-3 grid grid-cols-2 gap-4'>
          <div className='space-y-2 col-span-2'>
            <label
              htmlFor='designation'
              className='text-sm font-medium text-gray-700'
            >
              Désignation
            </label>
            <Input
              onChange={(e) =>
                setProduct({ ...product, description: e.target.value })
              }
              value={product.description}
              placeholder='Entrer la désignation'
            />
          </div>
          <div className='space-y-2'>
            <label htmlFor='code' className='text-sm font-medium text-gray-700'>
              Référence
            </label>
            <Input
              id='code'
              value={product.code}
              placeholder='Référence'
              // readOnly
              // disabled
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='name' className='text-sm font-medium text-gray-700'>
              Nom
            </label>
            <Input
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              value={product.name}
              placeholder='Entrer le nom'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='color'
              className='text-sm font-medium text-gray-700'
            >
              Couleur
            </label>
            <Input
              onChange={(e) =>
                setProduct({ ...product, color: e.target.value })
              }
              value={product.color}
              placeholder='Sélectionner la couleur'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='chant'
              className='text-sm font-medium text-gray-700'
            >
              Chant
            </label>
            <Input
              value={product.chant}
              max={10}
              onChange={(e) =>
                setProduct({ ...product, chant: e.target.value })
              }
              placeholder='Type de chant'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='gamme'
              className='text-sm font-medium text-gray-700'
            >
              Gamme
            </label>
            <Input
              value={product.gamme}
              onChange={(e) =>
                setProduct({ ...product, gamme: e.target.value })
              }
              placeholder='Sélectionner la gamme'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='price'
              className='text-sm font-medium text-gray-700'
            >
              Prix de vente <span className='text-gray-500'>(MAD)</span>
            </label>
            <Input
              value={product.price}
              type='number'
              onChange={(e) =>
                setProduct({ ...product, price: e.target.value })
              }
              step='0.01'
              placeholder='Ex: 125.50'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='category'
              className='text-sm font-medium text-gray-700'
            >
              Category
            </label>

            <Select
              className='w-full'
              value={product.category || undefined} // fallback to undefined if null
              onChange={(value) => setProduct({ ...product, category: value })}
              placeholder='Catégorie du produit'
              options={categories}
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='prix-vente'
              className='text-sm font-medium text-gray-700'
            >
              Unité
            </label>
            <Input
              max={20}
              value={product.unit}
              onChange={(e) => setProduct({ ...product, unit: e.target.value })}
              placeholder='m, m², g, kg'
            />
          </div>
        </div>
      ),
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
        <div className='px-3 grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <label
              htmlFor='hauteur'
              className='text-sm font-medium text-gray-700'
            >
              Hauteur <span className='text-gray-500'>(mm)</span>
            </label>
            <Input
              value={product.height}
              onChange={(e) =>
                setProduct({ ...product, height: e.target.value })
              }
              type='number'
              placeholder='Ex: 2800'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='largeur'
              className='text-sm font-medium text-gray-700'
            >
              Largeur <span className='text-gray-500'>(mm)</span>
            </label>
            <Input
              value={product.width}
              onChange={(e) =>
                setProduct({ ...product, width: e.target.value })
              }
              type='number'
              placeholder='Ex: 2070'
            />
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='profondeur'
              className='text-sm font-medium text-gray-700'
            >
              Profondeur <span className='text-gray-500'>(mm)</span>
            </label>
            <Input
              value={product.depth}
              onChange={(e) =>
                setProduct({ ...product, depth: e.target.value })
              }
              type='number'
              placeholder='Ex: 600'
            />
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='epaisseur'
              className='text-sm font-medium text-gray-700'
            >
              Épaisseur <span className='text-gray-500'>(mm)</span>
            </label>
            <Input
              value={product.thickness}
              onChange={(e) =>
                setProduct({ ...product, thickness: e.target.value })
              }
              type='number'
              placeholder='Ex: 18'
            />
          </div>
        </div>
      ),
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
        <div className='px-3 grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <label
              htmlFor='epaisseur'
              className='text-sm font-medium text-gray-700'
            >
              Quantité
            </label>
            <Input
              value={product.quantity}
              onChange={(e) =>
                setProduct({ ...product, quantity: e.target.value })
              }
              type='number'
              placeholder='Quantité en stock'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='stock_min'
              className='text-sm font-medium text-gray-700'
            >
              Stock minimum <span className='text-gray-500'></span>
            </label>
            <Input
              value={product.stock_min}
              onChange={(e) =>
                setProduct({ ...product, stock_min: e.target.value })
              }
              type='number'
              placeholder='Ex: 600'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='condition'
              className='text-sm font-medium text-gray-700'
            >
              Condition (<small>Carton, Sac..</small>)
            </label>
            <Input
              value={product.condition}
              onChange={(e) =>
                setProduct({ ...product, condition: e.target.value })
              }
              placeholder='État du produit'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='palette-condition'
              className='text-sm font-medium text-gray-700'
            >
              Condition palette
            </label>
            <Input
              value={product.palette_condition}
              onChange={(e) =>
                setProduct({ ...product, palette_condition: e.target.value })
              }
              placeholder='État de la palette'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='code_supplier'
              className='text-sm font-medium text-gray-700'
            >
              Référence du fournisseur
            </label>
            <Input
              value={product.code_supplier}
              onChange={(e) =>
                setProduct({ ...product, code_supplier: e.target.value })
              }
              placeholder='Code du fournisseur'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='qr_code'
              className='text-sm font-medium text-gray-700'
            >
              QR / BAR Code
            </label>
            <Input
              value={product.qr_code}
              onChange={(e) =>
                setProduct({ ...product, qr_code: e.target.value })
              }
              placeholder='QR ou BAR Code'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='qte_inter'
              className='text-sm font-medium text-gray-700'
            >
              Quantité INTERCOCINA
            </label>
            <Input
              value={product.qte_inter}
              onChange={(e) =>
                setProduct({ ...product, qte_inter: e.target.value })
              }
              placeholder='Quantité'
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='qte_serie'
              className='text-sm font-medium text-gray-700'
            >
              Quantité SERIEMOBLE
            </label>
            <Input
              value={product.qte_serie}
              onChange={(e) =>
                setProduct({ ...product, qte_serie: e.target.value })
              }
              placeholder='Quantité'
            />
          </div>
        </div>
      ),
    },
  ]



  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto bg-white">
      { !window.electron && <BackButton />}
      
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        size="middle"
        type="line"
        items={tabs}
        style={{ marginBottom: 32 }}
      />
      <div className="flex-grow"></div>

      {/* Boutons d'action */}
      <div className="mt-8 flex justify-end space-x-3 px-4 pb-4">
        <button
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Réinitialiser
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}

export default ViewArticle