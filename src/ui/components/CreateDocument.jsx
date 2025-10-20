import React from 'react';
import { Card, Row, Col, Table, Tag, Button, Divider, Space } from 'antd';
import {
  FileTextOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
  CalculatorOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  SendOutlined,
  MoreOutlined
} from '@ant-design/icons';

const CreateDocument = () => {
  // Mock data for the table
  const tableData = [
    {
      key: '1',
      reference: 'REF001',
      designation: 'Produit A',
      hauteur: '200 cm',
      largeur: '150 cm',
      pu_ht: '150.00 €'
    },
    {
      key: '2',
      reference: 'REF002',
      designation: 'Produit B',
      hauteur: '180 cm',
      largeur: '120 cm',
      pu_ht: '200.00 €'
    },
  ];

  const columns = [
    {
      title: 'Référence article',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'Désignation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Hauteur',
      dataIndex: 'hauteur',
      key: 'hauteur',
    },
    {
      title: 'Largeur',
      dataIndex: 'largeur',
      key: 'largeur',
    },
    {
      title: 'P.U. HT',
      dataIndex: 'pu_ht',
      key: 'pu_ht',
    },
  ];

  const functions = [
    { icon: <FileTextOutlined />, label: 'Batèmes' },
    { icon: <InfoCircleOutlined />, label: 'Informations' },
    { icon: <MoreOutlined />, label: 'Pied' },
    { icon: <PrinterOutlined />, label: 'Imprimer' },
    { icon: <CalculatorOutlined />, label: 'Comptabilité' },
    { icon: <SyncOutlined />, label: 'Transformer' },
    { icon: <CheckCircleOutlined />, label: 'Valider' },
    { icon: <SendOutlined />, label: 'Expédition' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Card className="shadow-lg border-0">
        {/* Header */}
        <div className="bg-blue-50 border-b border-gray-200 p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">
              Devis : Envoyé N° 25BDE00454 CL012 INTERIEUR MARROC
            </h1>
            <Tag color="green" className="text-sm font-semibold">
              Statut: Envoyé
            </Tag>
          </div>
        </div>

        {/* Functions Menu */}
        <div className="bg-white py-3 px-4 border-b border-gray-200">
          <Space size="middle">
            {functions.map((func, index) => (
              <Button
                key={index}
                type="text"
                icon={func.icon}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
              >
                {func.label}
              </Button>
            ))}
          </Space>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Client Information Section */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} md={12}>
              <Card size="small" title="Client Numéro" className="shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">CL012</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>201025</span>
                  </div>
                  <div className="flex justify-between">
                    <span>N° document:</span>
                    <span>Souche B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Référence:</span>
                    <span className="font-semibold">25BDE00454</span>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card size="small" title="Statut & Livraison" className="shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Date livraison Prévue:</span>
                    <Tag color="orange">20/02/4</Tag>
                  </div>
                  <div className="flex justify-between">
                    <span>Référence test:</span>
                    <span>-</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Affaire & Expédition Section */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} md={12}>
              <Card size="small" title="Affaire" className="shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Représentant:</span>
                    <span className="font-medium">Hassan Agmir</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entête:</span>
                    <span>1</span>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card size="small" title="Expédition EX-WORK" className="shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>N° Expédition:</span>
                    <span>-</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Port:</span>
                    <span>-</span>
                  </div>
                  <div className="flex justify-end">
                    <Button type="primary" size="small">
                      Valider
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Divider />

          {/* Articles Table */}
          <div className="mb-6">
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="middle"
              className="shadow-sm"
              scroll={{ x: true }}
            />
          </div>

          <Divider />

          {/* Actions and Totals Section */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card size="small" title="Actions" className="shadow-sm">
                <Space>
                  <Button type="dashed" icon={<MoreOutlined />}>
                    Actions -
                  </Button>
                  <Button type="dashed" icon={<MoreOutlined />}>
                    Actions -
                  </Button>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card size="small" className="shadow-sm">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <span className="font-medium">Tools net:</span>
                    <span className="font-semibold">-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total HT:</span>
                    <span className="font-semibold text-blue-600">-</span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between">
                    <span>Tools brut:</span>
                    <span>-</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total HT devise:</span>
                    <span>-</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

export default CreateDocument;