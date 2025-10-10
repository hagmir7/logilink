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
import Stock from './pages/Stock'
import TransferOrder from './pages/TransferOrder'
import TransferOrdersList from './pages/TransferOrdersList'
import { DocumentProgress } from './pages/DocumentProgress'
import CompanyStock from './pages/CompanyStock'
import StockMovement from './components/StockMovement'
import Reception from './pages/Reception'
import ViewReception from './pages/ViewReception'
import UpdatePassword from './pages/UpdatePassword'
import ReceptionMovement from './components/ReceptionMovement'
import ReceptionMovementList from './pages/ReceptionMovementList'
import UpdateArticleRef from './pages/UpdateArticleRef'
import InvoiceDuplicate from './components/InvoiceDuplicate'
import ImportMovements from './components/ImportMovements'
import PreparationArchive from './pages/PreparationArchive'
import UsersActions from './pages/UsersActions'
import TransferStock from './components/TransferStock'
import ImportStock from './components/ImportStock'


const NotFound = () => {
  return <>Page not found 404</>
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path="articles/:id" element={<ViewArticle />} />
        <Route path="articles/create" element={<ViewArticle />} />

        <Route path='/document/:id' element={<ViewDocument />} />
        <Route path='document/:piece/progress' element={<DocumentProgress />} />
        <Route path='reception/:id/:company' element={<ViewReception />} />

        <Route path='document/palettes/:piece' element={<DocumentPalettes />} />
        <Route path='palette/controle/:code' element={<PaletteControle />} />
        

        <Route path='update-article-ref' element={<UpdateArticleRef />} />
        <Route path='duplicate-invoice' element={<InvoiceDuplicate />} />
        <Route path='import-movements' element={<ImportMovements />} />
        <Route path='import-stock' element={<ImportStock />} />
        <Route element={<MainLayout />}>
          <Route path='/' element={<Document />} />
          <Route path='/transfer-order' element={<TransferOrder />} />
          <Route path='/transfer-stock' element={<TransferStock />} />
          
          <Route path='/users' element={<Users />} />
          <Route path='/users/actions' element={<UsersActions />} />
          <Route path='update-password' element={<UpdatePassword />} />
          <Route path='/layout/document/:id' element={<ViewDocument />} />
          <Route path='/roles' element={<Roles />} />
          <Route path='/roles/:id' element={<ViewRole />} />
          <Route path='*' element={<NotFound />} />
          <Route path='/profile/:id' element={<Profile />} />
          <Route path='companies/stock' element={<CompanyStock />} />
          <Route path='documents' element={<Document />} />
          <Route path='preparation/:id' element={<Preparation />} />
          <Route path='fabrication/:id' element={<Fabrication />} />
          <Route path='validation' element={<Validation />} />
          <Route path='progress' element={<Progress />} />
          <Route path='shipping' element={<Shipping />} />
          <Route path='chargement/:id' element={<Chargement />} />
          <Route path='preparation/archive' element={<PreparationArchive />} />
          

          <Route path='stock/out' element={<StockMovement />} />
          <Route path='stock/in' element={<StockMovement />} />
          <Route path='stock/return' element={<StockMovement />} />
          <Route path='reception-movement-list' element={<ReceptionMovementList />} />
          <Route path='reception-movement/:id/:company_db' element={<ReceptionMovement />} />

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
          <Route path='stock' element={<Stock />} />
          <Route path='depots/:id' element={<ViewDepot />} />
          <Route path='articles' element={<Article />} />
          <Route path='reception' element={<Reception />} />
        </Route>
      </Routes>
    </>
  )
}

export default App;
