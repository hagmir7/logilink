import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { rolesApi, apiError } from '../services/rolesApi';
import useRoles from '../hooks/useRoles';
import RoleSidebar from '../components/roles/RoleSidebar';
import RoleModal from '../components/roles/RoleModal';
import PermissionsPanel from '../components/roles/PermissionsPanel';


function groupPermissions(permissions) {
  const groups = new Map();
  for (const permission of permissions) {
    const key = permission.category || 'autres';
    if (!groups.has(key)) groups.set(key, { key, label: permission.category_label || key, permissions: [] });
    groups.get(key).permissions.push(permission);
  }
  return [...groups.values()];
}

export default function Roles() {
  const { permissions: authPermissions } = useAuth();
  // Supports either a function can(name) or an array of permission strings in AuthContext.
  const can = useCallback((name) => typeof authPermissions === 'function'
    ? Boolean(authPermissions(name))
    : Array.isArray(authPermissions) && authPermissions.includes(name), [authPermissions]);

  const { roles, selectedName, setSelectedName, loading: rolesLoading, refresh } = useRoles();
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [initial, setInitial] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const groups = useMemo(() => groupPermissions(permissions), [permissions]);
  const dirty = useMemo(() => selected.size !== initial.size || [...selected].some((p) => !initial.has(p)), [selected, initial]);
  const canAssign = can('roles.attribuer') && can('permissions.attribuer') && !role?.protected;

  useEffect(() => {
    let active = true;
    if (!selectedName) { setRole(null); setSelected(new Set()); setInitial(new Set()); return; }
    setLoading(true); setAlert(null);
    Promise.all([rolesApi.get(selectedName), rolesApi.permissions()])
      .then(([roleData, permissionList]) => {
        if (!active) return;
        const names = (roleData.permissions || []).map((p) => typeof p === 'string' ? p : p.name);
        setRole(roleData);
        setPermissions(Array.isArray(permissionList) ? permissionList : []);
        setSelected(new Set(names));
        setInitial(new Set(names));
      })
      .catch((error) => { if (active) setAlert({ type: 'error', message: apiError(error, 'Chargement impossible.') }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedName]);

  const toggle = useCallback((name) => setSelected((old) => {
    const next = new Set(old);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  }), []);

  const toggleGroup = useCallback((key, checked) => setSelected((old) => {
    const next = new Set(old);
    for (const p of (groups.find((g) => g.key === key)?.permissions || [])) checked ? next.add(p.name) : next.delete(p.name);
    return next;
  }), [groups]);

  const toggleAll = useCallback(() => setSelected((old) => {
    const all = groups.flatMap((g) => g.permissions.map((p) => p.name));
    return all.every((p) => old.has(p)) ? new Set() : new Set(all);
  }), [groups]);

  const save = async () => {
    if (!canAssign || !selectedName || !dirty) return;
    setSaving(true); setAlert(null);
    try {
      const updated = await rolesApi.sync(selectedName, [...selected]);
      const names = (updated.permissions || []).map((p) => p.name);
      setSelected(new Set(names)); setInitial(new Set(names)); setRole(updated);
      setAlert({ type: 'success', message: 'Autorisations mises à jour avec succès.' });
      await refresh(selectedName);
    } catch (error) {
      setAlert({ type: 'error', message: apiError(error, 'Enregistrement impossible.') });
    } finally { setSaving(false); }
  };

  const submitRole = async (name) => {
    setModalLoading(true);
    try {
      const old = modal?.role?.name;
      if (modal?.mode === 'create') await rolesApi.create(name);
      else await rolesApi.rename(old, name);
      setModal(null);
      await refresh(name);
      messageApi.success(modal?.mode === 'create' ? 'Rôle créé.' : 'Rôle renommé.');
    } catch (error) { messageApi.error(apiError(error)); }
    finally { setModalLoading(false); }
  };

  const deleteRole = (target) => Modal.confirm({
    title: `Supprimer « ${target.name} » ?`,
    content: 'Ce rôle sera retiré des utilisateurs qui le possèdent. Les permissions elles-mêmes resteront disponibles.',
    okText: 'Supprimer', okButtonProps: { danger: true }, cancelText: 'Annuler',
    onOk: async () => {
      try { await rolesApi.remove(target.name); await refresh(target.name === selectedName ? null : undefined); messageApi.success('Rôle supprimé.'); }
      catch (error) { messageApi.error(apiError(error)); throw error; }
    },
  });

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[70vh] bg-white border border-gray-200 rounded-lg overflow-hidden">
      {contextHolder}
      <RoleSidebar roles={roles} selectedName={selectedName} onSelect={(name) => {
        if (dirty && !window.confirm('Abandonner les modifications non enregistrées ?')) return;
        setSelectedName(name);
      }} loading={rolesLoading} canCreate={can('roles.creer')} canRename={can('roles.attribuer')} canDelete={can('roles.supprimer')}
        onCreate={() => setModal({ mode: 'create' })} onRename={(role) => setModal({ mode: 'rename', role })} onDelete={deleteRole} />
      <PermissionsPanel role={role} groups={groups} selected={selected} onToggle={toggle} onToggleGroup={toggleGroup} onToggleAll={toggleAll}
        onSave={save} disabled={!canAssign || saving || loading} loading={loading} saving={saving} dirty={dirty} alert={alert} onDismiss={() => setAlert(null)} />
      <RoleModal open={!!modal} mode={modal?.mode} initialName={modal?.role?.name} loading={modalLoading} onCancel={() => setModal(null)} onSubmit={submitRole} />
    </div>
  );
}
