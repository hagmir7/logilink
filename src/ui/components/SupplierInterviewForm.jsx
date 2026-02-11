import React, { useEffect, useState } from "react";
import { Form, Input, DatePicker, Button, message, Select } from "antd";
import dayjs from "dayjs";
import { api } from "../utils/api";

const SupplierInterviewForm = ({ onSuccess, company }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [suppliers, setSuppliers] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);
    const [currentCompany, setCurrentCompany] = useState(company);

    const getSuppliers = async () => {
        if (!currentCompany) {
            setSuppliers([]);
            return;
        }

        setLoadingSuppliers(true);
        try {
            const params = new URLSearchParams();
            params.append("company_db", currentCompany);

            const response = await api.get(`client/suppliers?${params.toString()}`);
            setSuppliers(
                response.data.map(item => ({
                    label: `${item.CT_Num} ${item.CT_Intitule}`,
                    value: item.CT_Num,
                }))
            );
        } catch (error) {
            console.error(error);
            message.error(
                error.response?.data?.message || "Erreur lors de la récupération des fournisseurs"
            );
            setSuppliers([]);
        } finally {
            setLoadingSuppliers(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                date: values.date.format("YYYY-MM-DD"),
            };

            const { data } = await api.post("supplier-interviews", payload);
            message.success("Entretien fournisseur enregistré avec succès !");
            form.resetFields();

            // Reset to initial company after form reset
            if (company) {
                form.setFieldsValue({ company_db: company });
                setCurrentCompany(company);
            }

            onSuccess?.(data);
        } catch (err) {
            if (err.response?.status === 422) {
                message.error(err.response.data.message);
            } else {
                console.error(err);
                message.error(
                    err?.response?.data?.message || "Une erreur inattendue est survenue"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyChange = (value) => {
        setCurrentCompany(value);
        // Reset supplier field when company changes
        form.setFieldsValue({ CT_Num: undefined });
    };

    // Fetch suppliers when currentCompany changes
    useEffect(() => {
        getSuppliers();
    }, [currentCompany]);

    // Set initial form values
    useEffect(() => {
        if (company) {
            form.setFieldsValue({ company_db: company });
        }
    }, [company, form]);

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ company_db: company }}
        >
            {/* Société */}
            <Form.Item
                label="Société"
                name="company_db"
                rules={[{ required: true, message: 'La Société est requise' }]}
            >
                <Select
                    onChange={handleCompanyChange}
                    placeholder="Sélectionnez la société"
                    className="w-full"
                >
                    <Select.Option value="sqlsrv_inter">Intercocina</Select.Option>
                    <Select.Option value="sqlsrv_asti">AstiDkora</Select.Option>
                    <Select.Option value="sqlsrv_serie">Seriemoble</Select.Option>
                    <Select.Option value="sqlsrv">Stile Mobili</Select.Option>
                </Select>
            </Form.Item>

            {/* Fournisseur */}
            <Form.Item
                label="Fournisseur"
                name="CT_Num"
                rules={[{ required: true, message: "Le fournisseur est obligatoire" }]}
            >
                <Select
                    showSearch
                    loading={loadingSuppliers}
                    disabled={!currentCompany || loadingSuppliers}
                    placeholder="Sélectionnez un fournisseur"
                    filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    options={suppliers}
                    notFoundContent={
                        !currentCompany
                            ? "Veuillez d'abord sélectionner une société"
                            : "Aucun fournisseur trouvé"
                    }
                />
            </Form.Item>

            {/* Date */}
            <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: "La date est obligatoire" }]}
            >
                <DatePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder="Sélectionnez une date"
                />
            </Form.Item>

            {/* Description */}
            <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "La description est obligatoire" }]}
            >
                <Input.TextArea
                    rows={4}
                    placeholder="Entrez la description de l'entretien"
                />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Enregistrer
                </Button>
            </Form.Item>
        </Form>
    );
};

export default SupplierInterviewForm;