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
        <Flex vertical gap="middle" align="flex-start">
            <Button type="primary" onClick={handleOpenModal}>
                Palettes {countPalettes}
            </Button>
            
            <Modal
                title={`Détails du Document - ${document.piece || 'N/A'}`}
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
                    <Button key="close" onClick={() => setOpen(false)} loading={loading}>
                        Fermer
                    </Button>
                ]}
            >
                <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <span>Chargement des données...</span>
                        </div>
                    ) : (
                        <>
                            {/* Document Information */}
                            <Card title="Informations du Document" size="small" style={{ marginBottom: 16 }}>
                                <Descriptions column={2} size="small">
                                    <Descriptions.Item label="ID">{document.id}</Descriptions.Item>
                                    <Descriptions.Item label="Pièce">{document.piece}</Descriptions.Item>
                                    <Descriptions.Item label="Type">{document.type}</Descriptions.Item>
                                    <Descriptions.Item label="Référence">{document.ref}</Descriptions.Item>
                                    <Descriptions.Item label="ID Client">{document.client_id}</Descriptions.Item>
                                    <Descriptions.Item label="Expédition">{document.expedition}</Descriptions.Item>
                                    <Descriptions.Item label="Statut">
                                        <Tag color={getStatusColor(document.status)}>
                                            {document.status?.name || 'N/A'}
                                        </Tag>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            {/* Palettes Information */}
                            <Card title={`Palettes (${document.palettes?.length || 0})`} size="small">
                                {document.palettes && document.palettes.length > 0 ? (
                                    <List
                                        dataSource={document.palettes}
                                        renderItem={(palette) => (
                                            <List.Item>
                                                <Card 
                                                    size="small" 
                                                    style={{ width: '100%' }}
                                                    title={`Palette ${palette.code}`}
                                                >
                                                    <Descriptions column={2} size="small">
                                                        <Descriptions.Item label="ID">{palette.id}</Descriptions.Item>
                                                        <Descriptions.Item label="Type">{palette.type}</Descriptions.Item>
                                                        <Descriptions.Item label="Nb Lignes">{palette.lines_count}</Descriptions.Item>
                                                        <Descriptions.Item label="Contrôlé">
                                                            <Tag color={palette.controlled === "1" ? "green" : "orange"}>
                                                                {palette.controlled === "1" ? "Oui" : "Non"}
                                                            </Tag>
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label="Poids">
                                                            {palette.weight || 'N/A'}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item label="Utilisateur">
                                                            {palette.user?.full_name || 'N/A'}
                                                        </Descriptions.Item>
                                                    </Descriptions>
                                                    
                                                    {palette.user && (
                                                        <div style={{ marginTop: 8 }}>
                                                            <strong>Détails Utilisateur:</strong>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                                Email: {palette.user.email}<br/>
                                                                Téléphone: {palette.user.phone}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Card>
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                        Aucune palette trouvée
                                    </div>
                                )}
                            </Card>
                        </>
                    )}
                </div>
            </Modal>
        </Flex>
    );
};