import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, message, DatePicker } from "antd";
import { api } from "../utils/api";
import locale from "antd/es/date-picker/locale/fr_FR";
import dayjs from "dayjs";

const { Text } = Typography;

const UsersActions = () => {
  const [data, setData] = useState([]);
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));

  const fetchData = async () => {
    try {
      const response = await api.get(`users?month=${month}`);
      setData(response.data);
    } catch (error) {
      message.error("Erreur lors du chargement des données");
    }
  };

  useEffect(() => {
    fetchData();
  }, [month]);

  const columns = [
    {
      title: "Nom Complet",
      dataIndex: "full_name",
      key: "full_name",
      render: (name) => <Text>{name}</Text>,
    },
    {
      title: "Téléphone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (phone ? phone : <Text type="secondary">-</Text>),
    },
    {
      title: "Préparations",
      dataIndex: "preparations_count",
      key: "preparations_count",
    },
    {
      title: "Mouvements",
      dataIndex: "movements_count",
      key: "movements_count",
    },
    {
      title: "Contrôles",
      dataIndex: "controlles_count",
      key: "controlles_count",
    },
    {
      title: "Validations",
      dataIndex: "validations_count",
      key: "validations_count",
    },
    {
      title: "Chargements",
      dataIndex: "chargements_count",
      key: "chargements_count",
    },
    {
      title: "Statut",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "1" ? (
          <Tag color="green">Actif</Tag>
        ) : (
          <Tag color="volcano">Inactif</Tag>
        ),
    },
  ];

  return (
    <div>
      <div className="p-2 flex justify-between items-center">
        <Typography.Title className="p-2" level={4}>Liste d'actions</Typography.Title>
        <DatePicker
          picker="month"
          locale={locale}
          defaultValue={dayjs()}
          onChange={(date) => setMonth(date.format("YYYY-MM"))}
          format="MMMM YYYY"
          allowClear={false}
        />
      </div>

      <Table
        rowKey="id"
        columns={columns.map(col => ({ ...col, className: 'whitespace-nowrap' }))}
        dataSource={data}
        pagination={{ pageSize: 30 }}
      />
    </div>
  );
};

export default UsersActions;
