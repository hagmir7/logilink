import { RefreshCcw, Clipboard, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getExped, getDocumentType } from '../utils/config';
import { useParams } from 'react-router-dom';
import { Button, Tag } from 'antd';
import Skeleton from '../components/ui/Skeleton';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import SkeletonTable from '../components/ui/SkeletonTable';
import EmptyTable from '../components/ui/EmptyTable';
import { QRCode } from 'antd';
import { useAuth } from '../contexts/AuthContext';

function PreparationList() {
  const { id } = useParams();
  const [data, setData] = useState({ docentete: {}, doclignes: [] });
  const [loading, setLoading] = useState(false);
  const {roles} = useAuth();

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`docentete/${id}`)

      setData(response.data)
      setLoading(false)
      console.log(response);
      
    } catch (err) {
      setLoading(false)
      console.error('Failed to fetch data:', err)
    }
  }
  useEffect(() => {
    fetchData()
  }, [id])

  const currentItems = data?.doclignes || [];


  const statuses = [
    { id: 1, name: "Transféré" },
    { id: 2, name: "Reçu" },
    { id: 3, name: "Fabrication" },
    { id: 4, name: "Fabriqué" },
    { id: 5, name: "Montage" },
    { id: 6, name: "Monté" },
    { id: 7, name: "Préparation" },
    { id: 8, name: "Préparé" },
    { id: 9, name: "Contrôle" },
    { id: 10, name: "Contrôlé" },
    { id: 11, name: "Prêt" },
    { id: 12, name: "À livrer" },
    { id: 13, name: "Livré" },
  ];

  function getStatus(id) {
    const status = statuses.find(status => status.id === Number(id));
    return status ? status.name : "No Status";
  }

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

        {(data.docentete.document.status_id === 8 && roles('controleur')) ??
          <div className='flex gap-3'>
            <Button href={`#/preparation/${id}`} className='btn'>
              Controle <ArrowRight size={18} />{' '}
            </Button>
          </div>
        }

        <div className='flex gap-3'>
          <Button href={`#/preparation/${id}`} className='btn'>
            Preparation <ArrowRight size={18} />{' '}
          </Button>
        </div>
        

      </div>

      {/* Desktop Table */}
      <div className='hidden md:block overflow-x-auto'>
        <Table className='min-w-full bg-white border-2 border-gray-200 overflow-hidden'>
          <Thead className='bg-gray-50 border-gray-200 border-2'>
            <Tr>
              <Th>Etat</Th>
              <Th>Piece</Th>
              <Th>Ref Article</Th>
              <Th>Dimensions</Th>
              <Th>Matériaux</Th>
              <Th>Qte</Th>
              <Th>Qte Préparé</Th>
              <Th>QR Code</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <SkeletonTable />
            ) : data.doclignes?.length > 0 ? (
              currentItems.map((item, index) => (
                <Tr key={index}>
                  <Td>
                    <Tag color={item.line.status.color}>{item.line.status.name}</Tag>
                  </Td>
                  <Td className='font-black text-gray-800'>
                    {item.article ? item.article.Nom : item?.Nom || '__'}{' '}
                    {item?.article?.Description || null}
                  </Td>
                  <Td>{item.AR_Ref || '__'}</Td>
                  <Td>
                    <div className='text-sm text-gray-500'>
                      H:{' '}
                      <span className='font-bold text-gray-800'>
                        {Math.floor(
                          item.article ? item.article.Hauteur : item.Hauteur
                        ) || '__'}
                      </span>
                    </div>
                    <div className='text-sm text-gray-500'>
                      L:{' '}
                      <span className='font-bold text-gray-800'>
                        {Math.floor(
                          item.article ? item.article.Largeur : item.Largeur
                        ) || '__'}
                      </span>
                    </div>
                    <div className='text-sm text-gray-500'>
                      P:{' '}
                      <span className='font-bold  text-gray-800'>
                        {Math.floor(
                          item.article
                            ? item.article.Profondeur
                            : item.Profondeur
                        ) || '__'}
                      </span>
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
                        {Math.floor(
                          item.article ? item.article.Episseur : item.Episseur
                        ) || '__'}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <Tag color='green-inverse'>{Math.floor(item.DL_Qte)}</Tag>
                  </Td>
                  <Td>
                    <Tag
                      color={
                        item?.line?.palettes?.reduce(
                          (sum, palette) =>
                            sum + Number(palette?.pivot?.quantity || 0),
                          0
                        ) == Math.floor(item.DL_Qte)
                          ? 'green-inverse'
                          : 'red-inverse'
                      }
                    >
                      {item?.line?.palettes?.reduce(
                        (sum, palette) =>
                          sum + Number(palette?.pivot?.quantity || 0),
                        0
                      )}
                    </Tag>
                  </Td>
                  <Td>
                    <QRCode
                      size={100}
                      errorLevel='H'
                      value={`${item.line.id}`}
                    />
                  </Td>

                  {/* <Td>{item?.line?.palettes.length === Math.floor(item.DL_Qte) ? 'Yes' : 'No'}</Td> */}
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
              className='bg-white border-2 border-gray-200 rounded-md p-4 mb-4 shadow-sm'
            >
              <div className='flex justify-between items-center mb-2'>
                <span className='font-black text-gray-800 text-lg'>
                  {item.article ? item.article.Nom : item?.Nom || '__'}{' '}
                  {item?.article?.Description || null}
                </span>
                 <Tag color={item.line.status.color}>{item.line.status.name}</Tag>
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

export default PreparationList;