import { Loader2, RefreshCcw, User2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'antd';


function getExped(exp) {
    const expedMap = {
        "1": "EX-WORK",
        "2": "LA VOIE EXPRESS",
        "3": "SDTM",
        "4": "LODIVE",
        "5": "MTR",
        "6": "CARRE",
        "7": "MAROC EXPRESS",
        "8": "GLOG MAROC",
        "9": "AL JAZZERA",
        "10": "C YAHYA",
        "11": "C YASSIN",
        "12": "GHAZALA",
        "13": "GISNAD"
    };

    return expedMap[exp] || "";
}


const TableRow = ({ data }) => {
  const navigate = useNavigate();

  return (
    <tr
      className='hover:bg-gray-100 cursor-pointer'
      onClick={() => navigate(`document`)}
    >
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2 flex items-center gap-x-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            #{data.DO_Reliquat || '__'}
          </span>
        </div>
      </td>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            {data.DO_Piece || '__'}
          </span>
        </div>
      </td>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            {data.DO_Ref}
          </span>
        </div>
      </td>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            <Tag color='success'>{data.DO_Tiers}</Tag>
          </span>
        </div>
      </td>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            {data.DO_Date}
          </span>
        </div>
      </td>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            {data.DO_DateLivr}
          </span>
        </div>
      </td>
      <td className='size-px whitespace-nowrap'>
        <div className='px-6 py-2'>
          <span className='text-sm text-gray-600 dark:text-neutral-400'>
            <Tag color='#f50'>{getExped(data.DO_Expedit)}</Tag>
          </span>
        </div>
      </td>
    </tr>
  )
};

function Home() {
    const labels = ["Bon de commande", "Bon de préparation", "Référence", "N° Client","Date du document", "Date prévue", "Expédition",]
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)


    const fetchData = async () => {
      setLoading(true)
        try {
            const response = await api.get('docentetes/2');
            setData(response.data);
            setLoading(false)
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    return (
      <div className='flex flex-col'>
        <div className='-m-1.5 overflow-x-auto'>
          <div className='p-1.5 min-w-full inline-block align-middle'>
            <div className='bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden dark:bg-neutral-900 dark:border-neutral-700'>
              {/* Header */}
              <div className='px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-neutral-700'>
                <h2 className='text-xl font-semibold text-gray-800 dark:text-neutral-200'>
                  Gestion des commandes
                </h2>
                <div className='inline-flex gap-x-2'>
                  <button
                    type='button'
                    onClick={fetchData}
                    className='py-2 px-3 cursor-pointer inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700'
                  >
                    {loading ? (
                      <Loader2
                        className='animate-spin text-blue-500'
                        size={17}
                      />
                    ) : (
                      <RefreshCcw size={17} />
                    )}
                    Rafraîchir
                  </button>
                </div>
              </div>
              {/* Table */}
              <table className='min-w-full divide-y divide-gray-200 dark:divide-neutral-700'>
                <thead className='bg-gray-50 dark:bg-neutral-900'>
                  <tr>
                    {labels.map((label) => {
                      return (
                        <th
                          scope='col'
                          key={label}
                          className='px-6 py-3 text-start'
                        >
                          <div className='flex items-center gap-x-2'>
                            <span className='text-xs font-semibold uppercase text-gray-800 whitespace-nowrap dark:text-neutral-200'>
                              {label}
                            </span>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 dark:divide-neutral-700'>
                  {data.map((item, index) => (
                    <TableRow key={index} data={item} />
                  ))}
                </tbody>
              </table>
              {loading && (
                <div className='flex justify-center items-center h-64'>
                  <Loader2 className='animate-spin text-blue-500' size={32} />
                  <span className='ml-2 text-gray-600'>Chargement...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
}

export default Home;