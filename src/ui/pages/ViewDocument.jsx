import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import Commercial from './Commercial'
import Montage from './Montage'
import Controller from './Controller'

export default function ViewDocument() {
  const { roles } = useAuth()
  if (roles('commercial')) {
    return <Commercial />
  }

  if (roles('montage')) {
    return <Montage />
  }

  if (roles('fabrication')) {
    return <Fabrication />
  }

  if (roles('preparation')) {
    return <Controller />
  }
}
