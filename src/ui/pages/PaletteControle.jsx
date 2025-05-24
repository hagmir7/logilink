import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { Badge } from 'antd';
import { Circle, CircleCheckBig } from 'lucide-react';

export default function PaletteControle() {
  const { code } = useParams();
  const [palette, setPalette] = useState({ lines: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get(`palettes/${code}`);
      setPalette(data);
      console.log(data);
    } catch (error) {
      console.error('Failed to fetch palette:', error);
    }
  };

  const confirm = async (lineId) => {
    try {
      const response = await api.get(`/palettes/${code}/line/${lineId}`);
      // Optionally refresh data or update state directly
      console.log(response);
      
      fetchData(); // Refresh state after confirming
    } catch (error) {
      console.error('Confirmation failed:', error);
    }
  };

  return (
    <div className='p-2 md:p-5'>
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {palette?.lines?.map((item, index) => {
          const isConfirmed = item?.pivot?.controlled_at; // Adjust based on actual field
          return (
            <Badge.Ribbon key={item.id || index} text={item.ref} color='cyan'>
              <div className='rounded-2xl overflow-hidden bg-gray-20 shadow-sm hover:shadow-md'>
                <div className='p-4 bg-amber-50'>
                  <div className='flex justify-between items-center mt-4'>
                    <div>
                      <h3 className='text-md font-bold text-gray-600'>
                        {item.article_stock?.name || 'N/A'}{' '}
                        {item.article_stock?.width && item.article_stock?.height
                          ? `${Math.floor(
                              item.article_stock.height
                            )} * ${Math.floor(item.article_stock.width)}`
                          : ''}
                      </h3>
                      <span className='text-sm text-gray-600'>
                        ‑ {item.article_stock?.color || 'N/A'}
                      </span>
                    </div>
                    <span className='text-3xl font-bold text-gray-600'>
                      {item.quantity ? Math.floor(item.pivot.quantity) : 0}
                    </span>
                  </div>

                  <div className='flex justify-between items-center mt-4'>
                    <span className='text-sm text-gray-600'>
                      Profondeur : {item.article_stock?.depth || 'N/A'} |
                      Epaisseur : {item.article_stock?.thickness || 'N/A'} |
                      Chant : {item.article_stock?.chant || 'N/A'}
                    </span>

                    <button
                      onClick={() => confirm(item.id)}
                      disabled={isConfirmed}
                      className={`p-2 rounded-full text-white ${
                        isConfirmed
                          ? 'bg-green-500 hover:bg-green-700'
                          : 'bg-amber-500 hover:bg-amber-700'
                      }`}
                    >
                      {isConfirmed ? (
                        <CircleCheckBig size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Badge.Ribbon>
          )
        })}
      </div>
    </div>
  );
}
