import React, { useState, useEffect } from 'react'
import { Layout, Menu, theme, Drawer } from 'antd'
import {
  ArrowDownUp,
  BaggageClaim,
  ClipboardCheck,
  Layers,
  Package,
  Shield,
  ShoppingBag,
  UserCheck,
  Users,
  Menu as MenuIcon,
  X,
} from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import DropMenu from '../components/DropMenu'
import { useAuth } from '../contexts/AuthContext'
const { Header, Content, Sider } = Layout

const sideMenu = () => {
  const { roles, permissions } = useAuth()

  return [
    {
      key: 'menu-1',
      icon: <ShoppingBag size={20} />,
      label: <span className='text-base'>Commandes</span>,
      children: [
        {
          key: 'submenu-1',
          label: <Link to='/'>Préparation</Link>,
        },

        {
          key: 'submenu-10',
          label: <Link to='/validation'>Validation</Link>,
        },
        {
          key: 'submenu-11',
          label: <Link to='/preparation'>Expédition</Link>,
        },
      ],
    },
    {
      key: 'menu-2',
      icon: <Package size={20} />,
      label: <span className='text-base'>Stock</span>,

      children: [
        {
          key: 'submenu-2',
          label: 'Préparation',
        },
      ],
    },
    {
      key: 'menu-3',
      icon: <Layers size={20} />,
      label: <span className='text-base'>Inventaire</span>,
      children: [
        {
          key: 'submenu-3',
          label: 'Préparation',
        },
      ],
    },
    {
      key: 'menu-4',
      icon: <ArrowDownUp size={20} />,
      label: <span className='text-base'>Transfert</span>,
      children: [
        {
          key: 'submenu-4',
          label: 'Préparation',
        },
      ],
    },
    {
      key: 'menu-6',
      icon: <ClipboardCheck size={20} />,
      label: <span className='text-base'>Reception</span>,
      children: [
        {
          key: 'submenu-6',
          label: 'Préparation',
        },
      ],
    },
    {
      key: 'menu-7',
      icon: <BaggageClaim size={20} />,
      label: <span className='text-base'>Achat</span>,
      children: [
        {
          key: 'submenu-7',
          label: 'Group',
        },
      ],
    },
    {
      key: 'menu-8',
      icon: <Users size={20} />,
      label: <span className='text-base'>Personnel</span>,
      children: [
        {
          key: 'submenu-8-1',
          disabled: !permissions('view:users'),
          icon: <UserCheck size={20} />,
          label: <Link to='/users'>Utilisateurs</Link>,
        },
        {
          key: 'submenu-8-2',
          disabled: !permissions('view:roles'),
          icon: <Shield size={20} />,
          label: <Link to='/roles'>Roles</Link>,
        },
      ],
    },
  ]
}

const MainLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)

  // Handle responsive behavior
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

    // Initialize on first render
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize)

    return () => {
      window.removeEventListener('resize', checkScreenSize)
      document.body.style.overflow = 'auto'
    }
  }, [])


  const toggleSidebar = () => {
    setSidebarVisible((prevState) => !prevState)
    // Reset any potential lag on mobile
    if (isMobile) {
      document.body.style.overflow = sidebarVisible ? 'auto' : 'hidden'
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
        theme='light'
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
            <Link to={'/'}>
              <img
                width={100}
                src='https://intercocina.com/assets/imgs/intercocina-logo.png'
                alt='Intercocina logo'
              />
            </Link>
          </div>
          <div>
            <DropMenu />
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
              position: 'fixed', // Fixed position
              top: 64, // Assuming Header is 64px tall
              left: 0,
              height: 'calc(100vh - 64px)', // Full height minus header
              overflowY: 'auto', // Enable vertical scroll
              zIndex: 100,
            }}
          >
            <Menu
              mode='inline'
              className='space-y-2'
              defaultSelectedKeys={['menu-1']}
              defaultOpenKeys={['menu-1']}
              style={{ borderRight: 0 }}
              items={sideMenu()}
            />
          </Sider>
        )}

        {/* Mobile Drawer Sidebar */}
        {isMobile && (
          <Drawer
            placement='left'
            closable={false}
            onClose={toggleSidebar}
            open={sidebarVisible}
            width={240}
            bodyStyle={{
              padding: 0,
              paddingTop: '12px',
              background: colorBgContainer,
            }}
            maskClosable={true}
            mask={true}
          >
            <Menu
              mode='inline'
              className='space-y-2'
              defaultSelectedKeys={['menu-1']}
              style={{ height: '100%', borderRight: 0 }}
              items={sideMenu()}
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
            className='bg-gray-50 shadow'
            style={{
              minHeight: 'calc(100vh - 64px)',
              padding: 16,
              borderRadius: borderRadiusLG,
              overflow: 'auto',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default MainLayout
