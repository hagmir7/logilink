import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

export default function RoleModal({ open, mode, initialName, loading, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  useEffect(() => { if (open) form.setFieldsValue({ name: initialName ?? '' }); }, [open, initialName, form]);
  return (
    <Modal title={mode === 'create' ? 'Ajouter un rôle' : 'Renommer le rôle'} open={open} onCancel={onCancel} confirmLoading={loading} okText={mode === 'create' ? 'Créer' : 'Enregistrer'} cancelText="Annuler" destroyOnHidden onOk={() => form.submit()}>
      <Form form={form} onFinish={({ name }) => onSubmit(name.trim())} layout="vertical" className="!mt-4">
        <Form.Item name="name" label="Nom du rôle" rules={[{ required: true, whitespace: true, message: 'Saisissez un nom de rôle.' }, { max: 125 }]}>
          <Input autoFocus placeholder="Nom du rôle" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
