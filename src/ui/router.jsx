import { useEffect } from 'react'
import {
  createHashRouter,
  Outlet,
  useNavigate,
} from 'react-router-dom'
import { Button, Result } from 'antd'

import MainLayout from './layouts/MainLayout'
import ScrollToTop from './components/ScrollToTop'
import { AuthProvider } from './contexts/AuthContext'

import Roles from './pages/Roles'
import ViewRole from './pages/ViewRole'
import Login from './pages/Login'
import Users from './pages/Users'
import Profile from './pages/Profile'
import Document from './pages/Document'
import Preparation from './pages/Preparation'
import Fabrication from './pages/Fabrication'
import ViewDocument from './pages/ViewDocument'
import Validation from './pages/Validation'
import DocumentPalettes from './pages/DocumentPalettes'
import PaletteControle from './pages/PaletteControle'
import Progress from './pages/Progress'
import Shipping from './pages/Shipping'
import Chargement from './pages/Chargement'
import InventroyList from './pages/InventoryList'
import InventoryMovement from './pages/InventoryMovement'
import Depots from './pages/Depots'
import ViewInventory from './pages/ViewInventory'
import ViewDepot from './pages/ViewDepot'
import ViewArticle from './pages/ViewArticle'
import DepotEmplacement from './pages/DepotEmplacement'
import InventoryDepotEmplacment from './pages/InventoryDepotEmplacment'
import Stock from './pages/Stock'
import TransferOrder from './pages/TransferOrder'
import TransferOrdersList from './pages/TransferOrdersList'
import { DocumentProgress } from './pages/DocumentProgress'
import CompanyStock from './pages/CompanyStock'
import StockMovement from './components/StockMovement'
import Reception from './pages/Reception'
import ViewReception from './pages/ViewReception'
import ReceptionMovement from './components/ReceptionMovement'
import ReceptionMovementList from './pages/ReceptionMovementList'
import UpdateArticleRef from './pages/UpdateArticleRef'
import InvoiceDuplicate from './components/InvoiceDuplicate'
import ImportMovements from './components/ImportMovements'
import PreparationArchive from './pages/PreparationArchive'
import UsersActions from './pages/UsersActions'
import TransferStock from './components/TransferStock'
import ImportStock from './components/ImportStock'
import FindArticleEmplacement from './components/FindArticleEmplacement'
import UserArchive from './pages/UserArchive'
import ViewUserArchive from './pages/ViewUserArchive'
import Purchase from './pages/Purchase'
import PurchaseForm from './pages/PurchaseForm'
import InventoryDepotEmplacmentList from './pages/InventoryDepotEmplacmentList'
import Suppliers from './pages/Suppliers'
import SupplierInterviews from './pages/SupplierInterviews'
import ShowSupplierIntervew from './components/ShowSupplierIntervew'
import PurchaseOverview from './pages/PurchaseOverview'
import StockEmplacement from './pages/StockEmplacement'
import FabricationArticles from './pages/FabricationArticles'
import OFs from './pages/OFs'
import EmplacementLimit from './components/EmplacementLimit'
import TravelReceptionTable from './pages/TravelReceptionTable'
import QuoteComparison from './pages/QuoteComparison'
import NcfApp from './components/NcfApp'
import NcfForm from './components/NfcForm'
import WebsiteOrders from './pages/WebsiteOrders'
import PendingDocuments from './document/PendingDocuments'
import CompanyDocuments from './document/CompanyDocuments'
import FabricationDocuments from './document/FabricationDocuments'
import PeintureDocuments from './document/PeintureDocuments'
import MontageDocuments from './document/MontageDocuments'

const NotFound = () => {
  return (
    <Result
      status='404'
      title='404'
      subTitle="Désolé, la page que vous avez visitée n'existe pas."
      extra={<Button type='primary'>Retour à l'accueil</Button>}
    />
  )
}

// Root route element: runs inside the router, so hooks like useNavigate work.
function Root() {
  const navigate = useNavigate()

  useEffect(() => {
    const raw = localStorage.getItem('user')

    if (!raw || raw === 'undefined' || raw === 'null') {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return (
    <AuthProvider>
      <ScrollToTop />
      <Outlet />
    </AuthProvider>
  )
}

export const router = createHashRouter([
  {
    element: <Root />,
    children: [
      // Routes outside MainLayout
      { path: '/login', element: <Login /> },
      { path: 'articles/:id', element: <ViewArticle /> },
      { path: 'articles/create', element: <ViewArticle /> },
      { path: 'purchase/create', element: <PurchaseForm /> },
      { path: 'purchase/:id', element: <PurchaseForm /> },

      { path: '/document/:id', element: <ViewDocument /> },
      { path: 'document/:piece/progress', element: <DocumentProgress /> },
      { path: 'reception/:id/:company', element: <ViewReception /> },

      { path: 'document/palettes/:piece', element: <DocumentPalettes /> },
      { path: 'palette/controle/:code', element: <PaletteControle /> },
      { path: '/user-archive/:id', element: <ViewUserArchive /> },

      { path: 'update-article-ref', element: <UpdateArticleRef /> },
      { path: 'duplicate-invoice', element: <InvoiceDuplicate /> },
      { path: 'import-movements', element: <ImportMovements /> },
      { path: 'import-stock', element: <ImportStock /> },
      { path: 'profile/:id', element: <Profile /> },
      { path: 'depots/view/:id', element: <DepotEmplacement /> },
      { path: '/supplier-interviews/:id', element: <ShowSupplierIntervew /> },

      { path: 'depots', element: <Depots /> },
      { path: 'depots/:id', element: <ViewDepot /> },

      {
        path: 'inventory/:inventory_id/depot/:id/emplacements',
        element: <InventoryDepotEmplacmentList />,
      },

      { path: '/supplier-ncf/create', element: <NcfForm /> },
      { path: '/supplier-ncf/:id/edit', element: <NcfForm /> },

      // Routes inside MainLayout
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <Document /> },
          { path: '/transfer-order', element: <TransferOrder /> },
          { path: '/transfer-stock', element: <TransferStock /> },
          { path: '/find-article', element: <FindArticleEmplacement /> },
          { path: '/suppliers', element: <Suppliers /> },
          { path: '/supplier-interviews', element: <SupplierInterviews /> },

          { path: '/supplier-ncf', element: <NcfApp /> },

          { path: '/user-archive', element: <UserArchive /> },
          { path: '/layout/user-archive/:id', element: <ViewUserArchive /> },
          { path: '/purchase', element: <Purchase /> },

          { path: 'quote-comparison', element: <QuoteComparison /> },

          { path: '/users', element: <Users /> },
          { path: '/users/actions', element: <UsersActions /> },
          { path: '/layout/document/:id', element: <ViewDocument /> },
          { path: '/roles', element: <Roles /> },
          { path: '/roles/:id', element: <ViewRole /> },
          { path: 'layout/profile/:id', element: <Profile /> },
          { path: 'companies/stock', element: <CompanyStock /> },
          { path: 'documents', element: <Document /> },
          { path: 'preparation/:id', element: <Preparation /> },
          { path: 'fabrication/:id', element: <Fabrication /> },
          { path: 'fabrication/stock', element: <StockEmplacement /> },
          { path: 'fabrication/articles', element: <FabricationArticles /> },
          { path: 'fabrication/orders', element: <OFs /> },
          { path: 'fabrication/capacit', element: <EmplacementLimit /> },
          { path: 'validation', element: <Validation /> },
          { path: 'progress', element: <Progress /> },
          { path: 'shipping', element: <Shipping /> },
          { path: 'chargement/:id', element: <Chargement /> },
          { path: 'preparation/archive', element: <PreparationArchive /> },
          { path: 'travels', element: <TravelReceptionTable /> },

          { path: 'stock/out', element: <StockMovement /> },
          { path: 'website-orders', element: <WebsiteOrders /> },
          { path: 'stock/in', element: <StockMovement /> },
          { path: 'stock/return', element: <StockMovement /> },
          { path: 'reception-movement-list', element: <ReceptionMovementList /> },
          {
            path: 'reception-movement/:id/:company_db',
            element: <ReceptionMovement />,
          },

          { path: 'transfer-orders/list', element: <TransferOrdersList /> },

          {
            path: 'inventory/:inventory_id/depot/:id',
            element: <InventoryDepotEmplacment />,
          },
          { path: 'inventories', element: <InventroyList /> },
          { path: 'inventories/in/:id', element: <InventoryMovement /> },
          { path: 'inventories/:id', element: <ViewInventory /> },
          { path: 'layout/depots', element: <Depots /> },
          { path: 'layout/depots/view/:id', element: <DepotEmplacement /> },
          { path: 'stock', element: <Stock /> },
          { path: 'layout/depots/:id', element: <ViewDepot /> },
          { path: 'reception', element: <Reception /> },
          {
            path: 'layout/reception/:id/:company',
            element: <ViewReception />,
          },

          { path: 'purchase-overview', element: <PurchaseOverview /> },

          // Dev version
          { path: 'documents/pending', element: <PendingDocuments /> },
          { path: 'documents/company', element: <CompanyDocuments /> },
          { path: 'documents/fabrication', element: <FabricationDocuments /> },
          { path: 'documents/montage', element: <MontageDocuments /> },
          { path: 'documents/peinture', element: <PeintureDocuments /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])

export default router