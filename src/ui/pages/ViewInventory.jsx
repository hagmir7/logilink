import React, { useState } from 'react';
import { Tabs } from 'antd';
import { ArrowDownUp, ChartBar, Package, Warehouse } from 'lucide-react';
import InventoryArticles from './InventoryArticles';
import { useParams } from 'react-router-dom';
import InventoryOverview from '../components/InventoryOverview';
import InventoryDepots from './InventoryDepots';
import InventoryMovements from './InventoryMovements';
import { useAuth } from '../contexts/AuthContext';

const ViewInventory = () => {
    const [activeKey, setActiveKey] = useState('1');
    const { id } = useParams();
    const { roles } = useAuth();

    const items = [
        {
            label: (
                <span className='flex items-center gap-2 ml-3'>
                    <ChartBar size={16} />
                    Aperçu
                </span>
            ),
            key: '1',
            children: <InventoryOverview />,
            hidden: !roles('admin')
        },
        {
            label: (
                <span className='flex items-center gap-2'>
                    <ArrowDownUp size={16} />
                    Mouvements
                </span>
            ),
            key: '3',
            children: <InventoryMovements id={id} />,
        },
        {
            label: (
                <span className='flex items-center gap-2'>
                    <Package size={16} />
                    Articles
                </span>
            ),
            key: '2',
            children: <InventoryArticles />,
        },

        {
            label: (
                <span className='flex items-center gap-2'>
                    <Warehouse size={16} />
                    Depots
                </span>
            ),
            key: '4',
            children: <InventoryDepots inventory_id={id} />,
        },
    ];

    // Filter out hidden tabs
    const visibleItems = items.filter(item => !item.hidden);

    // Ensure activeKey is valid for visible tabs
    const validActiveKey = visibleItems.find(item => item.key === activeKey)
        ? activeKey
        : visibleItems[0]?.key || '1';

    const handleTabChange = (key) => {
        setActiveKey(key);
    };

    return (
        <div>
            <Tabs
                activeKey={validActiveKey}
                onChange={handleTabChange}
                size='middle'
                type="line"
                items={visibleItems}
                style={{ marginBottom: 32 }}
            />
        </div>
    );
};

export default ViewInventory;