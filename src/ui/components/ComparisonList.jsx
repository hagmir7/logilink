import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { getComparisons, deleteComparison } from '../utils/api';

const STATUS_COLORS = {
  brouillon: 'default',
  soumis: 'processing',
  valide: 'success',
  rejete: 'error',
};

export default function ComparisonList({ onAdd, onView }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, total: 0, pageSize: 15 });

  const fetch = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getComparisons(page);
      setData(res.data.data);
      setPagination({ current: res.data.current_page, total: res.data.total, pageSize: 15 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    await deleteComparison(id);
    message.success('Comparatif supprimé avec succès.');
    fetch(pagination.current);
  };

  const columns = [
    { title: 'Référence', dataIndex: 'reference', key: 'reference' },
    { title: 'Date', dataIndex: 'comparison_date', key: 'date', render: (d) => d?.slice(0, 10) },
    { title: 'Service', dataIndex: 'department', key: 'department' },
    { title: 'Objet', dataIndex: 'purchase_object', key: 'object', ellipsis: true },
    { title: 'Prestataire retenu', dataIndex: 'selected_provider', key: 'provider', render: (v) => v || '—' },
    {
      title: 'Statut', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={STATUS_COLORS[s]}>{s}</Tag>,
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => onView(record.id)}>Voir</Button>
          <Popconfirm title="Supprimer ce comparatif ?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Comparatifs des devis</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Nouveau comparatif</Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={pagination}
        onChange={(p) => fetch(p.current)}
      />
    </div>
  );
}