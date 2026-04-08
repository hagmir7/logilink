import React from 'react';
import { Form, Input, DatePicker, Select, Button, message } from 'antd';
import { createComparison, updateComparison } from '../utils/api';
import dayjs from 'dayjs';

const DEPARTMENTS = [
  'Production', 'Maintenance', 'Qualité', 'Logistique', 'Administratif',
  'Ressources Humaines', 'Commercial', 'Technique', 'Autre',
];

export default function ComparisonForm({ initialData, onSuccess }) {
  const [form] = Form.useForm();
  const isEdit = !!initialData?.id;

  const onFinish = async (values) => {
    try {
      values.comparison_date = values.comparison_date.format('YYYY-MM-DD');
      if (isEdit) {
        await updateComparison(initialData.id, values);

        
        message.success('Comparatif mis à jour avec succès.');
      } else {
        await createComparison(values);
        message.success('Comparatif créé avec succès.');
      }
      onSuccess?.();
    } catch (err) {
        console.log(err);
        
      const errors = err.response?.data?.errors;
      if (errors) {
        form.setFields(Object.entries(errors).map(([name, msgs]) => ({ name, errors: msgs })));
      } else {
        message.error('Une erreur est survenue.');
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={isEdit ? {
        ...initialData,
        comparison_date: dayjs(initialData.comparison_date),
      } : undefined}
    >
      <Form.Item label="Référence" name="reference" rules={[{ required: true, message: 'La référence est obligatoire.' }]}>
        <Input placeholder="DA-2026/001" />
      </Form.Item>

      <Form.Item label="Date du comparatif" name="comparison_date" rules={[{ required: true, message: 'La date est obligatoire.' }]}>
        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
      </Form.Item>

      <Form.Item label="Service demandeur" name="department" rules={[{ required: true, message: 'Le service est obligatoire.' }]}>
        <Select placeholder="Sélectionner un service" allowClear showSearch>
          {DEPARTMENTS.map((d) => <Select.Option key={d} value={d}>{d}</Select.Option>)}
        </Select>
      </Form.Item>

      <Form.Item label="Objet de l'achat" name="purchase_object" rules={[{ required: true, message: "L'objet est obligatoire." }]}>
        <Input.TextArea rows={2} placeholder="Décrire l'objet de l'achat..." />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {isEdit ? 'Mettre à jour' : 'Créer le comparatif'}
        </Button>
      </Form.Item>
    </Form>
  );
}