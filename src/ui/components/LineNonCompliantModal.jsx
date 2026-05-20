import React, { useState } from "react";
import { Modal, Input, Button, message } from "antd";
import { api } from "../utils/api";

export default function LineNonCompliantModal({
  open,
  setOpen,
  lineId,
  lineQte,
  form
}) {
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const qty = Number(quantity);

    if (!qty || qty < 1) {
      message.error("La quantité doit être au moins égale à 1");
      return;
    }

    if (qty > Number(lineQte)) {
      message.error(
        `La quantité doit être inférieure ou égale à ${lineQte}`
      );
      return;
    }

    try {
      setLoading(true);

      await api.post(`purchase-line/${lineId}/non-compliant`, {
        quantity: qty,
      });

      message.success("Ligne non conforme ajoutée avec succès");
      form?.submit();
      setQuantity("");
      setOpen(false);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Une erreur est survenue";

      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity("");
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
            className="rounded-xl"
          />

          <p className="text-xs text-gray-500 mt-1">
            Quantité maximale autorisée : {lineQte}
          </p>
        </div>

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