import React, { useEffect, useState } from 'react';
import {
  Box,
  BanknoteArrowDown,
  BanknoteArrowUp,
  ArrowUp,
  ArrowDown,
  CircleDollarSign
} from 'lucide-react';
import { DatePicker, Select } from 'antd';
import { categories, locale } from '../utils/config';
import { api } from '../utils/api';
import { useParams } from 'react-router-dom';

const { RangePicker } = DatePicker;

const InventoryOverview = () => {
  const [data, setData] = useState({
    quantity_in: 0,
    quantity_out: 0,
    value_in: 0,
    value_out: 0,
    quantity: 0,
    value: 0
  });

  const { id } = useParams();

  const fetchData = async () => {
    try {
      const response = await api.get(`inventory/overview/${id}`);
      setData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données :', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    {
      title: 'Stock total',
      value: parseFloat(data.quantity.toFixed(3)),
      icon: Box,
      color: 'bg-green-300'
    },
    {
      title: 'Valeur du stock',
      value: parseFloat(data.value.toFixed(3)),
      icon: CircleDollarSign,
      color: 'bg-blue-300'
    },
    {
      title: 'Total des entrées',
      value: parseFloat(data.quantity_in.toFixed(3)),
      icon: ArrowDown,
      color: 'bg-purple-300'
    },
    {
      title: 'Valeur des entrées',
      value: parseFloat(data.value_in.toFixed(3)),
      icon: BanknoteArrowDown,
      color: 'bg-orange-300'
    },
    {
      title: 'Total des sorties',
      value: parseFloat(data.quantity_out.toFixed(3)),
      icon: ArrowUp,
      color: 'bg-red-300'
    },
    {
      title: 'Valeur des sorties',
      value: parseFloat(data.value_out.toFixed(3)),
      icon: BanknoteArrowUp,
      color: 'bg-emerald-300'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Aperçu de l'inventaire</h1>
            <p className="text-gray-600 mt-1">Bon retour ! Voici ce qui se passe.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select
              defaultValue="panneaux"
              placeholder="Filtrer par catégorie"
              size="large"
              style={{ minWidth: 200 }}
              options={categories}
            />
            <RangePicker
              locale={locale}
              className="w-full sm:w-auto"
              size="large"
              placeholder={['Date début', 'Date fin']}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 truncate">{stat.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryOverview;
