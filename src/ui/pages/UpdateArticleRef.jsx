import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { api } from '../utils/api';

export default function UpdateArticleRef() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);

        try {
            const response = await api.post('articles/update-ref', {
                old_ref: values.old_ref,
                new_ref: values.new_ref,
                compnay_db: values.compnay_db
            });
            message.success(response.data.message)
            form.resetFields();
        } catch (err) {
            message.error(err.response.data.message || 'Une erreur est survenue lors de la mise à jour')
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
                size="large"
            >
                <Form.Item
                    label="Ancienne référence"
                    name="old_ref"
                    rules={[
                        { required: true, message: 'Veuillez saisir l\'ancienne référence!' },
                        { max: 50, message: 'Maximum 50 caractères!' }
                    ]}
                >
                    <Input
                        placeholder="Entrer l'ancienne référence"
                        maxLength={50}
                    />
                </Form.Item>

                <Form.Item
                    label="Nouvelle référence"
                    name="new_ref"
                    rules={[
                        { required: true, message: 'Veuillez saisir la nouvelle référence!' },
                        { max: 50, message: 'Maximum 50 caractères!' }
                    ]}
                >
                    <Input
                        placeholder="Entrer la nouvelle référence"
                        maxLength={50}
                    />
                </Form.Item>

                <Form.Item
                    label="Base de données"
                    name="compnay_db"
                    rules={[
                        { required: true, message: 'Veuillez sélectionner une base de données!' }
                    ]}
                >
                    <Select placeholder="Sélectionner une base de données" options={[
                        { value: 'sqlsrv_inter', label: 'INTERCOCINA' },
                        { value: 'sqlsrv_serie', label: 'SERIE MOBLE' },
                        { value: 'sqlsrv', label: 'STILE MOBILI' },
                        { value: 'sqlsrv_asti', label: 'ASTIDKORA' },
                    ]}>

                    </Select>
                </Form.Item>

                <Form.Item className="mb-0">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        className="h-10"
                    >
                        Mettre à jour la référence
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}