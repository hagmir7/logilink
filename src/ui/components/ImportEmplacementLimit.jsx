import React, { useState } from "react";
import { Upload, Button, message, Card } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { api } from "../utils/api";

const ImportEmplacementLimit = () => {
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

    const props = {
        beforeUpload: (file) => {
            const isExcel =
                file.type ===
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
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
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            message.success(response.data.message || "Import réussi !");
            setFileList([]);
        } catch (error) {
            console.error(error);
            message.error(
                error?.response?.data?.message || "Erreur lors de l'import"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Importer Emplacement & Stock" className="shadow-md">
            <div className="flex flex-col gap-4">
                <Upload {...props}>
                    <Button icon={<UploadOutlined />}>
                        Sélectionner fichier Excel
                    </Button>
                </Upload>

                <Button
                    type="primary"
                    onClick={handleUpload}
                    loading={loading}
                    disabled={fileList.length === 0}
                >
                    Importer
                </Button>
            </div>
        </Card>
    );
};

export default ImportEmplacementLimit;