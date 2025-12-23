import { useEffect, useState } from 'react'
import { Button, Checkbox, Empty, message, Popconfirm, Select, Tag } from 'antd'
import { getExped } from '../utils/config'
import { api } from '../utils/api'
import { useParams } from 'react-router-dom'
import Skeleton from '../components/ui/Skeleton'
import { ArrowRight, CheckCircle, CircleCheckBig, Clock, Settings, Undo2 } from 'lucide-react'

function ViewReception() {
  const [data, setData] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState();
  const [transferSpin, setTransferSpin] = useState(false);
  const [validationSpin, setValidationSpin] = useState(false)

  const { id, company } = useParams()

  const fetchData = async (controller) => {
    setLoading(true)
    try {
      const response = await api.get(`receptions/${id}?company=${company}`, {
        signal: controller.signal,
      })
      setData(response.data)
      console.log(response.data);
      
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

  const handleValidation = async () => {
    setValidationSpin(true);
    if (Number(data.document.status_id) !== 2) {
      message.warning("Le document etat pas valid");
      setValidationSpin(false)
      return;
    }
    try {
      await api.get(`receptions/validation/${id}?company_db=${company}`);
      setValidationSpin(false)
      const controller = new AbortController()
      fetchData(controller)
      message.success("Le document est validé avec succès");
    } catch (error) {
      setValidationSpin(false)
      console.error(error);
      message.error(error.response.data.message || "Erurr de validé le document")
    }

  }

  const handleTransfer = async () => {

    if (!user) {
      message.warning("Veuillez sélectionner magasinier");
      return;
    }

    if (Number(data?.document?.status_id) === 3) {
      message.warning("Le document est déjà valide");
      return;
    }

    try {
      setTransferSpin(true);
      const response = await api.post(`receptions/transfer?company=${company}`, {
        document_piece: id,
        user_id: user,
        lines: selected
      });
      const controller = new AbortController()
      fetchData(controller)
      setTransferSpin(false);
      message.success("Document transféré avec succès");

    } catch (error) {
      setTransferSpin(false);
      console.error(error);
      message.error(error.response?.data?.message || "Erreur de transfert");
    }

  };

  const reset = async () => {
    try {
      await api.get(`receptions/reset/${id}?company=${company}`)
      message.success('Réinitialiser avec succès')
      const controller = new AbortController()
      fetchData(controller)
    } catch (error) {
      message.error(error?.response?.data?.message)
      console.error(error);
    }
  }

  const statuses = [
    { id: 1, name: "Transféré", color: "#2980b9" },
    { id: 2, name: "Réceptionné", color: "#27ae60" },
    { id: 3, name: "Validé", color: "#2ecc71" },
  ];

  function getStatus(id) {
    return statuses.find(status => status.id === Number(id)) || null;
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


              {loading ? <Skeleton /> : <Tag
                color={getStatus(data?.document?.status_id)?.color}
                className='text-xs font-medium shadow-sm border'
              >
                {getStatus(data?.document?.status_id)?.name || 'En attente'}
              </Tag>}
              
            </h1>
            <div className='flex gap-1 items-center'><Clock size={17} className='text-gray-500' /> {loading ? <Skeleton /> : formatDate(data.DO_Date)} </div>
          </div>

          {/* Info cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4'>
            <div className='bg-white border rounded-lg p-2 shadow-sm'>
              <span className='text-sm text-gray-500'>N° Fournisseur</span>
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
              <span className='text-sm text-gray-500'>Date livraison</span>
              <div className='text-sm font-semibold'>
                {loading ? <Skeleton /> : formatDate(data.DO_DateLivr)}
              </div>
            </div>
          </div>

          {/* Articles Table */}
          <div className='flex justify-between items-center'>
            <h2 className='text-md font-semibold text-gray-800 mb-2'>Articles {!loading ? "(" + data?.doclignes?.length + ")" : ""}</h2>

            {Number(data?.document?.status_id) === 2 ? (
          <Button color="success" variant="solid" onClick={handleValidation} loading={validationSpin} className="mb-2">
            Valider <CircleCheckBig size={18} />
          </Button>
        ) : (
          <div className="mb-3 flex gap-2">
            {data.document && (
              <Popconfirm
                title="Réinitialiser la commande"
                description="Êtes-vous sûr de vouloir réinitialiser cette tâche ?"
                onConfirm={reset}
                okText="Réinitialiser"
                cancelText="Annuler"
              >
                <Button danger disabled={Number(data?.document?.status_id) > 1} className="flex items-center gap-2 hover:shadow-md transition-shadow">
                  Réinitialiser <Undo2 size={18} />
                </Button>
              </Popconfirm>
            )}

            <Select
              style={{ width: 250 }}
              options={users}
              onChange={setUser}
              placeholder="Magasinier"
              disabled={Number(data?.document?.status_id) > 2}
            />

            <Button
              onClick={handleTransfer}
              loading={transferSpin}
              color="cyan"
              variant="solid"
              disabled={Number(data?.document?.status_id) > 2}
            >
              Transfer <ArrowRight size={18} />
            </Button>
          </div>
        )}

           
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
                       
                        <span>
                          {users?.find((u) => Number(u.value) == Number(item?.line?.role_id))?.label} &nbsp;
                        </span>

                        {
                          item?.line?.role_id ? <CheckCircle className='mt-1 text-green-700' size={16} /> :
                            <Checkbox
                              checked={selected.includes(item.cbMarq)}
                              onChange={() => handleSelect(item.cbMarq)}
                            />
                        }
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
