import React from 'react';
import { Modal, Form, Select, Input, DatePicker, message } from 'antd';
import { updateComparison } from '../utils/api';

export default function ResultForm({ comparison, open, onClose, onSuccess }) {
  const [form] = Form.useForm();

  const providerNames = (comparison?.offers || []).map((o) => o.provider_name);

  const onFinish = async (values) => {
    try {
      if (values.purchasing_manager_date) values.purchasing_manager_date = values.purchasing_manager_date.format('YYYY-MM-DD');
      if (values.general_director_date) values.general_director_date = values.general_director_date.format('YYYY-MM-DD');
      values.status = 'valide';
      await updateComparison(comparison.id, values);
      message.success('Résultat enregistré avec succès.');
      form.resetFields();
      onSuccess?.();
    } catch {
      message.error('Erreur lors de l\'enregistrement.');
    }
  };

  return (
    <Modal
      title="Résultat & Validation"
      open={open}
      onCancel={() => { form.resetFields(); onClose(); }}
      onOk={() => form.submit()}
      okText="Valider le comparatif"
      cancelText="Annuler"
      width={520}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Prestataire sélectionné" name="selected_provider" rules={[{ required: true }]}>
          <Select placeholder="Choisir le prestataire retenu">
            {providerNames.map((n) => <Select.Option key={n} value={n}>{n}</Select.Option>)}
          </Select>
        </Form.Item>

        <Form.Item label="Justification technique et économique" name="selection_justification" rules={[{ required: true }]}>
          <Input.TextArea rows={3} placeholder="Motif du choix..." />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item label="Responsable Achats" name="purchasing_manager">
            <Input />
          </Form.Item>
          <Form.Item label="Date" name="purchasing_manager_date">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item label="Directeur Général" name="general_director">
            <Input />
          </Form.Item>
          <Form.Item label="Date" name="general_director_date">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}