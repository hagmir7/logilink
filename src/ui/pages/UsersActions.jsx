import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Typography, message, DatePicker } from "antd";
import { api } from "../utils/api";
// import { locale } from "../utils/config";
import locale from "antd/es/date-picker/locale/fr_FR"; // French locale
import dayjs from "dayjs";


const { Text } = Typography;

const UsersActions = () => {
    const [data, setData] = useState([])

    const fetchData = async () => {
        try {
            const response = api.get("users");
            setData((await response).data)
        } catch (error) {
            message.error("Error Fetching data")
        }
    }
    useEffect(() => {
        fetchData()
    }, [])

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
        <div className="">
            <div className="p-2 flex justify-between items-center">
                <Typography.Title level={4}>Liste des utilisateurs</Typography.Title>
                 <DatePicker
                    picker="month"
                    locale={locale}
                    defaultValue={dayjs()} // ✅ current month
                    format="MMMM YYYY"
                    allowClear={false}
                />
            </div>
            
            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}

                pagination={{ pageSize: 30 }}
                style={{ whiteSpace: "nowrap" }}
            />
        </div>
    );
};

export default UsersActions;
