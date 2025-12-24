import React, { useEffect, useState } from "react";
import { message, Tag, Spin, Button } from "antd";
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
            setData((prev) => (page === 1 ? response.data.data : [...prev, ...response.data.data]));

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
        fetchData(1);
    }, []);

    const hasMore = meta.current_page * meta.per_page < meta.total;

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            const nextPage = meta.current_page + 1;
            setMeta((prev) => ({ ...prev, current_page: nextPage }));
            fetchData(nextPage);
        }
    };

    const formatDate = (dateString) =>
        dateString ? new Date(dateString).toLocaleDateString() : "-";



    const handleShow = async (id) => {
        try {
            const url = `/user-archive/${id}`
            if (window.electron && typeof window.electron.openShow === 'function') {
                await window.electron.openShow({
                    width: 1200,
                    height: 700,
                    url,
                    resizable: true,
                })
            } else {
                navigate(`/user-archive/${id}`)
            }
        } catch (error) {
            console.error('Error navigating to article:', error)
        }
    }


    return (
        <div className="">
            <h1 className="text-lg p-4 font-bold text-gray-700">Mes documents</h1>

            {data.length === 0 && loading ? (
                <div className="flex justify-center py-10">
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["Pièce", "Référence", "Client", "Expédition", "Date document", "Date livraison", "Status"].map(
                                        (header, i) => (
                                            <th
                                                key={i}
                                                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                            >
                                                {header}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                            Aucune donnée disponible
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((record) => (
                                        <tr
                                            key={record.id}
                                            onClick={() => handleShow(record.piece)}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                                {record.piece}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{record.ref}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{record.client_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                {getExped(record.expedition)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                {formatDate(record.docentete?.DO_Date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                                                {formatDate(record.docentete?.DO_DateLivr)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Tag color={getStatus(Number(record.status_id))?.color}>
                                                    {getStatus(Number(record.status_id))?.name}
                                                </Tag>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <Button loading={loading} onClick={handleLoadMore} className="px-6 py-2 font-medium mb-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200" >
                                Charger plus
                            </Button>
                        </div>

                    )}
                </>
            )}
        </div>
    );
}
