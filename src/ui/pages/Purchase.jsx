
import React, { useEffect, useState } from "react";
import { Button, message, Modal, Select } from "antd";
import {
  RefreshCcw,
  PlusCircle,
  Eye,
  Edit,
  Trash,
  CircleAlert,
  Printer,
} from "lucide-react";

import { api } from "../utils/api";
import Skeleton from "../components/ui/Skeleton";
import { handleShow } from "../utils/config";
import { useNavigate } from "react-router-dom";


export default function Purchase() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedOnboarding, setSelectedPruchase] = useState(null);
  const { confirm } = Modal;
  const navigate = useNavigate()

  useEffect(() => {
    fetchData(true);
  }, [filter]);

  const fetchData = async (reset = false, url = null) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const endpoint = url
        ? url
        : filter
        ? `purchase-documents?status=${filter}`
        : `purchase-documents`;

      const response = await api.get(endpoint);
      const resData = response.data;

      const items = resData?.data || [];
      const paginationInfo = {
        current_page: resData?.current_page,
        next_page_url: resData?.next_page_url,
        total: resData?.total,
      };

      if (reset) setData(items);
      else setData((prev) => [...prev, ...items]);

      setPagination(paginationInfo);
    } catch (error) {
      message.warning(
        error?.response?.data?.message || "Erreur lors du chargement."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

    function getStatusLabel(status) {
        const statuses = {
            0: {
                label: "Brouillon",
                color: "bg-gray-100 text-gray-800 border border-gray-300",
            },
            1: {
                label: "Soumis",
                color: "bg-blue-100 text-blue-800 border border-blue-300",
            },
            2: {
                label: "En révision",
                color: "bg-yellow-100 text-yellow-800 border border-yellow-300",
            },
            3: {
                label: "Approuvé",
                color: "bg-green-100 text-green-800 border border-green-300",
            },
            4: {
                label: "Rejeté",
                color: "bg-red-100 text-red-800 border border-red-300",
            },
            5: {
                label: "Commandé",
                color: "bg-indigo-100 text-indigo-800 border border-indigo-300",
            },
            6: {
                label: "Reçu",
                color: "bg-emerald-100 text-emerald-800 border border-emerald-300",
            },
            7: {
                label: "Annulé",
                color: "bg-rose-100 text-rose-800 border border-rose-300",
            },
        };

        const s = statuses[status];
        if (!s)
            return (
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">__</span>
            );
        return <span className={`${s.color} border px-2 py-1 rounded`}>{s.label}</span>;
    }

  const handleDelete = async (id) => {
    try {
      await api.delete(`integrations/${id}`);
      message.success("Embarquement supprimé avec succès.");
      fetchData(true);
    } catch (error) {
      message.error("Erreur lors de la suppression.");
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: "Êtes-vous sûr de vouloir supprimer cet élément ?",
      icon: <CircleAlert size={25} className="text-red-600 mt-1 mr-2" />,
      content: "Cette action ne peut pas être annulée.",
      okText: "Oui, supprimez-le",
      okType: "danger",
      cancelText: "Annuler",
      onOk() {
        handleDelete(id);
      }
    });
  };


  return (
    <div>
      <div className="flex justify-between items-center pt-2 px-2">
        <h2 className="text-lg font-semibold text-gray-800">Documents d'achat</h2>
        <div className="flex gap-3">
          <Button
            onClick={() => fetchData(true)}
            className="flex items-center gap-2"
          >
            {loading ? (
              <RefreshCcw className="animate-spin h-4 w-4" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Rafraîchir
          </Button>

          <Select
            style={{ width: 200 }}
            placeholder="Filtrer par statut"
            onChange={(value) => setFilter(value)}
            allowClear
            options={[
                { label: "Tout", value: null },
                { label: "Brouillon", value: 0 },
                { label: "Soumis", value: 1 },
                { label: "En révision", value: 2 },
                { label: "Approuvé", value: 3 },
                { label: "Rejeté", value: 4 },
                { label: "Commandé", value: 5 },
                { label: "Reçu", value: 6 },
                { label: "Annulé", value: 7 },
                ]}
          />

          <Button
            type="primary"
            onClick={() => {
              setSelectedPruchase(null);
              handleShow(navigate, '/purchase/create', 1200, 700);
            //   setOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4" />
            Créer
          </Button>

          <Modal
            title={
              selectedOnboarding
                ? "Modifier un embarquement"
                : "Créer un embarquement"
            }
            centered
            open={open}
            onCancel={() => setOpen(false)}
            width="70%"
            footer={null}
          >
            {/* <OnboardingForm
              record={selectedOnboarding}
              onClose={() => {
                setOpen(false);
                fetchData(true);
              }} */}
            {/* /> */}
          </Modal>
        </div>
      </div>

      <div className="mt-4 overflow-auto bg-white rounded shadow-sm">
        <table className="min-w-full text-sm border-t border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Candidat</th>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Responsable</th>
              <th className="px-3 py-2 text-left">Date d’évaluation</th>
              <th className="px-3 py-2 text-left">Date d’embauche</th>
              <th className="px-3 py-2 text-left">Statut</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <Skeleton rows={3} columns={6} />
            ) : data.length > 0 ? (
              data.map((item, index) => (
                 <tr
                    key={index}
                    className="border-t border-gray-300 hover:bg-gray-50 whitespace-normal"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {item?.resume?.full_name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{item?.code}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {item?.responsible?.full_name || "__"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {item?.evaluation_date
                        ? formatDate(item.evaluation_date)
                        : "__"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {item?.hire_date
                        ? formatDate(item.hire_date)
                        : "__"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {getStatusLabel(item?.status)}
                    </td>
                  </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Aucun document trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {pagination?.next_page_url && (
          <div className="flex justify-center p-4">
            <Button
              onClick={() =>
                fetchData(false, pagination.next_page_url)
              }
              loading={loadingMore}
            >
              Charger plus
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
