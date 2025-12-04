import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { api } from '../utils/api';

export default function InvoiceDuplicate() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    console.log(values);
    

    try {
      const payload = {
        client: values.client?.trim() || null,
        souche: values.souche || null,
      };

      // POST (not GET) — this matches your .NET code
      const response = await api.post(`duplicate/${values.piece}`, payload);

      message.success(`Facture dupliquée avec succès ! Nouvelle pièce : ${response.data.message}`);

      form.resetFields();

    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Erreur inconnue";

      // Special case: "en cours d'utilisation"
      if (errorMessage.includes("en cours d'utilisation")) {
        message.warning("Impossible de dupliquer la facture. La pièce est actuellement ouverte dans Sage !");
      } else {
        message.error(errorMessage);
      }

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
        size="large"
        autoComplete="off"
      >

        {/* Piece */}
        <Form.Item
          label="Document pièce"
          name="piece"
          rules={[
            { required: true, message: 'Veuillez saisir la pièce !' },
            { max: 50, message: 'Maximum 50 caractères !' }
          ]}
        >
          <Input placeholder="Entrer la pièce" maxLength={50} />
        </Form.Item>

        {/* Client */}
        <Form.Item label="Client" name="client">
          <Input placeholder="Code client (optionnel)" />
        </Form.Item>

        {/* Souche */}
        <Form.Item
          label="Souche"
          name="souche"
          rules={[
            {
              required: true,
              message: "Veuillez sélectionner une souche",
            },
          ]}
        >
          <Select placeholder="Sélectionner une souche">
            <Select.Option value="Souche A">Souche A</Select.Option>
            <Select.Option value="Souche B">Souche B</Select.Option>
          </Select>
        </Form.Item>


        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="h-10"
          >
            Dupliquer
          </Button>
        </Form.Item>

      </Form>
    </div>
  );
}
