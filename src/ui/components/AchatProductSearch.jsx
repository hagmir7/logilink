import React, { useState, useEffect } from 'react';
import { Modal, Input, Table, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { api } from '../utils/api';

const AchatProductSearch = ({ searchModalOpen, inputValue, lineId, onCancel, onSelect }) => {
  const [searchText, setSearchText] = useState(inputValue || '');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState([]);

  // Fetch articles from Laravel API
  const fetchResults = async (query = '') => {
    try {
      setLoading(true);
      const res = await api.get(`articles/stock/search?q=${query}`);
      setResults(res.data.data || []); // Laravel paginate returns data in "data"
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial search when modal opens with inputValue
  useEffect(() => {
    if (searchModalOpen && inputValue) {
      setSearchText(inputValue);
      fetchResults(inputValue);
    }
  }, [searchModalOpen, inputValue]);

  // Trigger search when input changes (with debounce)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchText !== '') {
        fetchResults(searchText);
      } else {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchText]);

  // Reset selected articles when modal closes
  useEffect(() => {
    if (!searchModalOpen) {
      setSelectedArticles([]);
      setResults([]);
      setSearchText(inputValue || '');
    }
  }, [searchModalOpen]);

  // Handle checkbox selection
  const rowSelection = {
    selectedRowKeys: selectedArticles.map(a => a.code),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedArticles(selectedRows);
    },
  };

  // Handle OK button click
  const handleOk = () => {
    if (onSelect && selectedArticles.length > 0) {
      onSelect(selectedArticles, lineId);
    }
    setSelectedArticles([]);
    onCancel();
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedArticles([]);
    onCancel();
  };

  // Table columns
  const columns = [
    {
      title: 'Référence',
      dataIndex: 'code',
      key: 'code',
      className: 'font-semibold text-gray-700',
      width: '30%',
    },
    {
      title: 'Désignation',
      dataIndex: 'description',
      key: 'description',
      width: '70%',
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">
            Recherche - Ligne ID {lineId}
          </span>
          {selectedArticles.length > 0 && (
            <span className="text-sm text-blue-600 font-normal">
              {selectedArticles.length} article(s) sélectionné(s)
            </span>
          )}
        </div>
      }
      open={searchModalOpen}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Valider"
      cancelText="Annuler"
      okButtonProps={{ 
        disabled: selectedArticles.length === 0,
        className: 'bg-blue-600 hover:bg-blue-700'
      }}
      width={800}
      destroyOnHidden
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="flex items-center gap-2">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Rechercher un article par référence ou désignation..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            autoFocus
            className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-0"
          />
        </div>

        {/* Results */}
        <div className="border rounded-lg bg-white shadow-sm min-h-[300px] max-h-[500px] overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <Spin size="large" tip="Recherche en cours..." />
            </div>
          ) : results.length > 0 ? (
            <Table
              dataSource={results}
              columns={columns}
              pagination={false}
              rowKey="code"
              size="small"
              rowSelection={rowSelection}
              className="rounded-lg overflow-hidden"
              locale={{ 
                emptyText: 'Aucun résultat trouvé',
                selectAll: 'Tout sélectionner',
                selectInvert: 'Inverser la sélection'
              }}
            />
          ) : searchText ? (
            <Empty 
              description="Aucun résultat trouvé" 
              className="mt-20"
            />
          ) : (
            <Empty 
              description="Saisissez un terme de recherche" 
              className="mt-20"
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AchatProductSearch;