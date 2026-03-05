import { Loader2, RefreshCcw, Truck } from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { Button, Select, Input } from 'antd'
import ShippingTable from '../components/ShippingTable'

const { Search } = Input

const STATUS_OPTIONS = [
  { value: '',   label: 'Tous les statuts' },
  { value: '11', label: 'Validé' },
  { value: '12', label: 'Livraison' },
]

export default function Shipping() {
  const [documents, setDocuments]     = useState([])
  const [loading, setLoading]         = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [status, setStatus]           = useState('')
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(1)

  const navigate   = useNavigate()
  const isElectron = Boolean(window.electron)
  const size       = isElectron ? 'large' : 'middle'

  const fetchDocuments = useCallback(async (reset = true) => {
    reset ? setLoading(true) : setLoadingMore(true)
    try {
      const response = await api.get('documents/livraison', {
        params: { status, search, page: reset ? 1 : page },
      })
      setDocuments(prev =>
        reset
          ? response.data
          : {
              ...response.data,
              data: [...(prev.data ?? []), ...(response.data.data ?? [])],
            }
      )
      if (!reset) setPage(p => p + 1)
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      reset ? setLoading(false) : setLoadingMore(false)
    }
  }, [status, search, page])

  useEffect(() => {
    setPage(1)
    fetchDocuments(true)
  }, [status, search])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>

      {/* ── Header ── */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        padding: isElectron ? '14px 24px' : '10px 16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}>

          {/* Title — takes remaining space */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 160 }}>
            <Truck size={isElectron ? 20 : 17} style={{ color: '#3b82f6', flexShrink: 0 }} />
            <h2 style={{
              margin: 0,
              fontWeight: 600,
              fontSize: isElectron ? 18 : 15,
              color: '#1f2937',
              whiteSpace: 'nowrap',
            }}>
              Gestion de Livraison
            </h2>
          </div>

          {/* Search — fixed width */}
          <Search
            placeholder="Rechercher…"
            allowClear
            size={size}
            style={{ width: 220 }}
            onSearch={val => setSearch(val)}
            onChange={e => { if (!e.target.value) setSearch('') }}
          />

          {/* Status filter — fixed width */}
          <Select
            value={status}
            size={size}
            style={{ width: 170 }}
            onChange={setStatus}
            options={STATUS_OPTIONS}
          />

          {/* Refresh button */}
          <Button
            size={size}
            onClick={() => fetchDocuments(true)}
            disabled={loading}
            icon={loading
              ? <Loader2 className="animate-spin" size={14} />
              : <RefreshCcw size={14} />
            }
          >
            Rafraîchir
          </Button>

        </div>
      </div>

      {/* ── Content ── */}
      <div>
        <ShippingTable
          loading={loading}
          documents={documents}
          onSelectOrder={id => navigate(`/document/${id}`)}
        />

        {documents.next_page_url && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
            <Button type="primary" loading={loadingMore} onClick={() => fetchDocuments(false)}>
              Charger plus
            </Button>
          </div>
        )}
      </div>

    </div>
  )
}