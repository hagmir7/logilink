import React, { useState } from 'react';
import { Tabs } from 'antd';
import { ArrowDown, ArrowDownUp, ArrowLeftRight, ArrowUp, ChartBar, ChartNoAxesColumn, Package, Warehouse } from 'lucide-react';
import { useParams } from 'react-router-dom';
import InventoryOverview from '../components/InventoryOverview';
import InventoryDepots from './InventoryDepots';
import Article from './Article';
import Depots from './Depots';
import InventoryMovements from './InventoryMovements';
import InStock from '../components/InStock';
import OutStock from '../components/OutStock';
import TransferStock from '../components/TransferStock';

const Transfert = () => {
    const [activeKey, setActiveKey] = useState('1');
    const { id } = useParams();

    const items = [
      {
        label: (
          <span className='flex items-center gap-2 ml-3'>
            <ChartNoAxesColumn size={16} />
            Aperçu
          </span>
        ),
        key: '1',
        children: <InventoryOverview />,
      },
      {
        label: (
          <span className='flex items-center gap-2'>
            <Package size={16} />
            Articles
          </span>
        ),
        key: '2',
        children: <Article />,
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
            <Warehouse size={16} />
            Depots
          </span>
        ),
        key: '4',
        children: <Depots />,
      },
      {
        label: (
          <span className='flex items-center gap-2'>
            <ArrowDown size={16} />
            Entrée
          </span>
        ),
        key: '5',
        children: <InStock />,
      },

      {
        label: (
          <span className='flex items-center gap-2'>
            <ArrowUp size={16} />
            Sortie
          </span>
        ),
        key: '6',
        children: <OutStock />,
      },

      {
        label: (
          <span className='flex items-center gap-2'>
            <ArrowLeftRight size={16} />
            Transfert
          </span>
        ),
        key: '7',
        children: <TransferStock />,
      },
    ]

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

export default Transfert;