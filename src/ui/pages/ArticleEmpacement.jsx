import React, { useEffect, useState, useCallback } from 'react';
import { Card, Collapse, Tag, Table, message, Empty } from 'antd';
import { api } from '../utils/api';
import { debounce } from 'lodash';

const { Panel } = Collapse;

const ArticleEmpacement = ({ code }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Debounced version (same structure as your fetchEmplacementData)
  const fetchData = useCallback(
    debounce(async (articleCode) => {
      if (!articleCode?.trim()) return;

      setLoading(true);
      setData([]);
      try {
        const response = await api.get(`articles/emplacements/${articleCode}`);
        setData(response.data);
      } catch (error) {
        message.error(error.response?.data?.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchData(code);
    return () => fetchData.cancel(); // cleanup debounce
  }, [code]);

  return (
    <div className="p-4 space-y-4">
      {data.map((emplacement, index) => (
        <Card
          key={emplacement.id}
          style={index > 0 ? { marginTop: 14 } : {}}
          title={
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg text-gray-700">
                {emplacement.code}
              </span>
              <span className="text-sm text-gray-500">
                Dépôt: <span className="text-black">{emplacement?.depot?.code}</span>
              </span>
            </div>
          }
          className="shadow-sm rounded-2xl"
        >
          <Collapse accordion>
            {emplacement.palettes.map((palette) => (
              <Panel
                key={palette.id}
                header={
                  <div className="flex items-center justify-between">
                    <span>
                      Palette: <Tag color="green">{palette.code}</Tag>
                    </span>
                    <span className="text-gray-500 text-sm">
                      Type: {palette.type}
                    </span>
                  </div>
                }
              >
                {palette.articles.length > 0 ? (
                  <Table
                    size="small"
                    pagination={false}
                    rowKey="id"
                    columns={[
                      {
                        title: 'Code Article',
                        dataIndex: 'code',
                        key: 'code',
                        render: (text) => <Tag color="geekblue">{text}</Tag>,
                      },
                      {
                        title: 'Description',
                        dataIndex: 'description',
                        key: 'description',
                      },
                      {
                        title: 'Quantité',
                        key: 'quantity',
                        render: (_, record) => (
                          <span className="font-semibold">
                            {record.pivot?.quantity || record.quantity}
                          </span>
                        ),
                      },
                    ]}
                    dataSource={palette.articles}
                  />
                ) : (
                  <p className="text-gray-500 italic">
                    Aucun article dans cette palette.
                  </p>
                )}
              </Panel>
            ))}
          </Collapse>
        </Card>
      ))}

      {data.length === 0 && !loading ? (
        <Empty description="Aucun emplacement pour cet article" />
      ) : (
        ''
      )}
    </div>
  );
};

export default ArticleEmpacement;
