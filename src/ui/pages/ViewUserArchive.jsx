import React, { useEffect, useState } from "react";
import { getExped, getStatus } from "../utils/config";
import { Badge, message, Tag } from "antd";
import { api } from "../utils/api";
import { useParams } from "react-router-dom";

export default function DocumentsTable() {
  const [data, setData] = useState({lines:[]});
  const [loading, setLoading] = useState(false);
  const {id} = useParams();


  const fetchData = async () => {
    setLoading(true)
    try {

      const response = await api.get(`users/documents/${id}`)
      setData(response.data);

    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Erreur de chargement des données")

    }
    setLoading(false)
  }

  useEffect(()=>{
    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto">
        <h1 className="text-xl p-2 font-semibold text-gray-800">
          {data.piece}
        </h1>

        <div key={data.id} className="mb-8">
          {/* dataument Info Header */}
          <div className="mb-5 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white shadow-sm rounded-md p-3">
                <p className="text-gray-500">Référence</p>
                <p className="font-bold text-gray-800 break-words">{data.ref}</p>
              </div>

              <div className="bg-white shadow-sm rounded-md p-3">
                <p className="text-gray-500">Pièce</p>
                <p className="font-bold text-gray-800 break-words">{data.piece}</p>
              </div>

              <div className="bg-white shadow-sm rounded-md p-3">
                <p className="text-gray-500">Client</p>
                <p className="font-bold text-gray-800 break-words">{data.client_id}</p>
              </div>

              <div className="bg-white shadow-sm rounded-md p-3">
                <p className="text-gray-500">Expédition</p>
                <p className="font-bold text-gray-800 break-words">{getExped(data.expedition)}</p>
              </div>

              <div className="bg-white shadow-sm rounded-md p-3">
                <p className="text-gray-500">Statut</p>
                <Tag color={getStatus(Number(data.status_id))?.color}>
                  <p className="font-bold break-words">
                    {getStatus(Number(data.status_id))?.name}
                  </p>
                </Tag>
              </div>

              <div className="bg-white shadow-sm rounded-md p-3">
                <p className="text-gray-500">Type</p>
                <p className="font-bold text-gray-800 break-words">{data.type}</p>
              </div>
            </div>


          </div>

          {/* Lines Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 shadow-sm">
              <thead className="sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 shadow-sm z-10 whitespace-nowrap">
                <tr>
                  <th className="px-4 py-2  text-left">Référence</th>
                  <th className="px-4 py-2  text-left">Désignation</th>
                  <th className="px-4 py-2  text-center">Quantité</th>
                  <th className="px-4 py-2  text-center">Date de complétion</th>
                  <th className="px-4 py-2  text-center">Société</th>
                </tr>
              </thead>
              <tbody className="whitespace-normal">
                {data.lines.map((line) => (
                  <tr key={line.id} className="">
                    <td className="px-4 py-2 border-b border-gray-200 whitespace-nowrap font-medium text-gray-800">
                      {line.ref}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 whitespace-nowrap text-gray-700">
                      {line.name || line.design}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 whitespace-nowrap text-center text-gray-800">
                      <Tag><span className="text-xl">{parseFloat(line.quantity)}</span></Tag>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 whitespace-nowrap text-center text-gray-600">
                      {line.complation_date
                        ? new Date(line.complation_date).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200 whitespace-nowrap text-center text-gray-700">
                      {line.company_code}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
