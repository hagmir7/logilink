import React, { useEffect, useState } from 'react'
import { api } from '../utils/api';
import { Button, message, Popconfirm, Tag, Input, Select } from 'antd';
import { Edit, PlusCircle, Trash, View } from 'lucide-react';
import { Link } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import DepotForm from '../components/DepotForm';
import ImportEmplacement from '../components/ImportEmplacement';
import { useAuth } from '../contexts/AuthContext';
const { Search } = Input

export default function Depots() {

  const [depots, setDepots] = useState([]);
  const [filteredDepots, setFilteredDepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const { roles = [] } = useAuth();

  useEffect(() => {
    fetchDepots()
  }, []);

  useEffect(() => {
    filterDepots();
  }, [searchTerm, selectedCompany, depots]);

  const fetchDepots = async () => {
    try {
      const response = await api('depots')
      setDepots(response.data.data)
      setFilteredDepots(response.data.data)
      setLoading(false)
    } catch (error) {
      setLoading(false);
      message.error(error.response.data.message)
      console.error(error.response);
    }
  }

  const filterDepots = () => {
    let filtered = [...depots];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(depot => 
        depot.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        depot.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by company
    if (selectedCompany !== 'all') {
      filtered = filtered.filter(depot => depot.company.id === parseInt(selectedCompany));
    }

    setFilteredDepots(filtered);
  }

  const handleSearch = (value) => {
    setSearchTerm(value);
  }

  const handleCompanyChange = (value) => {
    setSelectedCompany(value);
  }

  const deleteDepot = async (code) => {
    try {
      await api.delete(`depots/delete/${code}`);
      message.success('Dépôt supprimé avec succès');
      fetchDepots(); // Refresh list after delete
    } catch (error) {
      message.error(error?.response?.data?.message);
      console.error(error);
    }
  }

  const handleDepotCreated = () => {
    fetchDepots(); // Refresh list after creation
  }

  return (
    <div className='w-full'>
      <div className='flex items-center px-3 justify-between bg-gray-100 py-3 gap-3'>
        <div className='flex items-center gap-3 flex-1'>
          <Search
            placeholder='Rechercher par code ou entreprise'
            style={{ width: "300px" }}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Filtrer par entreprise"
            style={{ width: 200 }}
            onChange={handleCompanyChange}
            value={selectedCompany}
            options={[
              { value: 'all', label: 'Toutes les entreprises' },
              { value: '1', label: 'Intercocina' },
              { value: '2', label: 'Seriemobel' }
            ]}
          />
        </div>
        {
           roles('admin') && <DepotForm onSuccess={handleDepotCreated} />
        }
      </div>

      {/* Desktop Table View */}
      <div className='overflow-x-auto'>
        <table className='w-full '>
          <thead className='bg-gray-100 border-y  border-gray-200'>
            <tr>
              <th className='px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Depot Code
              </th>
              <th className='px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Emplacments
              </th>
              <th className='px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Entreprise
              </th>
              <th className='px-6 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredDepots.map((data, index) => (
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
                  <Tag color={data.company.id === 1 ? 'red' : 'green'}>
                    <Link to={`/depots/${data.id}`}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          data.company.id === 1 ? 'text-red-900' : 'text-green-900'
                        }`}
                      >
                        {data.company.name}
                      </span>
                    </Link>
                  </Tag>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {loading && <Spinner />}
      {!loading && filteredDepots.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>
            {searchTerm || selectedCompany !== 'all' 
              ? 'Aucun résultat trouvé' 
              : 'Aucun document à afficher'}
          </p>
        </div>
      )}
    </div>
  )
}