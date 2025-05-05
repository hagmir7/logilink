import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import MainLayout from './layouts/MainLayout'
import DataTable from './components/DataTable'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

    <MainLayout>
      <DataTable />
    </MainLayout>
    
    </>
  )
}

export default App
