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
import InventroyList from './pages/InventoryList'
import InventoryMovement from './pages/InventoryMovement'
import Depots from './pages/Depots'
import Article from './pages/Article'
import ViewInventory from './pages/ViewInventory'
import ViewDepot from './pages/ViewDepot'
import ViewArticle from './pages/ViewArticle'
import DepotEmplacement from './pages/DepotEmplacement'
import ScrollToTop from './components/ScrollToTop'
import InventoryDepotEmplacment from './pages/InventoryDepotEmplacment'
import Transfert from './pages/Transfert'
import TransferOrder from './pages/TransferOrder'
import TransferOrdersList from './pages/TransferOrdersList'

const NotFound = () => {
  return <>Page not found 404</>
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='articles/:id' element={<ViewArticle />} />
        <Route path='/document/:id' element={<ViewDocument />} />

        <Route path='document/palettes/:piece' element={<DocumentPalettes />} />
        <Route path='palette/controle/:code' element={<PaletteControle />} />
        <Route element={<MainLayout />}>
          <Route path='/' element={<Document />} />
          <Route path='/transfer-order' element={<TransferOrder />} />
          <Route path='/users' element={<Users />} />
          <Route path='/layout/document/:id' element={<ViewDocument />} />
          <Route path='/roles' element={<Roles />} />
          <Route path='/roles/:id' element={<ViewRole />} />
          <Route path='*' element={<NotFound />} />
          <Route path='/profile/:id' element={<Profile />} />
          <Route path='documents' element={<Document />} />
          <Route path='preparation/:id' element={<Preparation />} />
          <Route path='fabrication/:id' element={<Fabrication />} />
          <Route path='validation' element={<Validation />} />
          <Route path='progress' element={<Progress />} />
          <Route path='shipping' element={<Shipping />} />
          <Route path='chargement/:id' element={<Chargement />} />
          <Route path='transfer-orders/list' element={<TransferOrdersList />} />

          <Route
            path='inventory/:inventory_id/depot/:id'
            element={<InventoryDepotEmplacment />}
          />
          <Route path='inventories' element={<InventroyList />} />
          <Route path='inventories/in/:id' element={<InventoryMovement />} />
          <Route path='inventories/:id' element={<ViewInventory />} />
          <Route path='depots' element={<Depots />} />
          <Route path='depots/view/:id' element={<DepotEmplacement />} />
          <Route path='transfert' element={<Transfert />} />
          <Route path='depots/:id' element={<ViewDepot />} />
          <Route path='articles' element={<Article />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
