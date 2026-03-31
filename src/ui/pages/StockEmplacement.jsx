import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../utils/api";
import { uppercaseFirst } from "../utils/config";
import { Input, Select, Table, Button, message } from "antd";

/* ---------- Helpers ---------- */

function StockBadge({ quantity, limit }) {
  if (!limit) {
    return <span className="font-medium text-gray-800">{quantity}</span>;
  }

  const pct = Math.min((quantity / limit) * 100, 100);

  const color =
    pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-yellow-400" : "bg-green-500";

  return (
    <div className="min-w-[90px]">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-800">{quantity}</span>
        <span className="text-gray-400">/ {limit}</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Component ---------- */

const PAGE_SIZE = 50;

export default function StockEmplacement() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(false);
  const [search, setSearch]       = useState("");
  const [depotCode, setDepotCode] = useState("");
  const [category, setCategory]   = useState("");
  const [depots, setDepots]       = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const debouncedSearch = useRef("");
  const searchTimer     = useRef(null);

  /* ---------- Fetch depots ---------- */

  useEffect(() => {
    const fetchDepots = async () => {
      try {
        const res = await api("depots");
        setDepots(res.data.data);
      } catch (err) {
        message.error(err.response?.data?.message || "Erreur depots");
        console.error(err);
      }
    };
    fetchDepots();
  }, []);

  /* ---------- Fetch first page (reset) ---------- */

  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, per_page: PAGE_SIZE });
      if (debouncedSearch.current) params.set("search",     debouncedSearch.current);
      if (depotCode)               params.set("depot_code", depotCode);
      if (category)                params.set("category",   category);

      const res = await api.get(`articles/stock?${params}`);
      const data = res.data.data;

      setItems(data);
      setTotal(res.data.total);
      setPage(1);
      setHasMore(data.length < res.data.total);

      const cats = [...new Set(data.map((i) => i.category).filter(Boolean))];
      if (cats.length) setCategoryOptions(cats);
    } catch (err) {
      message.error("Erreur lors du chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [depotCode, category]);

  // Reset to first page whenever filters change
  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  /* ---------- Load more ---------- */

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ page: nextPage, per_page: PAGE_SIZE });
      if (debouncedSearch.current) params.set("search",     debouncedSearch.current);
      if (depotCode)               params.set("depot_code", depotCode);
      if (category)                params.set("category",   category);

      const res = await api.get(`articles/stock?${params}`);
      const newData = res.data.data;

      setItems((prev) => [...prev, ...newData]);
      setPage(nextPage);
      setHasMore(items.length + newData.length < res.data.total);

      const cats = [...new Set(newData.map((i) => i.category).filter(Boolean))];
      if (cats.length) {
        setCategoryOptions((prev) => [...new Set([...prev, ...cats])]);
      }
    } catch (err) {
      message.error("Erreur lors du chargement");
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  /* ---------- Search debounce ---------- */

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      debouncedSearch.current = value;
      fetchFirstPage();
    }, 300);
  };

  const handleSearchClear = () => {
    setSearch("");
    debouncedSearch.current = "";
    fetchFirstPage();
  };

  /* ---------- Columns ---------- */

  const columns = [
    {
      title: "Référence",
      dataIndex: "article_code",
      key: "article_code",
      render: (code) => (
        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold text-gray-800">
          {code}
        </code>
      ),
    },
    {
      title: "Désignation",
      dataIndex: "description",
      key: "description",
      width: "20%",
      ellipsis: true,
      render: (desc) => (
        <span className="text-sm text-gray-700">{uppercaseFirst(desc)}</span>
      ),
    },
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (name) => (
        <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
          {uppercaseFirst(name)}
        </span>
      ),
    },
    {
      title: "Quantité",
      key: "quantity",
      render: (_, item) => (
        <StockBadge
          quantity={item.total_quantity}
          limit={item.quantity_limit || 0}
        />
      ),
    },
    {
      title: "Emplacement",
      dataIndex: "emplacement_code",
      key: "emplacement_code",
      render: (code) => (
        <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">
          {code}
        </code>
      ),
    },
    {
      title: "Capacité",
      dataIndex: "quantity_limit",
      key: "quantity_limit",
      align: "center",
      render: (limit, item) =>
        item.category ? (
          <span className="inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {limit || 0}
          </span>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      title: "Écart",
      key: "ecart",
      align: "center",
      render: (_, item) => {
        const ecart = (item.quantity_limit || 0) - parseInt(item.total_quantity);
        const isNeg = ecart < 0;
        return (
          <span
            className={`inline-flex items-center justify-center min-w-[60px] px-3 py-0.5 rounded-lg text-sm font-semibold border
              ${isNeg
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
          >
            {ecart}
          </span>
        );
      },
    },
  ];

  /* ---------- Render ---------- */

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Recherche..."
            value={search}
            onChange={handleSearchChange}
            allowClear
            onClear={handleSearchClear}
            className="max-w-xs"
          />

          <Select
            placeholder="Dépôt"
            style={{ width: 180 }}
            onChange={(val) => setDepotCode(val || "")}
            allowClear
            options={depots.map((d) => ({ label: d.code, value: d.code }))}
          />

          <Select
            placeholder="Catégorie"
            style={{ width: 180 }}
            value={category || undefined}
            onChange={(val) => setCategory(val || "")}
            allowClear
            options={categoryOptions.map((c) => ({ label: c, value: c }))}
          />

          <span className="ml-auto text-sm text-gray-400">
            {items.length} / {total} résultats
          </span>
        </div>
      </div>

      {/* Table */}
      <Table
        rowKey={(r) => `${r.emplacement_id}-${r.article_stock_id}`}
        columns={columns}
        dataSource={items}
        loading={loading}
        size="small"
        scroll={{ x: 900 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        pagination={false}
        footer={
          hasMore
            ? () => (
                <div className="flex justify-center py-2">
                  <Button
                    onClick={loadMore}
                    loading={loadingMore}
                    type="default"
                  >
                    Charger plus ({total - items.length} restants)
                  </Button>
                </div>
              )
            : null
        }
      />
    </div>
  );
}