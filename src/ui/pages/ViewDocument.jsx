import { RefreshCcw, Clipboard, ArrowDownCircle } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Empty,
  Skeleton,
  Table,
  Tag,
  Typography,
  Space,
  Divider,
  Collapse,
  Row,
  Col,
} from 'antd'
import { getExped, getDocumentType } from '../utils/config'
import { useParams } from 'react-router-dom'

const { Title, Text } = Typography
const { Panel } = Collapse

function ViewDocument() {
  const { id } = useParams()
  const [data, setData] = useState({ doclignes: [] })
  const [loading, setLoading] = useState(false)

  const columns = [
    {
      title: 'Ref Article',
      dataIndex: 'AR_Ref',
      key: 'AR_Ref',
      render: (text) => <Text>{text || '__'}</Text>,
      responsive: ['md'],
    },
    {
      title: 'Piece',
      dataIndex: 'Nom',
      key: 'Nom',
      render: (text) => <Text strong>{text || '__'}</Text>,
    },
    {
      title: 'Dimensions',
      dataIndex: 'dimensions',
      key: 'dimensions',
      render: (_, record) => (
        <Space direction='vertical' size='small'>
          <Text type='secondary'>H: {Math.floor(record.Hauteur) || '__'}</Text>
          <Text type='secondary'>L: {Math.floor(record.Largeur) || '__'}</Text>
          <Text type='secondary'>
            P: {Math.floor(record.Profondeur) || '__'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Matériaux',
      dataIndex: 'materials',
      key: 'materials',
      render: (_, record) => (
        <Space direction='vertical' size='small'>
          <Text type='secondary'>Couleur: {record.Couleur || '__'}</Text>
          <Text type='secondary'>Chant: {record.Chant || '__'}</Text>
          <Text type='secondary'>
            Epaisseur: {Math.floor(record.Episseur) || '__'}
          </Text>
        </Space>
      ),
      responsive: ['lg'],
    },
    {
      title: 'Quantité',
      dataIndex: 'DL_Qte',
      key: 'DL_Qte',
      render: (text) => (
        <Tag color='green' className='px-3 py-1'>
          {Math.floor(text)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type='text' icon={<Clipboard size={16} />} />
        </Space>
      ),
      responsive: ['lg'],
    },
  ]

  // Mobile card rendering for items
  const renderMobileCard = (item, index) => (
    <Card key={index} className='mb-4 shadow-sm' size='small'>
      <Space direction='vertical' className='w-full'>
        <Space className='w-full justify-between'>
          <Text strong>{item.Nom || '__'}</Text>
          <Tag color='green'>{Math.floor(item.DL_Qte)}</Tag>
        </Space>

        <Divider className='my-2' />

        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text type='secondary'>
              Hauteur: {Math.floor(item.Hauteur) || '__'}
            </Text>
          </Col>
          <Col span={12}>
            <Text type='secondary'>
              Largeur: {Math.floor(item.Largeur) || '__'}
            </Text>
          </Col>
          <Col span={12}>
            <Text type='secondary'>
              Profondeur: {Math.floor(item.Profondeur) || '__'}
            </Text>
          </Col>
          <Col span={12}>
            <Text type='secondary'>
              Epaisseur: {Math.floor(item.Episseur) || '__'}
            </Text>
          </Col>
        </Row>

        <Divider className='my-2' />

        <Space direction='vertical' size='small'>
          <Text type='secondary'>Couleur: {item.Couleur || '__'}</Text>
          <Text type='secondary'>Chant: {item.Chant || '__'}</Text>
        </Space>
      </Space>
    </Card>
  )

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`docentete/${id}`)
      setData(response.data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.error('Failed to fetch data:', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const documentInfo = [
    {
      key: '1',
      label: 'Client',
      children: data.DO_Tiers || <Skeleton.Button active size='small' />,
    },
    {
      key: '2',
      label: 'Référence',
      children: data.DO_Ref || <Skeleton.Button active size='small' />,
    },
    {
      key: '3',
      label: 'Articles',
      children: loading ? (
        <Skeleton.Button active size='small' />
      ) : (
        <Tag color='blue'>{data.doclignes?.length || 0}</Tag>
      ),
    },
    {
      key: '4',
      label: 'Expédition',
      children: data.DO_Expedit ? (
        getExped(data.DO_Expedit)
      ) : (
        <Skeleton.Button active size='small' />
      ),
    },
    {
      key: '5',
      label: 'Type de document',
      children: data.DO_Piece ? (
        getDocumentType(data.DO_Piece)
      ) : (
        <Skeleton.Button active size='small' />
      ),
    },
    {
      key: '6',
      label: 'Total TTC',
      children: data.DO_TotalTTC ? (
        <Tag color='green' className='text-lg px-3 py-1'>
          {Math.floor(data.DO_TotalTTC)} MAD
        </Tag>
      ) : (
        <Skeleton.Button active size='small' />
      ),
    },
  ]

  return (
    <div className='mx-auto max-w-7xl'>
      <Card
        className='mb-6'
        loading={loading}
        title={
          <div className='flex justify-between items-center'>
            <Space>
              <Title level={4} className='mb-0'>
                {data.DO_Piece
                  ? `Bon de commande ${data.DO_Piece}`
                  : 'Chargement...'}
              </Title>
              {data.DO_Piece && (
                <Badge
                  status='processing'
                  text={getDocumentType(data.DO_Piece)}
                />
              )}
            </Space>
            <Button
              onClick={fetchData}
              icon={
                loading ? (
                  <RefreshCcw className='animate-spin' size={16} />
                ) : (
                  <RefreshCcw size={16} />
                )
              }
            >
              Rafraîchir
            </Button>
          </div>
        }
      >
        <Descriptions
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
          items={documentInfo}
          className='mb-4'
          size='small'
        />

        <div className='mt-6'>
          <div className='flex justify-between items-center mb-4'>
            <Title level={5} className='mb-0'>
              Détails des articles
            </Title>
            <Button type='primary' icon={<ArrowDownCircle size={16} />}>
              Exporter
            </Button>
          </div>

          {/* For desktop view */}
          <div className='hidden md:block'>
            <Table
              columns={columns}
              dataSource={data.doclignes?.map((item, index) => ({
                ...item,
                key: index,
              }))}
              rowKey='key'
              pagination={{ pageSize: 10 }}
              size='middle'
              loading={loading}
              locale={{
                emptyText: <Empty description='Aucun article trouvé' />,
              }}
              scroll={{ x: 'max-content' }}
            />
          </div>

          {/* For mobile view */}
          <div className='block md:hidden'>
            {loading ? (
              <div className='space-y-4'>
                {[1, 2, 3].map((i) => (
                  <Card key={i} loading={true} />
                ))}
              </div>
            ) : data.doclignes?.length > 0 ? (
              data.doclignes.map(renderMobileCard)
            ) : (
              <Empty description='Aucun article trouvé' />
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ViewDocument
