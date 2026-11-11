import React, { useState, useEffect, useMemo } from 'react'
import { Layout, Menu, theme, Drawer, Badge } from 'antd'
import {
  ArrowDownUp,
  ArrowRightLeft,
  Archive,
  BadgeX,
  BaggageClaim,
  Boxes,
  Building2,
  ChartCandlestick,
  CircleCheck,
  ClipboardCheck,
  ClipboardList,
  Factory,
  FileArchive,
  FileText,
  FolderArchive,
  Gauge,
  GitCompare,
  Globe,
  Hammer,
  Handshake,
  History,
  LayoutDashboard,
  Layers,
  Lock,
  Menu as MenuIcon,
  Package,
  PackageCheck,
  Paintbrush,
  PlaneLanding,
  ScrollText,
  ShoppingBag,
  Truck,
  UserCheck,
  Users,
  Van,
  Warehouse,
  Wrench,
  X,
} from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import DropMenu from '../components/DropMenu'
import { useAuth } from '../contexts/AuthContext'
import MobileBottomNav from './MobileButtomNav'
import Tools from '../components/Tools'
import { api } from '../utils/api'
import { handleShow } from '../utils/config'

const { Header, Content, Sider } = Layout

/* -------------------------------------------------------------------------- */
/*  Menu helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Generates unique keys by position: menu-0, menu-0-0, menu-0-1, menu-1 ...
 * - If an item has `path` and a string label, the label is wrapped in <Link>.
 * - `path` is stripped before the items are passed to antd.
 * - Hidden items still take an index, so keys never shift.
 */
const addKeys = (items, parentKey = 'menu') =>
  items.map((item, index) => {
    const key = `${parentKey}-${index}`
    const { path, children, label, ...rest } = item

    return {
      ...rest,
      key,
      path, // kept temporarily for route matching (removed by stripPaths)
      label: path && typeof label === 'string' ? <Link to={path}>{label}</Link> : label,
      ...(children && { children: addKeys(children, key) }),
    }
  })

/** Removes the custom `path` field before giving items to antd. */
const stripPaths = (items) =>
  items.map(({ path, children, ...rest }) => ({
    ...rest,
    ...(children && { children: stripPaths(children) }),
  }))

/**
 * Finds the keys matching the current URL (longest matching path wins).
 * Returns { selected: [keys], open: [parent keys] }.
 */
const matchRoute = (items, pathname) => {
  let best = { length: -1, keys: [], parents: [] }

  const walk = (list, parents) => {
    list.forEach((item) => {
      if (item.path) {
        const isMatch =
          pathname === item.path ||
          (item.path !== '/' && pathname.startsWith(item.path + '/'))

        if (isMatch) {
          if (item.path.length > best.length) {
            best = { length: item.path.length, keys: [item.key], parents }
          } else if (item.path.length === best.length) {
            best.keys.push(item.key) // same path used in several menus
          }
        }
      }
      if (item.children) walk(item.children, [...parents, item.key])
    })
  }

  walk(items, [])
  return { selected: best.keys, open: best.parents }
}

/* -------------------------------------------------------------------------- */
/*  Menu definition (hook, called ONCE in MainLayout)                          */
/* -------------------------------------------------------------------------- */

const useSideMenu = () => {
  const { roles, permissions, user } = useAuth()
  const navigate = useNavigate()

  const [states, setStates] = useState({
    purchase: 0,
    website_orders: 0,
  })

  useEffect(() => {
    const getStates = async () => {
      try {
        // The website API key now lives on the backend only.
        const [purchase, orders] = await Promise.all([
          api.get('status-count/2'),
          api.get('website-orders/count'),
        ])

        setStates({
          purchase: purchase.data,
          website_orders: orders.data.count,
        })
      } catch (error) {
        console.error('Failed to load states:', error)
      }
    }

    getStates()
  }, [])

  const canBuy = roles(['admin', 'super_admin', 'dg']) || parseInt(user?.service_id) === 4
  const showPurchaseBadge = Number(states.purchase) > 0 && roles(['admin', 'dg'])

return addKeys([
  /* ------------------------------ Commandes ------------------------------ */
  {
    icon: <ShoppingBag size={20} />,
    label: <span className='text-base'>Commandes</span>,
    children: [
      { path: '/documents/pending',     hidden: !permissions('commandes_en_cours.voir'),            icon: <ClipboardList size={19} />, label: 'Préparation en cours' },
      { path: '/documents/company',     hidden: !permissions('societe_commandes.voir'),             icon: <Building2 size={19} />,     label: 'Préparation Société' },
      { path: '/company/archive',       hidden: !permissions('archives.company.voir'),              icon: <FolderArchive size={19} />, label: 'Archives société' },
      { path: '/global/archive',        hidden: !permissions('archives.global.voir'),               icon: <Archive size={19} />,       label: 'Archives' },
      { path: '/documents/fabrication', hidden: !permissions('fabrication_commandes.voir'),         icon: <Hammer size={19} />,        label: 'Fabrication' },
      { path: '/fabrication/archive',   hidden: !permissions('fabrication_commandes.voir_archive'), icon: <History size={19} />,       label: 'Fabrication archives' },
      { path: '/fabrication/orders',    hidden: !permissions('ordres_fabrication.voir'),             icon: <Factory size={19} />,       label: 'OFs' },
      { path: '/documents/peinture',    hidden: !permissions('fabrication_peinture.voir'),          icon: <Paintbrush size={19} />,    label: 'Peinture' },
      { path: '/documents/montage',     hidden: !permissions('fabrication_montage.voir'),           icon: <Wrench size={19} />,        label: 'Montage' },
      {
        path: '/validation',
        disabled: !roles(['controleur', 'commercial', 'expedition', 'admin', 'preparation']),
        icon: <CircleCheck size={19} />,
        label: 'Validation',
      },

      {
        path: '/documents/preparation',
        icon: <CircleCheck size={19} />,
        label: 'Preparation',
      },
      {
        path: '/shipping',
        disabled: !roles(['controleur', 'commercial', 'chargement', 'expedition', 'preparation']),
        icon: <Truck size={19} />,
        label: 'Expédition',
      },
      {
        path: '/transfer-orders/list',
        disabled: !roles(['controleur', 'commercial', 'chargement', 'expedition']),
        icon: <ArrowRightLeft size={19} />,
        label: 'Transfert',
      },
      {
        path: '/website-orders',
        hidden: !roles(['commercial', 'admin']),
        icon: <Globe size={19} />,
        label: (
          <Link to='/website-orders' className='flex items-center justify-between w-full'>
            Site web
            <Badge count={states.website_orders} className='ml-2' />
          </Link>
        ),
      },
    ],
  },

  /* -------------------------------- Stock -------------------------------- */
  {
    icon: <Package size={20} />,
    label: <span className='text-base'>Stock</span>,
    children: [
      { path: '/stock',                hidden: false,                                         icon: <ArrowDownUp size={19} />,    label: 'Suivi' },
      { path: '/inventories',          hidden: !permissions('inventaire.voir'),               icon: <ClipboardCheck size={19} />, label: 'Inventaire' },
      {
        icon: <Warehouse size={19} />,
        hidden: !permissions('depots.voir'),
        onClick: () => handleShow(navigate, '/depots', 1000, 800),
        label: 'Depots',
      },
      { path: '/fabrication/stock',    hidden: !permissions('stock_fabrication.voir'),          icon: <Layers size={19} />, label: 'Fabrication Stock' },
      { path: '/fabrication/articles', hidden: !permissions('stock_fabrication.voir'),          icon: <Boxes size={19} />,  label: 'Fabrication Articles' },
      { path: '/fabrication/capacit',  hidden: !permissions('stock_fabrication.voir_capacite'), icon: <Gauge size={19} />,  label: 'Fabrication Capacité' },
    ],
  },

  /* ------------------------------- Arrivage ------------------------------ */
  {
    icon: <PlaneLanding size={20} />,
    disabled: !roles(['logistique', 'admin']),
    label: 'Arrivage',
    children: [
      { path: '/reception', icon: <PackageCheck size={20} />, label: 'Reception' },
      { path: '/travels',   icon: <Van size={20} />,          label: 'Voyage' },
    ],
  },

  /* --------------------- Achat (simple link, non-admin) ------------------ */
  {
    path: '/purchase',
    hidden: roles(['admin']),
    disabled: !roles(['admin', 'chef_service']),
    icon: <BaggageClaim size={20} />,
    label: 'Achat',
  },

  /* ----------------------------- Achat (admin) --------------------------- */
  {
    hidden: !roles(['admin']),
    disabled: !roles(['admin', 'chef_service']),
    icon: <BaggageClaim size={20} />,
    label: (
      <div className='flex items-center justify-between w-full'>
        Achat
        {showPurchaseBadge ? <Badge count={states.purchase} className='ml-2' /> : null}
      </div>
    ),
    children: [
      { path: '/purchase-overview', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
      {
        path: '/purchase',
        disabled: !canBuy,
        icon: <FileText size={20} />,
        label: (
          <Link to='/purchase' className='flex items-center justify-between w-full'>
            <span className='flex-1'>Domands</span>
            {showPurchaseBadge ? <Badge count={states.purchase} className='ml-2' /> : null}
          </Link>
        ),
      },
      { path: '/suppliers',           disabled: !canBuy, icon: <Handshake size={20} />,        label: 'Fournisseurs' },
      { path: '/supplier-interviews', disabled: !canBuy, icon: <ChartCandlestick size={20} />, label: 'F.Evaluations' },
      { path: '/quote-comparison',    disabled: !canBuy, icon: <GitCompare size={20} />,       label: 'Comparatif des devis' },
      { path: '/supplier-ncf',        disabled: !canBuy, icon: <BadgeX size={20} />,           label: 'NC Fournisseur' },
    ],
  },

  /* ------------------------------ Personnel ------------------------------ */
  {
    icon: <Users size={20} />,
    label: <span className='text-base'>Personnel</span>,
    children: [
      { path: '/users',         disabled: !permissions('view:users'), icon: <UserCheck size={20} />, label: 'Utilisateurs' },
      { path: '/users/actions', disabled: !permissions('view:users'), icon: <ScrollText size={20} />, label: 'Actions' },
      { path: '/roles',         disabled: !permissions('view:roles'), icon: <Lock size={20} />,       label: 'Roles' },
    ],
  },
])
}

/* -------------------------------------------------------------------------- */
/*  Layout                                                                     */
/* -------------------------------------------------------------------------- */

const MainLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [openKeys, setOpenKeys] = useState([])

  // Built once and shared by the desktop Sider and the mobile Drawer
  const rawItems = useSideMenu()
  const menuItems = useMemo(() => stripPaths(rawItems), [rawItems])

  // Highlight the active item from the URL
  const { selected, open } = useMemo(() => matchRoute(rawItems, pathname), [rawItems, pathname])

  // Keep the parent of the active page open when the route changes
  useEffect(() => {
    setOpenKeys((prev) => Array.from(new Set([...prev, ...open])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
        setSidebarVisible(false)
      } else {
        setSidebarVisible(true)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
      document.body.style.overflow = 'auto'
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarVisible((prevState) => !prevState)
    if (isMobile) {
      document.body.style.overflow = sidebarVisible ? 'auto' : 'hidden'
    }
  }

  const closeDrawer = () => {
    setSidebarVisible(false)
    document.body.style.overflow = 'auto'
  }

  return (
    <Layout style={{ minHeight: '100vh' }} className='pb-14 md:mb-4'>
      <Header
        className='flex items-center justify-between shadow-sm top-0 left-0'
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: 64,
          background: '#fff',
          paddingInline: 16,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className='flex justify-between w-full items-center'>
          <div className='flex md:hidden h-full items-center'>
            <button
              style={{ background: 'transparent', border: 'none' }}
              type='button'
              onClick={toggleSidebar}
            >
              {sidebarVisible ? (
                <X size={40} color='black' />
              ) : (
                <MenuIcon size={40} color='black' />
              )}
            </button>
          </div>
          <div>
            <Link to='/'>
              <img
                src='https://app.intercocina.com/logo.png'
                alt='Intercocina logo'
                className='w-40 md:w-60'
              />
            </Link>
          </div>
          <div className='flex gap-3 items-center'>
            <div>
              <Tools />
            </div>
            <div>
              <DropMenu />
            </div>
          </div>
        </div>
      </Header>

      <Layout>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Sider
            width={300}
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            breakpoint='lg'
            collapsedWidth={80}
            style={{
              background: colorBgContainer,
              paddingTop: '12px',
              position: 'fixed',
              top: 64,
              left: 0,
              height: 'calc(100vh - 64px)',
              overflowY: 'auto',
              zIndex: 100,
            }}
          >
            <Menu
              mode='inline'
              className='space-y-2'
              selectedKeys={selected}
              openKeys={openKeys}
              onOpenChange={setOpenKeys}
              style={{ borderRight: 0 }}
              items={menuItems}
            />
          </Sider>
        )}

        {/* Mobile Drawer Sidebar */}
        {isMobile && (
          <Drawer
            placement='left'
            closable={false}
            onClose={closeDrawer}
            open={sidebarVisible}
            width={240}
            styles={{
              body: {
                padding: 0,
                paddingTop: 12,
                background: colorBgContainer,
              },
            }}
            maskClosable
            mask
          >
            <Menu
              mode='inline'
              className='space-y-2'
              selectedKeys={selected}
              openKeys={openKeys}
              onOpenChange={setOpenKeys}
              onClick={closeDrawer}
              style={{ height: '100%', borderRight: 0 }}
              items={menuItems}
            />
          </Drawer>
        )}

        <Layout
          className='pt-0 px-0 md:px-4'
          style={{
            marginLeft: !isMobile ? (collapsed ? 80 : 300) : 0,
            marginTop: 74,
            transition: 'margin 0.2s ease-in-out',
          }}
        >
          <Content
            className='bg-gray-50 shadow mb-4'
            style={{
              minHeight: 'calc(100vh - 64px)',
              borderRadius: borderRadiusLG,
              overflow: 'auto',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <MobileBottomNav />
    </Layout>
  )
}

export default MainLayout