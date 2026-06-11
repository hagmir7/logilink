import React, { useState } from "react";
import { Modal, Input, Button, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

export default function LineNonCompliantModal({
  open,
  setOpen,
  lineId,
  lineQte,
  form,
  fetch,
}) {
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { roles } = useAuth()

  const handleSubmit = async () => {
    const qty = Number(quantity);
    

    if (!qty || qty < 1) {
      message.error("La quantité doit être au moins égale à 1");
      return;
    }

    if (qty > Number(lineQte)) {
      message.error(`La quantité doit être inférieure ou égale à ${lineQte}`);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("quantity", qty);
      formData.append("note", note);
      formData.append("supplier_code", supplierCode);

      if (file) {
        formData.append("file", file);
      }

      await api.post(
        `purchase-line/${lineId}/non-compliant`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      message.success("Ligne non conforme ajoutée avec succès");

      form?.submit();
      setQuantity("");
      setNote("");
      setSupplierCode("");
      setFile(null);
      setOpen(false);
      fetch();
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Une erreur est survenue";

      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity("");
    setNote("");
    setSupplierCode("");
    setFile(null);
    setOpen(false);
  };

  return (
    <Modal
      title="Ajouter une quantité non conforme"
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnClose
    >
      <div className="flex flex-col gap-4">

        {/* Quantity */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-2">
            Quantité
          </label>

          <Input
            type="number"
            min={1}
            max={lineQte}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Saisir la quantité"
          />

          <p className="text-xs text-gray-500 mt-1">
            Quantité maximale autorisée : {lineQte}
          </p>
        </div>

        {/* Supplier Code */}
        {
          roles('admin') ? <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">
              fournisseur
            </label>

            <Input
              value={supplierCode}
              onChange={(e) => setSupplierCode(e.target.value)}
              placeholder="Ex: FR001"
            />
          </div> : ''
        }
        
        {/* Note */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-2">
            Note
          </label>

          <Input.TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ajouter une note..."
            rows={3}
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-2">
            Fichier (image ou PDF)
          </label>

          <Upload
            beforeUpload={(file) => {
              const isValid =
                file.type === "application/pdf" ||
                file.type.startsWith("image/");

              if (!isValid) {
                message.error("Seuls les images et PDF sont autorisés");
                return Upload.LIST_IGNORE;
              }

              setFile(file);
              return false; // prevent auto upload
            }}
            maxCount={1}
            onRemove={() => setFile(null)}
          >
            <Button icon={<UploadOutlined />}>
              Choisir un fichier
            </Button>
          </Upload>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-2">
          <Button onClick={handleClose}>
            Annuler
          </Button>

          <Button
            type="primary"
            loading={loading}
            onClick={handleSubmit}
            className="bg-red-500"
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  );
}