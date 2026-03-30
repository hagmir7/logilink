// components/EmplacementLimitModal.jsx
import React, { useEffect } from "react";
import { Form, InputNumber, Select, Button, message, Modal, Input } from "antd";
import { api } from "../utils/api";

const { Option } = Select;

export default function EmplacementLimitForm({
    open,
    onClose,
    initialValues,
    onSuccess,
    emplacements = [],
    articles = [],
}) {
    const [form] = Form.useForm();
    const isEdit = !!initialValues?.id;

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [open, initialValues]);

    const onFinish = async (values) => {
        const uppercasedValues = Object.fromEntries(
            Object.entries(values).map(([key, value]) => [
                key,
                typeof value === "string" ? value.toUpperCase() : value,
            ])
        );

        try {
            if (isEdit) {
                const response = await api.put(`emplacement-limits/${initialValues.id}`, uppercasedValues);
                message.success(response.message);
            } else {
                const response = await api.post("emplacement-limits", uppercasedValues);
                message.success(response.message);
            }

            onSuccess && onSuccess();
            onClose();
            form.resetFields();
        } catch (error) {
            console.error(error);
            message.error("Une erreur est survenue 142");
        }
    };

    return (
        <Modal
            title={isEdit ? "Mettre à jour la limite d'emplacement" : "Créer une limite d'emplacement"}
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                {/* Emplacement */}
                <Form.Item
                    name="emplacement_code"
                    label="Emplacement"
                    rules={[{ required: true, message: "Champ obligatoire" }]}
                >
                    <Input placeholder="Emplacement" />
                </Form.Item>

                {/* Article */}
                <Form.Item
                    name="article_code"
                    label="Article"
                    rules={[{ required: true, message: "Champ obligatoire" }]}
                >
                    <Input placeholder="Référence" />
                </Form.Item>

                {/* Quantité */}
                <Form.Item
                    name="quantity"
                    label="Quantité"
                    className="w-full"
                    rules={[{ required: true, message: "Champ obligatoire" }]}
                >
                    <InputNumber
                        min={0}
                        className="w-full"
                        style={{width: "100%"}}
                        placeholder="Saisir la quantité"
                    />
                </Form.Item>

                {/* Soumission */}
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full rounded-xl"
                    >
                        {isEdit ? "Mettre à jour" : "Créer"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}