import { useEffect, useState } from 'react'
import { Button, Checkbox, Empty, message, Popconfirm, Select, Tag } from 'antd'
import { getExped } from '../utils/config'
import { api } from '../utils/api'
import { useParams } from 'react-router-dom'
import Skeleton from '../components/ui/Skeleton'
import { ArrowRight, Clock, Settings, Undo2 } from 'lucide-react'

function ViewReception() {
  const [data, setData] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState();
  const [transferSpin, setTransferSpin] = useState(false);

  const { id } = useParams()

  const fetchData = async (controller) => {
    setLoading(true)
    try {
      const response = await api.get(`receptions/${id}`, {
        signal: controller.signal,
      })
      setData(response.data)
    } catch (error) {
      if (error.name !== 'CanceledError') {
        console.error('Error fetching reception:', error)
      }
    } finally {
      setLoading(false)
    }
  }


  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/role/magasinier')
      setUsers(
        response.data.map((u) => ({
          label: u.full_name,
          value: u.id,
        }))
      )
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller)
    fetchUsers()
    return () => controller.abort()
  }, [id])

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(data?.doclignes?.map((item) => item.cbMarq))
    } else {
      setSelected([])
    }
  }

  const formatCurrency = (value) => {
    if (value == null) return ''
    return `${parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} MAD`
  }

  function formatDate(dateString, options = {}) {
    const {
      locale = 'fr-FR',
      withTime = false,
      fallback = '',
    } = options
    if (!dateString || typeof dateString !== 'string') return fallback

    const parsed = new Date(dateString.replace(' ', 'T'))
    if (isNaN(parsed)) return fallback

    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
    if (withTime) {
      dateOptions.hour = '2-digit'
      dateOptions.minute = '2-digit'
      dateOptions.second = '2-digit'
    }
    return parsed.toLocaleDateString(locale, dateOptions)
  }

  const handleTransfer = async () => {

    if (!user) {
      message.warning("Veuillez sélectionner magasinier");
      return;
    }

    try {
      setTransferSpin(true);
      const response = await api.post('receptions/transfer', {
        document_piece: id,
        user_id: user,
      });
      setTransferSpin(false);
      message.success("Document transféré avec succès");
      console.log(response);

    } catch (error) {
      setTransferSpin(false);
      console.error(error);
      message.error(error.response?.data?.message || "Erreur de transfert");
    }

  };

  const reset = async () => {
    try {
      await api.get(`receptions/reset/${id}`)
      message.success('Réinitialiser avec succès')
      fetchData()
    } catch (error) {
      console.log(error);
      
      message.error(error?.response?.data?.message)
      console.error(error);
    }
  }

  return (
    <div className='h-full flex flex-col bg-gray-50'>
      <div className='flex-shrink-0 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto p-4'>
          {/* Header */}
          <div className='flex justify-between'>
            <h1 className='text-lg font-bold text-gray-900 flex items-center gap-2'>{id}

              {data.DO_Reliquat === "1" && (
                <span className='ml-2 p-1 bg-gray-100 text-gray-600 rounded border border-gray-300 shadow-sm'>
                  <Settings size={12} />
                </span>
              )}

              <Tag
                color={data?.document?.status?.color}
                className='text-xs font-medium shadow-sm border'
              >
                {data?.document?.status?.name || 'En attente'}
              </Tag>
            </h1>
            <div className='flex gap-1 items-center'><Clock size={17} className='text-gray-500' /> {loading ? <Skeleton /> : formatDate(data.DO_Date)} </div>
          </div>

          {/* Info cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4'>
            <div className='bg-white border rounded-lg p-2 shadow-sm'>
              <span className='text-sm text-gray-500'>Client</span>
              <div className='text-sm font-semibold'>
                {loading ? <Skeleton /> : data.DO_Tiers}
              </div>
            </div>
            <div className='bg-white border rounded-lg p-2 shadow-sm'>
              <span className='text-sm text-gray-500'>Référence</span>
              <div className='text-sm font-semibold'>
                {loading ? <Skeleton /> : data.DO_Ref}
              </div>
            </div>
            <div className='bg-white border rounded-lg p-2 shadow-sm'>
              <span className='text-sm text-gray-500'>Expédition</span>
              <div className='text-sm font-semibold'>
                {loading ? <Skeleton /> : getExped(data.DO_Expedit)}
              </div>
            </div>
            <div className='bg-white border rounded-lg p-2 shadow-sm'>
              <span className='text-sm text-gray-500'>Total HT</span>
              <div className='text-sm font-semibold'>
                {loading ? <Skeleton /> : formatCurrency(data.DO_TotalHT)}
              </div>
            </div>
          </div>

          {/* Articles Table */}
          <div className='flex justify-between items-center'>
            <h2 className='text-md font-semibold text-gray-800 mb-2'>Articles {!loading ? "(" + data?.doclignes?.length + ")" : ""}</h2>
            <div className='mb-3 flex gap-2 '>
              {
                data.document ? <Popconfirm
                  title='Réinitialiser la commande'
                  description='Êtes-vous sûr de vouloir réinitialiser cette tâche ?'
                  onConfirm={reset}
                  okText='Réinitialiser'
                  cancelText='Annuler'
                >
                  <Button
                    danger
                    className='flex items-center gap-2 hover:shadow-md transition-shadow'
                  >
                    Réinitialiser <Undo2 size={18} />
                  </Button>
                </Popconfirm> : ""
              }
              

              <Select
                style={{ width: 250 }}
                options={users}
                onChange={(value) => setUser(value)}
                placeholder='Magasinier'
              />
              <Button onClick={handleTransfer} loading={transferSpin} color="cyan" variant="solid">
                Transfer <ArrowRight size={18} />
              </Button>
            </div>
          </div>
          <div className='bg-white border rounded-lg overflow-hidden'>
            <table className='w-full border-collapse'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-2 py-1 border-r'>
                    <Checkbox
                      onChange={handleSelectAll}
                      checked={
                        selected.length === data?.doclignes?.length &&
                        data?.doclignes?.length > 0
                      }
                    />
                  </th>
                  <th className='px-2 py-1 text-left'>Référence</th>
                  <th className='px-2 py-1 text-left'>Description</th>
                  <th className='px-2 py-1 text-left'>QTE CMD</th>
                  <th className='px-2 py-1 text-left'>QTE RCP</th>
                </tr>
              </thead>
              <tbody>
                {data?.doclignes?.length > 0 ? (
                  data.doclignes.map((item) => (
                    <tr key={item.cbMarq} className='border-t'>
                      <td className='px-2 py-1 border-r flex items-center justify-center'>
                        <Checkbox
                          checked={selected.includes(item.cbMarq)}
                          onChange={() => handleSelect(item.cbMarq)}
                        />
                      </td>
                      <td className='px-2 py-1'>{item.AR_Ref}</td>
                      <td className='px-2 py-1'>{item.DL_Design}</td>
                      <td className='px-2 py-1'>
                        <Tag
                          color='green'
                          style={{ fontSize: '15px', padding: '0 16px' }}
                        >
                          {Math.floor(item.DL_Qte)}
                        </Tag>
                      </td>
                      <td className='px-2 py-1'>
                        <Tag
                          color='gold'
                          style={{ fontSize: '15px', padding: '0 16px' }}
                        >
                          {item.line ? Math.floor(item.DL_QteBL) : 0}
                        </Tag>
                      </td>
                    </tr>
                  ))
                ) : loading ? (
                  [...Array(4)].map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {[...Array(5)].map((_, colIndex) => (
                        <td className='px-6 py-4' key={colIndex}>
                          <div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse'></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='5' className='p-8 text-center'>
                      <Empty description='Aucun article trouvé' />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewReception
