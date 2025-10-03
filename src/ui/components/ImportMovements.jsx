import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { api } from "../utils/api";


const ImportMovements = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");

  const handleUpload = async () => {
    if (!file) {
      message.warning("Veuillez sélectionner un fichier !");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await api.post("import-movements", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success("Importation réussie !");
      console.log("Response:", response.data);
    } catch (error) {
      console.error(error);
      message.error(error.response.data.message || "Échec de l’importation.")

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Upload
        beforeUpload={(file) => {
          setFile(file);
          return false; // prevent auto-upload
        }}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Choisir un fichier</Button>
      </Upload>

      <Button
        type="primary"
        onClick={handleUpload}
        loading={loading}
        disabled={!file}
      >
        Importer
      </Button>
    </div>
  );
};

export default ImportMovements;
