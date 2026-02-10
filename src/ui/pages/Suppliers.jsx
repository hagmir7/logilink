import React, { useEffect, useState } from "react";
import { Button, message, Modal, Select, Tooltip } from "antd";
import {CircleAlert, Sheet, RefreshCw } from "lucide-react";

import { api } from "../utils/api";
import TableSkeleton from "../components/ui/TableSkeleton";
import SupplierFrom from "../components/SupplierFrom";
import { useNavigate } from "react-router-dom";
import SupplierInterviewForm from "../components/SupplierInterviewForm";

export default function Suppliers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
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
      const response = await api.get("client/suppliers", {
        params: { company_db: company },
      });

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

  /* =======================
     Open update modal
  ======================= */
  const openUpdate = (CT_Num) => {
    setSelectedClient(CT_Num);
    setOpen(true);
  };

  /* =======================
     Delete supplier (optional)
  ======================= */
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

  const downloadSuppliers = async () => {
    setDownloadLoading(true);
    try {
      const response = await api.post("client/suppliers/download",
        {
          company_db: "sqlsrv_inter"
        },
        {
          responseType: "blob"
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      const now = new Date();
      const shortDate =
        String(now.getFullYear()).slice(2) +   // YY
        String(now.getMonth() + 1).padStart(2, '0') + // MM
        String(now.getDate()).padStart(2, '0') +      // DD
        '_' +
        String(now.getHours()).padStart(2, '0') +     // HH
        String(now.getMinutes()).padStart(2, '0');    // MM

      link.setAttribute("download", `liste-fournisseurs_${shortDate}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error("Download error:", error);
      message.error("Erreur lors du téléchargement.");
    } finally {
      setDownloadLoading(false);
    }
  };


  /* =======================
     Render
  ======================= */
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center pt-2 px-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Fournisseurs
        </h2>

        <div className="flex gap-3">
          <Button
            onClick={() => fetchData(true)}
            className="flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="animate-spin h-4 w-4" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Rafraîchir
          </Button>


          <Tooltip title="LISTE DES PRESTATAIRES EXTERNES REFERENCES">
            <Button
              onClick={downloadSuppliers}
              loading={downloadLoading}
              variant="solid"
              color="green"
              className="flex items-center gap-2"
            >
              {!downloadLoading && <Sheet className="h-4 w-4" />}
            </Button>
          </Tooltip>

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
          <thead className="bg-gray-100 whitespace-nowrap">
            <tr>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Fournisseur</th>
              <th className="px-3 py-2 text-left">Nature d'achat</th>
              <th className="px-3 py-2 text-left">Téléphone</th>
              {/* <th className="px-3 py-2 text-left">E-mail</th> */}
              <th className="px-3 py-2 text-left">Adresse</th>
            </tr>
          </thead>

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
                  <td className="px-3 py-2">{item.CT_Intitule}</td>
                  <td className="px-3 py-2">
                    {item.Nature_Achat || "__"}
                  </td>
                  <td className="px-3 py-2">
                    {item.CT_Telephone || item.CT_Telecopie}
                  </td>
                  {/* <td className="px-3 py-2">{item.CT_EMail}</td> */}
                  <td className="px-3 py-2">
                    {item.CT_Pays}
                    {item.CT_Ville && `, ${item.CT_Ville}`}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  Aucun fournisseur trouvé
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