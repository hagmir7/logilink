import React, { useState } from "react";
import { Upload, Button, message, Modal } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { api } from "../utils/api";

const ImportEmplacementLimit = ({ open, onClose }) => {
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

    const uploadProps = {
        beforeUpload: (file) => {
            const isExcel =
                file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                file.type === "application/vnd.ms-excel";

            if (!isExcel) {
                message.error("Seuls les fichiers Excel sont autorisés !");
                return Upload.LIST_IGNORE;
            }

            setFileList([file]);
            return false;
        },
        onRemove: () => {
            setFileList([]);
        },
        fileList,
        maxCount: 1,
    };

    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning("Veuillez sélectionner un fichier");
            return;
        }

        const formData = new FormData();
        formData.append("file", fileList[0]);

        try {
            setLoading(true);

            const response = await api.post("/import-emplacement-limit", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            message.success(response.data.message || "Import réussi !");
            setFileList([]);
            onClose();
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "Erreur lors de l'import");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFileList([]);
        onClose();
    };

    return (
        <Modal
            title="Importer Emplacement & Stock"
            open={open}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel} disabled={loading}>
                    Annuler
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    disabled={fileList.length === 0}
                    onClick={handleUpload}
                >
                    Importer
                </Button>,
            ]}
        >
            <Upload.Dragger {...uploadProps} style={{ marginTop: 8 }}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                    Cliquez ou glissez un fichier Excel ici
                </p>
                <p className="ant-upload-hint">
                    Formats supportés : .xlsx, .xls
                </p>
            </Upload.Dragger>
        </Modal>
    );
};

export default ImportEmplacementLimit;