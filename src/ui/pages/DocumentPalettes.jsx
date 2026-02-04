import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import {
  User,
  Truck,
  AlertCircle,
  Package,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getExped, getStatus } from '../utils/config';
import { Button } from 'antd';
import BackButton from '../components/ui/BackButton';
import { useAuth } from '../contexts/AuthContext';

// Simple Skeleton Component
const PaletteSkeleton = () => (
  <div className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="h-5 bg-gray-200 rounded w-24"></div>
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </div>
    <div className="space-y-2 mb-3">
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="h-9 bg-gray-200 rounded w-full"></div>
  </div>
);

function DocumentPalettes() {
  const { piece } = useParams();
  const [document, setDocument] = useState({ palettes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const { data } = await api.get(`palettes/document/${piece}`);
      setDocument(data);

      const company = data?.companies?.find(
        (c) => parseInt(c.id) === parseInt(user?.company_id)
      );

      if (company?.pivot?.status_id) {
        const st = getStatus(company.pivot.status_id);
        setStatus(st || null);
      }
    } catch (err) {
      console.error(err);
      setError("Échec du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3 mb-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PaletteSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-red-200 p-6 max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 mb-4">{error}</p>
          <Button onClick={fetchData} type="primary">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const controlledCount = document.palettes.filter(p => Number(p.controlled) === 1).length;
  const totalCount = document.palettes.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <BackButton />
          <div className="flex-1 min-w-0 pt-2">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {document.ref}
            </h1>
            <p className="text-sm text-gray-500">{document.piece}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Client</p>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">{document.client_id}</span>
            </div>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Expédition</p>
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">{getExped(document.expedition)}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Contrôle</span>
              <span className="font-semibold text-gray-900">
                {controlledCount}/{totalCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (controlledCount / totalCount) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Palettes List */}
      <div className="p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Palettes ({totalCount})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {document.palettes.map((palette) => {
            const isControlled = Number(palette.controlled) === 1;
            
            return (
              <Link
                to={`/palette/controle/${palette.code}`}
                key={palette.id}
                className="block"
              >
                <div className={`bg-white rounded-lg p-4 border transition-all hover:shadow-md ${
                  isControlled 
                    ? 'border-green-200 bg-green-50/30' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {palette.code}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {palette.lines_count}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-3.5 h-3.5" />
                      <span className="truncate">{palette?.user?.full_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(palette.created_at)}</span>
                    </div>
                  </div>

                  {/* Action */}
                  {!isControlled ? (
                    <Button
                      type="primary"
                      size="middle"
                      className="w-full"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Contrôler
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium py-2 bg-green-50 rounded border border-green-200 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Contrôlé
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {document.palettes.length === 0 && (
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucune palette trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentPalettes;