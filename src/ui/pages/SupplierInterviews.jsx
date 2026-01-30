import React, { useEffect, useState } from "react";
import { Badge, Button, Empty, message, Modal, Select, Tag } from "antd";
import {
  RefreshCcw,
  PlusCircle,
  CircleAlert,
} from "lucide-react";

import { api } from "../utils/api";
import TableSkeleton from "../components/ui/TableSkeleton";
import SupplierFrom from "../components/SupplierFrom";
import { useNavigate } from "react-router-dom";
import SupplierInterviewForm from "../components/SupplierInterviewForm";
import { formatDate } from "../utils/config";

export default function SupplierInterviews() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [company, setCompany] = useState('sqlsrv_inter');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { confirm } = Modal;

  /* =======================
     Fetch suppliers
  ======================= */
  useEffect(() => {
    fetchData(true);
  }, [company]);

  const fetchData = async (reset = false) => {
    setLoading(true);

    try {
      const response = await api.get("supplier-interviews", {
        params: { company_db: company },
      });

      console.log(response.data);
      

      setData(response.data);
    } catch (error) {
      message.warning(
        error?.response?.data?.message ||
        "Erreur lors du chargement des fournisseurs."
      );
    } finally {
      setLoading(false);
    }
  };


  const openUpdate = (CT_Num) => {
    setSelectedClient(CT_Num);
    setOpen(true);
  };


  const handleDelete = async (id) => {
    try {
      await api.delete(`client/suppliers/${id}`);
      message.success("Fournisseur supprimé avec succès.");
      fetchData(true);
    } catch (error) {
      message.error("Erreur lors de la suppression.");
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: "Supprimer ce fournisseur ?",
      icon: <CircleAlert size={22} className="text-red-600" />,
      content: "Cette action est irréversible.",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      onOk() {
        handleDelete(id);
      },
    });
  };


  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };



  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center pt-2 px-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Fournisseur Evaluation
        </h2>

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

          <Button type="primary" onClick={showModal}>
            Evaluation
          </Button>

          <Select
            value={company}
            className="min-w-[220px] block md:hidden"
            size="middle"
            placeholder="Société"

            onChange={(value) => setCompany(value)}
            options={[
              { value: 'sqlsrv_inter', label: 'INTERCOCINA' },
              { value: 'sqlsrv_serie', label: 'SERIE MOBLE' },
              { value: 'sqlsrv', label: 'STILE MOBILI' },
              { value: 'sqlsrv_asti', label: 'ASTIDKORA' },
            ]}
          />
        </div>
      </div>

      {/* Update Supplier Modal */}
      <SupplierFrom
        open={open}
        onClose={() => setOpen(false)}
        clientCode={selectedClient}
        companyDb={company}
        onUpdated={() => fetchData(true)}
      />

      {/* Table */}
      <div className="mt-4 overflow-auto bg-white border-gray-300 border-b">
        <table className="min-w-full text-sm border-t border-gray-300">
          {
            data.length != 0 && (<thead className="bg-gray-100 whitespace-nowrap">
              <tr>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Fournisseur </th>
                <th className="px-3 py-2 text-left">Produit / Service Achat</th>
                <th className="px-3 py-2 text-left">Note</th>
                <th className="px-3 py-2 text-left">Date</th>
              </tr>
            </thead>)
          }
          

          <tbody>
            {loading ? (
              <TableSkeleton rows={4} columns={5} />
            ) : data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.CT_Num}
                  onClick={() => openUpdate(item.CT_Num)}
                  className="border-t border-gray-300 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  <td className="px-3 py-2">{item.CT_Num}</td>
                  <td className="px-3 py-2">{item?.client.CT_Intitule}</td>
                  <td className="px-3 py-2"> {item.description}  </td>
                  <td className="px-3 py-2">
                    <Tag>{item.note | 0}</Tag>
                  </td>
                  <td className="px-3 py-2">{formatDate(item.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                 <Empty description=" Aucun fournisseur trouvé" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        
        <Modal
          title="Créer une évaluation des fournisseurs"
          closable={{ 'aria-label': 'Close Button' }}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={false}
        >
          <SupplierInterviewForm company={company} />
        </Modal>
 

    </div>
  );
}
