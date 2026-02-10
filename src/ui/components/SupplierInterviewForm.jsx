import React, { useEffect, useState } from "react";
import { Form, Input, DatePicker, Button, message, Select } from "antd";
import { api } from "../utils/api";
import { locale } from "../utils/config";

const SupplierInterviewForm = ({ onSuccess, company }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [suppliers, setSuppliers] = useState([]);
    const [currentCompany, setCurrentCompany] = useState(company);


    const getCompts = async () => {
        try {
            const params = new URLSearchParams();
            if (currentCompany) params.append("company_db", currentCompany);

            const response = await api.get(`client/suppliers?${params.toString()}`);
            setSuppliers(
                response.data.map(item => ({
                    label: item.CT_Num + " " + item.CT_Intitule,
                    value: item.CT_Num,
                }))
            );
        } catch (error) {
            console.error(error);
            message.error(
                error.response?.data?.message ||
                "Erreur lors de la récupération des fournisseurs"
            );
        }
    };



    /* 🔹 Soumission du formulaire */
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
            onSuccess && onSuccess(data);
        } catch (err) {
            if (err.response?.status === 422) {
                message.error(err.response.data.message);
            } else {
                console.error(err);
                message.error(
                    err?.response?.data?.message ||
                    "Une erreur inattendue est survenue"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCompts();
    }, []);

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
                note: 0,
            }}
        >

            <Form.Item
                label={<span className="font-semibold text-gray-700 mt-2">Société</span>}
                name="company_db"
                rules={[
                    { required: true, message: 'La Société est requise' },
                ]}
            >
                <Select
                    onChange={(value) => setCurrentCompany(value)}
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
                label={<span className="font-semibold text-gray-700 mt-2">Fournisseur</span>}
                name="CT_Num"
                rules={[
                    { required: true, message: "Le fournisseur est obligatoire" },
                ]}
            >
                <Select
                    showSearch
                    placeholder="Sélectionnez un fournisseur"
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                    }
                    options={suppliers}
                />
            </Form.Item>

            {/* Date */}
            <Form.Item
                label="Date"
                name="date"
                rules={[
                    { required: true, message: "La date est obligatoire" },
                ]}
            >
                <DatePicker locale={locale} format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>

            {/* Description */}
            <Form.Item label="PRODUIT/ SERVICE ACHETE " name="description">
                <Input.TextArea
                    placeholder="PRODUIT/ SERVICE ACHETE"
                    rows={3}
                />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Enregistrer
                </Button>
            </Form.Item>
        </Form>
    );
};

export default SupplierInterviewForm;
