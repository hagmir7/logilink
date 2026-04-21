import React, { useEffect, useState } from 'react';
import { Descriptions, Table, Card, Button, Space, Tag, Popconfirm, message, Empty, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined, ArrowLeftOutlined, StarOutlined, FilePdfOutlined, LoadingOutlined } from '@ant-design/icons';
import { getComparison, deleteOffer, api } from '../utils/api';
import OfferForm from './OfferForm';
import EvaluationForm from './EvaluationForm';
import ResultForm from './ResultForm';
import { upperFirst } from 'lodash';

const STATUS_COLORS = { brouillon: 'default', soumis: 'processing', valide: 'success', rejete: 'error' };

export default function ComparisonDetail({ comparisonId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [offerModal, setOfferModal] = useState({ open: false, offer: null });
  const [evalModal, setEvalModal] = useState({ open: false, evaluation: null });
  const [resultModal, setResultModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getComparison(comparisonId);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [comparisonId]);

  const handleDeleteOffer = async (offerId) => {
    await deleteOffer(comparisonId, offerId);
    message.success('Offre supprimée.');
    fetchData();
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const res = await api.get(`/quote-comparisons/${comparisonId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comparatif-${data.reference || comparisonId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('PDF téléchargé avec succès.');
    } catch (error) {
      console.log(error);
      message.error('Erreur lors du téléchargement du PDF.');
    } finally {
      setPdfLoading(false);
    }
  };

const offerColumns = [
    { title: 'Prestataire', dataIndex: 'provider_name', key: 'name', fixed: 'left', width: 150,
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
    { title: 'Réf. devis', dataIndex: 'quote_reference', key: 'ref',
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
    { title: 'Désignation', dataIndex: 'product_designation', key: 'design',
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },  // ← removed ellipsis
    { title: 'Qté', dataIndex: 'quantity', key: 'qty', align: 'right',
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
    { title: 'P.U (MAD)', dataIndex: 'unit_price', key: 'pu', align: 'right',
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{Number(v).toLocaleString('fr-FR')}</span> },
    { title: 'Total (MAD)', dataIndex: 'total_price', key: 'total', align: 'right',
      render: (v) => <strong style={{ whiteSpace: 'nowrap' }}>{Number(v).toLocaleString('fr-FR')}</strong> },
    { title: 'Délai', dataIndex: 'delivery_delay', key: 'delay',
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
    { title: 'Paiement', dataIndex: 'payment_conditions', key: 'pay',
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
    { title: 'Garantie', dataIndex: 'warranty', key: 'warranty',
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
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
      render: (v) => <Tag color="blue" className="font-semibold">{v} / 10</Tag>,
      sorter: (a, b) => a.weighted_total - b.weighted_total,
      defaultSortOrder: 'descend',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Chargement du comparatif..." />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-5 px-3 py-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Retour
        </Button>

        <Space>
          <Button
            icon={pdfLoading ? <LoadingOutlined /> : <FilePdfOutlined />}
            onClick={handleDownloadPdf}
            loading={pdfLoading}
            className="!text-red-700"
          >
            Télécharger PDF
          </Button>

          <Tag
            color={STATUS_COLORS[data.status]}
            className="!text-sm !px-3 !py-1"
          >
            {upperFirst(data.status)}
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
          <Table
            rowKey="id"
            columns={offerColumns}
            dataSource={data.offers}
            pagination={false}
            scroll={{ x: 'max-content' }} 
            size="small"
          />
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
          <div className="text-center py-6">
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
        onSuccess={() => { setOfferModal({ open: false, offer: null }); fetchData(); }}
      />
      <EvaluationForm
        comparisonId={comparisonId}
        evaluation={evalModal.evaluation}
        open={evalModal.open}
        onClose={() => setEvalModal({ open: false, evaluation: null })}
        onSuccess={() => { setEvalModal({ open: false, evaluation: null }); fetchData(); }}
        offers={data.offers}
      />
      <ResultForm
        comparison={data}
        open={resultModal}
        onClose={() => setResultModal(false)}
        onSuccess={() => { setResultModal(false); fetchData(); }}
      />
    </div>
  );
}