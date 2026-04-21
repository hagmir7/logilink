import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Button, message } from 'antd';
import { api, createComparison, updateComparison } from '../utils/api';
import dayjs from 'dayjs';

const DEPARTMENTS = [
  'Production', 'Maintenance', 'Qualité', 'Logistique', 'Administratif',
  'Ressources Humaines', 'Commercial', 'Technique', 'Autre',
];

export default function ComparisonForm({ initialData, onSuccess }) {
  const [form] = Form.useForm();
  const isEdit = !!initialData?.id;
  const [services, setServices] = useState([]);

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


  const fetchServices = async () => {
    try {
      const response = await api.get('services');
      
      setServices(response.data.map(c => ({
        label: c.name,
        value: c.name
      })))
    } catch (error) {
      console.error(error);
      message.error(error?.response?.data?.message || "Une erreur s'est produite")
    }
  }

  useEffect(()=>{
    fetchServices()
  }, [])


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
        <Select options={services} placeholder="Sélectionner un service" allowClear showSearch />
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