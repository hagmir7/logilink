import React from 'react'
import { Pie, Column } from '@ant-design/plots';
import { DatePicker } from 'antd';
import PurchasePieChart from '../components/charts/PurchasePieChart';
const { RangePicker } = DatePicker;



const data = [
  { type: 'Sans service', value: 26, percent: 59.09 },
  { type: 'Marketing', value: 16, percent: 36.36 },
  { type: 'Stock', value: 2, percent: 4.55 },
];




const DemoPie = () => {
  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    color: ['#5B8FF9', '#61DDAA', '#F6BD16'],
    label: {
      type: 'spider', // labels outside with lines
      labelHeight: 40,
      content: (d) => `${d.type}`, // show type outside
      style: {
        fontSize: 14,
        fontWeight: 500,
      },
    },
    tooltip: {
      showTitle: false,
      formatter: (d) => ({
        name: d.type,
        value: `${d.percent}% (${d.value})`, // type + percent + total
      }),
    },
    legend: {
      position: 'right',
      layout: 'vertical',
      itemSpacing: 10,
    },
    interactions: [
      { type: 'element-active' }, // highlight slice on hover
    ],
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 800,
      },
    },
  };

  return <Pie {...config} />;
};


const DemoColumn = () => {
  const config = {
    data: {
      type: 'fetch',
      value: 'https://render.alipay.com/p/yuyan/180020010001215413/antd-charts/column-column.json',
    },
    xField: 'letter',
    yField: 'frequency',
    label: {
      text: (d) => `${(d.frequency * 100).toFixed(1)}%`,
      textBaseline: 'bottom',
    },
    axis: {
      y: {
        labelFormatter: '.0%',
      },
    },
    style: {
      radiusTopLeft: 10,
      radiusTopRight: 10,
    },
  };
  return <Column {...config} />;
};



export default function PurchaseOverview() {

  
    const handleChangeDate = (dates) => {
      // if (dates && dates.length === 2) {
      //   setDateFilter(dates.map((d) => dayjs(d).format('YYYY-MM-DD')));
      // } else {
      //   setDateFilter([]);
      // }
    };
  
  return (
    <div>
       <div className='hidden md:block'>
            <RangePicker
              size='large'
              onChange={handleChangeDate}
              className='min-w-[140px]'
            />
          </div>
        <div className="border flex gap-2 max-w-full">
            <DemoColumn />

            <PurchasePieChart />
        </div>


    </div>
  )
}
