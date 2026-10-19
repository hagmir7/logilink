import React from 'react';
import { Form, Input, Select } from 'antd';
import StatusSelect from './StatusSelect';
import PrioritySelect from './PrioritySelect';
import { STATUS_OPTIONS } from '../../constants/purchaseStatus';

const Field = ({ label, children, ...rest }) => (
  <Form.Item
    label={<span className="font-semibold text-gray-700">{label}</span>}
    style={{ marginBottom: 0 }}
    {...rest}
  >
    {children}
  </Form.Item>
);

const SearchSelect = (props) => (
  <Select
    showSearch
    className="w-full"
    optionFilterProp="label"
    {...props}
  />
);

// Converts "12" -> 12, keeps null/undefined/'' as undefined (no NaN)
const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
};

// Antd calls this on every change; the form stores the converted number
const numberNormalize = (value) => toNumber(value);

// Use this in the parent when pre-filling the form (edit mode):
// form.setFieldsValue(normalizePurchaseIds(purchase))
export const normalizePurchaseIds = (purchase = {}) => ({
  ...purchase,
  service_id: toNumber(purchase.service_id),
  user_id: toNumber(purchase.user_id),
});

export default function PurchaseHeaderFields({
  services = [],
  users = [],
  hasRole,
  canEdit,
  currentStatus,
  priority,
  onPriorityChange,
}) {
  const isSuperAdmin = hasRole('super_admin');
  const chefOnly = hasRole('chef_service') && !hasRole('admin');

  // chef_service can only pick "Brouillon" / "Envoyer" (plus the current value)
  const statusOptions = STATUS_OPTIONS.filter(
    (o) =>
      !chefOnly ||
      o.value === String(currentStatus) ||
      ['1', '2'].includes(o.value)
  );

  const serviceOptions = services.map((s) => ({
    value: Number(s.id),
    label: s.name,
  }));

  const userOptions = users.map((u) => ({
    value: Number(u.id),
    label: u.full_name,
  }));

  return (
    <div className="shadow-sm p-5 rounded-lg bg-white border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field
          name="reference"
          label="Référence"
          rules={[
            { required: true, message: 'Référence requise' },
            { max: 17, message: 'Maximum 17 caractères' },
          ]}
        >
          <Input
            maxLength={17}
            placeholder="Ex: BON-2025-001"
            prefix={<span className="text-gray-400">#</span>}
          />
        </Field>

        <Field
          name="status"
          label="Statut"
          rules={[{ required: true, message: 'Statut requis' }]}
        >
          <StatusSelect
            options={statusOptions}
            placeholder="Sélectionner le statut"
            disabled={!canEdit}
            defaultActiveFirstOption={false}
          />
        </Field>

        <Field
          name="service_id"
          label="Service / Département"
          normalize={numberNormalize}
          getValueProps={(value) => ({ value: toNumber(value) })}
        >
          <SearchSelect
            placeholder="Sélectionner un service"
            disabled={!isSuperAdmin}
            options={serviceOptions}
          />
        </Field>

        <Field
          name="user_id"
          label="Utilisateur"
          normalize={numberNormalize}
          getValueProps={(value) => ({ value: toNumber(value) })}
        >
          <SearchSelect
            placeholder="Sélectionner un utilisateur"
            disabled={!isSuperAdmin}
            options={userOptions}
          />
        </Field>

        <Field name="note" label="Note / Commentaire">
          <Input.TextArea
            rows={1}
            showCount
            maxLength={500}
            placeholder="Ajouter des notes, instructions spéciales ou commentaires..."
          />
        </Field>

        <PrioritySelect
          value={priority}
          onChange={onPriorityChange}
          disabled={!canEdit}
        />
      </div>
    </div>
  );
}