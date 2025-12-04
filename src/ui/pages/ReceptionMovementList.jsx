import { Loader2, RefreshCcw, Settings } from "lucide-react";
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Button, Empty, Badge, Tooltip } from "antd";
import Spinner from "../components/ui/Spinner";
import { formatDate, getExped } from "../utils/config";

function ReceptionMovementList() {
  const [data, setData] = useState({ data: [], next_page_url: null, total: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [moreSpinner, setMoreSpinner] = useState(false);

  const navigate = useNavigate();

  const buildUrl = (pageNumber = 1) => {
    let url = "receptions/list";
    return `${url}?page=${pageNumber}`;
  };

  const fetchData = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await api.get(buildUrl(pageNumber));
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAndNotify = async () => {
      await fetchData();
      window.electron?.notifyPrintReady?.();
    };
    fetchAndNotify();
    const intervalId = setInterval(fetchAndNotify, 40000);
    return () => clearInterval(intervalId);
  }, []);

  const loadMore = async () => {
    if (!data.next_page_url) return;
    setMoreSpinner(true);
    const nextPage = page + 1;
    setPage(nextPage);

    try {
      const response = await api.get(buildUrl(nextPage));
      setData({
        data: [...data.data, ...response.data.data],
        next_page_url: response.data.next_page_url,
        total: response.data.total,
      });
    } catch (err) {
      console.error("Failed to fetch more data:", err);
    } finally {
      setMoreSpinner(false);
    }
  };

  const handleSelectOrder = (orderId, company_db) => {
    navigate(`/reception-movement/${orderId}/${company_db}`);
  };

    const statuses = [
      { id: 1, name: "Transféré", color: "orange" },
      { id: 2, name: "Réceptionné", color: "green" },
      { id: 3, name: "Validé", color: "blue" },
    ]

    const getStatus = (id) =>
      statuses.find(s => s.id === Number(id)) || { name: "En attente", color: "default" }


  return (
    <div className="min-h-screen">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800 mb-1 p-2 md:p-1">
        Gestion de la réception
      </h2>

      {/* Header */}
      <div className="flex justify-between items-center px-2 md:px-4 mb-4">
        <Button onClick={() => fetchData()} size="large">
          {loading ? (
            <Loader2 className="animate-spin text-blue-500" size={17} />
          ) : (
            <RefreshCcw size={17} />
          )}
          <span className="hidden sm:inline ml-2">Rafraîchir</span>
        </Button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 md:p-4">
        {data.data.length > 0 ? (
          data.data.map((item, index) => (
            <Badge.Ribbon key={index} text={getStatus(item?.document?.status_id)?.name || "Document"} color={getStatus(item?.document?.status_id)?.color || "blue"}>
              <div
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 p-5 transition cursor-pointer"
                onClick={() => handleSelectOrder(item.DO_Piece, item.company)}
              >
                {/* Title */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.DO_Piece || "__"}
                  </h3>
                  {Number(item?.DO_Reliquat) === 1 && (
                    <Tooltip title="Reliquat">
                      <Settings className="text-gray-500 w-5 h-5" />
                    </Tooltip>
                  )}
                </div>

                {/* Labels */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 text-md font-medium bg-red-100 text-red-700 rounded-full">
                    {getExped(item.DO_Expedit)}
                  </span>
                  <span className="px-3 py-1 text-md font-medium bg-green-100 text-green-700 rounded-full">
                    {item.DO_Tiers}
                  </span>
                </div>

                {/* Details */}
                <dl className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-lg">Référence:</dt>
                    <dd className="font-medium text-lg">{item.DO_Ref}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-lg">Date du document:</dt>
                    <dd className="font-medium text-lg">
                      {formatDate(new Date(item?.DO_Date))}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-lg">Date prévue:</dt>
                    <dd className="font-medium text-lg">
                      {formatDate(new Date(item?.DO_DateLivr))}
                    </dd>
                  </div>
                </dl>
              </div>
            </Badge.Ribbon>
          ))
        ) : (
          !loading && <Empty className="mt-10" description="Aucun document à afficher" />
        )}
      </div>

      {/* Load more */}
      {data.next_page_url && (
        <div className="flex justify-center py-6">
          <Button
            onClick={loadMore}
            type="primary"
            loading={moreSpinner}
            iconPosition="end"
          >
            Charger Plus
          </Button>
        </div>
      )}

      {loading && <Spinner />}
    </div>
  );
}

export default ReceptionMovementList;
