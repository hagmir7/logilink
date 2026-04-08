import React from 'react';
import { Modal, Form, Input, Slider, Typography, message } from 'antd';
import { saveEvaluation } from '../utils/api';

const CRITERIA = [
  { name: 'price_score',       label: 'Prix et conditions commerciales', weight: '30%' },
  { name: 'delivery_score',    label: 'Délai de livraison',              weight: '25%' },
  { name: 'technical_score',   label: 'Conformité technique',            weight: '25%' },
  { name: 'reliability_score', label: 'Fiabilité / Réactivité',          weight: '10%' },
  { name: 'payment_score',     label: 'Conditions de paiement',          weight: '10%' },
];

export default function EvaluationForm({ comparisonId, evaluation, open, onClose, onSuccess }) {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await saveEvaluation(comparisonId, values);
      message.success('Évaluation enregistrée.');
      form.resetFields();
      onSuccess?.();
    } catch (err) {
      message.error('Erreur lors de l\'enregistrement.');
    }
  };

  return (
    <Modal
      title="Évaluer un prestataire"
      open={open}
      onCancel={() => { form.resetFields(); onClose(); }}
      onOk={() => form.submit()}
      okText="Enregistrer"
      cancelText="Annuler"
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={evaluation}>
        <Form.Item label="Nom du prestataire" name="provider_name" rules={[{ required: true }]}>
          <Input placeholder="Fournisseur ABC" />
        </Form.Item>

        {CRITERIA.map(({ name, label, weight }) => (
          <Form.Item key={name} label={`${label} (${weight})`} name={name} rules={[{ required: true }]}>
            <Slider min={1} max={10} marks={{ 1: '1', 5: '5', 10: '10' }} />
          </Form.Item>
        ))}

        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Note finale = (Note × Pondération) / 100 — calculée automatiquement côté serveur.
        </Typography.Text>
      </Form>
    </Modal>
  );
}