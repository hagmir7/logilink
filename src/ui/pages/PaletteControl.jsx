import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import {
  Package,
  Calendar,
  User,
  Truck,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getExped } from '../utils/config';
import { Tag } from 'antd';

function PaletteControl() {
  const { piece } = useParams();
  const [document, setDocument] = useState({ palettes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const { data } = await api.get(`palettes/document/${piece}`);
      console.log(data);
      setDocument(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load document data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (statusId) => {
    const status = parseInt(statusId);
    if (status >= 8) return 'bg-green-100 text-green-800 border-green-200';
    if (status >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusIcon = (statusId) => {
    const status = parseInt(statusId);
    if (status >= 8) return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
       <div className='flex flex-col items-center justify-center h-64'>
          <Loader2 className='animate-spin text-blue-500 mb-2' size={32} />
          <span className='text-gray-600'>Chargement...</span>
        </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=''>
      {/* Document Header */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-2 md:py-4 border-b border-gray-200'>
        <div className='flex items-center justify-between flex-wrap gap-4'>
          <div className='flex items-center space-x-4'>
            <div className='bg-blue-100 p-2 rounded-lg'>
              <Package className='w-6 h-6 text-blue-600' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                {document.ref}
              </h2>
              <p className='text-sm text-gray-600'>
                <strong>{document.piece}</strong>
              </p>
            </div>
          </div>
          <div
            style={{ backgroundColor: document?.status?.color }}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-white`}
          >
            {document?.status?.name}
          </div>
        </div>
      </div>

      {/* Document Details */}
      <div className='py-2 md:py-4'>
        <div className='grid  grid-cols-2 md:grid-cols-3 gap-4 mb-6 px-6 '>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-gray-500'>Client ID</p>
            <p className='text-sm text-gray-900 flex gap-2 font-black'>
              <User className='w-5 h-5 text-gray-600' />
              {document.client_id}
            </p>
          </div>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-gray-500'>Expedition</p>
            <p className='text-sm text-gray-900 flex gap-2 font-black'>
              <Truck className='w-5 h-5 text-gray-600' />{' '}
              {getExped(document.expedition)}
            </p>
          </div>
        </div>

        {/* Palettes Section */}
        <div className='border-t border-gray-200 pt-4 px-6 '>
          <div className='flex items-center space-x-2 mb-4'>
            <Truck className='w-5 h-5 text-gray-600' />
            <h3 className='text-lg font-semibold text-gray-900'>
              Palettes ({document.palettes.length})
            </h3>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {document.palettes.map((palette) => (
              <div
                key={palette.id}
                className='bg-gray-50 rounded-lg p-4 border border-gray-200'
              >
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-medium text-gray-900'>{palette.code}</h4>
                  <span className='px-2 py-1 bg-blue-100 text-blue-800 border-blue-950 border text-xs rounded-full'>
                    {palette.lines_count}
                  </span>
                </div>
                <div className='space-y-1 text-sm text-gray-600'>
                  <p>
                    Créé par:{' '}
                    <span className='font-semibold'>
                      {palette?.user?.full_name}
                    </span>
                  </p>
                  <p className='text-xs'>
                    Préparé le:{' '}
                    <span className='font-semibold'>
                      {formatDate(palette.created_at)}{' '}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaletteControl;
