// useDocEntete.js
// Encapsulates fetching a docentete + its lines, including the polling
// interval. Pulling this out of the component means Fabrication.jsx no
// longer needs to know about the API shape or the refresh timer.

import { useCallback, useEffect, useState } from 'react'

// import { REFRESH_INTERVAL_MS } from './fabricationConfig'
import { message } from 'antd'
import { api } from '../utils/api'
import { REFRESH_INTERVAL_MS } from '../utils/config'

const EMPTY_DATA = { docentete: {}, doclignes: [] }

export function useDocEntet(id, type) {
  const [data, setData] = useState(EMPTY_DATA)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const query = type ? `?type=${type}` : ''
      const response = await api.get(`docentetes/${id}${query}`)
      setData(response.data)
    } catch (err) {
      message.error(err?.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }, [id, type])

  useEffect(() => {
    fetchData()
    if (!id) return
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchData, id])

  return { data, loading, refetch: fetchData }
}