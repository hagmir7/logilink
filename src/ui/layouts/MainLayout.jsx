import React from 'react';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { ArrowDownUp, BaggageClaim, Boxes, CarTaxiFront, ClipboardCheck, Layers, Package, Shield, ShoppingBag, UserCheck, Users } from 'lucide-react';
const { Header, Content, Sider } = Layout;


const items1 = ['1', '2', '3'].map(key => ({
    key,
    label: `nav ${key}`,
}));


const sideMenu = [
    {
        key: 1,
        icon: <ShoppingBag size={20} />,
        label: <span className='text-[16px]'>Commandes</span>,
        children: [
            {
                key: "1",
                label: "Priparation"
            }
        ]
    },
    {
        key: 2,
        icon: <Package size={20} />,
        label: <span className='text-[16px]'>Stock</span>,
        children: [
            {
                key: "2",
                label: "Priparation"
            }
        ]
    },

    {
        key: 3,
        icon: <Layers size={20} />,
        label: <span className='text-[16px]'>Inventaire</span>,
        children: [
            {
                key: "3",
                label: "Priparation"
            }
        ]
    },
    {
        key: 4,
        icon: <ArrowDownUp size={20} />,
        label: <span className='text-[16px]'>Transfert</span>,
        children: [
            {
                key: "4",
                label: "Priparation"
            }
        ]
    },
    {
        key: 6,
        icon: <ClipboardCheck size={20} />,
        label: <span className='text-[16px]'>Reception</span>,
        children: [
            {
                key: "6",
                label: "Priparation"
            }
        ]
    },
    {
        key: 7,
        icon: <BaggageClaim size={20} />,
        label: <span className='text-[16px]'>Achat</span>,
        children: [
            {
                key: "7",
                label: "Group"
            }
        ]
    },
    {
        key: 8,
        icon: <Users size={20} />,
        label: <span className='text-[16px]'>Personnel</span>,
        children: [
            {
                icon: <UserCheck size={20} />,
                key: "8",
                label: "Utilisateurs"
            },
            {
                icon: <Shield size={20} />,
                key: "9",
                label: "Roles"
            }
        ]
    },

]



const MainLayout = ({ children }) => {
    const { token: { colorBgContainer, borderRadiusLG }, } = theme.useToken();
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header className='flex items-center justify-between' theme="light">
                <div>
                    <img width={100} src="https://intercocina.com/assets/imgs/intercocina-logo.png" alt="" />
                </div>
                <div>
                    {/* <Menu
                    // theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['2']}
                    items={items1}
                    style={{ flex: 1, minWidth: 0 }}
                /> */}
                </div>
            </Header>
            <Layout>
                <Sider width={300} style={{ background: colorBgContainer, paddingTop: "12px" }}>
                    <Menu
                        mode="inline"
                        className='space-y-4'
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1']}
                        style={{ height: '100%', borderRight: 0 }}
                        items={sideMenu}
                    />
                </Sider>

                <Layout className='pt-4' style={{ padding: '0 24px 24px' }}>
                    <Content
                        className='mt-4 min-h-screen'
                        style={{
                            padding: 24,
                            // margin: 0,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </Content>
                </Layout>

            </Layout>
        </Layout>
    );
};
export default MainLayout;