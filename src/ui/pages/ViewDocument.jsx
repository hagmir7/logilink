import { RefreshCcw, Clipboard, ArrowDownCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { api } from '../utils/api'
import { getExped, getDocumentType } from '../utils/config'
import { useParams } from 'react-router-dom'
import { Button, Checkbox, message, Popconfirm, Select, Tag } from 'antd'
import { useAuth } from '../contexts/AuthContext'

function ViewDocument() {
  const { id } = useParams()
  const [data, setData] = useState({ docentete: {}, doclignes: [] })
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [company, setCompany] = useState();
  const [transferSpin, setTransferSpin] = useState(false);
  const { roles } = useAuth();
  const itemsPerPage = 100;


  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`docentete/${id}`)
      console.log(response);
      
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

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = data?.doclignes?.slice(indexOfFirstItem, indexOfLastItem) || []
  const totalPages = Math.ceil((data?.doclignes?.length || 0) / itemsPerPage)
  const paginate = (pageNumber) => setCurrentPage(pageNumber)


  // Loading skeleton component
  const Skeleton = () => (
    <div className="animate-pulse bg-gray-200 h-4 rounded w-24"></div>
  )

  const handleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    console.log(selected);
    
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(data.doclignes.map(item => item.cbMarq));
    } else {
      setSelected([]);
    }
  };


  const handleChangeCompany = value => {
    setCompany(value);
    if (value !== company) {
      setCompany(value);
      // setIsPopconfirmVisible(true);
    }
  };

  const getCompany = ($id) => {
    const companies = [
      { value: 1, label: 'Inter' },
      { value: 2, label: 'Serie' },
    ]

    const company = companies.find((c) => c.value === Number($id))
    return company ? company.label : null
  }
  
  



  const transfer = async () => {
    setTransferSpin(true);
    if(company && selected.length > 0){
      setCompany(company);
      const data = {
        'company' : company,
        'lines' : selected
      }


      const response = await api.post('docentete/transfer', data)
      console.log(response);
      fetchData()
      message.success('Company changed successfully');
    }else{
      message.error('No selected data');
    }
    setTransferSpin(false);
    
  

  };

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center space-x-3'>
          <h1 className='text-xl font-bold text-gray-800'>
            {data.docentete.DO_Piece
              ? `Bon de commande ${data.docentete.DO_Piece}`
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
        {roles('commercial') && (
          <div className='flex gap-3'>
            <Select
              defaultValue='Entreprise'
              style={{ width: 120 }}
              onChange={handleChangeCompany}
              options={[
                { value: 1, label: 'Intercocina' },
                { value: 2, label: 'Seriemoble' },
              ]}
            />

            <Button onClick={transfer} loading={transferSpin}>
              Transfer <ArrowRight size={18} />{' '}
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className='hidden md:block overflow-x-auto'>
        <table className='min-w-full bg-white border-2 border-gray-200 overflow-hidden'>
          <thead className='bg-gray-50 border-gray-200 border-2'>
            <tr>
              <th className=''>
                <Checkbox
                  onChange={handleSelectAll}
                  className='px-4 text-center ml-12'
                  checked={
                    selected.length === data.doclignes.length &&
                    data.doclignes.length > 0
                  }
                >
                  {' '}
                </Checkbox>
              </th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
                Ref Article
              </th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
                Piece
              </th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
                Dimensions
              </th>
              <th className='hidden lg:table-cell px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
                Matériaux
              </th>
              <th className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
                Quantité
              </th>
              <th className='hidden lg:table-cell px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {loading ? (
              // Loading state
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td colSpan='6' className='px-6 py-4'>
                      <div className='animate-pulse flex space-x-4'>
                        <div className='flex-1 space-y-4 py-1'>
                          <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                          <div className='space-y-2'>
                            <div className='h-4 bg-gray-200 rounded'></div>
                            <div className='h-4 bg-gray-200 rounded w-5/6'></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
            ) : data.doclignes?.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={index} className='hover:bg-gray-50'>
                  <td className='px-4 text-center'>
                    {item.line ? (
                      <Tag color='#f50'>{getCompany(item.line.company_id)}</Tag>
                    ) : (
                      <Checkbox
                        checked={selected.includes(item.cbMarq)}
                        onChange={() => handleSelect(item.cbMarq)}
                      ></Checkbox>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {item.AR_Ref || '__'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-black'>
                    {item.Nom || '__'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-500'>
                      H: {Math.floor(item.Hauteur) || '__'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      L: {Math.floor(item.Largeur) || '__'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      P: {Math.floor(item.Profondeur) || '__'}
                    </div>
                  </td>
                  <td className='hidden lg:table-cell px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-500'>
                      Couleur: {item.Couleur || '__'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      Chant: {item.Chant || '__'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      Epaisseur: {Math.floor(item.Episseur) || '__'}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className='px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                      {Math.floor(item.DL_Qte)}
                    </span>
                  </td>
                  <td className='hidden lg:table-cell px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <button className='text-gray-500 hover:text-gray-700'>
                      <Clipboard className='h-4 w-4' />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan='6'
                  className='px-6 py-4 text-center text-sm text-gray-500'
                >
                  <div className='flex flex-col items-center justify-center py-6'>
                    <svg
                      className='h-12 w-12 text-gray-400'
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
        </table>

        {/* Pagination */}
        {!loading && data.doclignes?.length > itemsPerPage && (
          <div className='flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4'>
            <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-700'>
                  Affichage de{' '}
                  <span className='font-medium'>{indexOfFirstItem + 1}</span> à{' '}
                  <span className='font-medium'>
                    {Math.min(indexOfLastItem, data.doclignes.length)}
                  </span>{' '}
                  sur{' '}
                  <span className='font-medium'>{data.doclignes.length}</span>{' '}
                  résultats
                </p>
              </div>
              <div>
                <nav
                  className='isolate inline-flex -space-x-px rounded-md shadow-sm'
                  aria-label='Pagination'
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                      currentPage === 1
                        ? 'cursor-not-allowed'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className='sr-only'>Previous</span>
                    <svg
                      className='h-5 w-5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      aria-hidden='true'
                    >
                      <path
                        fillRule='evenodd'
                        d='M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          number === currentPage
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                      currentPage === totalPages
                        ? 'cursor-not-allowed'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className='sr-only'>Next</span>
                    <svg
                      className='h-5 w-5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      aria-hidden='true'
                    >
                      <path
                        fillRule='evenodd'
                        d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
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

        {/* Mobile Pagination */}
        {!loading && data.doclignes?.length > itemsPerPage && (
          <div className='flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 mt-4'>
            <div className='flex flex-1 justify-between'>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${
                  currentPage === 1
                    ? 'text-gray-300'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                }`}
              >
                Précédent
              </button>
              <span className='text-sm text-gray-700'>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${
                  currentPage === totalPages
                    ? 'text-gray-300'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                }`}
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewDocument