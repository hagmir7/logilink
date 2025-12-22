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
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Article', dataIndex: 'description', key: 'description' },
    { title: 'Couleur', dataIndex: 'color', key: 'color' },
    {
      title: 'Quantité',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
      render: q => <Text strong>{q}</Text>,
    },
  ]

  const tableData =
    data?.palettes?.flatMap(palette =>
      palette.articles.map(article => ({
        key: `${palette.id}-${article.id}`,
        code: article.code,
        description: article.description || article.description,
        color: article.color,
        quantity: Number(article.pivot?.quantity || 0),
      }))
    ) || []

  return (
    <Modal
      title={`Articles - Emplacement ${emplacement_code}`}
        open={open}
        onCancel={onClose}
        footer={null}
        width={isElectron ? '95%' : 900}
        className={isElectron ? 'electron-modal' : ''}
        destroyOnClose
    >
      <div
        style={{
          fontSize: isElectron ? 16 : 13,
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
            pagination={0}
            size={isElectron ? 'middle' : 'small'}
            scroll={isElectron ? { y: '70vh' } : undefined}
            onRow={record => ({
                onClick: () => {
                onArticleSelect?.(record.code) // 🔥 send article code
                onClose?.()                     // optional: close modal
                },
                style: { cursor: 'pointer' },
            })}
          />
        )}
      </div>
    </Modal>
  )
}
