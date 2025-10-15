import React, { useEffect, useState } from "react";
import { getExped, getStatus } from "../utils/config";
import { Badge, message, Tag, Skeleton, Empty } from "antd";
import { api } from "../utils/api";
import { useParams } from "react-router-dom";
import SkeletonTable from "../components/ui/SkeletonTable";

export default function DocumentsTable() {
  const [data, setData] = useState({ lines: [] });
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`users/documents/${id}`);
      setData(response.data);
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message || "Erreur de chargement des données"
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {/* Skeleton for Header */}
            <Skeleton active title paragraph={{ rows: 1 }}  />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton.Input
                  key={i}
                  active
                  size="large"
                  style={{ width: "100%", height: "70px" }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <h1 className="text-xl p-2 font-semibold text-gray-800">
              {data.piece}
            </h1>

            <div key={data.id} className="mb-8">
              {/* Document Info */}
              <div className="mb-2 p-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white rounded-md p-3 shadow-sm">
                    <p className="text-gray-500">Référence</p>
                    <p className="font-bold text-gray-800 break-words">
                      {data.ref}
                    </p>
                  </div>

                  <div className="bg-white rounded-md p-3 shadow-sm">
                    <p className="text-gray-500">Pièce</p>
                    <p className="font-bold text-gray-800 break-words">
                      {data.piece}
                    </p>
                  </div>

                  <div className="bg-white rounded-md p-3 shadow-sm">
                    <p className="text-gray-500">Client</p>
                    <p className="font-bold text-gray-800 break-words">
                      {data.client_id}
                    </p>
                  </div>

                  <div className="bg-white rounded-md p-3 shadow-sm">
                    <p className="text-gray-500">Expédition</p>
                    <p className="font-bold text-gray-800 break-words">
                      {getExped(data.expedition)}
                    </p>
                  </div>

                  <div className="bg-white rounded-md p-3 shadow-sm">
                    <p className="text-gray-500">Statut</p>
                    <Tag color={getStatus(Number(data.status_id))?.color}>
                      <p className="font-bold break-words">
                        {getStatus(Number(data.status_id))?.name}
                      </p>
                    </Tag>
                  </div>

                  <div className="bg-white rounded-md p-3 shadow-sm">
                    <p className="text-gray-500">Type</p>
                    <p className="font-bold text-gray-800 break-words">
                      {data.type}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lines Table */}
              <div className="overflow-x-auto mt-4">
                {data.lines && data.lines.length > 0 ? (
                  <table className="min-w-full shadow-sm">
                    <thead className="sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 shadow-sm z-10 whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-2 text-left">Référence</th>
                        <th className="px-4 py-2 text-left">Désignation</th>
                        <th className="px-4 py-2 text-left">Quantité</th>
                        <th className="px-4 py-2 text-left">Dimensions</th>
                      </tr>
                    </thead>
                    <tbody className="whitespace-normal bg-white">
                      {data.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="px-4 py-2 border-b border-gray-200 whitespace-nowrap font-medium text-gray-800">
                            {line.ref}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 text-gray-700">
                            {line.name && line.name !== ""
                              ? line.name
                              : line.design}
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 text-left text-gray-800">
                            <Tag>
                              <span className="text-xl">
                                {parseFloat(line.quantity)}
                              </span>
                            </Tag>
                          </td>
                          <td className="px-4 py-2 border-b border-gray-200 text-left text-gray-600">
                            {line.dimensions}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-12">
                    <Empty
                      description="Aucune ligne trouvée pour ce document"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
