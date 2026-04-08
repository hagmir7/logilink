import React, { useEffect, useState } from 'react';
import { Descriptions, Table, Card, Button, Space, Tag, Popconfirm, message, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined, ArrowLeftOutlined, StarOutlined, FilePdfOutlined } from '@ant-design/icons';
import { getComparison, deleteOffer, getPdfUrl } from '../utils/api';
import OfferForm from './OfferForm';
import EvaluationForm from './EvaluationForm';
import ResultForm from './ResultForm';

const STATUS_COLORS = { brouillon: 'default', soumis: 'processing', valide: 'success', rejete: 'error' };

export default function ComparisonDetail({ comparisonId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerModal, setOfferModal] = useState({ open: false, offer: null });
  const [evalModal, setEvalModal] = useState({ open: false, evaluation: null });
  const [resultModal, setResultModal] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getComparison(comparisonId);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [comparisonId]);

  const handleDeleteOffer = async (offerId) => {
    await deleteOffer(comparisonId, offerId);
    message.success('Offre supprimée.');
    fetch();
  };

  const offerColumns = [
    { title: 'Prestataire', dataIndex: 'provider_name', key: 'name', fixed: 'left', width: 150 },
    { title: 'Réf. devis', dataIndex: 'quote_reference', key: 'ref' },
    { title: 'Désignation', dataIndex: 'product_designation', key: 'design', ellipsis: true },
    { title: 'Qté', dataIndex: 'quantity', key: 'qty', align: 'right' },
    { title: 'P.U (MAD)', dataIndex: 'unit_price', key: 'pu', align: 'right', render: (v) => Number(v).toLocaleString('fr-FR') },
    { title: 'Total (MAD)', dataIndex: 'total_price', key: 'total', align: 'right', render: (v) => <strong>{Number(v).toLocaleString('fr-FR')}</strong> },
    { title: 'Délai', dataIndex: 'delivery_delay', key: 'delay' },
    { title: 'Paiement', dataIndex: 'payment_conditions', key: 'pay' },
    { title: 'Garantie', dataIndex: 'warranty', key: 'warranty' },
    {
      title: '', key: 'actions', width: 80, fixed: 'right',
      render: (_, r) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => setOfferModal({ open: true, offer: r })} />
          <Popconfirm title="Supprimer ?" onConfirm={() => handleDeleteOffer(r.id)}>
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const evalColumns = [
    { title: 'Prestataire', dataIndex: 'provider_name', key: 'name' },
    { title: 'Prix (30%)', dataIndex: 'price_score', key: 'p', align: 'center' },
    { title: 'Délai (25%)', dataIndex: 'delivery_score', key: 'd', align: 'center' },
    { title: 'Technique (25%)', dataIndex: 'technical_score', key: 't', align: 'center' },
    { title: 'Fiabilité (10%)', dataIndex: 'reliability_score', key: 'r', align: 'center' },
    { title: 'Paiement (10%)', dataIndex: 'payment_score', key: 'pm', align: 'center' },
    {
      title: 'Note finale', dataIndex: 'weighted_total', key: 'total', align: 'center',
      render: (v) => <Tag color="blue" style={{ fontWeight: 600 }}>{v} / 10</Tag>,
      sorter: (a, b) => a.weighted_total - b.weighted_total,
      defaultSortOrder: 'descend',
    },
  ];

  if (loading || !data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Retour
        </Button>

        <Space>
          <Button
            icon={<FilePdfOutlined />}
            onClick={async () => {
              const url = await getPdfUrl(comparisonId);
              if (url) {
                window.open(url, '_blank');
              }
            }}
            style={{ color: '#cf1322' }}
          >
            Télécharger PDF
          </Button>

          <Tag
            color={STATUS_COLORS[data.status]}
            style={{ fontSize: 14, padding: '4px 12px' }}
          >
            {data.status}
          </Tag>
        </Space>
      </div>

      {/* Informations générales */}
      <Card title="Informations générales" size="small">
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Référence">{data.reference}</Descriptions.Item>
          <Descriptions.Item label="Date">{data.comparison_date?.slice(0, 10)}</Descriptions.Item>
          <Descriptions.Item label="Service">{data.department}</Descriptions.Item>
          <Descriptions.Item label="Objet">{data.purchase_object}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Détail des offres */}
      <Card
        title="Détail des offres reçues"
        size="small"
        extra={
          <Button size="small" icon={<PlusOutlined />} onClick={() => setOfferModal({ open: true, offer: null })}>
            Ajouter une offre
          </Button>
        }
      >
        {data.offers?.length ? (
          <Table rowKey="id" columns={offerColumns} dataSource={data.offers} pagination={false} scroll={{ x: 1000 }} size="small" />
        ) : (
          <Empty description="Aucune offre ajoutée" />
        )}
      </Card>

      {/* Évaluation et pondération */}
      <Card
        title="Évaluation et pondération"
        size="small"
        extra={
          <Button size="small" icon={<StarOutlined />} onClick={() => setEvalModal({ open: true, evaluation: null })}>
            Évaluer un prestataire
          </Button>
        }
      >
        {data.evaluations?.length ? (
          <Table rowKey="id" columns={evalColumns} dataSource={data.evaluations} pagination={false} size="small" />
        ) : (
          <Empty description="Aucune évaluation" />
        )}
      </Card>

      {/* Résultat */}
      <Card title="Résultat du comparatif" size="small">
        {data.selected_provider ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Prestataire retenu">
              <Tag color="green">{data.selected_provider}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Justification">{data.selection_justification}</Descriptions.Item>
            <Descriptions.Item label="Responsable Achats">{data.purchasing_manager} — {data.purchasing_manager_date?.slice(0, 10)}</Descriptions.Item>
            <Descriptions.Item label="Directeur Général">{data.general_director} — {data.general_director_date?.slice(0, 10)}</Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Button type="primary" icon={<TrophyOutlined />} onClick={() => setResultModal(true)}>
              Sélectionner le prestataire retenu
            </Button>
          </div>
        )}
      </Card>

      {/* Modals */}
      <OfferForm
        comparisonId={comparisonId}
        offer={offerModal.offer}
        open={offerModal.open}
        onClose={() => setOfferModal({ open: false, offer: null })}
        onSuccess={() => { setOfferModal({ open: false, offer: null }); fetch(); }}
      />
      <EvaluationForm
        comparisonId={comparisonId}
        evaluation={evalModal.evaluation}
        open={evalModal.open}
        onClose={() => setEvalModal({ open: false, evaluation: null })}
        onSuccess={() => { setEvalModal({ open: false, evaluation: null }); fetch(); }}
      />
      <ResultForm
        comparison={data}
        open={resultModal}
        onClose={() => setResultModal(false)}
        onSuccess={() => { setResultModal(false); fetch(); }}
      />
    </div>
  );
}