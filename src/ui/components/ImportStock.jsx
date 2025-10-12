import React, { useState } from "react";
// import { Upload, Button, message } from "antd";
import { api } from "../utils/api";
import { Upload, FileSpreadsheet, ArrowUpCircle } from "lucide-react";
import { Button, Upload as AntUpload, Typography, Card, message } from "antd";

const { Title, Text } = Typography;


const ImportStock = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      message.warning("Veuillez sélectionner un fichier !");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await api.post("palettes/import", formData, {
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


    const downloadModel = async () => {
        try {
            await window.electron.ipcRenderer.invoke('download-file', 'http://192.168.1.113/models/import-stock-model.xlsx');
        } catch (error) {
            console.error(error);
            message.error('Erreur lors du téléchargement du modèle');
        }
    };

  return (
    <Card
      className="p-6 border border-gray-100 bg-white h-dvh"
      title={
        <div className="flex items-center justify-between">
          <Title level={4} className="!mb-0 text-gray-700 flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-blue-600" />
            Importation de stock
          </Title>

        </div>
      }
    >
      <div className="flex flex-col gap-3 mt-3">
        <AntUpload
          beforeUpload={(file) => {
            setFile(file);
            return false; // Empêche le téléversement automatique
          }}
          maxCount={1}
        >
          <Button icon={<Upload className="w-4 h-4" />}>
            Choisir un fichier
          </Button>
        </AntUpload>

        <Button
          type="primary"
          onClick={handleUpload}
          loading={loading}
          disabled={!file}
          icon={<ArrowUpCircle className="w-4 h-4" />}
        >
          Importer
        </Button>

        <Button
          type="link"
          className="mt-5 flex items-center gap-1"
          onClick={downloadModel}
        >
          <FileSpreadsheet className="w-4 h-4 text-green-600" />
          Télécharger le modèle d'importation
        </Button>
      </div>
    </Card>
  );
};

export default ImportStock;
