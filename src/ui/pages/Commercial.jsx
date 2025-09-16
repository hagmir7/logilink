import {
  RefreshCcw,
  ArrowRight,
  Undo2,
  LoaderCircle,
  PrinterCheck,
  Settings,
  Edit2,
  Wrench,
} from 'lucide-react'
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getExped, getDocumentType, uppercaseFirst, getStatus } from '../utils/config';
import { useParams } from 'react-router-dom';
import { Button, Checkbox, Empty, message, Popconfirm, Select, Tag } from 'antd';
import { useAuth } from '../contexts/AuthContext'
import Skeleton from '../components/ui/Skeleton'
import PrintDocument from '../components/PrintDocument';
import { DocumentPalettesModal } from '../components/DocumentPalettesModal';
import ResetPrinter from '../components/ResetPrinter';

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
      const response = await api.get(`docentetes/${id}`)
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
        setSelected(data.doclignes.map((item) => item.line.id))
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
      { value: 3, label: 'Asti' },
      { value: 4, label: 'Stile' },
    ]
    const company = companies.find((c) => c.value === Number($id))
    return company ? company.label : null
  }

  const transfer = async () => {
    setTransferSpin(true)
    if (selectedCompany && selected.length > 0) {

      try {
        setSelectedCompany(selectedCompany)
        const data = {
          company: selectedCompany,
          lines: selected,
        }
        await api.post('docentetes/transfer', data)
        setSelectedCompany(null)
        setSelected([])
        fetchData()
        message.success('Articles transférés avec succès')
      } catch (error) {
        console.error(error);
        message.error(error.response.data.message || "Can't trnsfer the article");
        
      }
      
    
      
    } else {
      message.warning('Aucun article sélectionné')
    }
    setTransferSpin(false)
  }

  const listTransfer = [
    { value: 1, label: 'Intercocina' },
    { value: 2, label: 'Seriemoble' },
  ]

  const reset = async () => {
    try {
      await api.get(`docentetes/reset/${id}`)
      message.success('Réinitialiser avec succès')
      fetchData()
    } catch (error) {
      message.error(error?.response?.data?.message)
      console.error(error);
    }
  }

   const getStatusColor = (status) => {
     return status?.color || 'gray'
   }


   
  return (
    <div className='h-full flex flex-col bg-gray-50'>
      <div className='flex-shrink-0 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto p-4'>
          {/* Header */}
          <div className='flex justify-between items-center mb-4'>
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
                  <Tag
                    color={getStatusColor(data?.docentete?.document?.status)}
                  >
                    {data?.docentete?.document?.status.name}
                  </Tag>
                )}
              </h1>
            </div>
            <div className='flex gap-3'>
              <Button
                onClick={fetchData}
                className='flex items-center gap-2 hover:shadow-md transition-shadow'
              >
                {loading ? (
                  <LoaderCircle className='animate-spin h-4 w-4' />
                ) : (
                  <RefreshCcw className='h-4 w-4' />
                )}
                Actualiser
              </Button>
              <PrintDocument
                doclignes={data.doclignes}
                docentete={data.docentete}
              />
             {data?.docentete?.document && (
              <DocumentPalettesModal
                countPalettes={data.docentete.document.palettes?.length ?? 0}
                documentPiece={
                  data.docentete.document?.piece_fa ||
                  data.docentete.document?.piece_bl ||
                  data.docentete.document?.piece ||
                  data.docentete?.DO_Piece
                }
              />
            )}

            </div>
          </div>

          {/* Document Info Cards */}
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

          {/* Table Header Controls */}
          <div className='flex justify-between items-center'>
            <h2 className='text-md font-semibold text-gray-800'>Articles</h2>
            <div className='flex gap-3'>


              <ResetPrinter document={data?.docentete?.document} fetchData={fetchData} />
          


              {data.docentete.document &&
                Number(data.docentete.document.status_id) < 8 && (
                  <Popconfirm
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
                  </Popconfirm>
                )}

              <Select
                placeholder='Transférer vers'
                style={{ width: 200 }}
                value={selectedCompany}
                onChange={handleChangeTransfer}
                options={listTransfer}
              />

              <Button
                type='primary'
                onClick={transfer}
                loading={transferSpin}
                className='flex items-center gap-2 hover:shadow-md transition-shadow'
              >
                Transfer <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex-1 overflow-hidden'>
        <div className='max-w-7xl mx-auto p-4 h-full'>
          {/* Desktop Table */}
          <div className='hidden md:block h-full'>
            <div className='bg-white border border-gray-200 rounded-lg h-full flex flex-col overflow-hidden'>
              <div className='flex-1 overflow-hidden'>
                <div className='h-full overflow-auto'>
                  <table className='w-full border-collapse'>
                    <thead className='sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-300 shadow-sm z-10'>
                      <tr>
                        <th className='px-2 py-1 text-left border-r border-gray-200'>
                          <Checkbox
                            onChange={handleSelectAll}
                            checked={
                              selected.length === data.doclignes.length &&
                              data.doclignes.length > 0
                            }
                          />
                        </th>
                         <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200'>
                          État
                        </th>
                        <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200'>
                          Ref Article
                        </th>
                        <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200'>
                          Piece
                        </th>
                        <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200'>
                          Hauteur
                        </th>
                        <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200'>
                          Largeur
                        </th>
                       
                        <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200'>
                          Epaisseur
                        </th>

                        <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200'>
                          Couleur
                        </th>

                        <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200'>
                          Chant
                        </th>
                        <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200'>
                          Description
                        </th>
                        <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                          QTE CMD
                        </th>

                         <th className='px-2 py-1 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                           QTE PREP
                        </th>

                    
                      </tr>
                    </thead>
                    <tbody className='bg-white'>
                      {loading ? (
                        [...Array(4)].map((_, rowIndex) => (
                          <tr key={rowIndex}>
                            {[...Array(12)].map((_, colIndex) => (
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
                              {item?.line ? (
                                <Tag
                                  color={
                                    item.line.company_id == 1
                                      ? 'success'
                                      : 'processing'
                                  }
                                  className='shadow-sm'
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
                                  '__'}
                              </div>
                              {/* {item?.article?.Description && (
                                <div className='text-xs text-gray-500 mt-1'>
                                  {item.article.Description}
                                </div>
                              )} */}
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
                              {(item.Couleur
                                ? item.Couleur
                                : item?.article?.Couleur) || '__'}
                            </td>

                            <td className='px-2 text-sm border-r border-gray-100'>
                              {(item.Chant
                                ? item.Chant
                                : item?.article?.Chant) || '__'}
                            </td>

                            <td className='px-2 text-sm border-r border-gray-100  whitespace-nowrap'>
                              {item?.Description} {item?.Rotation}{' '}
                              {item?.Poignee}{' '}
                            </td>

                            <td className='px-4 py-2'>
                              <span className='inline-flex justify-center px-2 py-1 w-full rounded-md text-sm font-semibold bg-green-50 text-green-700 border border-green-200'>
                                {Math.floor(item.DL_Qte)}
                              </span>
                            </td>

                             <td className='px-4 py-2'>
                              <span className='inline-flex justify-center px-2 py-1 w-full rounded-md text-sm font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200'>
                                {Math.floor(item.DL_QteBL)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan='6' className='p-8'>
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

          {/* Mobile Cards */}
          <div className='block md:hidden'>
            <div className='space-y-4'>
              {loading ? (
                // Mobile loading skeleton
                <div className='space-y-4'>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm animate-pulse'
                    >
                      <div className='flex justify-between mb-3'>
                        <div className='h-5 bg-gray-200 rounded w-2/3'></div>
                        <div className='h-6 bg-gray-200 rounded w-16'></div>
                      </div>
                      <div className='h-px bg-gray-200 my-3'></div>
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
                    className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900 text-lg'>
                          {uppercaseFirst(item.DL_Design)}
                        </h3>
                        {item?.article?.Description && (
                          <p className='text-sm text-gray-500 mt-1'>
                            {item.article.Description}
                          </p>
                        )}
                      </div>
                      <Tag color='success' className='ml-2 font-semibold'>
                        {Math.floor(item.DL_Qte || 0)}
                      </Tag>
                    </div>

                    <div className='flex justify-between items-center mb-3'>
                      <span className='text-sm text-gray-500'>
                        Référence:{' '}
                        <span className='font-semibold text-gray-900'>
                          {item.AR_Ref || '__'}
                        </span>
                      </span>
                    </div>

                    <div className='border-t border-gray-200 pt-3'>
                      <div className='grid grid-cols-2 gap-3 mb-3'>
                        <div className='text-sm'>
                          <span className='text-gray-500 font-medium'>H:</span>{' '}
                          <span className='font-semibold text-gray-900'>
                            {Math.floor(
                              item.article ? item.article.Hauteur : item.Hauteur
                            ) || '__'}
                          </span>
                        </div>
                        <div className='text-sm'>
                          <span className='text-gray-500 font-medium'>L:</span>{' '}
                          <span className='font-semibold text-gray-900'>
                            {Math.floor(
                              item.article ? item.article.Largeur : item.Largeur
                            ) || '__'}
                          </span>
                        </div>
                        <div className='text-sm'>
                          <span className='text-gray-500 font-medium'>P:</span>{' '}
                          <span className='font-semibold text-gray-900'>
                            {Math.floor(
                              item.Profondeur
                                ? item.Profondeur
                                : item.article?.Profonduer
                            ) || '__'}
                          </span>
                        </div>
                        <div className='text-sm'>
                          <span className='text-gray-500 font-medium'>
                            Epaisseur:
                          </span>{' '}
                          <span className='font-semibold text-gray-900'>
                            {Math.floor(
                              item.article
                                ? item.article.Episseur
                                : item.Episseur
                            ) || '__'}
                          </span>
                        </div>
                      </div>

                      <div className='border-t border-gray-200 pt-3'>
                        <div className='grid grid-cols-2 gap-3'>
                          <div className='text-sm'>
                            <span className='text-gray-500 font-medium'>
                              Couleur:
                            </span>{' '}
                            <span className='font-semibold text-gray-900'>
                              {(item.article
                                ? item.article.Couleur
                                : item.Couleur) || '__'}
                            </span>
                          </div>
                          <div className='text-sm'>
                            <span className='text-gray-500 font-medium'>
                              Chant:
                            </span>{' '}
                            <span className='font-semibold text-gray-900'>
                              {(item.article
                                ? item.article.Chant
                                : item.Chant) || '__'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm'>
                  <Empty description='Aucun article trouvé' />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Commercial