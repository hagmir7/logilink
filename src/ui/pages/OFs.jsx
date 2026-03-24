import React, { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../utils/api'
import { Factory, ChevronDown, RefreshCcw, X } from 'lucide-react'
import { Empty, Button, Tag, Input, Select, DatePicker } from 'antd'
import OFCard from '../components/OfCard'

const { RangePicker } = DatePicker

const STATUS_OPTIONS = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'lancé', label: 'Lancé' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'terminé', label: 'Terminé' },
    { value: 'annulé', label: 'Annulé' },
]

/* ─── Skeleton ───────────────────────────────────────────────── */
function SkeletonCard() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-28 h-7 bg-gray-100 rounded-lg" />
                <div className="flex gap-3 flex-1">
                    <div className="w-20 h-4 bg-gray-100 rounded" />
                    <div className="w-20 h-4 bg-gray-100 rounded" />
                    <div className="w-16 h-4 bg-gray-100 rounded" />
                </div>
                <div className="w-16 h-5 bg-gray-100 rounded-full" />
                <div className="w-7 h-7 bg-gray-100 rounded-lg" />
                <div className="w-7 h-7 bg-gray-100 rounded-lg" />
            </div>
        </div>
    )
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function OFs() {
    const [ofs, setOfs] = useState([])
    const [page, setPage] = useState(1)
    const [lastPage, setLastPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)

    const [filters, setFilters] = useState({
        reference: '',
        statut: '',
        dateRange: null,
    })

    const debounceRef = useRef(null)

    /* ── Fetch ── */
    const fetchOfs = useCallback(async (currentPage = 1, append = false, activeFilters) => {
        append ? setLoadingMore(true) : setLoading(true)
        try {
            const params = { page: currentPage, per_page: 15 }

            if (activeFilters?.reference?.trim()) {
                params.reference = activeFilters.reference.trim()
            }
            if (activeFilters?.statut) {
                params.statut = activeFilters.statut          // ✅ statut
            }
            if (activeFilters?.dateRange?.[0] && activeFilters?.dateRange?.[1]) {
                params.date_debut = activeFilters.dateRange[0].format('YYYY-MM-DD')
                params.date_fin = activeFilters.dateRange[1].format('YYYY-MM-DD')
            }

            const res = await api.get('ordres-fabrication', { params })
            const { data, last_page, total } = res.data

            setOfs(prev => append ? [...prev, ...data] : data)
            setLastPage(last_page)
            setTotal(total)
            setPage(currentPage)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [])

    /* ── Initial load ── */
    useEffect(() => {
        fetchOfs(1, false, filters)
    }, [])

    /* ── Re-fetch on filter change (debounce only for reference) ── */
    useEffect(() => {
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            fetchOfs(1, false, filters)
        }, filters.reference !== '' ? 400 : 0)

        return () => clearTimeout(debounceRef.current)
    }, [filters])

    /* ── Helpers ── */
    const setFilter = (key, value) =>
        setFilters(prev => ({ ...prev, [key]: value }))

    const resetFilters = () =>
        setFilters({ reference: '', statut: '', dateRange: null }) // ✅ statut

    const hasActiveFilters =
        !!filters.reference || !!filters.statut || !!filters.dateRange // ✅ statut

    return (
        <div className="min-h-full bg-gray-50 px-2">
            <div className="max-w-[1400px] mx-auto">

                {/* ── Page header ── */}
                <div className="flex items-center justify-between py-3 mb-1">
                    <div className="flex items-center gap-2.5">
                        <div className="p-0.5 bg-blue-50 rounded-lg">
                            <Factory size={20} className="text-blue-600" />
                        </div>
                        <h1 className="text-base font-semibold text-gray-900 m-0">
                            Ordres de Fabrication
                        </h1>
                        <Tag color="blue" className="!m-0 !font-bold">{total}</Tag>
                    </div>

                    <div className="flex gap-2">
                        {hasActiveFilters && (
                            <Button
                                size="middle"
                                icon={<X size={12} />}
                                onClick={resetFilters}
                                className="text-gray-500"
                            />
                        )}

                        <Input
                            placeholder="Rechercher par référence…"
                            allowClear
                            size="small"
                            value={filters.reference}
                            onChange={e => setFilter('reference', e.target.value)}
                            style={{ width: '200px' }}
                        />

                        <RangePicker
                            value={filters.dateRange}
                            onChange={range => setFilter('dateRange', range)}
                            format="DD/MM/YYYY"
                            size="small"
                            placeholder={['Date début', 'Date fin']}
                            className="w-52"
                        />

                        <Select
                            value={filters.statut || undefined}  // ✅ statut
                            placeholder="Statut"
                            allowClear
                            size="middle"
                            onChange={val => setFilter('statut', val ?? '')}  // ✅ statut
                            options={STATUS_OPTIONS}
                            className="w-40"
                        />

                        <Button
                            icon={<RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />}
                            onClick={() => fetchOfs(1, false, filters)}
                            disabled={loading}
                        >
                            Actualiser
                        </Button>
                    </div>
                </div>

                {/* ── List ── */}
                {loading
                    ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
                    : ofs.length === 0
                        ? (
                            <div className="bg-white border border-gray-200 rounded-xl py-16">
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <span className="text-gray-400 text-sm">
                                            {hasActiveFilters
                                                ? 'Aucun résultat pour ces filtres'
                                                : 'Aucun ordre de fabrication'}
                                        </span>
                                    }
                                />
                            </div>
                        )
                        : ofs.map(of => <OFCard key={of.id} of={of} />)
                }

                {/* ── Load more ── */}
                {!loading && page < lastPage && (
                    <div className="flex justify-center py-5">
                        <Button
                            onClick={() => fetchOfs(page + 1, true, filters)}
                            loading={loadingMore}
                            icon={!loadingMore && <ChevronDown size={14} />}
                            className="px-6"
                        >
                            Charger plus
                            <span className="text-gray-400 font-normal ml-1">
                                ({total - ofs.length} restants)
                            </span>
                        </Button>
                    </div>
                )}

            </div>
        </div>
    )
}