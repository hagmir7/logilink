import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, message, Select } from 'antd';
import { api, createOffer, updateOffer } from '../utils/api';
import dayjs from 'dayjs';

export default function OfferForm({ comparisonId, offer, open, onClose, onSuccess }) {

  const [suppliers, setSuppliers] = useState([]);
  
  const [form] = Form.useForm();
  const isEdit = !!offer?.id;

  const onFinish = async (values) => {
    try {
      if (values.quote_date) values.quote_date = values.quote_date.format('YYYY-MM-DD');
      if (isEdit) {
        await updateOffer(comparisonId, offer.id, values);
        message.success('Offre mise à jour.');
      } else {
        await createOffer(comparisonId, values);
        message.success('Offre ajoutée.');
      }
      form.resetFields();
      onSuccess?.();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        form.setFields(Object.entries(errors).map(([name, msgs]) => ({ name, errors: msgs })));
      }
    }
  };


    const fetchSuppliers = async (reset = false) => {
    // setLoading(true);

    try {
      const response = await api.get("client/suppliers", {
        params: { company_db: 'sqlsrv_inter' },
      });
      setSuppliers(
        response.data.map(item => ({
          label: item.CT_Intitule + " " + item.CT_Num,
          value: item.CT_Intitule + " " + item.CT_Num,
        }))
      );
    } catch (error) {
      console.error(error);
      message.warning(
        error?.response?.data?.message ||
        "Erreur lors du chargement des fournisseurs."
      );
    } finally {
      // setLoading(false);
    }
  };


  useEffect(()=>{
    fetchSuppliers();
  }, []);

  return (
    <Modal
      title={isEdit ? 'Modifier l\'offre' : 'Ajouter une offre'}
      open={open}
      onCancel={() => { form.resetFields(); onClose(); }}
      onOk={() => form.submit()}
      okText={isEdit ? 'Modifier' : 'Ajouter'}
      cancelText="Annuler"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={isEdit ? { ...offer, quote_date: offer.quote_date ? dayjs(offer.quote_date) : null } : undefined}
      >
        <Form.Item label="Nom du prestataire" name="provider_name" rules={[{ required: true, message: 'Obligatoire' }]}>
          <Select
            options={suppliers}
            placeholder="Fournisseur"
            showSearch
            allowClear
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item label="Référence devis" name="quote_reference">
            <Input />
          </Form.Item>
          <Form.Item label="Date du devis" name="quote_date">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </div>

        <Form.Item label="Désignation produit / service" name="product_designation">
          <Input.TextArea rows={2} />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Form.Item label="Quantité" name="quantity" rules={[{ required: true, message: 'Obligatoire' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Prix unitaire (MAD)" name="unit_price" rules={[{ required: true, message: 'Obligatoire' }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Délai de validité" name="validity_period">
            <Input placeholder="30 jours" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item label="Conditions de paiement" name="payment_conditions">
            <Input />
          </Form.Item>
          <Form.Item label="Délai de livraison" name="delivery_delay">
            <Input placeholder="15 jours" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item label="Garantie / SAV" name="warranty">
            <Input />
          </Form.Item>
          <Form.Item label="Conformité technique" name="technical_compliance">
            <Input />
          </Form.Item>
        </div>

        <Form.Item label="Observations" name="observations">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
}