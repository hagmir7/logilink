import React, { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import { Badge, Button, Empty, message, Select, Tag } from 'antd'
import { getExped } from '../utils/config'
import { useAuth } from '../contexts/AuthContext'
import Spinner from './ui/Spinner'
import { api } from '../utils/api'
import { Link, useNavigate } from 'react-router-dom'

// Mock utility functions for demo
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

function ShippingTable({ documents = [], onSelectOrder, loading }) {
  // Sample data for demonstration  

  const { roles, user } = useAuth();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate()
  // const [companies, setCompanies] = useState([]);



  const fetchData = async () => {
    try {
      const response = await api.get('roles/chargement');
      setUsers(response.data);
      
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchData();
  
  }, []);


  const handleChange = async (value, document_id) => {
    api.post(`/documents/chargement/${document_id}`, {'user_id' : value});
    message.success('Agent attribué avec succès');
  };


  const handleShow = async (id) => {
    try {
      const url = `/document/${id}`
      if (window.electron && typeof window.electron.openShow === 'function') {
        await window.electron.openShow({
          width: 1200,
          height: 700,
          url,
        })
      } else {
        navigate(`/document/${id}`)
      }
    } catch (error) {
      console.error('Error navigating to article:', error)
    }
  }



  const getStatusBadgeColor = (color) => {
    const colorMap = {
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colorMap[color] || colorMap.gray
  }

  const getExpeditionColor = (expedit) => {
    const colorMap = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-green-100 text-green-800',
    }
    return colorMap[expedit] || 'bg-gray-100 text-gray-800'
  }

  

  return (
    <div className='w-full '>
      {/* Desktop Table View */}
      <div className='hidden lg:block overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              {roles('commercial') && (
                <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Document
                </th>
              )}
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Préparation
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Statut
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Expédition
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Client
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Référence
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date Document
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date Prévue
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {documents.map((item, index) => (
              <tr
                key={index}
                className='hover:bg-gray-50 cursor-pointer transition-colors duration-200 border-b border-gray-200'
                onDoubleClick={() =>
                  onSelectOrder &&
                  handleShow(item.piece_bl || item.docentete.DO_Piece)
                }
              >
                {roles('commercial') && (
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-bold text-gray-900'>
                      {item.piece_bl || item?.docentete?.DO_Piece || '__'}
                    </div>
                  </td>
                )}

                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-bold text-gray-900'>
                    {item.piece || '__'}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <Tag
                    color={item?.status?.color || item?.document?.status?.color}
                    className='text-xl'
                  >
                    {item?.status?.name ||
                      item?.document?.status?.name ||
                      'En attente'}
                  </Tag>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExpeditionColor(
                      item.expedition || item.DO_Expedit
                    )}`}
                  >
                    {getExped(item.expedition || item.DO_Expedit)}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='text-sm text-gray-900 font-medium'>
                    {item.client_id || item.DO_Tiers}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {item.ref || item.DO_Ref}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {formatDate(
                    new Date(item?.docentete?.DO_Date || item.DO_Date)
                  )}
                </td>

                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {formatDate(
                    new Date(item?.docentete?.DO_DateLivr || item?.DO_DateLivr)
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {['11', '12', '13'].includes(
                    item.companies.find(
                      (company) => company.id == user.company_id
                    )?.pivot.status_id
                  ) &&
                    roles('preparation') && (
                      <Select
                        placeholder='Agent de chargement'
                        defaultValue={item.user_id}
                        style={{ width: 170 }}
                        allowClear
                        onChange={(value) => handleChange(value, item.id)}
                        options={users}
                      />
                    )}

                  {roles('chargement') && (
                    <Link to={`/chargement/${item.piece}`}>
                      <Button>Chargement</Button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className='lg:hidden'>
        {documents.map((item, index) => {
          const pieceBL = item.piece_bl || item?.docentete?.DO_Piece || 0
          const piecePL = item?.piece || '__'

          return (
            <div
              key={index}
              className='border-b border-gray-300 p-6 hover:bg-gray-100 cursor-pointer transition-all duration-200'
            >
              {/* Header with document number and status */}
              <div
                className='flex justify-between items-start mb-4'
                onClick={() => onSelectOrder(piecePL)}
              >
                <div className='flex items-center'>
                  <span className='text-2xl font-extrabold text-gray-900'>
                    {roles('commercial') ? pieceBL : piecePL}
                  </span>
                  {(item.DO_Reliquat === 1 || item.reliquat === 1) && (
                    <span className='ml-3 p-2 bg-gray-200 text-gray-700 rounded'>
                      <Settings size={18} />
                    </span>
                  )}
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeColor(
                    item?.status?.color || item?.document?.status?.color
                  )}`}
                >
                  {item?.status?.name ||
                    item?.document?.status?.name ||
                    'En attente'}
                </span>
              </div>

              {/* Expedition and Client badges */}
              <div className='flex flex-wrap gap-3 mb-4'>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getExpeditionColor(
                    item.expedition || item.DO_Expedit
                  )}`}
                >
                  {getExped(item.expedition || item.DO_Expedit)}
                </span>
                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-200 text-blue-900'>
                  {item.client_id || item.DO_Tiers}
                </span>
              </div>

              {/* Details */}
              <div className='space-y-3 text-base'>
                <div className='flex justify-between text-xl'>
                  <span className='text-gray-600 font-medium'>Référence:</span>
                  <span className='font-semibold text-gray-900'>
                    {item.ref || item.DO_Ref}
                  </span>
                </div>

                <div className='flex justify-between text-xl'>
                  <span className='text-gray-600 font-medium'>
                    Date prévue:
                  </span>
                  <span className='font-semibold text-gray-900'>
                    {formatDate(
                      new Date(
                        item?.docentete?.DO_DateLivr || item?.DO_DateLivr
                      )
                    )}
                  </span>
                </div>

                <div className='flex justify-between items-center text-xl'>
                  <span className='text-gray-600 font-medium'>Palettes:</span>
                  <Tag className='font-bold text-gray-900'>
                    <div className='font-extrabold text-xl px-4 py-2'>
                      {item?.palettes_count}
                    </div>
                  </Tag>
                </div>
              </div>

              <Link to={`/chargement/${item.piece}`}>
                <Button className='mt-4 w-full text-lg py-3 rounded-xl' style={{ fontSize: "30px", padding: "30px" }}>
                  🚚 Chargement
                </Button>
              </Link>
            </div>
          )
        })}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        documents.length === 0 && (
          <Empty className='mt-10' description='Aucun document à afficher' />
        )
      )}
    </div>
  )
}

export default ShippingTable;