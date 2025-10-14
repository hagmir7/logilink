import React, { useEffect, useState } from "react";
import { message, Table, Tag, Spin } from "antd";
import { api } from "../utils/api";
import { getExped, getStatus } from "../utils/config";
import { useNavigate } from "react-router-dom";

export default function UserArchive() {
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, total: 0, per_page: 10 });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get("users/documents", { params: { page } });
            setData(response.data.data || []);
            setMeta({
                current_page: response.data.current_page,
                total: response.data.total,
                per_page: response.data.per_page,
            });
        } catch (error) {
            console.error(error);
            message.error(error?.response?.data?.message || "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(meta.current_page);
    }, []);

    const columns = [
        {
            title: "Pièce",
            dataIndex: "piece",
            key: "piece",
            render: (text) => <span className="font-semibold">{text}</span>,
        },
        {
            title: "Référence",
            dataIndex: "ref",
            key: "ref",
        },
        {
            title: "Client",
            dataIndex: "client_id",
            key: "client_id",
        },
        {
            title: "Expédition",
            key: "expedition",
            render: (_, record) => getExped(record.expedition),
        },
        {
            title: "Date document",
            key: "doc_date",
            render: (_, record) => {
                const date = record.docentete?.DO_Date;
                return date ? new Date(date).toLocaleDateString() : "-";
            },
        },
        {
            title: "Date livraison",
            key: "doc_date_livr",
            render: (_, record) => {
                const dateLivr = record.docentete?.DO_DateLivr;
                return dateLivr ? new Date(dateLivr).toLocaleDateString() : "-";
            },
        },
        {
            title: "Status",
            key: "status_id",
            render: (_, record) => (
                <Tag color={getStatus(Number(record.status_id))?.color}>
                    {getStatus(Number(record.status_id))?.name}
                </Tag>
            ),
        },
    ];

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4 text-gray-700">Mon Archive</h1>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    bordered
                    scroll={{ x: "max-content" }}
                    pagination={{
                        current: meta.current_page,
                        total: meta.total,
                        pageSize: meta.per_page,
                        showSizeChanger: false,
                        onChange: (page) => fetchData(page),
                    }}
                    onRow={(record) => ({
                        onClick: () => navigate(`/documents/${record.id}`), // 👈 navigate to detail page
                        style: {
                            cursor: "pointer",
                            transition: "background 0.2s",
                        },
                        onMouseEnter: (e) => (e.currentTarget.style.background = "#fafafa"),
                        onMouseLeave: (e) => (e.currentTarget.style.background = "white"),
                    })}
                />
            )}
        </div>
    );
}
