import React, { useEffect, useState } from 'react';
import { Button, Modal, Descriptions, Tag, Divider, Spin } from 'antd';
import { api } from '../utils/api';
import {statuses } from '../utils/config'

const statusLabel = (status) => {
    const found = statuses.find((s) => s.id === Number(status));
    return found
        ? { text: found.name, color: found.color }
        : { text: `Statut ${status}`, color: '#95a5a6' };
};

const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d) ? value : d.toLocaleString();
};

const DocumentLineActions = ({ line_id, open, setOpen }) => {
    const [line, setLine] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleCancel = () => setOpen(false);

    const fetchLine = async () => {
        setLoading(true);
        try {
            const res = await api.get(`lines/${line_id}`);
            setLine(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && line_id) {
            fetchLine();
        }
    }, [line_id, open]);

    const prepare = async () => {
        setSubmitting(true);
        try {
            await api.post('lines/prepare', { line: line_id ?? line?.id });
            await fetchLine(); // rafraîchir le statut au lieu de fermer la modale aveuglément
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const status = statusLabel(line?.status_id);

    return (
        <Modal
            title={`Ligne de document — ${line?.ref || line_id || 'Aucune'}`}
            closable={{ 'aria-label': 'Bouton de fermeture personnalisé' }}
            open={open}
            onOk={handleCancel}
            onCancel={handleCancel}
            width={640}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Fermer
                </Button>,
                // <Button key="prepare" type="primary" loading={submitting} onClick={prepare}>
                //     Préparé
                // </Button>,
            ]}
        >
            {loading ? (
                <Spin />
            ) : line ? (
                <>
                    <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Référence">{line.ref}</Descriptions.Item>
                        <Descriptions.Item label="Statut">
                            <Tag color={status.color}>{status.text}</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Nom" span={2}>
                            {line.name}
                        </Descriptions.Item>

                        <Descriptions.Item label="Design" span={2}>
                            {line.design}
                        </Descriptions.Item>

                        <Descriptions.Item label="Dimensions">{line.dimensions}</Descriptions.Item>
                        <Descriptions.Item label="Quantité">{line.quantity}</Descriptions.Item>

                        <Descriptions.Item label="Fabrication prévue" span={2}>
                            {formatDate(line.completion_date)}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider orientation="left" plain>
                        Document
                    </Divider>
                    <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Pièce">{line.document?.piece}</Descriptions.Item>
                        <Descriptions.Item label="Type">{line.document?.type}</Descriptions.Item>
                        <Descriptions.Item label="BC">{line?.piece_bc}</Descriptions.Item>
                        <Descriptions.Item label="Urgent">
                            {line.document?.urgent === '1' ? <Tag color="red">Urgent</Tag> : 'Non'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Date de transfer" span={2}>
                            {formatDate(line.document?.created_at)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Date Livraison prévue" span={2}>
                            {formatDate(line.document?.delivery_date)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Transféré par" span={2}>
                            {line.document?.transfer_user?.full_name || '—'}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider orientation="left" plain>
                        Équipe
                    </Divider>
                    <Descriptions column={2} size="small" bordered>
                        <Descriptions.Item label="Entreprise">{line.company?.name}</Descriptions.Item>
                        <Descriptions.Item label="Code entreprise">{line.company_code}</Descriptions.Item>

                        <Descriptions.Item label="Fabriqué par">
                            {line.fabricated_user?.full_name || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fabriqué le">
                            {formatDate(line.fabricated_at)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Préparé par">
                            {line.prepared_user?.full_name || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Préparé le">
                            {formatDate(line.prepared_at)}
                        </Descriptions.Item>
                    </Descriptions>
                </>
            ) : (
                <p>{line_id || 'Aucune'}</p>
            )}
        </Modal>
    );
};

export default DocumentLineActions;