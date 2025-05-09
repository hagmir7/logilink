import React, { useState, useEffect } from 'react';
import {Layout, Menu, theme, Drawer } from 'antd';
import { ArrowDownUp, BaggageClaim, ClipboardCheck, Layers, Package, Shield, ShoppingBag, UserCheck, Users, Menu as MenuIcon, X, RefreshCcw, CircleCheck, CircleCheckBig, Forklift } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import DropMenu from '../components/DropMenu';
import { useAuth } from '../contexts/AuthContext';
const { Header, Content, Sider } = Layout;

const sideMenu = ()=>{

    const { roles } = useAuth();

    return [
        {
            key: 'menu-1',
            icon: <ShoppingBag size={20} />,
            label: <span className="text-base">Commandes</span>,
            children: [
                {
                    key: "submenu-2",
                    icon: <RefreshCcw size={20} />,
                    label: <Link to="/">Préparation</Link>
                },
                {
                    key: "submenu-3",
                    icon: <CircleCheckBig size={20} />,
                    label: <Link to="/">Validation</Link>
                },

                {
                    key: "submenu-4",
                    icon: <Forklift size={20} />,
                    label: <Link to="/">Expédition</Link>
                }
            ]
        },
        // {
        //     key: 'menu-2',
        //     icon: <Package size={20} />,
        //     label: <span className="text-base">Stock</span>,
            
        //     children: [
        //         {
        //             key: "submenu-2",
        //             label: "Préparation"
        //         }
        //     ]
        // },
        // {
        //     key: 'menu-3',
        //     icon: <Layers size={20} />,
        //     label: <span className="text-base">Inventaire</span>,
        //     children: [
        //         {
        //             key: "submenu-3",
        //             label: "Préparation"
        //         }
        //     ]
        // },
        // {
        //     key: 'menu-4',
        //     icon: <ArrowDownUp size={20} />,
        //     label: <span className="text-base">Transfert</span>,
        //     children: [
        //         {
        //             key: "submenu-4",
        //             label: "Préparation"
        //         }
        //     ]
        // },
        // {
        //     key: 'menu-6',
        //     icon: <ClipboardCheck size={20} />,
        //     label: <span className="text-base">Reception</span>,
        //     children: [
        //         {
        //             key: "submenu-6",
        //             label: "Préparation"
        //         }
        //     ]
        // },
        // {
        //     key: 'menu-7',
        //     icon: <BaggageClaim size={20} />,
        //     label: <span className="text-base">Achat</span>,
        //     children: [
        //         {
        //             key: "submenu-7",
        //             label: "Group"
        //         }
        //     ]
        // },
        {
            key: 'menu-8',
            icon: <Users size={20} />,
            label: <span className="text-base">Personnel</span>,
            children: [
                {
                    key: "submenu-8-1",
                    disabled: !roles("view:users"),
                    icon: <UserCheck size={20} />,
                    label: <Link to="/users">Utilisateurs</Link>,
                },
                {
                    key: "submenu-8-2",
                    disabled: !roles("view:roles"),
                    icon: <Shield size={20} />,
                    label: <Link to="/roles">Roles</Link>
                }
            ]
        },
    ];
}

const MainLayout = ({ children }) => {
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarVisible, setSidebarVisible] = useState(true);

    // Handle responsive behavior
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setCollapsed(true);
                setSidebarVisible(false);
            } else {
                setSidebarVisible(true);
            }
        };

        // Initialize on first render
        checkScreenSize();

        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', checkScreenSize);
            document.body.style.overflow = 'auto'; // Reset overflow when component unmounts
        };
    }, []);

    // Toggle sidebar for mobile with immediate response
    const toggleSidebar = () => {
        // Force immediate update for better performance
        setSidebarVisible(prevState => !prevState);
        // Reset any potential lag on mobile
        if (isMobile) {
            document.body.style.overflow = sidebarVisible ? 'auto' : 'hidden';
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header className="flex items-center justify-between" theme="light">
                <div className="flex items-center">
                    {/* Mobile menu toggle button */}

                    <img width={100} src="https://intercocina.com/assets/imgs/intercocina-logo.png" alt="Intercocina logo" />
                </div>
                <div className='flex gap-6 items-center'>
                    
                    <div>
                        <DropMenu />
                    </div>

                    <div>
                        <button
                            className="block md:hidden"
                            style={{ background: 'transparent', border: 'none' }}
                            type='button'
                            onClick={toggleSidebar}
                        >
                            {sidebarVisible ? <X size={24} color="white" /> : <MenuIcon size={24} color="white" />}</button>
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
                        breakpoint="lg"
                        collapsedWidth={80}
                        style={{
                            background: colorBgContainer,
                            paddingTop: "12px",
                            position: 'relative',
                            height: '100%',
                            zIndex: 10
                        }}
                    >
                        <Menu
                            mode="inline"
                            className="space-y-2"
                            defaultSelectedKeys={['menu-1']}
                            defaultOpenKeys={['menu-1']}
                            style={{ height: '100%', borderRight: 0 }}
                            items={sideMenu()}
                        />
                    </Sider>
                )}

                {/* Mobile Drawer Sidebar */}
                {isMobile && (
                    <Drawer
                        placement="left"
                        closable={false}
                        onClose={toggleSidebar}
                        open={sidebarVisible}
                        width={240}
                        bodyStyle={{ padding: 0, paddingTop: "12px", background: colorBgContainer }}
                        maskClosable={true}
                        mask={true}
                    >
                        <Menu
                            mode="inline"
                            className="space-y-2"
                            defaultSelectedKeys={['menu-1']}
                            style={{ height: '100%', borderRight: 0 }}
                            items={sideMenu()}
                        />
                    </Drawer>
                )}

                <Layout className="pt-4" style={{
                    padding: '0 24px 24px',
                    marginLeft: isMobile ? 0 : (collapsed ? 0 : 0)
                }}>
                    <Content
                        className="mt-4 min-h-screen"
                        style={{
                            padding: 16,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MainLayout;