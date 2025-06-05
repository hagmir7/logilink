import {
  RefreshCcw,
  Clipboard,
  ArrowRight,
  Undo2,
} from 'lucide-react'
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getExped, getDocumentType } from '../utils/config';
import { useParams } from 'react-router-dom';
import { Button, Checkbox, message, Popconfirm, Select, Tag } from 'antd';
import { useAuth } from '../contexts/AuthContext'
import Skeleton from '../components/ui/Skeleton'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import SkeletonTable from '../components/ui/SkeletonTable'
import EmptyTable from '../components/ui/EmptyTable';
import PrintDocument from '../components/PrintDocument';


function Commercial() {
  const { id } = useParams()
  const [data, setData] = useState({ docentete: {}, doclignes: [] })
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState([])
  const [selectedCompany, setSelectedCompany] = useState()
  const [transferSpin, setTransferSpin] = useState(false)
  const { roles } = useAuth()


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
        console.log(data.docentete);

        setSelected(
          data.doclignes.map((item) => item.line.id)
        )
      }
    } else {
      setSelected([])
    }
  }

  const handleChangeTransfer = (value) => {
    setSelectedCompany(value)
    if (value !== selectedCompany) {
      setSelectedCompany(value)
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


  const transfer = async () => {
    setTransferSpin(true)

    if (selectedCompany && selected.length > 0) {
      setSelectedCompany(selectedCompany)
      const data = {
        company: selectedCompany,
        lines: selected,
      }
      const response = await api.post('docentete/transfer', data)
      console.log(response)

      setSelectedCompany(null)
      setSelected([])
      fetchData()
      message.success('Articles transférés avec succès')
    } else {
      message.error('No selected data')
    }
    setTransferSpin(false)
  }

  const listTransfer = [
    { value: 1, label: 'Intercocina' },
    { value: 2, label: 'Seriemoble' },
  ]



  const reset = async () => {
    const response = await api.get(`docentetes/reset/${id}`)
    console.log(response);
    message.success('Réinitialiser avec succès')
  }
  

  return (
    <div className='max-w-7xl mx-auto p-2 md:p-6'>
      <div className='md:flex justify-between items-center mb-6 space-x-3'>
        <div className='flex items-center space-x-3 mb-4 md:mb-0'>
          <h1 className='text-lg font-semibold text-gray-800'>
            {data.docentete.DO_Piece
              ? `Commande ${data.docentete.DO_Piece}`
              : 'Chargement...'}
          </h1>
        </div>
        <div className='flex gap-3'>
          <Button size='large' onClick={fetchData}>
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
        </div>
      </div>

      {/* Document Info */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-gray-300 rounded-2xl p-6 mb-8'>
        <div className='flex flex-col space-y-1'>
          <span className='text-sm text-gray-800 uppercase tracking-wide'>
            Client
          </span>
          <span className='text-base font-semibold text-gray-800'>
            {data.docentete.DO_Tiers || <Skeleton />}
          </span>
        </div>

        <div className='flex flex-col space-y-1'>
          <span className='text-sm text-gray-800 uppercase tracking-wide'>
            Référence
          </span>
          <span className='text-base font-semibold text-gray-800'>
            {data.docentete.DO_Ref || <Skeleton />}
          </span>
        </div>

        <div className='flex flex-col space-y-1'>
          <span className='text-sm text-gray-800 uppercase tracking-wide'>
            Expédition
          </span>
          <span className='text-base font-semibold text-gray-800'>
            {getExped(data.docentete.DO_Expedit) || <Skeleton />}
          </span>
        </div>

        <div className='flex flex-col space-y-1'>
          <span className='text-sm text-gray-800 uppercase tracking-wide'>
            Type de document
          </span>
          <span className='text-base font-semibold text-gray-800'>
            {(data.docentete.DO_Piece &&
              getDocumentType(data.docentete.DO_Piece)) || <Skeleton />}
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Articles
        </h2>
        <div className='flex gap-3'>
          {data.docentete.document ? (
            <Popconfirm
              title='Réinitialiser la commande'
              description='Êtes-vous sûr de vouloir réinitialiser cette tâche ?'
              onConfirm={reset}
              okText='Réinitialiser'
              cancelText='Annuler'
            >
              <Button color='red' size='large' variant='solid'>
                Réinitialiser <Undo2 size={18} />{' '}
              </Button>
            </Popconfirm>
          ) : (
            ''
          )}

          <Select
            defaultValue='Transférer vers'
            size='large'
            style={{ width: 200 }}
            onChange={handleChangeTransfer}
            options={listTransfer}
          />

          <Button size='large' onClick={transfer} loading={transferSpin}>
            Transfer <ArrowRight size={18} />{' '}
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className='hidden md:block overflow-x-auto'>
        <Table>
          <Thead>
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
              <Th>Ref Article</Th>
              <Th>Piece</Th>
              <Th>Dimensions</Th>
              <Th>Matériaux</Th>
              <Th>Quantité</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <SkeletonTable />
            ) : data.doclignes?.length > 0 ? (
              currentItems.map((item, index) => (
                <Tr key={index}>
                  <Td>
                    {item?.line ? (
                      <Tag
                        color={
                          item.line.company_id == 1 ? '#87d068' : '#2db7f5'
                        }
                      >
                        {getCompany(item.line.company_id)}
                      </Tag>
                    ) : (
                      <Checkbox
                        checked={selected.includes(
                          item.line?.id || item.cbMarq
                        )}
                        onChange={() =>
                          handleSelect(item.line?.id || item.cbMarq)
                        }
                      />
                    )}
                  </Td>

                  <Td>{item.AR_Ref || '__'}</Td>
                  <Td>
                    {item.DL_Design} {item?.article?.Description || null}
                  </Td>
                  <Td>
                    <div className='text-sm text-gray-800'>
                      H:{' '}
                      {item.Hauteur > 0 ? (
                        <strong>{Math.floor(item.Hauteur)}</strong>
                      ) : (
                        <strong>{Math.floor(item.article?.Hauteur)}</strong>
                      )}
                    </div>
                    <div className='text-sm text-gray-800'>
                      L:{' '}
                      <strong>
                        {Math.floor(
                          item.Largeur ? item.Largeur : item?.article?.Largeur
                        ) || '__'}
                      </strong>
                    </div>
                    <div className='text-sm text-gray-800'>
                      P:{' '}
                      <strong>
                        {Math.floor(
                          item.Profondeur
                            ? item?.Profondeur
                            : item?.article?.Profondeur
                        ) || '__'}
                      </strong>
                    </div>
                  </Td>
                  <Td>
                    <div className='text-sm text-gray-800'>
                      Couleur:{' '}
                      <strong>
                        {(item.Couleur
                          ? item.Couleur
                          : item?.article?.Couleur) || '__'}
                      </strong>
                    </div>
                    <div className='text-sm text-gray-800'>
                      Chant:{' '}
                      <strong>
                        {(item.Chant ? item.Chant : item?.article?.Chant) ||
                          '__'}
                      </strong>
                    </div>
                    <div className='text-sm text-gray-800'>
                      Epaisseur:{' '}
                      <strong>
                        {Math.floor(
                          item.article
                            ? item?.article?.Episseur
                            : item?.Episseur
                        ) || '__'}
                      </strong>
                    </div>
                  </Td>
                  <Td>
                    <span className='px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                      {Math.floor(item.DL_Qte)}
                    </span>
                  </Td>
                </Tr>
              ))
            ) : (
              <EmptyTable />
            )}
          </Tbody>
        </Table>
      </div>

      {/* Improved Mobile Cards with structure similar to desktop */}
      <div className='block md:hidden'>
        {loading ? (
          // Mobile loading skeleton
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='bg-white border-2 border-gray-200 rounded-md p-4 space-y-3 animate-pulse'
              >
                <div className='flex justify-between'>
                  <div className='h-5 bg-gray-200 rounded w-2/3'></div>
                  <div className='h-6 bg-gray-200 rounded w-16'></div>
                </div>
                <div className='h-px bg-gray-200'></div>
                <div className='grid grid-cols-2 gap-3'>
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
              className='bg-white border-2 border-gray-200 rounded-lg p-4 mb-4'
            >
              <div className='flex justify-between items-center mb-2'>
                <span className='font-black text-gray-800 text-lg'>
                  {item.article ? item.article.Nom : item?.Nom || '__'}{' '}
                  {item?.article?.Description || null}
                </span>
                {/* <Tag color={item.line.status.color}>
                  {item.line?.status?.name}
                </Tag> */}
              </div>

              <div className='flex justify-between items-center mb-2'>
                <span className='text-sm text-gray-500'>
                  Référence:{' '}
                  <span className='font-medium text-gray-700'>
                    {item.AR_Ref || '__'}
                  </span>
                </span>
                <Tag color='green-inverse'>{Math.floor(item.DL_Qte || 0)}</Tag>
              </div>

              <div className='h-px bg-gray-200 my-3'></div>
              <div className='grid grid-cols-2 gap-y-3'>
                <div className='text-sm'>
                  <span className='text-gray-500'>H: </span>
                  <span className='font-bold text-gray-800'>
                    {Math.floor(
                      item.article ? item.article.Hauteur : item.Hauteur
                    ) || '__'}
                  </span>
                </div>
                <div className='text-sm'>
                  <span className='text-gray-500'>L: </span>
                  <span className='font-bold text-gray-800'>
                    {Math.floor(
                      item.article ? item.article.Largeur : item.Largeur
                    ) || '__'}
                  </span>
                </div>
                <div className='text-sm'>
                  <span className='text-gray-500'>P: </span>
                  <span className='font-bold text-gray-800'>
                    {Math.floor(
                      item.article ? item.article.Profondeur : item.Profondeur
                    ) || '__'}
                  </span>
                </div>
                <div className='text-sm'>
                  <span className='text-gray-500'>Epaisseur: </span>
                  <span className='font-bold text-gray-800'>
                    {Math.floor(
                      item.article ? item.article.Episseur : item.Episseur
                    ) || '__'}
                  </span>
                </div>
              </div>

              <div className='h-px bg-gray-200 my-3'></div>

              <div className='grid grid-cols-2 gap-y-3'>
                <div className='text-sm'>
                  <span className='text-gray-500'>Couleur: </span>
                  <span className='font-bold text-gray-800'>
                    {(item.article ? item.article.Couleur : item.Couleur) ||
                      '__'}
                  </span>
                </div>
                <div className='text-sm'>
                  <span className='text-gray-500'>Chant: </span>
                  <span className='font-bold text-gray-800'>
                    {(item.article ? item.article.Chant : item.Chant) || '__'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='bg-white border-2 border-gray-200 rounded-md p-8 text-center'>
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

export default Commercial
