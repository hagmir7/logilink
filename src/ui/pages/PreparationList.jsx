import { RefreshCcw, ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getExped, getDocumentType, getStatus } from '../utils/config';
import { useParams } from 'react-router-dom';
import { Button, Empty, message, Spin, Tag } from 'antd';
import Skeleton from '../components/ui/Skeleton';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import SkeletonTable from '../components/ui/SkeletonTable';
import EmptyTable from '../components/ui/EmptyTable';
import { useAuth } from '../contexts/AuthContext';
import PrintDocument from '../components/PrintDocument';
import BackButton from '../components/ui/BackButton';
import PreparationArticleCard from '../components/PreparationArticleCard';


function PreparationList() {
  const { id } = useParams()
  const [data, setData] = useState({ docentete: {}, doclignes: [] })
  const [loading, setLoading] = useState(false)
  const isElectron = Boolean(window?.electron)
  const [loadingId, setLoadingId] = useState(null)

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

  const prepare = async (lineId) => {
    setLoadingId(lineId)
    message.success('Preparation successfully')
    try {
      const response = await api.post('lines/prepare', { line: lineId })
      setData((prev) => ({
        ...prev,
        doclignes: prev.doclignes.map((it) =>
          it.line.id === lineId
            ? {
              ...it,
              line: {
                ...it.line,
                status: {
                  ...it.line.status,
                  name: 'Préparé',
                },
              },
            }
            : it
        ),
      }))
    } catch (error) {
      message.warning(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoadingId(null)
    }
  }

  const { user } = useAuth()

  const company = data?.docentete?.document?.companies?.find(
    (item) => item.id === Number(user.company_id)
  )

  const statusId = Number(company?.pivot?.status_id ?? null)

  return (
    <div className='max-w-7xl mx-auto p-2 md:p-5'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center space-x-2 gap-3'>
          {/* <BackButton /> */}
          <h1 className='text-md font-bold text-gray-900 flex gap-3 items-center p-0 m-0'>
            <span className='text-2xl'>
              {data.docentete.DO_Piece ? data.docentete.DO_Piece : 'Chargement...'}
            </span>

            {data?.docentete?.document && (
              <Tag color={getStatus(statusId)?.color} style={{ height: 25, fontSize: 15 }}>
                {getStatus(statusId)?.name}
              </Tag>
            )}
          </h1>
        </div>
        <div className='flex gap-4'>
          <Button onClick={fetchData} style={{ height: 60, fontSize: 25 }} size='large'>
            {loading ? (
              <Loader2 className='animate-spin text-blue-500' size={25} />
            ) : (
              <RefreshCcw size={25} />
            )}
            <span className='hidden sm:inline'>Rafraîchir</span>
          </Button>
          <PrintDocument
            doclignes={data.doclignes}
            docentete={data.docentete}
            largeSize={true}
          />
        </div>
      </div>

      {/* Document Info */}

      <div className='grid grid-cols-2 md:grid-cols-2 gap-6 bg-white border border-gray-300 rounded-2xl p-6 mb-8'>
        <div className='flex flex-col space-y-1'>
          <span className='text-sm text-gray-800 uppercase tracking-wide'>
            Client
          </span>
          <span className='text-xl font-semibold text-gray-800'>
            {data.docentete.DO_Tiers || <Skeleton />}
          </span>
        </div>

        <div className='flex flex-col space-y-1'>
          <span className='text-sm text-gray-800 uppercase tracking-wide'>
            Référence
          </span>
          <span className='text-xl font-semibold text-gray-800'>
            {data.docentete.DO_Ref || <Skeleton />}
          </span>
        </div>

        <div className='flex flex-col space-y-1'>
          <span className='text-sm text-gray-800 uppercase tracking-wide'>
            Expédition
          </span>
          <span className='text-xl font-semibold text-gray-800'>
            {getExped(data.docentete.DO_Expedit) || <Skeleton />}
          </span>
        </div>

        <div className='flex flex-col space-y-1'>
          <span className='text-sm text-gray-800 uppercase tracking-wide'>
            Type de document
          </span>
          <span className='text-xl font-semibold text-gray-800'>
            {(data.docentete.DO_Piece &&
              getDocumentType(data.docentete.DO_Piece)) || <Skeleton />}
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-3xl font-semibold text-gray-800'>
          Articles ({data.doclignes.length})
        </h2>

        <div className='flex gap-3'>
          <Button
            color='green'
            variant='solid'
            href={`#/preparation/${id}`}
            className='btn'
            style={{ height: 60, fontSize: 25 }}
          >
            Preparation <ArrowRight size={25} />{' '}
          </Button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className='hidden md:block overflow-x-auto'>
        <Table>
          <Thead>
            <Tr>
              <Th>Etat</Th>
              <Th>Piece</Th>
              <Th>Ref Article</Th>
              <Th>Dimensions</Th>
              <Th>Matériaux</Th>
              <Th>Qte</Th>
              <Th>Qte Préparé</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <SkeletonTable />
            ) : data.doclignes?.length > 0 ? (
              currentItems.map((item, index) => (
                <Tr
                  key={index}
                  className={`${item.line.next_role_id == '4' ? 'opacity-40 disabled' : ''
                    }`}
                >
                  <Td>
                    <Tag color={item.line.status.color}>
                      {item.line?.status?.name}
                    </Tag>
                  </Td>
                  <Td className='font-black text-gray-800'>
                    {[item?.Nom, item.article?.Nom, item?.DL_Design].find(v => v && v !== "NULL") || "__"}
                    {item?.Description} {item?.Poignee} {item?.Chant}{' '}
                    {item?.Rotation}
                  </Td>
                  <Td>{item.AR_Ref || '__'}</Td>
                  <Td>
                    <div className='space-y-1'>
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
                          {item.Largeur > 0
                            ? Math.floor(item.Largeur)
                            : Math.floor(item?.article?.Largeur) || '__'}
                        </strong>
                      </div>
                      <div className='text-sm text-gray-600'>
                        <span className='font-medium'>P:</span>{' '}
                        <span className='font-bold'>
                          <span className='font-bold  text-gray-800'>
                            {Math.floor(
                              item.Profondeur
                                ? item.Profondeur
                                : item.article?.Profonduer
                            ) || '__'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </Td>

                  <Td>
                    <div className='text-sm text-gray-500'>
                      Couleur:{' '}
                      <span className='font-bold text-gray-800'>
                        {(item.article ? item.article.Couleur : item.Couleur) ||
                          '__'}
                      </span>
                    </div>
                    <div className='text-sm text-gray-500'>
                      Chant:{' '}
                      <span className='font-bold text-gray-800'>
                        {(item.article ? item.article.Chant : item.Chant) ||
                          '__'}
                      </span>
                    </div>


                    <div className='text-sm text-gray-500'>
                      Epaisseur:{' '}
                      <span className='font-bold text-gray-800'>
                        {Math.floor(item.Episseur ?? item.article?.Episseur) ||
                          '__'}
                      </span>
                    </div>
                  </Td>


                  <Td>
                    <Tag color='green-inverse'>
                      {Math.floor(item.DL_Qte)}
                    </Tag>
                  </Td>

                  <Td>
                    <Tag
                      color={item.DL_QteBL == Math.floor(item.DL_Qte)
                        ? 'green-inverse'
                        : 'red-inverse'
                      }
                    >
                      {Number(item.DL_QteBL || 0)}
                    </Tag>
                  </Td>
                </Tr>
              ))
            ) : (
              <EmptyTable />
            )}
          </Tbody>
        </Table>
      </div>

      <div
        className={`block md:hidden ${isElectron ? 'text-xl space-y-6' : ''}`}
      >
        {loading ? (
          <div className={`space-y-4 ${isElectron ? 'space-y-6' : ''}`}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`bg-white border-2 border-gray-200 rounded-md p-4 space-y-3 animate-pulse ${isElectron ? 'p-6 rounded-xl' : ''
                  }`}
              >
                <div className='flex justify-between'>
                  <div
                    className={`bg-gray-200 rounded ${isElectron ? 'h-8 w-3/4' : 'h-5 w-2/3'
                      }`}
                  ></div>
                  <div
                    className={`bg-gray-200 rounded ${isElectron ? 'h-10 w-24' : 'h-6 w-16'
                      }`}
                  ></div>
                </div>
                <div className='h-px bg-gray-200'></div>
                <div className={`grid grid-cols-2 gap-3 ${isElectron ? 'gap-5' : ''}`}>
                  {[1, 2, 3, 4].map((x) => (
                    <div
                      key={x}
                      className={`bg-gray-200 rounded ${isElectron ? 'h-6' : 'h-4'
                        }`}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : data.doclignes?.length > 0 ? (
          currentItems.map((item, index) => (
            <PreparationArticleCard
              item={item}
              index={index}
              isElectron={isElectron}
              loadingId={loadingId}
              onPrepare={prepare}
            />
          ))
        ) : (
          <div
            className={`bg-white border-2 border-gray-200 rounded-md text-center ${isElectron ? 'p-16 text-xl' : 'p-8'
              }`}
          >
            <Empty description='Aucun article trouvé' />
          </div>
        )}
      </div>
    </div>
  )
}

export default PreparationList
