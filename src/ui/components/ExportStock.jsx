import { useState } from "react";
import { Modal, Select, Button, message } from "antd";
import axios from "axios";
import { FileSpreadsheetIcon, DownloadIcon, XIcon } from "lucide-react";
import { api } from '../utils/api';
import { categories } from "../utils/config";

const { Option } = Select;


export default function ExportStockModal({ open, onClose, companies = [] }) {
  const [category, setCategory] = useState("tout");
  const [company, setCompany]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category && category !== "tout") params.category = category;
      if (company) params.company = company;

      const response = await api("articles/export", {
        params,
        responseType: "blob",
      });

      const url      = window.URL.createObjectURL(new Blob([response.data]));
      const link     = document.createElement("a");
      link.href      = url;
      link.download  = `stock_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("Export téléchargé avec succès !");
      onClose();
    } catch (err) {
      message.error("Erreur lors de l'export. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCategory("tout");
    setCompany(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closable={false}
      width={480}
      className="export-modal"
      centered
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <FileSpreadsheetIcon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-800 m-0">
              Exporter le stock
            </h2>
            <p className="text-xs text-gray-400 m-0">Format Excel (.xlsx)</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Catégorie
          </label>
          <Select
            value={category}
            onChange={setCategory}
            className="w-full"
            size="large"
          >
            {categories.map((c) => (
              <Option key={c.value} value={c.value}>
                {c.label}
              </Option>
            ))}
          </Select>
        </div>

        {companies.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Société <span className="text-gray-300 normal-case">(optionnel)</span>
            </label>
            <Select
              value={company}
              onChange={setCompany}
              className="w-full"
              size="large"
              allowClear
              placeholder="Toutes les sociétés"
            >
              {companies.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6">
        <span className="text-blue-400 text-base mt-0.5">ℹ</span>
        <p className="text-xs text-blue-600 m-0 leading-relaxed">
          L'export inclut le stock, les niveaux d'urgence, les écarts et les
          quantités en préparation pour chaque article.
        </p>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3">
        <Button size="large" onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<DownloadIcon className="w-4 h-4" />}
          loading={loading}
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 flex items-center gap-1.5"
        >
          {loading ? "Export en cours…" : "Télécharger"}
        </Button>
      </div>
    </Modal>
  );
}