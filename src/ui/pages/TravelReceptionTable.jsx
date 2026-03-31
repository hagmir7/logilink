import { useState, useEffect, useCallback } from 'react'
import {
    Table, Input, Select, DatePicker, Button, Tag, Tooltip,
    Empty, Spin, Badge
} from 'antd'
import {
    Search, RefreshCw, Car, User, Hash,
    Building2, CalendarDays, RotateCcw,
    Download
} from 'lucide-react'
import dayjs from 'dayjs'
import { api } from '../utils/api'
import TravelModal from '../components/TravelModal'

const { RangePicker } = DatePicker
const { Option } = Select

const PAGE_SIZE = 30

/* ── generate year options (current year back to 2019) ─────────────────── */
const currentYear = dayjs().year()
const YEARS = Array.from({ length: currentYear - 2018 }, (_, i) => currentYear - i)



const ExportExcel = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const response = await api.get('travel-receptions/export',
        {
          responseType: "blob", // IMPORTANT for file download
        }
      );

      // Create a blob URL
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create temporary link
      const link = document.createElement("a");
      link.href = url;

      // File name (you can customize or get from headers)
      link.setAttribute("download", "travel_receptions.xlsx");

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("Export réussi !");
    } catch (error) {
      console.error(error);
      message.error("Erreur lors de l'export !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
        color="cyan" variant="solid"
      icon={<Download size={17} />}
      size='large'
      loading={loading}
      onClick={handleExport}
    >
      Export Excel
    </Button>
  );
};

/* ── main component ─────────────────────────────────────────────────────── */
export default function TravelReceptionTable() {
    const [data, setData]         = useState([])
    const [total, setTotal]       = useState(0)
    const [page, setPage]         = useState(1)
    const [loading, setLoading]   = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore]   = useState(true)

    /* filters */
    const [cin, setCin]               = useState('')
    const [year, setYear]             = useState(null)
    const [dateRange, setDateRange]   = useState(null)

    /* ── fetch ────────────────────────────────────────────────────────── */
    const fetchData = useCallback(async ({ pageNum = 1, append = false } = {}) => {
        append ? setLoadingMore(true) : setLoading(true)
        try {
            const params = {
                page:     pageNum,
                per_page: PAGE_SIZE,
            }
            if (cin)                        params.cin       = cin
            if (year)                       params.year      = year
            if (dateRange?.[0])             params.date_from = dateRange[0].format('YYYY-MM-DD')
            if (dateRange?.[1])             params.date_to   = dateRange[1].format('YYYY-MM-DD')

            const { data: res } = await api.get('travel-receptions', { params })

            const rows = res.data ?? res        // support both paginated & plain array
            const tot  = res.total ?? rows.length

            setTotal(tot)
            setData(prev => append ? [...prev, ...rows] : rows)
            setHasMore(pageNum * PAGE_SIZE < tot)
            setPage(pageNum)
        } catch (err) {
            console.error('Fetch error:', err?.response?.data ?? err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [cin, year, dateRange])

    useEffect(() => {
        fetchData({ pageNum: 1, append: false })
    }, [fetchData])

    const handleLoadMore = () => fetchData({ pageNum: page + 1, append: true })

    const handleReset = () => {
        setCin('')
        setYear(null)
        setDateRange(null)
    }

    /* ── columns ──────────────────────────────────────────────────────── */
    const columns = [
        {
            title: (
                <span className="flex items-center gap-1.5">
                    Code Voyage
                </span>
            ),
            dataIndex: 'code',
            key: 'code',
            render: v => <Badge>{v}</Badge>,
        },
        {
            title: "CIN",
            key: 'driver',
            render: (_, row) => (row.driver?.cin),
        },
        {
            title: (
                <span className="flex items-center gap-1.5">
                    <User size={12} /> Chauffeur
                </span>
            ),
            key: 'driver',
            render: (_, row) => row.driver?.full_name,
        },
        {
            title: (
                <span className="flex items-center gap-1.5">
                    <Hash size={12} /> Matricule
                </span>
            ),
            key: 'driver_code',
            render: (_, row) => (
                <span className="text-gray-600 text-sm font-mono">
                    {row.driver?.code ?? '—'}
                </span>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-1.5">
                    Société
                </span>
            ),
            dataIndex: 'company',
            key: 'company',
            render: company => (
                <Tag className="rounded-full font-mono text-xs">{company?.name}</Tag>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-1.5">
                    <CalendarDays size={12} /> Date
                </span>
            ),
            dataIndex: 'created_at',
            key: 'created_at',
            render: v => (
                <div className="flex flex-col">
                    <span className="text-sm text-gray-700">
                        {dayjs(v).format('DD MMM YYYY')}  {dayjs(v).format('HH:mm')}
                    </span>
                </div>
            ),
        },

    ]

    const activeFilters = [cin, year, dateRange].filter(Boolean).length

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* ── header ── */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                        Réceptions de Voyage
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {total} enregistrement{total !== 1 ? 's' : ''} au total
                    </p>
                </div>
                <div className='flex gap-2'>
                    <Tooltip title="Rafraîchir">
                        <Button
                            size='large'
                            icon={<RefreshCw size={15} />}
                            onClick={() => fetchData({ pageNum: 1 })}
                            className="rounded-lg"
                        />
                    </Tooltip>
                    <ExportExcel />

                    <TravelModal />
                </div>
            </div>

            {/* ── filters ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 mb-3">
                <div className="flex flex-wrap gap-3 items-end">
                    {/* CIN */}
                    <div className="flex flex-col gap-1 min-w-[180px]">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            CIN Chauffeur
                        </label>
                        <Input
                            prefix={<Search size={14} className="text-gray-400" />}
                            placeholder="Rechercher par CIN…"
                            value={cin}
                            onChange={e => setCin(e.target.value)}
                            allowClear
                            className="rounded-lg"
                        />
                    </div>

                    {/* Year */}
                    <div className="flex flex-col gap-1 min-w-[130px]">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Année
                        </label>
                        <Select
                            placeholder="Toutes"
                            value={year}
                            onChange={setYear}
                            allowClear
                            className="rounded-lg w-full"
                        >
                            {YEARS.map(y => (
                                <Option key={y} value={y}>{y}</Option>
                            ))}
                        </Select>
                    </div>

                    {/* Date range */}
                    <div className="flex flex-col gap-1 min-w-[260px]">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Plage de dates
                        </label>
                        <RangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            format="DD/MM/YYYY"
                            className="rounded-lg w-full"
                            placeholder={['Date début', 'Date fin']}
                        />
                    </div>

                    {/* Reset */}
                    {activeFilters > 0 && (
                        <Button
                            icon={<RotateCcw size={14} />}
                            onClick={handleReset}
                            className="rounded-lg self-end text-gray-500"
                        >
                            Réinitialiser
                            <Badge
                                count={activeFilters}
                                size="small"
                                className="ml-1"
                            />
                        </Button>
                    )}
                </div>
            </div>

            {/* ── table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                     size="small" 
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span className="text-gray-400 text-sm">
                                        Aucune réception trouvée
                                    </span>
                                }
                            />
                        ),
                    }}
                    rowClassName="hover:bg-blue-50/40 transition-colors duration-150"
                    className="reception-table"
                />

                {/* ── load more ── */}
                {!loading && hasMore && (
                    <div className="flex justify-center py-5 border-t border-gray-100">
                        <Button
                            onClick={handleLoadMore}
                            loading={loadingMore}
                            className="rounded-full px-8 font-semibold border-blue-200
                                       text-blue-600 hover:bg-blue-50"
                        >
                            {loadingMore ? 'Chargement…' : `Charger plus (${total - data.length} restants)`}
                        </Button>
                    </div>
                )}

                {!loading && !hasMore && data.length > 0 && (
                    <p className="text-center text-xs text-gray-300 py-4 border-t border-gray-100">
                        Tous les enregistrements sont affichés
                    </p>
                )}
            </div>
        </div>
    )
}