import React from 'react';
import { Form, Select, DatePicker } from 'antd';
import { locale } from '../../utils/config';

const OPTIONS = [
  { value: 'normal', label: <span className="flex items-center gap-2">⚪ Normale</span> },
  {
    value: 'urgent',
    label: <span className="flex items-center gap-2 text-red-600 font-semibold">🚨 Urgente</span>,
  },
  {
    value: 'planned',
    label: <span className="flex items-center gap-2 text-green-600 font-semibold">📅 Planifiée</span>,
  },
];

export default function PrioritySelect({ value, onChange, disabled }) {
  const planned = value === 'planned';

  return (
    <div>
      <span className="font-semibold">Priorité</span>
      <div className="mt-2.5 flex gap-1">
        <Select
          value={value}
          onChange={onChange}
          disabled={disabled}
          options={OPTIONS}
          className={`font-medium ${planned ? 'w-1/2' : 'w-full'}`}
        />
        {planned && (
          <Form.Item
            name="planned_at"
            rules={[{ required: true, message: 'Requis' }]}
            className="w-1/2"
            style={{ marginBottom: 0 }}
          >
            <DatePicker className="w-full" locale={locale} placeholder="Choisir une date" />
          </Form.Item>
        )}
      </div>
    </div>
  );
}
