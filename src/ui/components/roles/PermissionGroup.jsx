import { Card, Checkbox, Col, Row, Tag, Typography } from 'antd';

export default function PermissionGroup({ category, selected, disabled, onToggle, onToggleGroup }) {
  const { key, label, permissions } = category;
  const selectedCount = permissions.filter((p) => selected.has(p.name)).length;
  const allChecked = selectedCount === permissions.length && permissions.length > 0;
  return (
    <section className="mb-6">
      <div className="flex justify-between items-center gap-3 mb-3">
        <div className="flex gap-2 items-center min-w-0">
          <Checkbox disabled={disabled} checked={allChecked} indeterminate={selectedCount > 0 && !allChecked} onChange={(e) => onToggleGroup(key, e.target.checked)} />
          <Typography.Text strong>{label}</Typography.Text>
        </div>
        <Tag className="!mr-0">{selectedCount}/{permissions.length}</Tag>
      </div>
      <Row gutter={[12, 12]}>
        {permissions.map((permission) => {
          const checked = selected.has(permission.name);
          return (
            <Col xs={24} sm={12} xl={8} key={permission.name}>
              <Card size="small" hoverable={!disabled} onClick={() => !disabled && onToggle(permission.name)} className={`h-full ${checked ? '!border-green-300 !bg-green-50' : ''}`} styles={{ body: { padding: 12 } }}>
                <div className="flex items-start gap-3">
                  <Checkbox checked={checked} disabled={disabled} onClick={(e) => e.stopPropagation()} onChange={() => onToggle(permission.name)} />
                  <div className="min-w-0">
                    <Typography.Text strong>{permission.label || permission.name}</Typography.Text>
                    <div><Typography.Text type="secondary" className="!text-xs break-all">{permission.name}</Typography.Text></div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </section>
  );
}
