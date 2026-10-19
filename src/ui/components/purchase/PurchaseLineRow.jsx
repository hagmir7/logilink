import React from 'react';
import { Form, Input, Select, Button, Checkbox, Badge, Tooltip } from 'antd';
import { MinusCircleOutlined, PaperClipOutlined } from '@ant-design/icons';
import StatusSelect from './StatusSelect';
import { STATUS } from '../../constants/purchaseStatus';

const noMargin = { marginBottom: 0 };

export default function PurchaseLineRow({
  field,
  form,
  units,
  isAdmin,
  canEdit,
  initialStatus,
  fileCount,
  onOpenFiles,
  onSearchKeyDown,
  onRemove,
  onShowNonCompliant,
}) {
  const { name } = field;
  const status = String(Form.useWatch(['lines', name, 'status'], form) ?? STATUS.DRAFT);
  const nonCompliant = Form.useWatch(['lines', name, 'non_compliant'], form) || 0;

  const lineCanEdit = isAdmin || status === STATUS.RECEIVED || String(initialStatus) === STATUS.RECEIVED;
  const isNonCompliant = status === STATUS.NON_COMPLIANT;

  // Non-admins may only move a line to "Brouillon" or "Reçu non conforme"
  const isOptionDisabled = (o) =>
    !isAdmin && o.value !== status && ![STATUS.DRAFT, STATUS.NON_COMPLIANT].includes(o.value);

  const showNonCompliant = () => {
    const line = form.getFieldValue(['lines', name]);
    if (nonCompliant > 0 && line?.id) onShowNonCompliant(line.id, line.quantity);
  };

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-7 gap-3 p-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
      <Form.Item name={[name, 'id']} hidden style={noMargin}>
        <Input type="hidden" />
      </Form.Item>

      <Form.Item name={[name, 'code']} style={noMargin}>
        <Input placeholder="Code (optionnel)" onKeyDown={(e) => onSearchKeyDown(e, name, 'code')} />
      </Form.Item>

      <Form.Item
        name={[name, 'description']}
        rules={[{ required: true, message: 'Requis' }]}
        className="col-span-2"
        style={noMargin}
      >
        <Input
          placeholder="Description de l'article"
          onKeyDown={(e) => onSearchKeyDown(e, name, 'description')}
        />
      </Form.Item>

      <Form.Item name={[name, 'quantity']} rules={[{ required: true, message: 'Requis' }]} style={noMargin}>
        <Input type="number" placeholder="Qté" min="0" step="0.01" />
      </Form.Item>

      <Form.Item name={[name, 'unit']} style={noMargin}>
        <Select
          showSearch
          placeholder="Unité"
          optionFilterProp="label"
          options={units.map((u) => ({ label: u.U_Intitule, value: u.U_Intitule }))}
        />
      </Form.Item>

      <Form.Item name={[name, 'status']} style={noMargin}>
        <StatusSelect
          disabled={!lineCanEdit || (!isAdmin && isNonCompliant)}
          isOptionDisabled={isOptionDisabled}
        />
      </Form.Item>

      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          <Button
            icon={<PaperClipOutlined />}
            onClick={() => onOpenFiles(name)}
            title="Joindre des fichiers"
            className="flex-shrink-0"
          >
            {fileCount > 0 && <span className="ml-1 text-blue-600 font-semibold">({fileCount})</span>}
          </Button>

          <Tooltip title={`${nonCompliant} non conforme`}>
            <span className="cursor-pointer" onClick={showNonCompliant}>
              <Badge count={nonCompliant} />
            </span>
          </Tooltip>
        </div>

        <Button
          type="text"
          danger
          icon={<MinusCircleOutlined />}
          onClick={() => onRemove(name)}
          title="Supprimer cette ligne"
          disabled={!canEdit}
        />

        <Form.Item name={[name, 'checked']} valuePropName="checked" style={noMargin}>
          <Checkbox />
        </Form.Item>
      </div>
    </div>
  );
}
