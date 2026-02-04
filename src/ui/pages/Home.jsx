import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import Montage from './Montage'
import Fabrication from './Fabrication'
import { useNavigate } from 'react-router-dom'

export default function Home() {

  const navigate = useNavigate()

  useEffect(() => {
    console.log("working");
    
  }, [])

  const { roles } = useAuth()


  if (roles("commercial")) {
    return <Document />
  }

  if (roles("montage")) {
    return <Montage />
  }

  if (roles("fabrication")) {
    return <Fabrication />
  }
}
