import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Input, DatePicker, Select,
  Button, message, Spin, Radio, Table, Divider, Tag, Space
} from 'antd';
import { SendOutlined, LoadingOutlined, CheckCircleOutlined, CheckSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { api } from '../utils/api';
import { locale } from '../utils/config';

const STATUS_COLORS = { Oui: 'green', Non: 'red', 'N.A': 'default' };
const STATUS_OPTIONS = ['Oui', 'Non', 'N.A'];

export default function CheckListModal({ document_id, open, setOpen, reload }) {
  const [form]                          = Form.useForm();
  const [loading, setLoading]           = useState(false);
  const [fetching, setFetching]         = useState(false);
  const [criteriaRows, setCriteriaRows] = useState([]);
  const [users, setUsers]               = useState([]);

  useEffect(() => {
    if (!open) return;
    fetchCriteria();
  }, [open]);

  const fetchCriteria = async () => {
    setFetching(true);
    try {
      const [criteriaRes, usersRes] = await Promise.all([
        api.get('shipping-criteria'),
        api.get('users/role/chargement'),
      ]);

      setUsers(
        usersRes.data.map(user => ({ label: user.full_name, value: user.id }))
      );
      setCriteriaRows(
        criteriaRes.data.map(c => ({
          id:     c.id,
          name:   c.name,
          status: null,
          note:   '',
        }))
      );
    } catch {
      message.error('Failed to load checklist criteria.');
    } finally {
      setFetching(false);
    }
  };

  const updateRow = (id, field, value) =>
    setCriteriaRows(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );

  // Set all rows to a given status value (or null to clear)
  const setAllStatus = (value) =>
    setCriteriaRows(prev => prev.map(r => ({ ...r, status: value })));

  // Derived state for the "select all" button label/icon
  const allAnswered   = criteriaRows.length > 0 && criteriaRows.every(r => r.status);
  const answeredCount = criteriaRows.filter(r => r.status).length;
  const noneAnswered  = criteriaRows.every(r => !r.status);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const unanswered = criteriaRows.filter(r => !r.status);
      if (unanswered.length > 0) {
        message.warning(`Please select a status for all ${unanswered.length} criteria row(s).`);
        return;
      }

      setLoading(true);

      const payload = {
        code:            values.code,
        shipping_date:   values.shipping_date?.format('YYYY-MM-DD'),
        validation_date: values.validation_date?.format('YYYY-MM-DD') ?? null,
        user_id:         values.user_id,
        document_id,
        criteria: criteriaRows.map(r => ({
          shipping_criteria_id: r.id,
          status:               r.status,
          note:                 r.note,
        })),
      };

      await api.post('shippings', payload);
      message.success("Liste de contrôle d'expédition soumise avec succès !");
      reload()
      handleClose();

    } catch (err) {
      if (err?.response?.data?.errors) {
        Object.values(err.response.data.errors).flat().forEach(m => message.error(m));
      } else if (!err?.errorFields) {
        message.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setCriteriaRows([]);
    setOpen(false);
  };


   
  const columns = [
    {
      title: <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Point de contrôle</span>,
      dataIndex: 'name',
      width: '40%',
      render: (name, _, index) => (
        <div className="flex items-start gap-2 py-1">
          <span className="text-xs text-gray-400 font-mono mt-0.5 w-4 shrink-0">{index + 1}</span>
          <span className="text-sm text-gray-800 leading-snug">{name}</span>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">État</span>
          {/* ── Select-all controls ── */}
          {criteriaRows.length > 0 && (
            <Space size={4}>
              {STATUS_OPTIONS.map(opt => {
                const allSet = criteriaRows.length > 0 && criteriaRows.every(r => r.status === opt);
                return (
                  <Button
                    key={opt}
                    size="small"
                    type={allSet ? 'primary' : 'default'}
                    ghost={allSet}
                    onClick={() => setAllStatus(allSet ? null : opt)}
                    className="!text-xs !h-6 !px-2 !leading-none"
                    style={
                      allSet
                        ? {
                            borderColor:
                              opt === 'Oui' ? '#16a34a' :
                              opt === 'Non' ? '#dc2626' : '#9ca3af',
                            color:
                              opt === 'Oui' ? '#16a34a' :
                              opt === 'Non' ? '#dc2626' : '#6b7280',
                          }
                        : {}
                    }
                    title={allSet ? `Désélectionner tout "${opt}"` : `Tout cocher "${opt}"`}
                  >
                    {allSet ? <MinusSquareOutlined /> : <CheckSquareOutlined />}
                    {' '}{opt}
                  </Button>
                );
              })}
            </Space>
          )}
        </div>
      ),
      dataIndex: 'status',
      width: '42%',
      render: (val, record) => (
        <Radio.Group
          value={val}
          onChange={e => updateRow(record.id, 'status', e.target.value)}
          className="flex gap-1"
        >
          {STATUS_OPTIONS.map(opt => (
            <Radio.Button
              key={opt}
              value={opt}
              className="!text-xs !px-3 !h-7 !leading-7"
              style={
                val === opt
                  ? {
                      backgroundColor:
                        opt === 'Oui' ? '#f0fdf4' :
                        opt === 'Non' ? '#fef2f2' : '#f9fafb',
                      borderColor:
                        opt === 'Oui' ? '#16a34a' :
                        opt === 'Non' ? '#dc2626' : '#9ca3af',
                      color:
                        opt === 'Oui' ? '#16a34a' :
                        opt === 'Non' ? '#dc2626' : '#6b7280',
                    }
                  : {}
              }
            >
              {opt}
            </Radio.Button>
          ))}
        </Radio.Group>
      ),
    },
    {
      title: <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Observation</span>,
      dataIndex: 'note',
      render: (val, record) => (
        <Input
          size="small"
          placeholder="Remarque..."
          value={val}
          onChange={e => updateRow(record.id, 'note', e.target.value)}
          className="!text-sm"
        />
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 py-1">
          <div className="w-8 h-8 rounded-lg flex border border-gray-400 items-center justify-center shrink-0">
            <CheckCircleOutlined color='white' className="text-white text-base" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight p-0 m-0" style={{margin: 0}}>
              Fiche de contrôle expédition
            </p>
            {criteriaRows.length > 0 && (
              <Tag
                color={allAnswered ? 'green' : 'orange'}
                className="ml-auto !text-xs"
              >
                {answeredCount} / {criteriaRows.length} complétés
              </Tag>
            )}
          </div>
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={800}
      footer={
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-400">
            {allAnswered
              ? '✓ Tous les critères sont renseignés'
              : `${criteriaRows.length - answeredCount} critère(s) en attente`}
          </span>
          <div className="flex gap-2">
            <Button onClick={handleClose} disabled={loading}>
              Annuler
            </Button>
            <Button
              type="primary"
              icon={loading ? <LoadingOutlined /> : <SendOutlined />}
              onClick={handleSubmit}
              loading={loading}
              disabled={!allAnswered}
            >
              Valider l'expédition
            </Button>
          </div>
        </div>
      }
      destroyOnClose
    >
      <Spin spinning={fetching} tip="Chargement des critères...">

        {/* ── Header fields ── */}
        <Form form={form} layout="vertical" className="mt-2">
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="user_id"
              label={<span className="text-xs font-medium text-gray-600">Nom & Prénom</span>}
              rules={[{ required: true, message: 'Champ requis' }]}
            >
              <Select
                placeholder="Sélectionner un utilisateur"
                showSearch
                optionFilterProp="label"
                options={users}
              />
            </Form.Item>

            <Form.Item
              name="shipping_date"
              label={<span className="text-xs font-medium text-gray-600">Date d'expédition</span>}
              rules={[{ required: true, message: 'La date est requise' }]}
            >
              <DatePicker locale={locale} className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
          </div>
        </Form>

        {/* ── Checklist table ── */}
        <Divider className="!my-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Points de contrôle
          </span>
        </Divider>

        <Table
          dataSource={criteriaRows}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
          rowClassName={r =>
            r.status
              ? r.status === 'Oui'
                ? 'bg-green-50'
                : r.status === 'Non'
                ? 'bg-red-50'
                : 'bg-gray-50'
              : ''
          }
          locale={{ emptyText: fetching ? ' ' : 'Aucun critère disponible.' }}
          className="rounded-lg overflow-hidden border border-gray-200"
        />

        {/* ── Validation block ── */}
        {allAnswered && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircleOutlined className="text-green-600" />
            <span className="text-xs text-green-700 font-medium">
              Oui Pour Tout — Expédition conforme
            </span>
          </div>
        )}

      </Spin>
    </Modal>
  );
}