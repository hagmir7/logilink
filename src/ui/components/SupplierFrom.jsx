import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, message, Spin, Row, Col } from "antd";
import { api } from "../utils/api";

const SupplierFrom = ({
    open,
    onClose,
    clientCode,
    companyDb,
    onUpdated,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (!open || !clientCode) return;

        const fetchClient = async () => {
            try {
                setFetching(true);

                const { data } = await api.get(
                    `client/suppliers/${clientCode}`,
                    {
                        params: {
                            company_db: companyDb,
                        },
                    }
                );

                form.setFieldsValue({
                    CT_Intitule: data.CT_Intitule,
                    CT_Num: data.CT_Num,
                    CT_EMail: data.CT_EMail,
                    CT_Adresse: data.CT_Adresse,
                    CT_Telephone: data.CT_Telephone,
                    CT_Telecopie: data.CT_Telecopie,
                    CT_Ville: data.CT_Ville,
                    Nature_Achat: data.Nature_Achat,
                });
            } catch (error) {
                message.error("Échec du chargement des données du fournisseur");
            } finally {
                setFetching(false);
            }
        };


        fetchClient();
    }, [open, clientCode, companyDb, form]);

    /* 🔹 Soumettre la mise à jour */
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            await api.put(`client/${clientCode}`, {
                ...values,
                company_db: companyDb,
            });

            message.success("fournisseur mis à jour avec succès");
            onUpdated?.();
            onClose();
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (!error.errorFields) {
                message.error("Échec de la mise à jour");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={open}
            title={`Mettre à jour le Fournisseur ${clientCode}`}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Annuler
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    Mettre à jour
                </Button>,
            ]}
            // destroyOnClose
        >
            {fetching ? (
                <div style={{ textAlign: "center", padding: 30 }}>
                    <Spin />
                </div>
            ) : (
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Nom du fournisseur"
                                name="CT_Intitule"
                                rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Code fournisseur" name="CT_Num">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Email"
                        name="CT_EMail"
                        // rules={[{ type: "email", required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Adresse"
                        name="CT_Adresse"
                        // rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Téléphone"
                                name="CT_Telephone"
                                // rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Fax"
                                name="CT_Telecopie"
                                // rules={[{ required: true }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Ville"
                        name="CT_Ville"
                        // rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Nature d’achat"
                        name="Nature_Achat"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default SupplierFrom;
