import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../utils/api";
import { uppercaseFirst } from "../utils/config";
import { Input, Select, Table, Button, message } from "antd";

/* ---------- Helpers ---------- */

function StockBadge({ quantity, limit }) {
  const qty = parseInt(quantity) || 0;
  const cap = parseInt(limit) || 0;

  const pct = cap > 0 ? Math.min((qty / cap) * 100, 100) : 100;

  const color =
    cap === 0
      ? "bg-green-500"
      : pct >= 90
        ? "bg-red-500"
        : pct >= 60
          ? "bg-yellow-400"
          : "bg-green-500";

  return (
    <div className="min-w-[90px]">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-800">{qty}</span>
        {cap > 0 && <span className="text-gray-400">/ {cap}</span>}
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
  const [items, setItems]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [loadingMore, setLoadingMore]         = useState(false);
  const [total, setTotal]                     = useState(0);
  const [page, setPage]                       = useState(1);
  const [hasMore, setHasMore]                 = useState(false);
  const [search, setSearch]                   = useState("");
  const [depotCodes, setDepotCodes]           = useState([]);
  const [category, setCategory]               = useState("");
  const [depots, setDepots]                   = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [sortBy, setSortBy]                   = useState("");
  const [sortDir, setSortDir]                 = useState("asc");

  const debouncedSearch = useRef("");
  const searchTimer     = useRef(null);

  /* ---------- Build shared params ---------- */

  const buildParams = useCallback((pageNum) => {
    const params = new URLSearchParams({ page: pageNum, per_page: PAGE_SIZE });
    if (debouncedSearch.current) params.set("search", debouncedSearch.current);
    if (depotCodes.length) depotCodes.forEach((c) => params.append("depot_code[]", c));
    if (category) params.set("category", category);
    if (sortBy) {
      params.set("sort_by", sortBy);
      params.set("sort_dir", sortDir);
    }
    return params;
  }, [depotCodes, category, sortBy, sortDir]);

  /* ---------- Fetch depots ---------- */

  useEffect(() => {
    api("depots")
      .then((res) => setDepots(res.data.data))
      .catch((err) => message.error(err.response?.data?.message || "Erreur depots"));
  }, []);

  /* ---------- Fetch first page (reset) ---------- */

  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await api.get(`articles/stock?${buildParams(1)}`);
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
  }, [buildParams]);

  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage]);

  /* ---------- Load more ---------- */

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res     = await api.get(`articles/stock?${buildParams(nextPage)}`);
      const newData = res.data.data;

      setItems((prev) => [...prev, ...newData]);
      setPage(nextPage);
      setHasMore(items.length + newData.length < res.data.total);

      const cats = [...new Set(newData.map((i) => i.category).filter(Boolean))];
      if (cats.length) setCategoryOptions((prev) => [...new Set([...prev, ...cats])]);
    } catch (err) {
      message.error("Erreur lors du chargement");
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

  /* ---------- Sort toggle (column header click) ---------- */

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-blue-500 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  /* ---------- Columns ---------- */

  const noWrap = { whiteSpace: "nowrap" };

  const columns = [
    {
      title: "Référence",
      dataIndex: "article_code",
      key: "article_code",
      onCell: () => ({ style: noWrap }),
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
      onCell: () => ({ style: noWrap }),
      render: (desc) => (
        <span className="text-sm text-gray-700">{uppercaseFirst(desc)}</span>
      ),
    },
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      onCell: () => ({ style: noWrap }),
      render: (name) => (
        <span className="text-sm font-medium text-gray-800">
          {uppercaseFirst(name)}
        </span>
      ),
    },
    {
      title: "Quantité",
      key: "quantity",
      onCell: () => ({ style: noWrap }),
      render: (_, item) => (
        <StockBadge quantity={item.total_quantity} limit={item.quantity_limit || 0} />
      ),
    },
    {
      title: "Emplacement",
      dataIndex: "emplacement_code",
      key: "emplacement_code",
      onCell: () => ({ style: noWrap }),
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
      onCell: () => ({ style: noWrap }),
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
      title: (
        <button
          className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
          onClick={() => handleSortChange("ecart")}
        >
          Écart <SortIcon field="ecart" />
        </button>
      ),
      key: "ecart",
      align: "center",
      onCell: () => ({ style: noWrap }),
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
            placeholder="Recherche par Article, Nom, Emplacement..."
            value={search}
            onChange={handleSearchChange}
            allowClear
            onClear={handleSearchClear}
            className="max-w-xs"
          />

          <Select
            mode="multiple"
            placeholder="Dépôts"
            style={{ minWidth: 220 }}
            maxTagCount="responsive"
            value={depotCodes}
            onChange={(vals) => setDepotCodes(vals || [])}
            allowClear
            options={depots.map((d) => ({ label: d.code, value: d.code }))}
          />

          {/* Sort direction — only shown when ecart sort is active */}
          {sortBy === "ecart" && (
            <Select
              style={{ minWidth: 130 }}
              value={sortDir}
              onChange={(val) => setSortDir(val)}
              options={[
                { label: "↑ Croissant",   value: "asc"  },
                { label: "↓ Décroissant", value: "desc" },
              ]}
            />
          )}

          <Button onClick={fetchFirstPage}>Actualiser</Button>

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
        scroll={{ x: "max-content" }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        pagination={false}
        footer={
          hasMore
            ? () => (
                <div className="flex justify-center py-2">
                  <Button onClick={loadMore} loading={loadingMore} type="default">
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