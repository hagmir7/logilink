import React, { useState } from 'react';
import { Tabs } from 'antd';
import { ArrowDownUp, ChartBar, Package } from 'lucide-react';
import InventoryArticles from './InventoryArticles';
import MovementsList from './MovementsList';
import { useParams } from 'react-router-dom';

const ViewInventory = () => {
    const [activeKey, setActiveKey] = useState('1');
    const { id } = useParams();

    const items = [
        {
            label: (
                <span className='flex items-center gap-2 ml-3'>
                    <ChartBar size={16} />
                    Aperçu
                </span>
            ),
            key: '1',
            children: ( <div>
                    <h3>Catalogue de Articles</h3>
                    <p>Parcourez et gérez votre catalogue de produits ici.</p>
                    
                </div>),
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
                    <ArrowDownUp size={16} />
                    Mouvements
                </span>
            ),
            key: '3',
            children: <MovementsList id={id} />,
        },
    ];

    const handleTabChange = (key) => {
        setActiveKey(key);
    };

    return (
        <div className=''>
            <Tabs
                activeKey={activeKey}
                onChange={handleTabChange}
                size='middle'
                type="line"
                items={items}
                style={{ marginBottom: 32 }}
            />
        </div>
    );
};

export default ViewInventory;