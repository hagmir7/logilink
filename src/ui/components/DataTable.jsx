import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tooltip, Badge, Tag } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined, PrinterOutlined, EyeOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { api } from '../utils/api';

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

function getExpedition(exp) {
  const expeditions = {
      "1": "EX-WORK",
      "2": "LA VOIE EXPRESS",
      "3": "SDTM",
      "4": "LODIVE",
      "5": "MTR",
      "6": "CARRE",
      "7": "MAROC EXPRESS",
      "8": "GLOG MAROC",
      "9": "AL JAZZERA",
      "10": "C YAHYA",
      "11": "C YASSIN",
      "12": "GHAZALA",
      "13": "GISNAD"
  };

  return expeditions[exp] || "  ";
}


const DataTable = () => {
  const { styles } = useStyle();
  const [searchText, setSearchText] = useState('');
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [dataSource, setDataSource] = useState([]);

  const handleSearch = value => {
    setSearchText(value);
  };

  const handleReset = () => {
    setFilteredInfo({});
    setSortedInfo({});
    setSearchText('');
  };

  const fetchData = async () => {
    try {
      const response = await api.get('docentetes/2');
      const data = response.data.map((item, index) => ({
        key: index,
        orderNumber: item.DO_Piece,
        preparationNumber: item.DO_Reliquat,
        reference: item.DO_Ref,
        clientNumber: item.DO_Tiers,
        documentDate: item.DO_Date,
        expectedDate: item.DO_DateLivr,
        shipping: item.DO_Expedit === '1' ? 'standard' : item.DO_Expedit === '2' ? 'express' : 'economic',
        status: 'pending', // You can change this based on business logic
      }));
      setDataSource(data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Bon de commande',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      sorter: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
      sortOrder: sortedInfo.columnKey === 'orderNumber' && sortedInfo.order,
    },
    {
      title: <div className='whitespace-nowrap'>Bon de préparation</div>,
      dataIndex: 'preparationNumber',
      key: 'preparationNumber',
    },
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'N° Client',
      dataIndex: 'clientNumber',
      key: 'clientNumber',
    },
    {
      title: 'Date du document',
      dataIndex: 'documentDate',
      key: 'documentDate',
    },
    {
      title: 'Date prévue',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      render: (date, record) => {
        const today = new Date();
        const expected = new Date(date);
        const isLate = expected < today && record.status !== 'completed';
        return <span className={isLate ? 'text-red-500 font-bold' : ''}>{date}</span>;
      },
    },
    {
      title: 'Expédition',
      dataIndex: 'shipping',
      key: 'shipping',
      render: (val) => {
        const colorMap = {
          standard: 'blue',
          express: 'green',
          economic: 'orange',
        };
        return <Tag color={colorMap[val] || 'default'}>{val}</Tag>;
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (val) => {
        const map = {
          pending: { text: 'En attente', color: 'orange' },
          processing: { text: 'En cours', color: 'blue' },
          completed: { text: 'Terminé', color: 'green' },
          delayed: { text: 'Retardé', color: 'red' },
        };
        const config = map[val] || { text: val, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Space>
          <Tooltip title="Voir les détails">
            <Button icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Imprimer">
            <Button icon={<PrinterOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = dataSource.filter((item) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      item.orderNumber?.toLowerCase().includes(search) ||
      item.reference?.toLowerCase().includes(search) ||
      item.clientNumber?.toLowerCase().includes(search)
    );
  });

  const calculateTableHeight = () => {
    const screenHeight = window.innerHeight || document.documentElement.clientHeight;
    return screenHeight - 220;
  };

  return (
    <div className={styles.customTable}>
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

      <div className="flex gap-4 mb-4">
        <Badge count={dataSource.filter(d => d.status === 'pending').length} color="orange">
          <div className="px-4 py-2 bg-gray-50 rounded">En attente</div>
        </Badge>
        <Badge count={dataSource.filter(d => d.status === 'processing').length} color="blue">
          <div className="px-4 py-2 bg-gray-50 rounded">En cours</div>
        </Badge>
        <Badge count={dataSource.filter(d => d.status === 'completed').length} color="green">
          <div className="px-4 py-2 bg-gray-50 rounded">Terminé</div>
        </Badge>
        <Badge count={dataSource.filter(d => d.status === 'delayed').length} color="red">
          <div className="px-4 py-2 bg-gray-50 rounded">Retardé</div>
        </Badge>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        scroll={{ x: 'max-content', y: calculateTableHeight() }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `Total ${total} éléments`,
        }}
        onChange={(pagination, filters, sorter) => {
          setFilteredInfo(filters);
          setSortedInfo(sorter);
        }}
        size="small"
        bordered
      />
    </div>
  );
};

export default DataTable;
