import React, { useEffect, useState } from 'react'
import { api } from '../utils/api';
import { Button, Tag } from 'antd';
import { Edit, PlusCircle, Trash } from 'lucide-react';

export default function Depots() {

    const [depots, setDepots] = useState([]);

    useEffect(()=>{
        fetchDepots()
    }, []);


    const fetchDepots = async () =>{
        const response = await api('depots');
        setDepots(response.data.data)
    }

  return (
    <div className='w-full '>
      <div className='flex justify-between mb-1 p-2 md:p-4'>
        <h2 className='text-xl font-semibold text-gray-800'>
          Gestion de la préparation
        </h2>
        <Button size='large' className='flex'>
          <PlusCircle size={20} />
          <span className='text-md'>Créer</span>
        </Button>
      </div>
      {/* Desktop Table View */}
      <div className='hidden lg:block overflow-x-auto'>
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
                  <div className='flex items-center'>
                    <span className='text-sm font-bold text-gray-900'>
                      {data.code || '__'}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-2 whitespace-nowrap'>
                  <Tag className='text-xl'>
                    {data?.emplacements_count || 'En attente'}
                  </Tag>
                </td>

                <td className='px-6 py-2 whitespace-nowrap'>
                  <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium'>
                    {data.company.name}
                  </span>
                </td>
                <td className='px-6 py-2 whitespace-nowrap flex gap-3'>
                  <Button>
                    <Trash size={15} />
                  </Button>
                 
                  <Button>
                    <Edit size={15} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {depots.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>Aucun document à afficher</p>
        </div>
      )}
    </div>
  )
}
