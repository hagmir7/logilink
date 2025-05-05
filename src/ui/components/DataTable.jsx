import React, { useState } from 'react';
import { Table, Input, Button, Space, Tooltip, Badge, Tag } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined, PrinterOutlined, EyeOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';

// Improved styling with better scrollbar and hover effects
const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        
        ${antCls}-table-thead > tr > th {
          background-color: #f7f9fc;
          font-weight: 600;
        }
        
        ${antCls}-table-tbody > tr:hover > td {
          background-color: #f0f7ff;
        }
        
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #c0c0c0 transparent;
            scrollbar-gutter: stable;
            
            &::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            
            &::-webkit-scrollbar-thumb {
              background: #c0c0c0;
              border-radius: 3px;
            }
            
            &::-webkit-scrollbar-track {
              background: #f0f0f0;
            }
          }
        }
      }
      
      .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      
      .table-title {
        font-size: 18px;
        font-weight: 600;
        color: ${token.colorTextHeading};
      }
      
      .search-wrapper {
        width: 250px;
      }
    `,
  };
});

// Status component for better visual indication
const StatusTag = ({ status }) => {

  const statusMap = {
    pending: { color: 'orange', text: 'En attente' },
    processing: { color: 'blue', text: 'En cours' },
    completed: { color: 'green', text: 'Terminé' },
    delayed: { color: 'red', text: 'Retardé' },
  };

  const config = statusMap[status] || { color: 'default', text: status };

  return <Tag color={config.color}>{config.text}</Tag>;

};

const DataTable = () => {
  const { styles } = useStyle();
  const [searchText, setSearchText] = useState('');
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  
  // Handle search
  const handleSearch = value => {
    setSearchText(value);
  };
  
  // Reset filters and sorters
  const handleReset = () => {
    setFilteredInfo({});
    setSortedInfo({});
    setSearchText('');
  };
  
  // Enhanced columns with better formatting, sorting and filtering
  const columns = [
    {
      title: <span className="whitespace-nowrap font-medium">Bon de commande</span>,
      width: 150,
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      fixed: 'left',
      sorter: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
      sortOrder: sortedInfo.columnKey === 'orderNumber' && sortedInfo.order,
      filteredValue: filteredInfo.orderNumber || null,
      render: (text) => <span className="font-medium text-blue-600">{text}</span>,
    },
    {
      title: <span className="whitespace-nowrap font-medium">Bon de préparation</span>,
      width: 150,
      dataIndex: 'preparationNumber',
      key: 'preparationNumber',
      fixed: 'left',
      sorter: (a, b) => a.preparationNumber.localeCompare(b.preparationNumber),
      sortOrder: sortedInfo.columnKey === 'preparationNumber' && sortedInfo.order,
    },
    {
      title: <span className="font-medium">Référence</span>,
      dataIndex: 'reference',
      key: 'reference',
      width: 150,
      sorter: (a, b) => a.reference.localeCompare(b.reference),
      sortOrder: sortedInfo.columnKey === 'reference' && sortedInfo.order,
    },
    {
      title: <span className="font-medium">N° Client</span>,
      dataIndex: 'clientNumber',
      key: 'clientNumber',
      width: 120,
      sorter: (a, b) => a.clientNumber.localeCompare(b.clientNumber),
      sortOrder: sortedInfo.columnKey === 'clientNumber' && sortedInfo.order,
    },
    {
      title: <span className="font-medium">Date du document</span>,
      dataIndex: 'documentDate',
      key: 'documentDate',
      width: 150,
      sorter: (a, b) => new Date(a.documentDate) - new Date(b.documentDate),
      sortOrder: sortedInfo.columnKey === 'documentDate' && sortedInfo.order,
    },
    {
      title: <span className="font-medium">Date prévue</span>,
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      width: 150,
      sorter: (a, b) => new Date(a.expectedDate) - new Date(b.expectedDate),
      sortOrder: sortedInfo.columnKey === 'expectedDate' && sortedInfo.order,
      render: (date, record) => {
        const today = new Date();
        const expectedDate = new Date(date);
        const isPastDue = expectedDate < today && record.status !== 'completed';
        
        return (
          <span className={isPastDue ? 'text-red-600 font-medium' : ''}>{date}</span>
        );
      }
    },
    {
      title: <span className="font-medium">Expédition</span>,
      dataIndex: 'shipping',
      key: 'shipping',
      width: 150,
      filters: [
        { text: 'Standard', value: 'standard' },
        { text: 'Express', value: 'express' },
        { text: 'Économique', value: 'economic' },
      ],
      filteredValue: filteredInfo.shipping || null,
      onFilter: (value, record) => record.shipping === value,
      render: (shipping) => {
        const shippingColors = {
          standard: 'blue',
          express: 'green',
          economic: 'orange',
        };
        
        return <Tag color={shippingColors[shipping]}>{shipping === 'standard' ? 'Standard' : shipping === 'express' ? 'Express' : 'Économique'}</Tag>;
      }
    },
    {
      title: <span className="font-medium">Statut</span>,
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'En attente', value: 'pending' },
        { text: 'En cours', value: 'processing' },
        { text: 'Terminé', value: 'completed' },
        { text: 'Retardé', value: 'delayed' },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: <span className="font-medium">Action</span>,
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Voir les détails">
            <Button type="text" icon={<EyeOutlined />} size="middle" />
          </Tooltip>
          <Tooltip title="Imprimer">
            <Button type="text" icon={<PrinterOutlined />} size="middle" />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Generate more realistic data
  const generateData = () => {
    const statuses = ['pending', 'processing', 'completed', 'delayed'];
    const shippingMethods = ['standard', 'express', 'economic'];
    
    return Array.from({ length: 100 }).map((_, i) => {
      const orderNum = `CMD-${String(2000 + i).padStart(4, '0')}`;
      const prepNum = `PREP-${String(3000 + i).padStart(4, '0')}`;
      
      // Generate random dates within a reasonable range
      const documentDate = new Date();
      documentDate.setDate(documentDate.getDate() - Math.floor(Math.random() * 30));
      
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + Math.floor(Math.random() * 30) - 10);
      
      return {
        key: i,
        orderNumber: orderNum,
        preparationNumber: prepNum,
        reference: `REF-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        clientNumber: `CL-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, '0')}`,
        documentDate: documentDate.toLocaleDateString('fr-FR'),
        expectedDate: expectedDate.toLocaleDateString('fr-FR'),
        shipping: shippingMethods[Math.floor(Math.random() * shippingMethods.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      };
    });
  };

  const dataSource = generateData();
  
  // Filter data based on search text
  const filteredData = dataSource.filter(item => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    
    return (
      item.orderNumber.toLowerCase().includes(searchLower) ||
      item.preparationNumber.toLowerCase().includes(searchLower) ||
      item.reference.toLowerCase().includes(searchLower) ||
      item.clientNumber.toLowerCase().includes(searchLower)
    );
  });

  // Handle table change (sorting, filtering)
  const handleTableChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };
  
  // Calculate dynamic table height based on viewport
  const calculateTableHeight = () => {
    const screenHeight = window.innerHeight || document.documentElement.clientHeight;
    return screenHeight - 220; // Adjust based on other UI elements
  };

  return (
    <div className={styles.customTable}>
      {/* Table header with search and actions */}
      <div className="table-header">
        <div className="table-title">Gestion des Commandes</div>
        <Space>
          <div className="search-wrapper">
            <Input
              placeholder="Rechercher..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <Tooltip title="Exporter">
            <Button icon={<DownloadOutlined />}>Exporter</Button>
          </Tooltip>
          <Button onClick={handleReset}>Réinitialiser</Button>
        </Space>
      </div>
      
      {/* Summary statistics */}
      <div className="flex gap-4 mb-4">
        <Badge count={dataSource.filter(d => d.status === 'pending').length} showZero color="#faad14">
          <div className="px-4 py-2 bg-gray-50 rounded">En attente</div>
        </Badge>
        <Badge count={dataSource.filter(d => d.status === 'processing').length} showZero color="#1890ff">
          <div className="px-4 py-2 bg-gray-50 rounded">En cours</div>
        </Badge>
        <Badge count={dataSource.filter(d => d.status === 'completed').length} showZero color="#52c41a">
          <div className="px-4 py-2 bg-gray-50 rounded">Terminé</div>
        </Badge>
        <Badge count={dataSource.filter(d => d.status === 'delayed').length} showZero color="#f5222d">
          <div className="px-4 py-2 bg-gray-50 rounded">Retardé</div>
        </Badge>
      </div>

      {/* Enhanced table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        scroll={{ x: 'max-content', y: calculateTableHeight() }}
        pagination={{ 
          pageSize: 15,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} éléments`,
        }}
        onChange={handleTableChange}
        size="small"
        bordered
      />
    </div>
  );
};

export default DataTable;