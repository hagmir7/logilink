import { Alert, Button, Card, Empty, Input, Progress, Space, Spin, Tag, Typography } from 'antd';
import { LockOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import PermissionGroup from './PermissionGroup';

export default function PermissionsPanel({ role, groups, selected, onToggle, onToggleGroup, onToggleAll, onSave, disabled, loading, saving, dirty, alert, onDismiss }) {
  const [query, setQuery] = useState('');
  const visibleGroups = useMemo(() => groups.map((g) => ({
    ...g,
    permissions: g.permissions.filter((p) => `${g.label} ${p.label} ${p.name}`.toLowerCase().includes(query.toLowerCase())),
  })).filter((g) => g.permissions.length), [groups, query]);
  const total = groups.reduce((n, g) => n + g.permissions.length, 0);
  const selectedCount = groups.flatMap((g) => g.permissions).filter((p) => selected.has(p.name)).length;

  if (loading) return <div className="flex justify-center items-center min-h-72"><Spin size="large" /></div>;
  if (!role) return <Empty image={<LockOutlined className="text-4xl text-gray-300" />} description="Sélectionnez un rôle pour gérer ses autorisations." className="!my-16" />;

  return (
    <main className="min-w-0 flex-1 bg-white">
      <header className="p-2 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
        <div><Typography.Title level={5} className="!mb-0">Autorisations : {role.label || role.name}</Typography.Title><Typography.Text type="secondary">Gérer les contrôles d’accès pour ce rôle</Typography.Text></div>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} disabled={disabled || !dirty} onClick={onSave}>Enregistrer</Button>
      </header>
      <div className="p-4 md:p-6">
        {alert && <Alert type={alert.type} message={alert.message} showIcon closable onClose={onDismiss} className="!mb-4" />}
        {role.protected && <Alert type="info" showIcon message="Le rôle Super Admin est protégé contre les modifications." className="!mb-4" />}
        <Card size="small" className="!mb-4 !bg-gray-50">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <Space wrap><Tag>{role.name}</Tag><Typography.Text type="secondary">{selectedCount} / {total} autorisations sélectionnées</Typography.Text></Space>
            <Progress percent={total ? Math.round(100 * selectedCount / total) : 0} size="small" className="!max-w-44" />
          </div>
        </Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <Input allowClear prefix={<SearchOutlined />} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une permission..." className="!w-full sm:!w-72" />
          <Button type="link" disabled={disabled || !total} onClick={onToggleAll}>{selectedCount === total ? 'Tout désélectionner' : 'Tout sélectionner'}</Button>
        </div>
        {visibleGroups.length ? visibleGroups.map((g) => <PermissionGroup key={g.key} category={g} selected={selected} disabled={disabled} onToggle={onToggle} onToggleGroup={onToggleGroup} />) : <Empty description="Aucune permission trouvée" />}
      </div>
    </main>
  );
}
