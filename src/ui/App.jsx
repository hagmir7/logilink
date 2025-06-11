import './App.css'
import MainLayout from './layouts/MainLayout'
import { Routes, Route } from 'react-router-dom'
import Roles from './pages/Roles'
import ViewRole from './pages/ViewRole'
import Login from './pages/Login'
import Users from './pages/Users'
import Home from './pages/Home'
import Profile from './pages/profile'
import Document from './pages/Document'
import Preparation from './pages/Preparation'
import Fabrication from './pages/Fabrication'
import ViewDocument from './pages/ViewDocument';
import Validation from './pages/Validation';
import DocumentPalettes from './pages/DocumentPalettes';
import PaletteControle from './pages/PaletteControle'
import Progress from './pages/Progress'
import Shipping from './pages/Shipping'
import Chargement from './pages/Chargement'
import InvetroryList from './pages/InvetroryList'
import InventoryMovement from './pages/InventoryMovement'
import Depots from './pages/Depots'
import Article from './pages/Article'
import ViewInventory from './pages/ViewInventory'

const NotFound = () => {
  return <>Page not found 404</>
}

function App() {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path='/' element={<Document />} />
          <Route path='palette/controle/:code' element={<PaletteControle />} />
          <Route path='/users' element={<Users />} />
          <Route path='/document/:id' element={<ViewDocument />} />
          <Route path='/roles' element={<Roles />} />
          <Route path='/roles/:id' element={<ViewRole />} />
          <Route path='*' element={<NotFound />} />
          <Route path='/profile/:id' element={<Profile />} />
          <Route path='documents' element={<Document />} />
          <Route
            path='document/palettes/:piece'
            element={<DocumentPalettes />}
          />
          <Route path='preparation/:id' element={<Preparation />} />
          <Route path='fabrication/:id' element={<Fabrication />} />
          <Route path='validation' element={<Validation />} />
          <Route path='progress' element={<Progress />} />
          <Route path='shipping' element={<Shipping />} />
          <Route path='shargement/:id' element={<Chargement />} />

          <Route path='inventories' element={<InvetroryList />} />
          <Route path='inventories/in/:id' element={<InventoryMovement />} />
          <Route path='inventories/:id' element={<ViewInventory />} />
          <Route path='depots' element={<Depots />} />
          <Route path='articles' element={<Article />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
