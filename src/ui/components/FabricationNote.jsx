import React, { useState } from "react";
import { Button, Modal, Input, message } from "antd";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import { CircleCheck } from "lucide-react";

const { TextArea } = Input;

const FabricationNote = ({ company, onUpdated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(company?.note || "");
  const { user } = useAuth();

  const hasNote = Boolean(company?.note);

  const showModal = () => {
    setNote(company?.note || "");
    setOpen(true);
  };

  const handleSave = async () => {
    if (hasNote) return;

    if (!note.trim()) {
      message.warning("Veuillez saisir une remarque.");
      return;
    }

    setLoading(true);

    try {
      await api.patch("documents/note", {
        document_company_id: company?.id,
        note,
      });

      message.success("Remarque enregistrée avec succès.");
      setOpen(false);

      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {hasNote ? <CircleCheck size={16} /> : null} Remarque
      </Button>

      <Modal
        open={open}
        title="Remarque de fabrication"
        onCancel={() => setOpen(false)}
        onOk={handleSave}
        okText="Enregistrer"
        cancelText="Annuler"
        confirmLoading={loading}
        okButtonProps={{ disabled: hasNote }}
        destroyOnClose
      >
        <TextArea
          rows={6}
          maxLength={600}
          value={note}
          readOnly={hasNote}
          disabled={hasNote}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Saisissez une remarque..."
          showCount
        />
      </Modal>
    </>
  );
};

export default FabricationNote;