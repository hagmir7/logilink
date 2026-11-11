
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Table, Tag, Tooltip, Empty } from 'antd';
import { getExped } from '../utils/config';

const STAGE_COLUMNS = {
    fabrication: 'fabricated_at',
    montage: 'montage_at',
    peinture: 'peinture_at',
    preparation: 'prepared_at',
};

const STAGE_LABELS = {
    fabrication: 'Fabrication',
    montage: 'Montage',
    peinture: 'Peinture',
    preparation: 'Préparation',
};

const STATUS_STYLES = {
    on_time: { label: 'Libéré à temps', color: '#15803D', background: '#F0FDF4', border: '#BBF7D0', icon: CheckCircle },
    late: { label: 'Libéré en retard', color: '#DC2626', background: '#FEF2F2', border: '#FECACA', icon: AlertCircle },
    pending: { label: 'En attente', color: '#6B7280', background: '#F9FAFB', border: '#E5E7EB', icon: Clock },
    no_deadline: { label: 'Sans échéance', color: '#D97706', background: '#FFFBEB', border: '#FDE68A', icon: Clock },
};

const formatDate = value => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('fr-FR');
};

const dateOnly = value => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getStageStatus = (completedAt, deadline) => {
    const completed = dateOnly(completedAt);
    const expected = dateOnly(deadline);
    if (!completed) return 'pending';
    if (!expected) return 'no_deadline';
    return completed <= expected ? 'on_time' : 'late';
};

function StageStatusBadge({ completedAt, deadline }) {
    const status = STATUS_STYLES[getStageStatus(completedAt, deadline)];
    const Icon = status.icon;

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, fontSize: 12, fontWeight: 500, lineHeight: '18px', whiteSpace: 'nowrap', backgroundColor: status.background, color: status.color, border: `1px solid ${status.border}` }}>
            <Icon size={12} />
            {status.label}
        </span>
    );
}

function DocumentStatusBadge({ status }) {
    const name = status?.name || '—';
    const color = /^#[0-9A-Fa-f]{6}$/.test(status?.color || '')
        ? status.color
        : '#6B7280';

    return (
        <Tag
            style={{
                backgroundColor: color,
                color: '#FFFFFF',
                border: 'none',
                margin: 0,
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                lineHeight: '18px',
                whiteSpace: 'nowrap',
            }}
        >
            {name}
        </Tag>
    );
}

function ExpeditionBadge({ value }) {
    const styles = {
        1: { backgroundColor: '#FFF1F0', color: '#CF1322', borderColor: '#FFA39E' },
        2: { backgroundColor: '#FFFB E6', color: '#D48806', borderColor: '#FFE58F' },
        3: { backgroundColor: '#F6FFED', color: '#389E0D', borderColor: '#B7EB8F' },
    };

    const style = styles[Number(value)] || { backgroundColor: '#FAFAFA', color: '#595959', borderColor: '#D9D9D9' };

    return (
        <Tag style={{ ...style, display: 'inline-flex', alignItems: 'center', width: 'fit-content', height: 'auto', padding: '2px 8px', margin: 0, borderRadius: 6, fontSize: 12, lineHeight: '18px', whiteSpace: 'nowrap' }}>
            {value != null ? getExped(value) : '—'}
        </Tag>
    );
}

function DeletedBadge() {
    return <Tag color="red" style={{ margin: 0, fontSize: 10 }}>Supprimé</Tag>;
}

export default function ArchiveTable({ documents = [], documentType = null, archiveType = 'global', companyId = null, loading = false, onSelectOrder, meta }) {
    const navigate = useNavigate();
    const stageColumn = STAGE_COLUMNS[archiveType];
    const isStageArchive = Boolean(stageColumn);

    const handleShow = async id => {
        if (!id) return;

        try {
            if (onSelectOrder) return onSelectOrder(id);

            const url = `/document/${id}?type=archive`;
            if (window.electron?.openShow) await window.electron.openShow({ width: 1200, height: 700, url, resizable: true });
            else navigate(url);
        } catch (error) {
            console.error('Erreur ouverture document:', error);
        }
    };

    const dataSource = useMemo(() => documents.map((data, index) => {
        const companies = Array.isArray(data.companies) ? data.companies : [];
        const company = companyId && companyId !== 'all' ? companies.find(c => Number(c.id) === Number(companyId)) : null;
        const lines = Array.isArray(data.lines) ? data.lines : [];
        const stageDates = stageColumn ? lines.map(line => line?.[stageColumn]).filter(Boolean) : [];
        const latestStageDate = stageDates.length ? stageDates.reduce((a, b) => new Date(a) > new Date(b) ? a : b) : null;
        const piece = documentType === 2 ? (data.piece_bl || data.piece || data.piece_fa) : (data.piece || data.piece_bl || data.piece_fa);

        return {
            ...data,
            key: data.id ?? piece ?? index,
            _piece: piece,
            _navId: data.piece_fa || data.piece_bl || data.piece,
            _expedit: data.docentete?.DO_Expedit ?? data.expedition,
            _client: data.docentete?.DO_Tiers ?? data.client_id,
            _ref: data.docentete?.DO_Ref ?? data.ref,
            _dateDoc: data.docentete?.DO_Date ?? data.created_at,
            _datePrev: data.docentete?.DO_DateLivr ?? data.delivery_date,
            _stageAt: stageColumn ? (data[stageColumn] || latestStageDate) : null,
            _complationDate: company?.pivot?.complation_date || data.complation_date,
            _note: company?.pivot?.note,
            _isDeleted: Boolean(data.canceled),
        };
    }), [documents, documentType, companyId, stageColumn]);

    const columns = useMemo(() => {
        const cols = [
            {
                title: 'Document',
                dataIndex: '_piece',
                key: 'document',
                fixed: 'left',
                width: 190,
                sorter: (a, b) => String(a._piece ?? '').localeCompare(String(b._piece ?? '')),
                render: (piece, record) => (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="font-semibold text-gray-800">{piece || '—'}</span>
                        {record._isDeleted && <DeletedBadge />}
                        {record.docentete?.DO_Reliquat === '1' && <Tooltip title="Reliquat"><Settings size={12} className="text-gray-400" /></Tooltip>}
                        {record.shipping && <CheckCircle size={12} className="text-gray-400" />}
                        {record._note && <Tooltip title={record._note}><Tag color="red" style={{ margin: 0 }}>❓</Tag></Tooltip>}
                    </div>
                ),
            },
            {
                title: 'Statut',
                key: 'status',
                width: 180,
                filters: isStageArchive ? [
                    { text: 'Libéré à temps', value: 'on_time' },
                    { text: 'Libéré en retard', value: 'late' },
                    { text: 'En attente', value: 'pending' },
                    { text: 'Sans échéance', value: 'no_deadline' },
                ] : undefined,
                onFilter: isStageArchive ? (value, record) => getStageStatus(record._stageAt, record._complationDate) === value : undefined,
                render: (_, record) => isStageArchive ? (
                    <StageStatusBadge completedAt={record._stageAt} deadline={record._complationDate} />
                ) : (
                    <DocumentStatusBadge status={record.status} />
                ),
            },
            {
                title: 'Expédition',
                dataIndex: '_expedit',
                key: 'expedition',
                width: 145,
                filters: [1, 2, 3].map(value => ({ text: getExped(value), value })),
                onFilter: (value, record) => Number(record._expedit) === Number(value),
                render: value => <ExpeditionBadge value={value} />,
            },
            {
                title: 'Client',
                dataIndex: '_client',
                key: 'client',
                width: 140,
                sorter: (a, b) => String(a._client ?? '').localeCompare(String(b._client ?? '')),
                render: value => <span className="font-medium text-gray-700">{value || '—'}</span>,
            },
            {
                title: 'Référence',
                dataIndex: '_ref',
                key: 'reference',
                width: 160,
                ellipsis: true,
                render: value => <span className="text-gray-500">{value || '—'}</span>,
            },
            {
                title: 'Date Document',
                dataIndex: '_dateDoc',
                key: 'date_doc',
                width: 140,
                sorter: (a, b) => new Date(a._dateDoc || 0) - new Date(b._dateDoc || 0),
                render: value => <span className="text-gray-500">{formatDate(value)}</span>,
            },
            {
                title: 'Date Prévue',
                dataIndex: '_datePrev',
                key: 'date_prev',
                width: 140,
                sorter: (a, b) => new Date(a._datePrev || 0) - new Date(b._datePrev || 0),
                render: value => <span className="text-gray-500">{formatDate(value)}</span>,
            },
        ];

        if (isStageArchive) {
            cols.push(
                {
                    title: `Date ${STAGE_LABELS[archiveType]}`,
                    dataIndex: '_stageAt',
                    key: 'stage_date',
                    width: 160,
                    sorter: (a, b) => new Date(a._stageAt || 0) - new Date(b._stageAt || 0),
                    render: value => <span className="text-gray-500">{formatDate(value)}</span>,
                },
                {
                    title: 'Date limite',
                    dataIndex: '_complationDate',
                    key: 'completion_date',
                    width: 155,
                    sorter: (a, b) => new Date(a._complationDate || 0) - new Date(b._complationDate || 0),
                    render: value => <span className="text-gray-500">{formatDate(value)}</span>,
                }
            );
        }

        return cols;
    }, [archiveType, isStageArchive]);

    return (
        <div className="flex h-full w-full flex-col bg-white">
            <Table
                columns={columns}
                dataSource={dataSource}
                loading={loading}
                pagination={false}
                scroll={{ x: 'max-content' }}
                size="small"
                sticky
                onRow={record => ({ onClick: () => handleShow(record._navId), className: 'cursor-pointer' })}
                rowClassName={record => record._isDeleted ? 'bg-red-50 hover:!bg-red-100/80' : 'hover:!bg-blue-50/60'}
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Aucun document trouvé" className="py-10" /> }}
                footer={documents.length ? () => <div className="text-xs text-gray-400">{documents.length} document(s){meta?.total ? ` sur ${meta.total}` : ''}</div> : undefined}
            />
        </div>
    );
}
