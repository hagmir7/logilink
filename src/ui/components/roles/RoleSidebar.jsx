import { useMemo, useState } from 'react';
import { Button, Empty, Input, List, Space, Spin, Tag, Typography, Dropdown } from 'antd';
import { PlusOutlined, SearchOutlined, SafetyCertificateOutlined, MoreOutlined } from '@ant-design/icons';

export default function RoleSidebar({ roles, selectedName, onSelect, loading, canCreate, canRename, canDelete, onCreate, onRename, onDelete }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => roles.filter((r) => r.name.toLowerCase().includes(query.toLowerCase())), [roles, query]);

  return (
    <aside className="w-full md:w-72 shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 font-semibold mb-3"><SafetyCertificateOutlined /> Rôles</div>
        <Space.Compact className="w-full">
          <Input prefix={<SearchOutlined />} placeholder="Rechercher un rôle..." value={query} onChange={(e) => setQuery(e.target.value)} allowClear />
          {canCreate && <Button icon={<PlusOutlined />} onClick={onCreate} aria-label="Ajouter un rôle" />}
        </Space.Compact>
      </div>
      <div className="max-h-64 md:max-h-[70vh] overflow-y-auto">
        {loading ? <div className="p-8 text-center"><Spin /></div> : filtered.length === 0 ? <Empty className="my-8" description="Aucun rôle trouvé" /> : (
          <List dataSource={filtered} renderItem={(role) => {
            const active = role.name === selectedName;
            const menuItems = [
              ...(canRename && !role.protected ? [{ key: 'rename', label: 'Renommer' }] : []),
              ...(canDelete && !role.protected ? [{ key: 'delete', label: 'Supprimer', danger: true }] : []),
            ];
            const menu = { items: menuItems, onClick: ({ key, domEvent }) => { domEvent.stopPropagation(); key === 'rename' ? onRename(role) : onDelete(role); } };
            return (
              <List.Item onClick={() => onSelect(role.name)} className={`!px-3 !py-2 cursor-pointer ${active ? '!bg-green-50 border-l-2 border-green-500' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between w-full gap-2 min-w-0">
                  <Typography.Text ellipsis className={active ? '!text-green-700 !font-medium' : ''}>{role.label || role.name}</Typography.Text>
                  <Space size={4}>
                    <Tag className="!mr-0">{role.permissions?.length ?? 0}</Tag>
                    {menuItems.length > 0 && <Dropdown menu={menu} trigger={['click']}><Button type="text" size="small" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} /></Dropdown>}
                  </Space>
                </div>
              </List.Item>
            );
          }} />
        )}
      </div>
    </aside>
  );
}
