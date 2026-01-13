import React, { useEffect, useState } from 'react'
import { Modal, Table, Spin, Empty, Typography } from 'antd'
import { api } from '../utils/api'

const { Text } = Typography

export default function EmplacementArticles({
  emplacement_code,
  open,
  onClose,
  onArticleSelect
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const isElectron =
    typeof window !== 'undefined' &&
    (window.electron || window.process?.type)

  useEffect(() => {
    if (!open || !emplacement_code) return

    setLoading(true)

    api
      .get(`/emplacement/${emplacement_code}/articles`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [open, emplacement_code])

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: isElectron ? 150 : 100,
      ellipsis: true,
      render: text => (
        <Text strong style={{ whiteSpace: 'nowrap' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Article',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: true,
      },
      render: text => (
        <span style={{ whiteSpace: 'nowrap' }} title={text}>
          {text}
        </span>
      ),
    },
    {
      title: 'Qté',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      width: isElectron ? 100 : 70,
      render: q => (
        <Text strong style={{ whiteSpace: 'nowrap' }}>
          {q}
        </Text>
      ),
    },
  ]

  const tableData =
    data?.palettes?.flatMap(palette =>
      palette.articles.map(article => ({
        key: `${palette.id}-${article.id}`,
        code: article.code,
        description: article.description || article.description,
        quantity: Number(article.pivot?.quantity || 0),
      }))
    ) || []

  return (
    <Modal
      title={`Articles - Emplacement ${emplacement_code}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={isElectron ? '95%' : '95%'}
      style={{ maxWidth: isElectron ? undefined : 900 }}
      className={isElectron ? 'electron-modal' : ''}
      destroyOnHidden
    >
      <div
        style={{
          fontSize: isElectron ? 16 : 14,
          overflowX: 'auto',
        }}
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Spin size="large" />
          </div>
        ) : tableData.length === 0 ? (
          <Empty description="Aucun article en stock" />
        ) : (
          <Table
            className="border border-gray-200"
            columns={columns}
            dataSource={tableData}
            pagination={false}
            size={isElectron ? 'middle' : 'small'}
            scroll={{
              x: 'max-content',
              y: isElectron ? '70vh' : '60vh',
            }}
            onRow={record => ({
              onClick: () => {
                onArticleSelect?.(record.code)
                onClose?.()
              },
              style: { cursor: 'pointer' },
            })}
            sticky
          />
        )}
      </div>

      <style jsx global>{`
        .ant-table-cell {
          white-space: nowrap !important;
        }
        
        @media (max-width: 768px) {
          .ant-modal-header {
            padding: 12px 16px;
          }
          
          .ant-modal-body {
            padding: 12px;
          }
          
          .ant-modal-title {
            font-size: 14px;
          }
          
          .ant-table-thead > tr > th {
            padding: 6px 4px !important;
            font-size: 12px;
          }
          
          .ant-table-tbody > tr > td {
            padding: 4px 2px !important;
            font-size: 13px;
          }
        }
      `}</style>
    </Modal>
  )
}