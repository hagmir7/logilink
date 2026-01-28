import { useEffect, useState, useCallback } from "react";
import { Button, message, Select, Tag, DatePicker, Empty } from "antd";
import { RefreshCcw, PlusCircle, Filter } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { api } from "../utils/api";
import { formatDate, handleShow, locale } from "../utils/config";
import TableSkeleton from "../components/ui/TableSkeleton";
import { useAuth } from "../contexts/AuthContext";

const { RangePicker } = DatePicker;

const STATUS_OPTIONS = [
  { label: "Brouillon", value: 1 },
  { label: "Envoyer", value: 2 },
  { label: "En révision", value: 3 },
  { label: "Approuvé", value: 4 },
  { label: "Rejeté", value: 5 },
  { label: "Commandé", value: 6 },
  { label: "Reçu", value: 7 },
  { label: "Annulé", value: 8 },
];

const STATUS_MAP = {
  1: { label: "Brouillon", color: "bg-gray-100 text-gray-800 border-gray-300" },
  2: { label: "Envoyer", color: "bg-blue-100 text-blue-800 border-blue-300" },
  3: { label: "En révision", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  4: { label: "Approuvé", color: "bg-green-100 text-green-800 border-green-300" },
  5: { label: "Rejeté", color: "bg-red-100 text-red-800 border-red-300" },
  6: { label: "Commandé", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  7: { label: "Reçu", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  8: { label: "Annulé", color: "bg-rose-100 text-rose-800 border-rose-300" },
};


export default function Purchase() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const { roles } = useAuth()


  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);


  const [filters, setFilters] = useState({
    service: null,
    status: null,
    user: null,
    dates: [],
  });




  const fetchOptions = async (url, mapper, setter) => {
    try {
      const { data } = await api.get(url);
      setter(data.map(mapper));
    } catch (err) {
      console.error(`Failed to fetch ${url}`, err);
    }
  };

  const fetchData = useCallback(async (reset = true) => {
    reset ? setLoading(true) : setLoadingMore(true);

    try {
      const { data: res } = await api.get("purchase-documents", {
        params: {
          service: filters.service,
          status: filters.status,
          user: filters.user,
          date_filter: filters.dates,
        },
      });

      setData(reset ? res.data : prev => [...prev, ...res.data]);
      setPagination({
        current: res.current_page,
        next: res.next_page_url,
        total: res.total,
      });
    } catch (err) {
      message.warning(err?.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);


  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchOptions("services", s => ({ label: s.name, value: s.id }), setServices);
    fetchOptions("users/role/chef_service", u => ({ label: u.full_name, value: u.id }), setUsers);
  }, []);


  const renderStatus = (status) => {
    const s = STATUS_MAP[status];
    if (!s) return <span className="px-2 py-1 bg-gray-100 rounded">__</span>;

    return (
      <span className={`px-2 py-0.5 rounded border ${s.color}`}>
        {s.label}
      </span>
    );
  };

  const handleDateChange = (dates) => {
    setFilters(f => ({
      ...f,
      dates: dates?.length === 2
        ? dates.map(d => dayjs(d).format("YYYY-MM-DD"))
        : [],
    }));
  };


  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center pt-2 px-2">
        <h2 className="text-lg font-semibold">Documents d'achat</h2>

        <div className="flex gap-3">
          <Button
            icon={<Filter className="h-4 w-4" />}
            onClick={() => setFilterOpen(v => !v)}
          >
            Filters
          </Button>

          <Button onClick={() => fetchData(true)}>
            <RefreshCcw className={`h-4 w-4 ${loading && "animate-spin"}`} />
            Rafraîchir
          </Button>

          <Button
            type="primary"
            icon={<PlusCircle className="h-4 w-4" />}
            onClick={() => handleShow(navigate, "/purchase/create", 1200, 900)}
          >
            Créer
          </Button>
        </div>
      </div>

      {/* Filters */}
      {filterOpen && (
        <div className="flex gap-2 mt-3 justify-end px-2">
          <RangePicker locale={locale} onChange={handleDateChange} />

          <Select
            placeholder="Statut"
            allowClear
            options={STATUS_OPTIONS}
            onChange={v => setFilters(f => ({ ...f, status: v }))}
            style={{ width: 150 }}
          />

          {roles('admin') &&
            <Select
              showSearch
              placeholder="Service"
              options={services}
              allowClear
              onChange={v => setFilters(f => ({ ...f, service: v }))}
              style={{ width: 150 }}
              optionFilterProp="label"
            />
          }

          <Select
            showSearch
            placeholder="Responsable"
            options={users}
            allowClear
            onChange={v => setFilters(f => ({ ...f, user: v }))}
            style={{ width: 150 }}
            optionFilterProp="label"
          />
        </div>
      )}

      {/* Table */}
      <div className="mt-4 bg-white border-gray-300 border-y">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Code", "Référence", "Service", "Responsable", "Statut", "Date"].map(h => (
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableSkeleton rows={3} columns={6} />
            ) : data.length ? (
              data.map(item => (
                <tr
                  key={item.id}
                  className="border-t border-gray-300 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleShow(navigate, `/purchase/${item.id}`, 1200, 800)}
                >
                  <td className="px-3 py-2 flex gap-2">
                    {item.code}
                    {item.urgent && <Tag color="red">🚨</Tag>}
                  </td>
                  <td className="px-3 py-2">{item.reference}</td>
                  <td className="px-3 py-2">{item.service?.name}</td>
                  <td className="px-3 py-2">{item.user?.full_name}</td>
                  <td className="px-3 py-2">{renderStatus(item.status)}</td>
                  <td className="px-3 py-2">{formatDate(item.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <Empty  description="Aucun document d'achat"/>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {pagination?.next && (
          <div className="p-4 flex justify-center">
            <Button loading={loadingMore} onClick={() => fetchData(false)}>
              Charger plus
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
