import { RefreshCcw, Clipboard, ArrowRight, Hourglass, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { getExped, getDocumentType } from '../utils/config'
import { useParams } from 'react-router-dom'
import { Button, Checkbox, message, Select, Tag } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import Skeleton from '../components/ui/Skeleton'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import SkeletonTable from '../components/ui/SkeletonTable'
import EmptyTable from '../components/ui/EmptyTable'

function Controller() {
  const { id } = useParams();
  const [data, setData] = useState({ docentete: {}, doclignes: [] });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState();
  const [transferSpin, setTransferSpin] = useState(false);
  const { roles } = useAuth();

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`docentete/${id}`)

      setData(response.data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error('Failed to fetch data:', err)
    }
  }
  useEffect(() => {
    fetchData()
  }, [id])


  const currentItems = data?.doclignes || []

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      if (roles('commercial')) {
        setSelected(data.doclignes.map((item) => item.cbMarq))
      } else {
        console.log(data.docentete)
        setSelected(data.doclignes.map((item) => item.line.id))
      }
    } else {
      setSelected([])
    }
  }

  const handleChangeTransfer = (value) => {
    setSelectedTransfer(value)
    if (value !== selectedTransfer) {
      setSelectedTransfer(value)
    }
  }

  const getCompany = ($id) => {
    const companies = [
      { value: 1, label: 'Inter' },
      { value: 2, label: 'Serie' },
    ]

    const company = companies.find((c) => c.value === Number($id))
    return company ? company.label : null
  }

  const getRoles = (currentRole) => {
    const allRoles = [
      { id: 1, name: 'supper_admin' },
      { id: 2, name: 'admin' },
      { id: 3, name: 'preparation' },
      { id: 4, name: 'Preparation Cuisine' },
      { id: 5, name: 'Preparation Trailer' },
      { id: 6, name: 'Fabrication' },
      { id: 7, name: 'Montage' },
      { id: 8, name: 'Magasinier' },
      { id: 10, name: 'Commercial' },
      { id: 11, name: 'Expedition' },
    ]

    const role = allRoles.find((role) => role.id == currentRole)
    return role ? role.name : currentRole
  }

  const transfer = async () => {
    setTransferSpin(true)

    if (selectedTransfer && selected.length > 0) {
      setSelectedTransfer(selectedTransfer)
      const data = {
        transfer: selectedTransfer,
        lines: selected,
      }
      const response = await api.post('docentete/transfer', data)
      console.log(response)

      setSelectedTransfer(null)
      setSelected([])
      fetchData()
      message.success('Company changed successfully')
    } else {
      message.error('No selected data')
    }
    setTransferSpin(false)
  }

  let listTransfer = [
    { value: 4, label: 'Preparation Cuisine' },
    { value: 5, label: 'Preparation Trailer' },
    { value: 6, label: 'Fabrication' },
    { value: 7, label: 'Montage' },
    { value: 8, label: 'Magasinier' },
  ]


  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center space-x-3'>
          <h1 className='text-xl font-bold text-gray-800'>
            {data.docentete.DO_Piece
              ? `Commande ${data.docentete.DO_Piece}`
              : 'Chargement...'}
          </h1>
        </div>
        <button
          onClick={fetchData}
          className='flex items-center px-3 py-2 bg-white border-1 border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700 transition'
        >
          {loading ? (
            <RefreshCcw className='animate-spin h-4 w-4 mr-2' />
          ) : (
            <RefreshCcw className='h-4 w-4 mr-2' />
          )}
          Rafraîchir
        </button>
      </div>

      {/* Document Info */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border-2 border-gray-200 p-4 mb-6'>
        <div className='flex flex-col'>
          <span className='text-sm text-gray-500'>Client</span>
          <span className='font-medium'>
            {data.docentete.DO_Tiers || <Skeleton />}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-sm text-gray-500'>Référence</span>
          <span className='font-medium'>
            {data.docentete.DO_Ref || <Skeleton />}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-sm text-gray-500'>Expédition</span>
          <span className='font-medium'>
            {getExped(data.docentete.DO_Expedit) || <Skeleton />}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-sm text-gray-500'>Type de document</span>
          <span className='font-medium'>
            {(data.docentete.DO_Piece &&
              getDocumentType(data.docentete.DO_Piece)) || <Skeleton />}
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Détails des articles
        </h2>
        <div className='flex gap-3'>
          <Select
            defaultValue='Transférer vers'
            style={{ width: 200 }}
            onChange={handleChangeTransfer}
            options={listTransfer}
          />

          <Button onClick={transfer} loading={transferSpin}>
            Transfer <ArrowRight size={18} />{' '}
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className='hidden md:block overflow-x-auto'>
        <Table className='min-w-full bg-white border-2 border-gray-200 overflow-hidden'>
          <Thead className='bg-gray-50 border-gray-200 border-2'>
            <Tr>
              <Th>
                <Checkbox
                  onChange={handleSelectAll}
                  checked={
                    selected.length === data.doclignes.length &&
                    data.doclignes.length > 0
                  }
                />
              </Th>
              <Th>Etat</Th>
              <Th>Ref Article</Th>
              <Th>Piece</Th>
              <Th>Dimensions</Th>
              <Th>Matériaux</Th>
              <Th>Qte</Th>
              <Th>Qte Inter</Th>
              <Th>Qte Serie</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? <SkeletonTable /> : data.doclignes?.length > 0 ? (
              currentItems.map((item, index) => (
                <Tr key={index}>

                  <Td>
                   <Checkbox checked={selected.includes(item.line?.id || item.id)} onChange={() => handleSelect(item.line?.id || item.id)} />
                  </Td>

                  <Td>
                    {item.line?.role_id > 0 ? <Tag color="#2db7f5">{getRoles(item.line.role_id)}</Tag> : item.line?.completed ? <CheckCircle size={20} color='green'  /> : "__"}
                  </Td>

                  <Td>{item.AR_Ref || '__'}</Td>
                  <Td>
                    {item.article ? item.article.Nom : item?.Nom || '__'}{' '}
                    {item?.article?.Description || null}
                  </Td>
                  <Td>
                    <div className='text-sm text-gray-500'>
                      H:{' '}
                      {Math.floor(
                        item.article ? item.article.Hauteur : item.Hauteur
                      ) || '__'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      L:{' '}
                      {Math.floor(
                        item.article ? item.article.Largeur : item.Largeur
                      ) || '__'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      P:{' '}
                      {Math.floor(
                        item.article ? item.article.Profondeur : item.Profondeur
                      ) || '__'}
                    </div>
                  </Td>
                  <Td>
                    <div className='text-sm text-gray-500'>
                      Couleur:{' '}
                      {(item.article ? item.article.Couleur : item.Couleur) ||
                        '__'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      Chant:{' '}
                      {(item.article ? item.article.Chant : item.Chant) || '__'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      Epaisseur:{' '}
                      {Math.floor(
                        item.article ? item.article.Episseur : item.Episseur
                      ) || '__'}
                    </div>
                  </Td>
                  <Td>
                    <Tag color='green-inverse' >{Math.floor(item.DL_Qte)}</Tag>
                  </Td>

                  <Td>
                    <Tag color={item?.stock?.qte_inter > 0 ? "green-inverse" : "#f50"}  >{item?.stock?.qte_inter}</Tag>
                  </Td>

                  <Td>
                    <Tag color={item?.stock?.qte_serie > 0 ? "green-inverse" : "#f50"}  >{item?.stock?.qte_inter}</Tag>
                  </Td>
                </Tr>
              ))
            ) : (
              <EmptyTable />
            )}
          </Tbody>
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
                  {item.Nom || '__'}
                </span>
                <span className='px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                  {Math.floor(item.DL_Qte)}
                </span>
              </div>

              <div className='h-px bg-gray-200 my-3'></div>

              <div className='grid grid-cols-2 gap-y-2 text-sm'>
                <div className='text-gray-500'>
                  Hauteur: {Math.floor(item.Hauteur) || '__'}
                </div>
                <div className='text-gray-500'>
                  Largeur: {Math.floor(item.Largeur) || '__'}
                </div>
                <div className='text-gray-500'>
                  Profondeur: {Math.floor(item.Profondeur) || '__'}
                </div>
                <div className='text-gray-500'>
                  Epaisseur: {Math.floor(item.Episseur) || '__'}
                </div>
              </div>

              <div className='h-px bg-gray-200 my-3'></div>

              <div className='space-y-1 text-sm'>
                <div className='text-gray-500'>
                  Couleur: {item.Couleur || '__'}
                </div>
                <div className='text-gray-500'>Chant: {item.Chant || '__'}</div>
                <div className='text-gray-500'>
                  Référence: {item.AR_Ref || '__'}
                </div>
              </div>

              <div className='mt-3 flex justify-end'>
                <button className='p-2 text-gray-500 hover:text-gray-700'>
                  <Clipboard className='h-4 w-4' />
                </button>
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

export default Controller;
