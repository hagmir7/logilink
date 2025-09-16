import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import {
  User,
  Truck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getExped, getStatus } from '../utils/config';
import { Button } from 'antd';
import BackButton from '../components/ui/BackButton';
import { useAuth } from '../contexts/AuthContext';

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

    console.log("📦 Document data:", data);
    console.log("👤 Current user company_id:", user.company_id);

    const company = data?.companies?.find(
      (c) => parseInt(c.id) === parseInt(user.company_id)
    );
    console.log("🏢 Matched company:", company);

    if (company?.pivot?.status_id) {
      console.log("📊 Status ID:", company.pivot.status_id);
      const st = getStatus(company.pivot.status_id);
      console.log("🎨 Resolved status:", st);
      setStatus(st || null);
    } else {
      console.log("⚠️ No status_id found for this company.");
    }
  } catch (err) {
    console.error(err);
    setError("Failed to load document data.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
        <span className="text-gray-600">Chargement...</span>
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
    <div>
      {/* Document Header */}
      <div className="bg-gradient-to-r bg-[#e5e7eb] px-3 py-1 md:py-2 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-full border border-gray-300">
              <BackButton />
            </div>
            <div>
              <h2 className="text-md font-semibold text-gray-900">
                {document.ref}
              </h2>
              <p className="text-sm text-gray-600">
                <strong>{document.piece}</strong>
              </p>
            </div>
          </div>

          {status ? (
            <div
              style={{ backgroundColor: status.color }}
              className="flex items-center space-x-2 px-3 py-1 rounded-full border text-white"
            >
              {status.name}
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full border bg-gray-400 text-white">
              Statut inconnu
            </div>
          )}
        </div>
      </div>

      {/* Document Details */}
      <div className="py-1 md:py-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 px-3 ">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Client</p>
            <p className="text-sm text-gray-900 flex gap-2 font-black">
              <User className="w-5 h-5 text-gray-600" />
              {document.client_id}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Expedition</p>
            <p className="text-sm text-gray-900 flex gap-2 font-black">
              <Truck className="w-5 h-5 text-gray-600" />
              {getExped(document.expedition)}
            </p>
          </div>
        </div>

        {/* Palettes Section */}
        <div className="border-t border-gray-200 pt-4 px-6 ">
          <div className="flex items-center space-x-2 mb-4">
            <Truck className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Palettes ({document.palettes.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {document.palettes.map((palette) => (
              <Link
                to={`/palette/controle/${palette.code}`}
                key={palette.id}
                className="group block transform transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-200">
                      {palette.code}
                    </h4>
                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm font-semibold rounded-full border border-blue-200">
                      QTE {palette.lines_count}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <p className="text-sm text-gray-600">
                        Préparé par:{' '}
                        <span className="font-medium text-gray-800">
                          {palette?.user?.full_name}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <p className="text-xs text-gray-500">
                        Le:{' '}
                        <span className="font-medium text-gray-700">
                          {formatDate(palette.created_at)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {Number(palette.controlled) !== 1 && (
                    <Button
                      component={Link}
                      size="Large"
                      to={`/palette/controle/${palette.code}`}
                      color="primary"
                      variant="solid"
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Contrôler
                      </span>
                    </Button>
                  )}

                  {Number(palette.controlled) === 1 && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Contrôlé
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentPalettes;
