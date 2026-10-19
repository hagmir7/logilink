import React from 'react';
import { Select } from 'antd';
import { STATUS_OPTIONS } from '../../constants/purchaseStatus';

/** Status dropdown with a coloured dot. `isOptionDisabled(option)` is optional. */
export default function StatusSelect({ options = STATUS_OPTIONS, isOptionDisabled, ...props }) {
  return (
    <Select
      placeholder="Statut"
      className="w-full"
      {...props}
      options={options.map((o) => ({
        value: o.value,
        disabled: isOptionDisabled?.(o) ?? false,
        label: (
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${o.color}`} />
            {o.label}
          </span>
        ),
      }))}
    />
  );
}
