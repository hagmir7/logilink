import React, { useEffect, useState } from 'react'
import { api } from '../utils/api';
import { Button, message, Popconfirm, Tag, Input } from 'antd';
import { Edit, PlusCircle, Trash, View } from 'lucide-react';
import { Link } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import DepotForm from '../components/DepotForm';
import ImportEmplacement from '../components/ImportEmplacement';
import { useAuth } from '../contexts/AuthContext';
const { Search } = Input

export default function Depots() {

  const [depots, setDepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const { roles } = useAuth();

  useEffect(() => {
    fetchDepots()
  }, []);


  const fetchDepots = async () => {
    try {
      const response = await api('depots')
      setDepots(response.data.data)
      setLoading(false)
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.message)
      console.error(error.response);

    }
  }


  const deleteDepot = async (code) => {
    try {
      await api.delete(`depots/delete/${code}`);
      message.success('Dépôt supprimé avec succès');
    } catch (error) {
      message.error(error?.response?.data?.message);
      console.error(error);
    }
  }

  return (
    <div className='w-full '>
      <div className='flex items-center px-3 justify-between'>
        <Search
          placeholder='Recherch'
          style={{ width: "300px" }}
        />
        {
           roles('admin') && <DepotForm />
        }
        
      </div>
      {/* Desktop Table View */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Depot Code
              </th>
              <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Emplacments
              </th>
              <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Entreprise
              </th>
              <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {depots.map((data, index) => (
              <tr
                key={index}
                className='hover:bg-gray-50 cursor-pointer transition-colors duration-200'
              >
                <td className='px-6 py-2 whitespace-nowrap'>
                  <Link to={`/depots/${data.id}`}>
                    <div className='flex items-center'>
                      <span className='text-sm font-bold text-gray-900'>
                        {data.code || '__'}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className='px-6 py-2 whitespace-nowrap'>
                  <Link to={`/depots/${data.id}`}>
                    <Tag className='text-xl'>
                      {data?.emplacements_count || 'En attente'}
                    </Tag>
                  </Link>
                </td>

                <td className='px-6 py-2 whitespace-nowrap'>
                  <Link to={`/depots/${data.id}`}>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium'>
                      {data.company.name}
                    </span>
                  </Link>
                </td>
                <td className=''>
                  {
                    roles('admin') && (<div className='px-6 py-2 whitespace-nowrap flex gap-3'>
                      <Popconfirm
                        title={`Supprimer le dépôt ${data.code}`}
                        description='Êtes-vous sûr de vouloir supprimer'
                        onConfirm={() => deleteDepot(data.id)}
                      >
                        <Button>
                          <Trash size={15} />
                        </Button>
                      </Popconfirm>

                      <Link to={`/depots/view/${data.id}`}>
                        <Button>
                          <View size={15} />
                        </Button>
                      </Link>

                      <ImportEmplacement depot_id={data.id} />
                    </div>)
                  }


                  {/* <Button>
                    <Edit size={15} />
                  </Button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {loading && <Spinner />}
      {!loading && depots.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>Aucun document à afficher</p>
        </div>
      )}
    </div>
  )
}
