import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import Montage from './Montage'
import Fabrication from './Fabrication'

export default function Home() {
  const {roles} = useAuth()
 

  if(roles("commercial")){
    return <Document />
  }

  if(roles("montage")){
    return <Montage />
  }

  if(roles("fabrication")){
    return <Fabrication />
  }
}
