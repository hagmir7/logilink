import {
  RefreshCcw,
  Clipboard,
  ArrowRight,
  Hourglass,
  CheckCircle,
  CircleCheckBig,
  Clock4,
  ListTodo,
  Printer,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { getExped, getDocumentType, getStatus } from '../utils/config'
import { useParams } from 'react-router-dom'
import { Button, Checkbox, message, Select, Tag, Popconfirm } from 'antd'
import Skeleton from '../components/ui/Skeleton'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import SkeletonTable from '../components/ui/SkeletonTable'
import EmptyTable from '../components/ui/EmptyTable'
import { useAuth } from '../contexts/AuthContext'
import PrintDocument from '../components/PrintDocument'
import TicketPrint from '../components/TicketPrinter'
import TicketPrinter from '../components/TicketPrinter'

function Controller() {
  const { id } = useParams()
  const [data, setData] = useState({ docentete: {}, doclignes: [] })
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState([])
  const [selectedRoles, setSelectedRoles] = useState()
  const [transferSpin, setTransferSpin] = useState(false)
  const [documentCompany, setDocumentCompany] = useState({})
  const { roles, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [status, setStatus] = useState({})

const fetchData = async () => {
  setLoading(true)

  try {
    const response = await api.get(`docentetes/${id}`)
    console.log('Fetched response:', response.data)

    setData(response.data)

    const companies = response.data?.docentete?.document?.companies || []
    const company = companies.find(
      (item) => item.id === Number(user?.company_id)
    )

    console.log('Selected company:', company)

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

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(data.doclignes.map((doc) => doc.line.id))
    } else {
      setSelected([])
    }
  }

  const handleChangeTransfer = (value) => {
    setSelectedRoles(value)
    if (value !== selectedRoles) {
      setSelectedRoles(value)
    }
  }

  const transfer = async () => {
    setTransferSpin(true)
    if (selectedRoles && selected.length > 0) {
      setSelectedRoles(selectedRoles)
      const data = {
        roles: selectedRoles,
        lines: selected,
      }
      const response = await api.post('docentetes/transfer', data)
      setSelectedRoles(null)
      setSelected([])
      fetchData()
      message.success('Articles transférés avec succès')
    } else {
      message.error('Aucun article sélectionné')
    }
    setTransferSpin(false)
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
    setConfirmLoading(true)
    await api.post(`docentetes/palettes/validate/${id}`, {
      lines: selected,
    })
    setOpen(false)
    setConfirmLoading(false)
    fetchData()
  }

  const handleCancel = () => {
    setOpen(false)
  }

  
   const getStatusColor = (status) => {
     return status?.color || 'gray'
   }

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

            {data?.docentete?.document && (
              <Tag color={getStatusColor(data?.docentete?.document?.status)}>
                {data?.docentete?.document?.status.name}
              </Tag>
            )}
          </h1>
        </div>

        <div className='flex gap-2'>
          {(Number(documentCompany?.pivot?.status_id) === 8 ||
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
            label: 'Type de document',
            value:
              data.docentete.DO_Piece &&
              getDocumentType(data.docentete.DO_Piece),
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
                    selected.length ===
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
                Profondeur
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

              <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                Quantité
              </th>
            </Tr>
          </Thead>
          <tbody className='bg-white'>
            {loading ? (
              [...Array(4)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(10)].map((_, colIndex) => (
                    <td className='px-6 py-4' key={colIndex}>
                      <div className='h-4 bg-gray-200 rounded w-3/4 animate-pulse'></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.doclignes?.length > 0 ? (
              currentItems.map((item, index) => (
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
                        checked={selected.includes(item.line?.id || item.id)}
                        onChange={() => handleSelect(item.line?.id || item.id)}
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
                    <div className='text-sm font-medium text-gray-900'>
                      {item?.Nom || item.article.Nom || item?.DL_Design || '__'}{' '}
                      {item?.article?.Description || null}
                    </div>
                    {item?.article?.Description && (
                      <div className='text-xs text-gray-500 mt-1'>
                        {item.article.Description}
                      </div>
                    )}
                  </td>

                  <td className='px-2 text-sm border-r border-gray-100'>
                    {item.Hauteur > 0
                      ? Math.floor(item.Hauteur)
                      : Math.floor(item.article?.Hauteur) || '__'}
                  </td>

                  <td className='px-2 text-sm border-r border-gray-100'>
                    {Math.floor(
                      item.Largeur ? item.Largeur : item?.article?.Largeur
                    ) || '__'}
                  </td>
                  <td className='px-2 text-sm border-r border-gray-100'>
                    {item.Profondeur | item?.article?.Profonduer || '__'}
                  </td>

                  <td className='px-2 text-sm border-r border-gray-100'>
                    {item?.Episseur | item?.article?.Episseur}
                  </td>

                  <td className='px-2 text-sm border-r border-gray-100'>
                    {(item.Couleur ? item.Couleur : item?.article?.Couleur) ||
                      '__'}
                  </td>

                  <td className='px-2 text-sm border-r border-gray-100'>
                    {(item.Chant ? item.Chant : item?.article?.Chant) || '__'}
                  </td>

                  <td className='px-4 py-2'>
                    <span className='inline-flex justify-center px-2 py-1 w-full rounded-md text-sm font-semibold bg-green-50 text-green-700 border border-green-200'>
                      {Math.floor(item.DL_Qte)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='6' className='p-8'>
                  <div className='text-center'>
                    <svg
                      className='mx-auto h-12 w-12 text-gray-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1}
                        d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                      />
                    </svg>
                    <h3 className='mt-2 text-sm font-medium text-gray-900'>
                      Aucun article trouvé
                    </h3>
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
          // Mobile loading skeleton
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
          currentItems.map((item, index) => (
            <div
              key={index}
              className='bg-white border-1 border-gray-200 p-4 mb-4 shadow-sm'
            >
              <div className='flex justify-between items-center'>
                <span className='font-medium text-gray-900'>
                  <div className='font-bold text-gray-900'>
                    {item?.Nom || item.article.Nom || item?.DL_Design || '__'}{' '}
                    {item?.article?.Description || null}
                  </div>
                  {item?.article?.Description && (
                    <div className='text-sm text-gray-500'>
                      {item.article.Description}
                    </div>
                  )}
                </span>
                <span className='px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                  {Math.floor(item.DL_Qte)}
                </span>
              </div>

              <div className='h-px bg-gray-200 my-3'></div>

              <div className='grid grid-cols-2 gap-y-2 text-sm'>
                <div className='text-gray-500'>
                  Hauteur:
                  {item.Hauteur > 0 ? (
                    <strong>{Math.floor(item.Hauteur)}</strong>
                  ) : (
                    <strong>{Math.floor(item.article?.Hauteur)}</strong>
                  )}
                </div>
                <div className='text-gray-500'>
                  Largeur:{' '}
                  {Math.floor(
                    item.Largeur ? item.Largeur : item?.article?.Largeur
                  ) || '__'}
                </div>
                <div className='text-gray-500'>
                  Profondeur:{' '}
                  {Math.floor(
                    item.Profondeur ? item.Profondeur : item.article?.Profonduer
                  ) || '__'}
                </div>
                <div className='text-gray-500'>
                  Epaisseur: {Math.floor(item.Episseur) || '__'}
                </div>
              </div>

              <div className='h-px bg-gray-200 my-3'></div>

              <div className='space-y-1 text-sm'>
                <div className='text-gray-500'>
                  Couleur:{' '}
                  <strong>
                    {(item.article ? item.article.Couleur : item.Couleur) ||
                      '__'}
                  </strong>
                </div>
                <div className='text-gray-500'>
                  Chant:{' '}
                  {(item.article ? item.article.Chant : item.Chant) || '__'}
                </div>
                <div className='text-gray-500'>
                  Référence: {item.AR_Ref || '__'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='bg-white border-1 border-gray-200 p-8 text-center'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              Aucun article trouvé
            </h3>
          </div>
        )}
      </div>
    </div>
  )
}

export default Controller
