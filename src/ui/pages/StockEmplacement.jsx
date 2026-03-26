import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import { uppercaseFirst } from "../utils/config";
import { Input, message, Select } from "antd";

/* ---------- Helpers ---------- */

function StockBadge({ quantity, limit }) {
  if (!limit) {
    return (
      <span className="font-medium text-gray-800">{quantity}</span>
    );
  }

  const pct = Math.min((quantity / limit) * 100, 100);

  const color =
    pct >= 90
      ? "bg-red-500"
      : pct >= 60
        ? "bg-yellow-400"
        : "bg-green-500";

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

function DimCell({ w, h, d, t }) {
  const parts = [
    w && `W:${w}`,
    h && `H:${h}`,
    d && `D:${d}`,
    t && `T:${t}`,
  ].filter(Boolean);

  if (!parts.length) {
    return <span className="text-gray-300">—</span>;
  }

  return (
    <span className="text-sm text-gray-500 font-mono">
      {parts.join(" · ")}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded w-full" />
      ))}
    </div>
  );
}

/* ---------- Component ---------- */

export default function StockEmplacement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [depotCode, setDepotCode] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [depots, setDepots] = useState([]);

  /* ---------- Effects ---------- */

  useEffect(() => {
    fetchDepots();
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, depotCode, category]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page });

      if (debouncedSearch) params.set("search", debouncedSearch);
      if (depotCode) params.set("depot_code", depotCode);
      if (category) params.set("category", category);

      const res = await api.get(`articles/stock?${params}`);
      setData(res.data);
      
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, depotCode, category, page]);

  useEffect(() => {
    fetchData();

  }, [fetchData]);

  /* ---------- Data ---------- */

  const items = data?.data ?? [];

  const meta = data
    ? {
      from: data.from,
      to: data.to,
      total: data.total,
      lastPage: data.last_page,
      currentPage: data.current_page,
    }
    : null;

  const categories = [
    ...new Set(items.map((i) => i.category).filter(Boolean)),
  ];

   const fetchDepots = async () => {
    try {
      const response = await api('depots')
      setDepots(response.data.data)
      
    } catch (error) {
      // setLoading(false);
      message.error(error.response.data.message)
      console.error(error.response);
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Filters */}
      <div className="mb-4 flex gap-3 flex-wrap">

        <Input
          placeholder="Recherche..."
          value={search}
          width={400}
          className="max-w-xl"
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          placeholder="Depot"
          style={{ width: 200 }}
          onChange={(value) => setDepotCode(value)}
          allowClear
          options={depots.map(item => ({
            label: item.code,
            value: item.code
          }))}
        />

        <select
          className="px-3 py-1 border rounded-lg text-sm border-gray-300"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Tout categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm text-gray-700">

          {/* Header */}
          <thead className="bg-gray-50 text-gray-500 uppercase text-sm">
            <tr>
              <th className="px-4 py-2 text-left">Référence</th>
              <th className="px-4 py-2 text-left">Désignation</th>
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left">Emplacement</th>
              <th className="px-4 py-2 text-left">Capacite</th>
              <th className="px-4 py-2 text-left">Ecart</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <Skeleton />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  No data
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={`${item.emplacement_id}-${item.article_stock_id}`}
                  className="hover:bg-gray-50 transition border-t border-gray-400"
                >

                  <td className="px-4 py-1 font-mono text-sm text-gray-900">
                    {item.article_code}
                  </td>

                  <td className="px-4 py-1 font-mono text-sm text-gray-700 whitespace-nowrap">
                    {uppercaseFirst(item.description)}
                  </td>

                  <td className="px-4 py-1">
                    <div className="font-medium text-gray-800 whitespace-nowrap">
                      {uppercaseFirst(item.name)}
                    </div>

                  </td>

                  <td className="px-4 py-1">
                    <StockBadge
                      quantity={item.total_quantity}
                      limit={item.quantity_limit || 0}
                    />
                  </td>


                  <td className="px-4 py-1 font-mono text-sm text-gray-700">
                    {item.emplacement_code}
                  </td>

                  <td className="px-4 py-1">
                    {item.category ? (
                      <span className="px-2 text-sm rounded-full bg-blue-50 text-blue-600">
                        {item.quantity_limit || 0}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-1 font-mono text-sm text-gray-700">
                    {(item.quantity_limit || 0) - parseInt(item.total_quantity)}
                  </td>


                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {meta && meta.lastPage > 1 && (
          <div className="flex justify-between items-center px-4 py-1  border-t border-gray-400 text-sm">
            <span className="text-gray-500">
              {meta.from}–{meta.to} of {meta.total}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 border rounded"
              >
                Prev
              </button>

              <button
                onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
                className="px-2 border rounded"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}