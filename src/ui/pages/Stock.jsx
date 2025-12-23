import React, { useState } from 'react';
import { Tabs } from 'antd';
import { ArrowDownUp, ChartNoAxesColumn, Package, Warehouse } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Depots from './Depots';
import StockOverView from '../components/StockOverView';
import CompanyStock from './CompanyStock';
import StockMovements from '../components/StockMovements';

const Stock = () => {
    const [activeKey, setActiveKey] = useState('2');
    const { id } = useParams();

    const items = [

      {
        label: (
          <span className='flex items-center gap-2 ml-3'>
            <Package size={16} />
            Stock
          </span>
        ),
        key: '2',
        children: <CompanyStock company_id={id} />,
      },
      {
        label: (
          <span className='flex items-center gap-2'>
            <ArrowDownUp size={16} />
            Mouvements
          </span>
        ),
        key: '3',
        children: <StockMovements company_id={id} />,
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

export default Stock;