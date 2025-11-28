import {
  RefreshCcw,
  ArrowRight,
  CircleCheckBig,
  ListTodo,
  Settings,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { getExped, getStatus } from '../utils/config'
import { useParams } from 'react-router-dom'
import {
  Button,
  Checkbox,
  message,
  Select,
  Tag,
  Popconfirm,
  Empty,
  InputNumber,
} from 'antd'
import Skeleton from '../components/ui/Skeleton'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { useAuth } from '../contexts/AuthContext'
import PrintDocument from '../components/PrintDocument'
import TicketPrinter from '../components/TicketPrinter'
import { DocumentPalettesModal } from '../components/DocumentPalettesModal'

function Controller() {
  const { id } = useParams()
  const [data, setData] = useState({ docentete: {}, doclignes: [] })
  const [loading, setLoading] = useState(false)
  const [validatePartialLoading, setValidatePartialLoading] = useState(false);
  const [selected, setSelected] = useState({});
  const [selectedRoles, setSelectedRoles] = useState()
  const [transferSpin, setTransferSpin] = useState(false)
  const [documentCompany, setDocumentCompany] = useState({})
  const { roles = [], user } = useAuth()
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [status, setStatus] = useState({})

  const fetchData = async () => {
    setLoading(true)

    try {
      const response = await api.get(`docentetes/${id}`)

      setData(response.data)

      const companies = response.data?.docentete?.document?.companies || []
      const company = companies.find(
        (item) => item.id === Number(user?.company_id)
      )

      if (company) {
        setDocumentCompany(company)
        if (company.pivot?.status_id) {
          setStatus(getStatus(Number(company.pivot.status_id)))
        }
      } else {
        console.warn('Company not found for user')
        setDocumentCompany({})
        setStatus({})
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      message.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.company_id) {
      fetchData()
    }
  }, [id, user])

  const currentItems = data?.doclignes || []

  const handleSelect = (lineId, item) => {
    setSelected((prev) => {
      const newSelected = { ...prev }

      if (newSelected[lineId]) {
        
        delete newSelected[lineId]
      } else {
       
        newSelected[lineId] = {
          line_id: lineId,
          quantity: Math.floor(item.DL_Qte), 
        }
      }

      return newSelected
    })
  }

  const validate = async () => {
    setValidatePartialLoading(true)
    const selectedItems = Object.values(selected)
    if(selectedItems.length == 0){
      message.warning("Aucun article sélectionné");
      setValidatePartialLoading(false)
      return;
    }
    try {
      const response = await api.post(`docentetes/palettes/validate-partial/${id}`, {
        lines: selectedItems
      })
      message.success("document validated successfully")
        fetchData()
      setValidatePartialLoading(false)
    } catch (error) {
      setValidatePartialLoading(false)
       message.error(error.response.data.message);
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelected = {}
      data.doclignes
        .filter((item) => item.line?.validated !== '1')
        .forEach((doc) => {
          const lineId = doc.line?.id || doc.id
          newSelected[lineId] = {
            line_id: lineId,
            quantity: Math.floor(doc.DL_Qte),
          }
        })
      setSelected(newSelected)
    } else {
      setSelected({})
    }
  }

  const handleChangeTransfer = (value) => {
    setSelectedRoles(value)
    if (value !== selectedRoles) {
      setSelectedRoles(value)
    }
  }

  const handleQuantityChange = (lineId, value) => {
    if (value && value > 0) {
      setSelected((prev) => ({
        ...prev,
        [lineId]: {
          ...prev[lineId],
          quantity: value,
        },
      }))
    }
  }

  const transfer = async () => {
    setTransferSpin(true)
    const selectedItems = Object.values(selected)

    if (selectedRoles && selectedItems.length > 0) {
      const transferData = {
        roles: selectedRoles,
        lines: selectedItems,
      }

      try {
        const response = await api.post('docentetes/transfer', transferData)
        setSelectedRoles(null)
        setSelected({})
        fetchData()
        message.success(response.data.message ?? 'Transfert réussi')
      } catch (error) {
        console.error('Transfer failed:', error)
        message.error(error.response?.data?.message ?? 'Erreur lors du transfert')
      } finally {
        setTransferSpin(false)
      }
    } else {
      message.warning('Aucun article sélectionné')
      setTransferSpin(false)
    }
  }


  let listTransfer = [
    { value: 4, label: 'Preparation Cuisine' },
    { value: 5, label: 'Preparation Trailer' },
    { value: '7,4', label: 'Montage + Pr Cuisine' },
    { value: '7,5', label: 'Montage + Pr Trailer' },
    { value: '6,4', label: 'Fabrication + Pr Cuisine' },
    { value: 8, label: 'Magasinier' },
  ]

  const showPopconfirm = () => {
    setOpen(true)
  }

  const handleOk = async () => {
    try {
      setConfirmLoading(true)
      const selectedItems = Object.values(selected)
      await api.post(`docentetes/palettes/validate/${id}`, {
        lines: selectedItems,
      })
      setOpen(false)
      setConfirmLoading(false)
      fetchData()
    } catch (error) {
      console.error(error)
      message.error(error.response.data.message)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }


  const isItemSelected = (lineId) => {
    return selected.hasOwnProperty(lineId)
  }

  const getSelectedQuantity = (lineId) => {
    return selected[lineId]?.quantity || 0
  }


  // const company = data?.docentete?.document?.companies?.find(
  //   c => +c.id === +user.company_id
  // );
  // setStatus(company ? getStatus(company.pivot.status_id) : null);




  
  return (
    <div className='max-w-7xl mx-auto p-2 md:p-5'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center space-x-3'>
          <h1 className='text-md font-bold text-gray-900 flex gap-3 items-center'>
            <span>
              {data.docentete.DO_Piece
                ? data.docentete.DO_Piece
                : 'Chargement...'}
            </span>

            {data?.docentete?.DO_Reliquat === '1' && (
              <span className='ml-2 p-1 bg-gray-100 text-gray-600 rounded border border-gray-300 shadow-sm'>
                <Settings size={12} />
              </span>
            )}
            {data?.docentete?.document && (
              <Tag color={status.color}>
                {status.name}
              </Tag>
            )}
          </h1>
        </div>

        <div className='flex gap-2'>
          {roles('controller') && (Number(documentCompany?.pivot?.status_id) === 8 ||
            (Number(documentCompany?.pivot?.status_id) === 9 &&
              roles('controleur'))) && (
            <Button href={`#/document/palettes/${id}`} className='btn'>
              <ListTodo /> Contrôler
            </Button>
          )}

          <Button onClick={fetchData}>
            {loading ? (
              <RefreshCcw className='animate-spin h-4 w-4 mr-2' />
            ) : (
              <RefreshCcw className='h-4 w-4 mr-2' />
            )}
            Rafraîchir
          </Button>

          <PrintDocument
            doclignes={data.doclignes}
            docentete={data.docentete}
          />

          <TicketPrinter
            doclignes={data.doclignes}
            docentete={data.docentete}
          />

          {data.docentete.document && (
            <DocumentPalettesModal
              countPalettes={data?.docentete?.document?.palettes?.length}
              documentPiece={data.docentete.DO_Piece}
            />
          )}

          <Button onClick={validate} loading={validatePartialLoading} className='btn'>
            <ListTodo /> Validate
          </Button>
        </div>
      </div>

      {/* Document Info */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
        {[
          {
            label: 'Client',
            value: data.docentete.DO_Tiers,
          },
          {
            label: 'Référence',
            value: data.docentete.DO_Ref,
          },
          {
            label: 'Expédition',
            value: getExped(data.docentete.DO_Expedit),
          },
          {
            label: 'Société',
            value: (
              <div>
                {data?.docentete?.document?.companies?.length > 0 ? (
                  data.docentete.document.companies
                    .map((company) => `${company.name} ${company.pivot.printed == 1 ? '🖨️' : ''}`)
                    .join(' & ')
                ) : (
                  <Skeleton />
                )}
              </div>
            ),
          },
        ].map(({ label, value }, idx) => (
          <div
            key={idx}
            className='bg-white border border-gray-200 rounded-lg p-2 shadow-sm'
          >
            <div className='flex flex-col gap-2'>
              <span className='text-xs text-gray-500 uppercase tracking-wider font-medium'>
                {label}
              </span>
              <span className='text-sm font-semibold text-gray-900'>
                {value || <Skeleton />}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table Header */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-800'>Articles</h2>

        <div className='flex gap-3 items-center'>
          {documentCompany?.pivot && (
            <>
              {Number(documentCompany.pivot.status_id) === 10 && (
                <Popconfirm
                  title='Validation'
                  description='Etes-vous sûr de vouloir valider'
                  open={open}
                  onConfirm={handleOk}
                  okButtonProps={{ loading: confirmLoading }}
                  onCancel={handleCancel}
                  cancelText='Annuler'
                  okText='Valider'
                  color='success'
                >
                  <Button
                    color='success'
                    variant='solid'
                    onClick={showPopconfirm}
                  >
                    Valider <CircleCheckBig size={18} />
                  </Button>
                </Popconfirm>
              )}

              {Number(documentCompany.pivot.status_id) < 8 && (
                <>
                  <Select
                    size='large'
                    defaultValue='Transférer vers'
                    style={{ width: 200 }}
                    onChange={handleChangeTransfer}
                    options={listTransfer}
                  />
                  <Button
                    onClick={transfer}
                    size='large'
                    loading={transferSpin}
                  >
                    Transfer <ArrowRight size={18} />
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className='hidden md:block overflow-x-auto' id='print-section'>
        <Table className='min-w-full'>
          <Thead>
            <Tr hoverable={false}>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                <Checkbox
                  onChange={handleSelectAll}
                  checked={
                    Object.keys(selected).length ===
                      data.doclignes.filter(
                        (item) => item.line?.validated !== '1'
                      ).length &&
                    data.doclignes.filter(
                      (item) => item.line?.validated !== '1'
                    ).length > 0
                  }
                />
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                État
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Ref Article
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Piece
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Hauteur
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Largeur
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Epaisseur
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Couleur
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 whitespace-nowrap'>
                Chant
              </th>
              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap'>
                QTE CMD
              </th>
               <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap'>
                QTE Prp
              </th>
  
            </Tr>
          </Thead>
          <tbody className='bg-white'>
            {loading ? (
              [...Array(4)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(11)].map((_, colIndex) => (
                    <td className='px-6 py-4' key={colIndex}>
                      <div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse'></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.doclignes?.length > 0 ? (
              currentItems.map((item, index) => {
                const lineId = item.line?.id || item.id
                return (
                  <tr
                    key={index}
                    className={`
                      border-b border-gray-200 
                      hover:bg-blue-50 
                      transition-colors 
                      duration-150 
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    `}
                  >
                    <td className='px-2 py-1 whitespace-nowrap border-r border-gray-100'>
                      {item.line?.validated === '1' ? (
                        <div className='flex items-center justify-center'>
                          <svg
                            className='w-5 h-5 text-green-500'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </div>
                      ) : (
                        <Checkbox
                          checked={isItemSelected(lineId)}
                          onChange={() => handleSelect(lineId, item)}
                        />
                      )}
                    </td>
                    <td className='px-2 py-1 whitespace-nowrap border-r border-gray-100'>
                      <Tag color={item.line?.status?.color}>
                        {item.line?.status?.name}
                      </Tag>
                    </td>

                    <td className='px-2 py-1 whitespace-nowrap border-r border-gray-100'>
                      <span className='text-sm font-semibold text-gray-900'>
                        {item.AR_Ref || '__'}
                      </span>
                    </td>

                    <td className='px-2 text-sm border-r border-gray-100'>
                      <div className='text-sm font-medium text-gray-900 whitespace-nowrap'>
                        {item?.Nom ||
                          item.article?.Nom ||
                          item?.DL_Design ||
                          '__'}{' '}
                        {item?.Poignee} {item?.Rotation} {item?.Description}
                      </div>
                    </td>

                    <td className='px-2 text-sm border-r border-gray-100'>
                      {item.Hauteur > 0
                        ? Math.floor(item.Hauteur)
                        : Math.floor(item.article?.Hauteur) || '__'}
                    </td>

                    <td className='px-2 text-sm border-r border-gray-100'>
                      {item.Largeur > 0
                        ? Math.floor(item.Largeur)
                        : Math.floor(item?.article?.Largeur) || '__'}
                    </td>

                    <td className='px-2 text-sm border-r border-gray-100'>
                      {item?.Episseur | item?.article?.Episseur}
                    </td>

                    <td className='px-2 text-sm border-r border-gray-100 whitespace-nowrap'>
                      {(item.Couleur ? item.Couleur : item?.article?.Couleur) ||
                        '__'}
                    </td>

                    <td className='px-2 text-sm border-r border-gray-100'>
                      {(item.Chant ? item.Chant : item?.article?.Chant) || '__'}
                    </td>

                    <td className='px-4 py-2'>
                      <span className='inline-flex justify-center px-2 py-1 w-full gap-1 items-center rounded-md text-sm font-semibold bg-green-50 text-green-700 border border-green-200'>
                        <span>{Math.floor(item.EU_Qte || 0)} {" "}</span>
                        <small>{item.EU_Qte !== item.DL_Qte ? `(${Math.floor(item.DL_Qte)}m)` : ''}</small>
                      </span>
                    </td>

                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex justify-center px-2 py-1 w-full rounded-md text-sm font-semibold border
                            ${
                              (item?.line?.quantity_prepare
                                ? Math.floor(item.DL_QteBL) - item.line.quantity_prepare
                                : Math.floor(item.DL_QteBL)) <
                              (item?.line?.quantity_prepare
                                ? Math.floor(item.DL_Qte) - item.line.quantity_prepare
                                : Math.floor(item.DL_Qte))
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                            }`}
                        >
                          {item?.line?.quantity_prepare
                            ? Math.floor(item.DL_QteBL) - item.line.quantity_prepare
                            : Math.floor(item.DL_QteBL)}
                        </span>
                      </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan='11' className='p-8'>
                  <div className='text-center'>
                    <Empty description='Aucun article trouvé' />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className='block md:hidden'>
        {loading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='bg-white border-1 border-gray-200 p-4 space-y-3 animate-pulse'
              >
                <div className='flex justify-between'>
                  <div className='h-4 bg-gray-200 rounded w-1/3'></div>
                  <div className='h-4 bg-gray-200 rounded w-16'></div>
                </div>
                <div className='h-px bg-gray-200'></div>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='h-4 bg-gray-200 rounded'></div>
                  <div className='h-4 bg-gray-200 rounded'></div>
                  <div className='h-4 bg-gray-200 rounded'></div>
                  <div className='h-4 bg-gray-200 rounded'></div>
                </div>
              </div>
            ))}
          </div>
        ) : data.doclignes?.length > 0 ? (
          currentItems.map((item, index) => {
            const lineId = item.line?.id || item.id
            return (
              <div
                key={index}
                className='bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6 hover:shadow-lg transition-all duration-200'
              >
                <div className='flex justify-between items-start mb-4'>
                  <div className='space-y-1'>
                    <h2 className='text-lg font-semibold text-gray-900 flex gap-3 items-center'>
                      <span>
                        <Checkbox
                          checked={isItemSelected(lineId)}
                          onChange={() => handleSelect(lineId, item)}
                          style={{
                            transform: 'scale(1.5)',
                            transformOrigin: 'top left',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        />
                      </span>

                      <span>
                        {item?.Nom ||
                          item.article?.Nom ||
                          item?.DL_Design ||
                          '__'}
                      </span>
                    </h2>
                    <p className='text-sm text-gray-500'>
                      {item?.Description || ''} {item?.Rotation || ''}{' '}
                      {item?.Poignee || ''}
                    </p>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <span className='px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'>
                      {Math.floor(item.DL_Qte)}
                    </span>
                  </div>
                </div>

                {isItemSelected(lineId) && (
                  <div className='mb-4 p-3 bg-blue-50 rounded-lg'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Quantité à transférer:
                    </label>
                    <InputNumber
                      min={0.1}
                      max={Math.floor(item.DL_Qte)}
                      value={getSelectedQuantity(lineId)}
                      onChange={(value) => handleQuantityChange(lineId, value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}

                <div className='border-t border-gray-200 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700'>
                  <div>
                    <span className='block text-gray-500'>Hauteur</span>
                    {item.Hauteur > 0
                      ? Math.floor(item.Hauteur)
                      : Math.floor(item.article?.Hauteur) || '__'}
                  </div>
                  <div>
                    <span className='block text-gray-500'>Largeur</span>
                    {item.Largeur > 0
                      ? Math.floor(item.Largeur)
                      : Math.floor(item?.article?.Largeur) || '__'}
                  </div>
                  <div>
                    <span className='block text-gray-500'>Profondeur</span>
                    {item.Profondeur || item?.article?.Profonduer || '__'}
                  </div>
                  <div>
                    <span className='block text-gray-500'>Épaisseur</span>
                    {item?.Episseur | item?.article?.Episseur}
                  </div>
                </div>

                <div className='border-t border-gray-200 pt-4 grid grid-cols-3 gap-4 text-sm text-gray-700 mt-4'>
                  <div>
                    <span className='block text-gray-500'>Couleur</span>
                    <strong>
                      {item.Couleur || item?.article?.Couleur || '__'}
                    </strong>
                  </div>
                  <div>
                    <span className='block text-gray-500'>Chant</span>
                    {item.Chant || item?.article?.Chant || '__'}
                  </div>
                  <div>
                    <span className='block text-gray-500'>Référence</span>
                    {item.AR_Ref || '__'}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className='bg-white border-1 border-gray-200 p-8 text-center'>
            <Empty description='Aucun article trouvé' />
          </div>
        )}
      </div>
    </div>
  )
}

export default Controller
