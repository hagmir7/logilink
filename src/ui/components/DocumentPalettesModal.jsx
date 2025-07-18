import React, { useState } from 'react';
import { Button, Flex, message, Modal, Card, Tag, Descriptions, List } from 'antd';
import { api } from '../utils/api';

export const DocumentPalettesModal = ({ countPalettes, documentPiece }) => {
    const [open, setOpen] = useState(false);
    const [document, setDocument] = useState({ palettes: [] });
    const [loading, setLoading] = useState(false);

    const getPalettes = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`palettes/document/${documentPiece}`);
            setDocument(data);
        } catch (error) {
            console.error(error);
            message.error(error.response?.data?.message || 'Erreur lors du chargement des palettes');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setOpen(true);
        getPalettes();
    };

    const getStatusColor = (status) => {
        return status?.color || '#1890ff';
    };

    return (
      <Flex vertical gap='middle' align='flex-start'>
        <Button type='primary' onClick={handleOpenModal}>
          Palettes ({document.palettes?.length})
        </Button>

        <Modal
          title={
            <div className='flex items-center gap-3'>
              <span>
                Palettes ({document.palettes?.length || 0}) -{' '}
                {document.piece || 'N/A'}{' '}
              </span>
              <Tag color={getStatusColor(document.status)}>
                {document.status?.name || 'N/A'}
              </Tag>
            </div>
          }
          centered
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          loading={loading}
          width={{
            xs: '90%',
            sm: '80%',
            md: '70%',
            lg: '60%',
            xl: '50%',
            xxl: '40%',
          }}
          footer={[
            <Button
              key='close'
              onClick={() => setOpen(false)}
              loading={loading}
            >
              Fermer
            </Button>,
          ]}
        >
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <span>Chargement des données...</span>
              </div>
            ) : (
              <>
                {document.palettes && document.palettes.length > 0 ? (
                  <List
                    dataSource={document.palettes}
                    renderItem={(palette) => (
                      <List.Item>
                        <Card
                          size='small'
                          style={{ width: '100%' }}
                          title={`Palette ${palette.code}`}
                        >
                          <Descriptions column={2} size='small'>
                            <Descriptions.Item label='Type'>
                              {palette.type}
                            </Descriptions.Item>
                            <Descriptions.Item label='Nb Articles'>
                              <Tag>{palette.lines_count}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label='Contrôlé'>
                              <Tag
                                color={
                                  palette.controlled === '1'
                                    ? 'green'
                                    : 'orange'
                                }
                              >
                                {palette.controlled === '1' ? 'Oui' : 'Non'}
                              </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label='Poids'>
                              {palette.weight || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label='Utilisateur'>
                              {palette.user?.full_name || 'N/A'}
                            </Descriptions.Item>
                          </Descriptions>
                        </Card>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#999',
                      padding: '20px',
                    }}
                  >
                    <div className='text-6xl mb-4'>🎨</div>
                    Aucune palette trouvée
                  </div>
                )}
              </>
            )}
          </div>
        </Modal>
      </Flex>
    )
};