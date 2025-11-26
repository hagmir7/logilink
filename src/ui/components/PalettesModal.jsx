import React, { useEffect, useState } from 'react'
import { Button, Flex, Modal, Card, Tag, Descriptions, Skeleton } from 'antd'
import { api } from '../utils/api'

export const PalettesModal = ({
  countPalettes,
  documentPiece,
  selectPalette,
  checkedPalette,
}) => {
  const [open, setOpen] = useState(false)
  const [document, setDocument] = useState({ palettes: [] })
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    if (open) getDocument()
  }, [open])

  const getDocument = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`palettes/document/${documentPiece}`)
      setDocument(data)
    } catch (error) {
      console.error('Error fetching document:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex vertical gap='middle' align='flex-start'>
      <Button type='primary' size='large' onClick={() => setOpen(true)}>
        Palettes ({countPalettes})
      </Button>

      <Modal
        title={<div className='text-3xl mb-3'>Palettes du Document - {document.piece || ''}</div>}
        centered
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width={{
          xs: '100%',
          sm: '100%',
          md: '100%',
          lg: '60%',
          xl: '50%',
          xxl: '40%',
        }}
        style={{ top: 20 }}
        // bodyStyle={{
        //   maxHeight: '70vh',
        //   overflowY: 'auto',
        // }}
        footer={[
          <Button key='close' size='large' onClick={() => setOpen(false)} style={{fontSize: "25x"}}>
            Fermer
          </Button>,
        ]}
      >
        <div className='space-y-6'>
          {/* Document Infos */}
          <div>
            {loading ? (
              <Skeleton active paragraph={{ rows: 0 }} />
            ) : (
              <Descriptions
                bordered
                size='middle'
                column={{ xs: 1, sm: 2 }}
                className='bg-white rounded-md'
              >
                <Descriptions.Item label='Pièce' style={{fontSize:'25px'}}>
                  <span className='text-blue-600 font-semibold text-xl'>
                    {document.piece}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label='Client' style={{fontSize:'25px'}}>
                  <span className='text-green-600 font-semibold text-xl'>
                    {document.client_id}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>

          {/* Palettes */}
          <div>
            <h3 className='text-xl font-bold text-gray-800 mb-4'>
              Palettes ({document.palettes?.length || 0})
            </h3>

            {loading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {[...Array(2)].map((_, index) => (
                  <Card key={index} className='rounded-xl shadow-sm'>
                    <Skeleton active paragraph={{ rows: 1 }} />
                  </Card>
                ))}
              </div>
            ) : document.palettes?.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-3'>
                {document.palettes.map((palette) => {
                  const isChecked = checkedPalette?.code === palette.code

                  return (
                    <div
                      onClick={() => {
                        selectPalette(palette);
                        setOpen(false);
                      }}
                      key={palette.id}
                      className={`transition-shadow duration-300 rounded-xl cursor-pointer p-2 ${
                        isChecked
                          ? 'bg-blue-50 border-blue-500  border-2'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <h4 className=' font-bold text-gray-700 text-2xl'>
                            {palette.code}
                          </h4>
                          <Tag color='blue'>
                            <span className='text-lg font-semibold'>
                              <span className='text-2xl'>{palette.lines_count}</span> Articles
                            </span>
                          </Tag>
                        </div>

                        <div className='flex flex-wrap gap-2 mt-2 text-xl'>
                          <Tag
                          style={{fontSize: '20px', padding: '8px'}}
                            color={
                              palette.type === 'Livraison' ? 'blue' : 'default'
                            }
                          >
                            {palette.type}
                          </Tag>
                          <Tag
                            color={palette.controlled === '1' ? 'green' : 'red'}
                            style={{fontSize: '20px', padding: '8px'}}
                          >
                            {palette.controlled === '1'
                              ? 'Contrôlé'
                              : 'Non contrôlé'}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='text-center py-12 bg-gray-50 rounded-lg'>
                <p className='text-gray-500 text-lg'>
                  Aucune palette trouvée pour ce document.
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </Flex>
  )
}
