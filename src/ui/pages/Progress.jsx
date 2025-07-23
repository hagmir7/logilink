import React, { useEffect, useState } from 'react';
import {User, Calendar, RefreshCcw, Loader2 } from 'lucide-react';
import { getExped, locale } from '../utils/config';
import { Select, DatePicker, Input } from 'antd';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const { Search } = Input
const { RangePicker } = DatePicker;

const Progress = () => {
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
      getDocuments()
    }, [search, dateFilter])

    const getDocuments = async () => {
      
      
      setLoading(true)
      const { data } = await api.get(`documents?search=${search}&dates=${dateFilter || ''}`)
      setDocuments(data)
      setLoading(false)
    }
    


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const ProgressBar = ({ progress }) => (
    <div className='w-full bg-gray-200 rounded-full h-2'>
      <div
        className='bg-green-500 h-2 rounded-full transition-all duration-300'
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  )

    const handleShow = async (id) => {
      try {
        const url = `document/${id}/progress`
        if (window.electron && typeof window.electron.openShow === 'function') {
          await window.electron.openShow({
            width: 1200,
            height: 700,
            url,
          })
        } else {
          navigate(`document/${id}/progress`)
        }
      } catch (error) {
        console.error('Error navigating to article:', error)
      }
    }

  return (
    <div className='min-h-screen bg-white'>
      <div className=''>
        {/* Orders Table */}
        <div>
          <div className='px-6 py-4'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Suivie des Commandes {search}
            </h2>
          </div>
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-4 px-3 md:px-4 border-b border-gray-200'>
            {/* Search input - full width on mobile */}
            <div className='flex-1 min-w-0'>
              <Search
                placeholder='Pièce, Client, Réf...'
                size='large'
                onChange={(e) => setSearch(e.target.value)}
                className='w-full'
              />
            </div>

            {/* Date range picker - responsive width */}
            <div className='w-full sm:w-auto sm:min-w-[240px]'>
              <RangePicker
                size='large'
                locale={locale}
                onChange={(dates, dateStrings) => {
                  setDateFilter(dateStrings)
                }}
                className='h-10 w-full'
                placeholder={['Date début', 'Date fin']}
              />
            </div>

            {/* Status select - responsive width */}
            <div className='w-full sm:w-auto sm:min-w-[140px]'>
              <Select
                defaultValue=''
                className='h-10 w-full'
                size='large'
                placeholder='Statut'
                onChange={(value) => value}
                options={[
                  { value: '', label: 'Tous les statuts' },
                  { value: '1', label: 'En attente' },
                  { value: '2', label: 'Transféré' },
                  { value: '3', label: 'Reçu' },
                  { value: '4', label: 'Fabrication' },
                ]}
              />
            </div>

            {/* Refresh button - responsive text */}
            <button
              type='button'
              onClick={() => getDocuments()}
              className='h-10 px-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label='Rafraîchir les données'
            >
              {loading ? (
                <Loader2 className='animate-spin text-blue-500' size={17} />
              ) : (
                <RefreshCcw size={17} />
              )}
              <span className='whitespace-nowrap hidden sm:inline'>
                Rafraîchir
              </span>
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Commande
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Client
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Statut
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Progression
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Lignes
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Dates
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {documents.map((order) => (
                  <tr
                    key={order.id}
                    onClick={()=> handleShow(order.piece)}
                    className='hover:bg-gray-50 transition-colors duration-200'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {order.piece}
                        </div>
                        <div className='text-sm text-gray-500'>
                          Réf: {order.ref}
                        </div>
                        <div className='text-xs text-gray-400'>
                          Expédition: {getExped(order.expedition)}
                        </div>
                      </div>
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <User className='h-4 w-4 text-gray-400 mr-2' />
                        <span className='text-sm font-medium text-gray-900'>
                          {order.client}
                        </span>
                      </div>
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className='inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white'
                        style={{ backgroundColor: order.status.color }}
                      >
                        {order.status.name}
                      </span>
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-600'>
                            {order.current_qte}/{order.required_qte}
                          </span>
                          <span className='font-medium text-gray-900'>
                            {order.progress}%
                          </span>
                        </div>
                        <ProgressBar progress={order.progress} />
                      </div>
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                        {order.lines_count} - {order.company}
                      </span>
                    </td>

                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <div className='space-y-1'>
                        <div className='flex items-center'>
                          <Calendar className='h-3 w-3 mr-1' />
                          <span className='text-xs'>
                            Créé: {formatDate(order.created_at)}
                          </span>
                        </div>
                        <div className='flex items-center'>
                          <Calendar className='h-3 w-3 mr-1' />
                          <span className='text-xs'>
                            MAJ: {formatDate(order.updated_at)}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && (
              <div className='flex flex-col items-center justify-center h-64'>
                <Loader2
                  className='animate-spin text-blue-500 mb-2'
                  size={32}
                />
                <span className='text-gray-600'>Chargement...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Progress
