import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, DatePicker, Button, message, Select } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const SupplierInterviewForm = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [suppliers, setSuppliers] = useState([]);


    const getCompts = async () => {
        try {
            const params = new URLSearchParams();
            if (company) params.append('company_db', company);

            const response = await api.get(`client/suppliers?${params.toString()}`);
            setSuppliers(
                response.data.map(item => ({
                    label: item.CT_Num + " " + item.CT_Intitule,
                    value: item.CT_Num
                }))
            );
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Erreur lors de la récupération des fournisseurs');
        }
    };



    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            const payload = {
                ...values,
                date: values.date.format("YYYY-MM-DD"),
            };

            const { data } = await axios.post("/api/supplier-interviews", payload);

            message.success("Supplier interview saved successfully!");
            form.resetFields();
            onSuccess && onSuccess(data);
        } catch (err) {
            if (err.response?.status === 422) {
                message.error(err.response.data.message);
            } else {
                message.error("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };



    useEffect(()=>{
        getCompts
    }, [])

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
                note: 0,
            }}
        >
            {/* Fournisseur */}
            <Form.Item
                label={<span className="font-semibold text-gray-700 mt-2">Fournisseur</span>}
                name="client_id"
                rules={[
                    { required: true, message: 'Le fournisseur est requis' },
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

            <Form.Item
                label="Date"
                name="date"
                rules={[{ required: true, message: "Date is required" }]}
            >
                <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Description" name="description">
                <Input.TextArea placeholder="Optional description" rows={3} />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Save
                </Button>
            </Form.Item>
        </Form>
    );
};

export default SupplierInterviewForm;
