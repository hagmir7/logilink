import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { api } from '../utils/api';

export default function InvoiceDuplicate() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const response = await api.get(`duplicate/${values.piece}`);
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
          label="Document piece"
          name="piece"
          rules={[
            { required: true, message: 'Veuillez saisir document piece!' },
            { max: 50, message: 'Maximum 50 caractères!' }
          ]}
        >
          <Input
            placeholder="Entrer le piece"
            maxLength={50}
          />
        </Form.Item>



        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="h-10"
          >
           Dupliquer la facture
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}