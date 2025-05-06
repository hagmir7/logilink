import React from 'react';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { ArrowDownUp, BaggageClaim, Boxes, CarTaxiFront, ClipboardCheck, Layers, Package, Shield, ShoppingBag, UserCheck, Users } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
const { Header, Content, Sider } = Layout;


const items1 = ['1', '2', '3'].map(key => ({
    key,
    label: `nav ${key}`,
}));

const sideMenu = [
    {
        key: 'menu-1',
        icon: <ShoppingBag size={20} />,
        label: <span className="text-base">Commandes</span>,
        children: [
            {
                key: "submenu-1",
                label: <Link to="/">Préparation</Link>
            }
        ]
    },
    {
        key: 'menu-2',
        icon: <Package size={20} />,
        label: <span className="text-base">Stock</span>,
        children: [
            {
                key: "submenu-2",
                label: "Préparation"
            }
        ]
    },
    {
        key: 'menu-3',
        icon: <Layers size={20} />,
        label: <span className="text-base">Inventaire</span>,
        children: [
            {
                key: "submenu-3",
                label: "Préparation"
            }
        ]
    },
    {
        key: 'menu-4',
        icon: <ArrowDownUp size={20} />,
        label: <span className="text-base">Transfert</span>,
        children: [
            {
                key: "submenu-4",
                label: "Préparation"
            }
        ]
    },
    {
        key: 'menu-6',
        icon: <ClipboardCheck size={20} />,
        label: <span className="text-base">Reception</span>,
        children: [
            {
                key: "submenu-6",
                label: "Préparation"
            }
        ]
    },
    {
        key: 'menu-7',
        icon: <BaggageClaim size={20} />,
        label: <span className="text-base">Achat</span>,
        children: [
            {
                key: "submenu-7",
                label: "Group"
            }
        ]
    },
    {
        key: 'menu-8',
        icon: <Users size={20} />,
        label: <span className="text-base">Personnel</span>,
        children: [
            {
                key: "submenu-8-1",
                icon: <UserCheck size={20} />,
                label: <Link to="/users">Utilisateurs</Link>,
            },
            {
                key: "submenu-8-2",
                icon: <Shield size={20} />,
                label: <Link to="/roles">Roles</Link>
            }
        ]
    },
];

const MainLayout = ({ children }) => {
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header className="flex items-center justify-between" theme="light">
                <div>
                    <img width={100} src="https://intercocina.com/assets/imgs/intercocina-logo.png" alt="Intercocina logo" />
                </div>
                <div>
                    {/* Menu commented out
                    <Menu
                        mode="horizontal"
                        defaultSelectedKeys={['2']}
                        items={items1}
                        style={{ flex: 1, minWidth: 0 }}
                    /> 
                    */}
                </div>
            </Header>
            <Layout>
                <Sider width={300} style={{ background: colorBgContainer, paddingTop: "12px" }}>
                    <Menu
                        mode="inline"
                        className="space-y-4"
                        defaultSelectedKeys={['menu-1']}
                        defaultOpenKeys={['menu-1']}
                        style={{ height: '100%', borderRight: 0 }}
                        items={sideMenu}
                    />
                </Sider>

                <Layout className="pt-4" style={{ padding: '0 24px 24px' }}>
                    <Content
                        className="mt-4 min-h-screen"
                        style={{
                            padding: 24,
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