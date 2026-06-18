import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Table, Select, Tag, Card, Typography, Alert, Empty, Modal, Divider, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { CheckCircle } from 'lucide-react';

const { Title, Text } = Typography;

const API_URL = 'https://app.intercocina.com/api/orders/json';
const API_KEY = 'BUvM$K|+z)XS)kz}cOal2cg{)gJV|H$';

const STATUS_MAP = {
  1: { label: 'En Attente', color: 'gold' },
  2: { label: 'Confirmé', color: 'blue' },
  3: { label: 'Préparation', color: 'purple' },
  4: { label: 'Prêt', color: 'green' },
  5: { label: 'Annulé', color: 'red' },
};

const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(([value, { label }]) => ({
  value: Number(value),
  label,
}));

const formatMAD = (value) =>
  `${new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)} DH`;

const formatDate = (value) =>
  new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function WebsiteOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(undefined);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchOrders = useCallback(async (statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(API_URL, {
        headers: { 'X-API-Key': API_KEY },
        params: statusFilter !== undefined ? { status: statusFilter } : {},
      });
      setOrders(data?.data ?? []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          'Impossible de charger les commandes.'
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(status);
  }, [status, fetchOrders]);

  const openOrderDetail = (record) => {
    setSelectedOrder(record);
    setDetailOpen(true);
  };

  const closeOrderDetail = () => {
    setDetailOpen(false);
    setSelectedOrder(null);
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'Client',
      key: 'customer',
      render: (_, record) =>
        record.customer ? (
          <div>
            {record.customer_code}
          </div>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Articles',
      key: 'products',
      align: 'center',
      render: (_, record) => record.products?.length ?? 0,
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      align: 'right',
      sorter: (a, b) => a.total_amount - b.total_amount,
      render: (value) => <Text strong>{formatMAD(value)}</Text>,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (value) => {
        const info = STATUS_MAP[value] || { label: 'Inconnu', color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: formatDate,
    },
    {
      title: '',
      key: 'actions',
      align: 'center',
      width: 56,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            openOrderDetail(record);
          }}
        />
      ),
    },
  ];

const productColumns = [
  {
    title: 'Désignation',
    dataIndex: 'designation',
    key: 'designation',
    render: (text) => (
      <div className="whitespace-nowrap">
        {text}
      </div>
    ),
  },
  {
    title: 'Couleur',
    dataIndex: 'color',
    key: 'color',
    width: 100,
  },
  {
    title: 'Dimensions',
    dataIndex: 'dimensions',
    key: 'dimensions',
    width: 130,
  },
  {
    title: 'Qté',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 70,
    align: 'center',
  },
  {
    title: 'Remise',
    dataIndex: 'discount',
    key: 'discount',
    width: 70,
    align: 'center',
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    width: 110,
    align: 'right',
    render: formatMAD,
  },
];


  const validate = () =>{

  }

  const selectedStatusInfo = selectedOrder
    ? STATUS_MAP[selectedOrder.status] || { label: 'Inconnu', color: 'default' }
    : null;

  return (
    <div className=" bg-slate-50 min-h-screen">

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Title level={4} className="!mb-0 px-3 py-2">
            Commandes du site
          </Title>
          <div className="flex items-center gap-2 px-3 py-2">
            <Select
              allowClear
              placeholder="Tous les statuts"
              style={{ width: 200 }}
              value={status}
              onChange={(value) => setStatus(value)}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        {error && (
          <Alert
            type="error"
            // message="Erreur"
            description={error}
            showIcon
            className="mb-4 p-0"
          />
        )}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={loading}
          onRow={(record) => ({
            onClick: () => openOrderDetail(record),
            style: { cursor: 'pointer' },
          })}
          size='small'
          locale={{ emptyText: <Empty description="Aucune commande trouvée" /> }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} commande(s)`,
          }}
          scroll={{ x: true }}
        />

        <Modal
          title={selectedOrder ? `Commande ${selectedOrder.code}` : ''}
          open={detailOpen}
          onCancel={closeOrderDetail}
          footer={null}
          width={900}
          centered
          destroyOnClose
        >
          {selectedOrder && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 border border-gray-300 p-2 rounded-2xl">
                <div>
                  <Text type="secondary" className="block text-xs">Référence</Text>
                  <div><Text strong>{selectedOrder.reference}</Text></div>
                </div>
                <div>
                  <Text type="secondary" className="block text-xs">Statut</Text>
                  <div><Tag color={selectedStatusInfo.color}>{selectedStatusInfo.label}</Tag></div>
                </div>
                <div>
                  <Text type="secondary" className="block text-xs">Client</Text>
                  <div>{selectedOrder.customer ? selectedOrder.customer_code : <Text type="secondary">—</Text>}</div>
                </div>
                <div>
                  <Text type="secondary" className="block text-xs">Date</Text>
                  <div>{formatDate(selectedOrder.created_at)}</div>
                </div>
              </div>

              <Divider className="!my-3" />

              <Table
                columns={productColumns}
                dataSource={selectedOrder.products}
                rowKey="id"
                pagination={false}
                scroll={{ x: true }}
                size="small"
              />

            <div className="flex justify-end mt-4">
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 min-w-[250px]">
                <div className="flex justify-between items-center mb-2">
                  <Text type="secondary">Total HT</Text>
                  <Text strong>
                    {formatMAD(selectedOrder.total_amount)}
                  </Text>
                </div>

                {/* <Divider className="p-0" /> */}

                <div className="flex justify-between items-center">
                  <Text strong style={{ fontSize: 14 }}>
                    Total TTC
                  </Text>
                  <Text strong style={{ fontSize: 16 }}>
                    {formatMAD(selectedOrder.total_amount)}
                  </Text>
                </div>
              </div>
            </div>

              <div>

                <Button color='green' variant='solid' onClick={validate} icon={<CheckCircle size={16} />}>
                  Valider
                </Button>

              </div>
            </div>
          )}
        </Modal>
    </div>
  );
}