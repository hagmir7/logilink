import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Dropdown, Space, Avatar } from 'antd';
import { ArrowRightCircle, Settings, User2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router'

const UserAvatar = () => (
  <Space direction='vertical'>
    <Avatar icon={<UserOutlined />} size={40} />
  </Space>
)

const DropMenu = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handelLogout = async () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        if (window.electron) {
            await window.electron.logout();
        } else {
            navigate('/login')
        }
    }

    const items = [
        {
            key: '1',
            label: user ? user.full_name : "INTERCOCINA",
            disabled: true,
        },
        {
            key: '2',
            label: 'Profile',
            icon: <User2 />,
            extra: '⌘P',
        },
        {
            key: '3',
            label: 'Paramètres',
            icon: <Settings />,
            extra: '⌘B',
        },
        {
            key: '4',
            label: 'Déconnexion',
            icon: <ArrowRightCircle />,
            extra: '⌘S',
            onClick: handelLogout
        },
    ];


    return (
        <Dropdown menu={{ items }}>
            <a onClick={e => e.preventDefault()}>
                <UserAvatar />
            </a>
        </Dropdown>
    );
}

export default DropMenu;