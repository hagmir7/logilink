import React, { useEffect, useState } from 'react';
import { Modal, Spin, Empty, Typography, Badge, Tag, Input, message } from 'antd';
import {
    WarningOutlined,
    ReloadOutlined,
    FilePdfOutlined,
    FileImageOutlined,
    EditOutlined,
    CheckOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { api } from '../utils/api';

const { Text } = Typography;

function RecordCard({ item, lineId, onUpdated, fetch }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(item.supplier_code || '');
    const [saving, setSaving] = useState(false);

    const fileIcon = (file) => {
        if (!file) return null;
        return file.endsWith('.pdf')
            ? <FilePdfOutlined className="text-red-500" />
            : <FileImageOutlined className="text-blue-500" />;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.patch(
                `purchase-line/${item.id}/non-compliant/update`,
                { supplier_code: value }
            );
            onUpdated(res.data);
            setEditing(false);
            fetch();
            message.success('Fournisseur mis à jour');
        } catch (err) {
            message.error(err?.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setValue(item.supplier_code || '');
        setEditing(false);
    };

    return (
        <div className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <Tag color="volcano">Qté: {item.quantity}</Tag>
                {fileIcon(item.file)}
            </div>

            {/* Supplier — inline editable */}
            <div className="text-xs text-gray-500 mb-2">
                <span className="mr-1">Fournisseur:</span>
                {editing ? (
                    <span className="inline-flex items-center gap-1">
                        <Input
                            size="small"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onPressEnter={handleSave}
                            autoFocus
                            className="w-32"
                            placeholder="Code fournisseur"
                        />
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700 disabled:opacity-50"
                            title="Enregistrer"
                        >
                            <CheckOutlined />
                        </button>
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-gray-600"
                            title="Annuler"
                        >
                            <CloseOutlined />
                        </button>
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 group">
                        <Text strong>{item.supplier_code || '—'}</Text>
                        <button
                            onClick={() => setEditing(true)}
                            className="text-gray-300 group-hover:text-blue-400 transition"
                            title="Modifier le fournisseur"
                        >
                            <EditOutlined className="text-xs" />
                        </button>
                    </span>
                )}
            </div>

            {/* Note */}
            {item.note && (
                <p className="text-sm text-gray-700 mb-2">{item.note}</p>
            )}

            {/* User */}
            <div className="text-xs text-gray-500 mb-2">
                Par: <Tag color="blue">{item.user?.full_name || '—'}</Tag>
            </div>

            {/* Date */}
            <div className="text-xs text-gray-400">
                {item.created_at
                    ? new Date(item.created_at).toLocaleDateString('fr-FR')
                    : '—'}
            </div>

            {/* File link */}
            {item.file && (
                <div className="mt-2">
                    <a
                        href={`/storage/${item.file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 underline"
                    >
                        Voir fichier
                    </a>
                </div>
            )}
        </div>
    );
}

export default function ShowLineNonCompliantModal({ open, setOpen, lineId, lineQte }) {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && lineId) fetchNonCompliants();
    }, [open, lineId]);

    const fetchNonCompliants = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`purchase-line/${lineId}/non-compliant`);
            setRecords(res.data || []);
        } catch (err) {
            setError(err?.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdated = (updated) => {
        setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    };

    const handleClose = () => {
        setOpen(false);
        setRecords([]);
        setError(null);
    };

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            onOk={handleClose}
            okText="Fermer"
            cancelButtonProps={{ style: { display: 'none' } }}
            width={800}
            title={
                <div className="flex items-center gap-2">
                    <WarningOutlined className="text-orange-500 text-lg" />
                    <span className="font-semibold">Réceptions non conformes</span>
                    <Badge count={records.length} style={{ backgroundColor: '#f97316' }} />
                </div>
            }
        >
            {lineQte && (
                <div className="mb-4 text-sm text-gray-500">
                    Qté commandée : <Text strong>{lineQte}</Text>
                </div>
            )}

            {error && (
                <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-md text-red-600 text-sm">
                    <WarningOutlined />
                    <span>{error}</span>
                    <button
                        onClick={fetchNonCompliants}
                        className="ml-auto text-xs underline flex items-center gap-1"
                    >
                        <ReloadOutlined /> Retry
                    </button>
                </div>
            )}

            <Spin spinning={loading}>
                {records.length === 0 ? (
                    <Empty description="Aucune non-conformité trouvée" />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {records.map((item) => (
                            <RecordCard
                                key={item.id}
                                item={item}
                                lineId={lineId}
                                onUpdated={handleUpdated}
                                fetch={fetchNonCompliants}
                            />
                        ))}
                    </div>
                )}
            </Spin>
        </Modal>
    );
}