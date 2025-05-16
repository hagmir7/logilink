import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import Commercial from './Commercial'

export default function ViewDocument() {
  const { roles } = useAuth()
  if (roles('commercial') || roles('preparation')) {
    return <Commercial />
  }

  if (roles('montage')) {
    return <Montage />
  }

  if (roles('fabrication')) {
    return <Fabrication />
  }
}
