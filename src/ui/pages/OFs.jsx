import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { Factory, ChevronDown, RefreshCcw, } from 'lucide-react'
import { Empty, Button, Tag, } from 'antd'
import OFCard from '../components/OfCard'




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

    const fetchOfs = useCallback(async (currentPage = 1, append = false) => {
        append ? setLoadingMore(true) : setLoading(true)
        try {
            const res = await api.get('ordres-fabrication', {
                params: { page: currentPage, per_page: 15 }
            })
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

    useEffect(() => { fetchOfs(1) }, [fetchOfs])

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

                    <Button
                        icon={<RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />}
                        onClick={() => fetchOfs(1)}
                        disabled={loading}
                    >
                        Actualiser
                    </Button>
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
                                        <span className="text-gray-400 text-sm">Aucun ordre de fabrication</span>
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
                            onClick={() => fetchOfs(page + 1, true)}
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