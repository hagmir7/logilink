import { Modal, Radio, Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

export default function ArticleSelectModal({
  isOpen,
  modalOptions,
  selectedOption,
  onSelect,
  onOk,
  onCancel,
}) {

    
  return (
    <Modal
      title='Sélectionnez une option'
      closable
      closeIcon={<CloseOutlined aria-label='Close Modal' />}
      open={isOpen}
      onOk={onOk}
      onCancel={onCancel}
      footer={false}
      width={600}
      styles={{ padding: '24px' }}
    >
      <div style={{ padding: '16px 0' }}>
        <Radio.Group
          onChange={onSelect}
          value={selectedOption}
          size='large'
          style={{ width: '100%' }}
        >
          <Space direction='vertical' size='large' style={{ width: '100%' }}>
            {modalOptions.map((option) => (
              <Radio.Button
                key={option.value}
                value={option.value}
                style={{
                  height: '60px',
                  lineHeight: '60px',
                  fontSize: '20px',
                  fontWeight: '500',
                  width: '100%',
                  border: '2px solid #d9d9d9',
                  borderRadius: '8px',
                }}
              >
                {option.label}
              </Radio.Button>
            ))}
          </Space>
        </Radio.Group>
      </div>
    </Modal>
  )
}