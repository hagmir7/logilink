import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  ArrowDown,
  CircleDollarSign,
  ClockAlert,
  SquareX,
  RefreshCcwDot,
  Merge,
  TrendingUp,
  TrendingDown,
  Minus,
  LayoutGrid,
  GitMerge,
  PackageCheck,
  ShieldCheck,
  GitPullRequestDraft,
} from 'lucide-react';
import { Button, DatePicker, message, Popconfirm, Select, Spin } from 'antd';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { categories, locale } from '../utils/config';
import { api } from '../utils/api';
import { useParams } from 'react-router-dom';
import InvenotryExport from './InvenotryExport';
import { useAuth } from '../contexts/AuthContext';

const { RangePicker } = DatePicker;

// ── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n = 0, decimals = 0) =>
  Number(n).toLocaleString('fr-FR', { maximumFractionDigits: decimals });

const fmtCurrency = (n = 0) =>
  Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 });

const pct = (part, total) =>
  total > 0 ? Math.round((part / total) * 100) : 0;

// ── sub-components ───────────────────────────────────────────────────────────

const Trend = ({ value, suffix = '%', invert = false }) => {
  if (value === null || value === undefined) return null;
  const positive = invert ? value < 0 : value > 0;
  const neutral = value === 0;

  if (neutral)
    return (
      <span className="inline-flex items-center gap-1 text-xs px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
        <Minus size={11} /> stable
      </span>
    );

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-1 py-0.5 rounded font-medium ${
        positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      }`}
    >
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {value > 0 ? '+' : ''}{value}{suffix}
    </span>
  );
};

const KpiCard = ({ icon: Icon, iconBg, iconColor, label, value, trend, trendSuffix, trendInvert }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-2 hover:shadow-sm transition-shadow flex flex-col gap-3">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
      <Icon size={17} className={iconColor} />
    </div>
    <div>
      <p className="text-2xl font-semibold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-500 mt-1 leading-snug">{label}</p>
    </div>
    {trend !== undefined && (
      <Trend value={trend} suffix={trendSuffix} invert={trendInvert} />
    )}
  </div>
);

const RateCard = ({ label, value, color }) => (
  <div className="bg-gray-50 rounded-lg p-3 text-center">
    <p className="text-xl font-semibold" style={{ color }}>{value}%</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

const ProgressRow = ({ label, current, total, color }) => {
  const ratio = pct(current, total);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span className="font-medium text-gray-700">{fmt(current)} / {fmt(total)} — {ratio}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${ratio}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const MOVEMENT_COLORS = ['#2a78d6', '#e34948'];
const STATUS_COLORS   = ['#16a34a', '#e34948', '#d97706'];
const CAT_COLORS      = ['#2a78d6', '#16a34a', '#d97706', '#7c3aed'];

const CustomTooltip = ({ active, payload, label, currency = false }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-medium">{currency ? fmtCurrency(p.value) : fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const InventoryOverview = () => {
  const [data, setData] = useState({
    quantity_in: 0,
    quantity_out: 0,
    value_in: 0,
    value_out: 0,
    quantity: 0,
    value: 0,
    movements_in: 0,
    movements_in_none_controlled: 0,
    articles_non_used: 0,
    emplacement_non_used: 0,
    total_articles: 0,
    emplacements: 0,
    not_merged: 0,
    not_merged_articles: 0,
  });

  const [loading, setLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { id }    = useParams();
  const { roles } = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`inventory/overview/${id}`);
      setData(res);
    } catch (err) {
      message.error('Erreur lors du chargement des données.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── computed rates ──────────────────────────────────────────────────────────

  const controlRate        = pct(data.movements_in - data.movements_in_none_controlled, data.movements_in);
  const mergeRate          = pct(data.movements_in - data.not_merged, data.movements_in);
  const notMergedRate      = 100 - mergeRate;
  const articleRate        = pct(data.total_articles - data.articles_non_used, data.total_articles);
  const emplacementOccupied = data.emplacements - data.emplacement_non_used;
  const emplacementRate    = pct(emplacementOccupied, data.emplacements);

  // colour helpers for rates
  const rateColor = (r) => r >= 80 ? '#16a34a' : r >= 50 ? '#d97706' : '#e34948';
  const mergeRateColor     = rateColor(mergeRate);
  const notMergedRateColor = rateColor(100 - notMergedRate);

  // ── chart data (replace with real history from API when available) ──────────

  const movementHistory = [
    { mois: 'Jan', Entrées: 210, Sorties: 90  },
    { mois: 'Fév', Entrées: 185, Sorties: 110 },
    { mois: 'Mar', Entrées: 260, Sorties: 80  },
    { mois: 'Avr', Entrées: 195, Sorties: 130 },
    { mois: 'Mai', Entrées: 280, Sorties: 95  },
    { mois: 'Jun', Entrées: 310, Sorties: 120 },
  ];

  const valueHistory = [
    { mois: 'Jan', Valeur: 118000 },
    { mois: 'Fév', Valeur: 122000 },
    { mois: 'Mar', Valeur: 135000 },
    { mois: 'Avr', Valeur: 128000 },
    { mois: 'Mai', Valeur: 140000 },
    { mois: 'Jun', Valeur: data.value || 142000 },
  ];

  const statusData = [
    { name: 'Contrôlés',     value: data.movements_in - data.movements_in_none_controlled },
    { name: 'En attente',    value: data.movements_in_none_controlled },
    { name: 'Non fusionnés', value: data.not_merged },
  ];

  // ── actions ─────────────────────────────────────────────────────────────────

  const handleAction = async (endpoint, successMsg) => {
    if (!roles('super_admin')) return;
    setActionLoading(true);
    try {
      await api.get(`inventory/${id}/${endpoint}`);
      message.success(successMsg);
      fetchData();
    } catch (err) {
      message.error(err?.response?.data?.message ?? 'Une erreur est survenue.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── kpi config ───────────────────────────────────────────────────────────────

  const kpis = [
    {
      icon: Box,
      iconBg: 'bg-green-50', iconColor: 'text-green-600',
      label: 'Stock total (quantité)',
      value: fmt(data.quantity_in, 3),
      trend: 12.4,
    },
    {
      icon: ArrowDown,
      iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
      label: 'Total entrées (mouvements)',
      value: fmt(data.movements_in),
      trend: 8,
    },
    {
      icon: ClockAlert,
      iconBg: 'bg-red-50', iconColor: 'text-red-500',
      label: 'Entrées non contrôlées',
      value: fmt(data.movements_in_none_controlled),
      trend: -100 + controlRate,
      trendSuffix: '%',
      trendInvert: true,
    },
    {
      icon: SquareX,
      iconBg: 'bg-orange-50', iconColor: 'text-orange-500',
      label: 'Articles non traités',
      value: fmt(data.articles_non_used),
      trend: 0,
    },
    {
      icon: CircleDollarSign,
      iconBg: 'bg-green-50', iconColor: 'text-green-600',
      label: "Valeur d'entrées",
      value: fmtCurrency(data.value_in),
      trend: 5.1,
    },
    {
      icon: LayoutGrid,
      iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
      label: 'Emplacements libres',
      value: fmt(data.emplacement_non_used),
      trend: -3,
      trendSuffix: '',
      trendInvert: true,
    },
    {
      icon: GitPullRequestDraft,
      iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
      label: 'Articles non fusionnés',
      value: fmt(data.not_merged),
      trend: notMergedRate,
      trendSuffix: '%',
      trendInvert: true,
    },
  ];

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Aperçu de l'inventaire</h1>
            <p className="text-sm text-gray-500 mt-0.5">Suivi en temps réel — stock, mouvements et valeur</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {roles('super_admin') && (
              <>
                <Popconfirm
                  title="Intégrer le stock"
                  description="Cette action est irréversible."
                  onConfirm={() => handleAction('merge', 'Le stock a été intégré avec succès.')}
                  okText="Oui" cancelText="Non" okButtonProps={{ danger: true }}
                >
                  <Button icon={<Merge size={14} />} loading={actionLoading}>
                    Intégrer le stock
                  </Button>
                </Popconfirm>

                <Popconfirm
                  title="Réinitialisation du stock"
                  description="Cette action est irréversible."
                  onConfirm={() => handleAction('init', 'Réinitialisation effectuée.')}
                  okText="Oui" cancelText="Non" okButtonProps={{ danger: true }}
                >
                  <Button icon={<RefreshCcwDot size={14} />} danger loading={actionLoading}>
                    Réinitialiser
                  </Button>
                </Popconfirm>
              </>
            )}

            <InvenotryExport inventory_id={id} />

            <Select
              defaultValue="panneaux"
              placeholder="Filtrer par catégorie"
              style={{ minWidth: 180 }}
              options={categories}
            />

            <RangePicker
              locale={locale}
              placeholder={['Date début', 'Date fin']}
              className="w-full sm:w-auto"
            />

            <Button icon={<RefreshCcwDot size={14} />} onClick={fetchData} loading={loading} />
          </div>
        </div>
      </div>

      <Spin spinning={loading}>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3 mb-6">
          {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
        </div>

        {/* Charts row */}
      

        {/* Rates + Progress */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">Taux de traitement</p>
          <p className="text-xs text-gray-400 mb-4">Indicateurs clés de performance</p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            <RateCard label="Taux de contrôle"    value={controlRate}    color="#16a34a" />
            <RateCard label="Taux de fusion"       value={mergeRate}      color={mergeRateColor} />
            <RateCard label="Non fusionnés"        value={notMergedRate}  color={notMergedRateColor} />
            <RateCard label="Articles utilisés"    value={articleRate}    color="#d97706" />
            <RateCard label="Emplacements occupés" value={emplacementRate} color="#7c3aed" />
          </div>

          <div className="flex flex-col gap-3">
            <ProgressRow
              label="Mouvements contrôlés"
              current={data.movements_in - data.movements_in_none_controlled}
              total={data.movements_in}
              color="#16a34a"
            />
            <ProgressRow
              label="Fusion vers stock"
              current={data.movements_in - data.not_merged}
              total={data.movements_in}
              color="#2a78d6"
            />
            <ProgressRow
              label="Articles actifs"
              current={data.total_articles - data.articles_non_used}
              total={data.total_articles}
              color="#d97706"
            />
            <ProgressRow
              label="Emplacements occupés"
              current={emplacementOccupied}
              total={data.emplacements}
              color="#7c3aed"
            />
            <ProgressRow
              label="Articles non fusionnés"
              current={data.not_merged}
              total={data.movements_in}
              color={notMergedRateColor}
            />
          </div>
        </div>

        {/* Not-merged articles breakdown */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Articles non fusionnés</p>
              <p className="text-xs text-gray-400">Mouvements IN en attente d'intégration au stock physique</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-2xl font-semibold"
                style={{ color: notMergedRateColor }}
              >
                {notMergedRate}%
              </span>
              <span className="text-xs text-gray-400">non fusionné</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="bg-amber-50 rounded-xl p-4 flex flex-col gap-1">
              <p className="text-xs text-amber-600 font-medium">Non fusionnés</p>
              <p className="text-2xl font-semibold text-amber-700">{fmt(data.not_merged)}</p>
              <p className="text-xs text-amber-500">mouvements en attente</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 flex flex-col gap-1">
              <p className="text-xs text-green-600 font-medium">Fusionnés</p>
              <p className="text-2xl font-semibold text-green-700">{fmt(data.movements_in - data.not_merged)}</p>
              <p className="text-xs text-green-500">intégrés au stock</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 flex flex-col gap-1">
              <p className="text-xs text-blue-600 font-medium">Taux de fusion</p>
              <p className="text-2xl font-semibold" style={{ color: mergeRateColor }}>{mergeRate}%</p>
              <p className="text-xs text-blue-400">des entrées traitées</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <ProgressRow
              label="Fusionnés vers stock"
              current={data.movements_in - data.not_merged}
              total={data.movements_in}
              color={mergeRateColor}
            />
            <ProgressRow
              label="En attente de fusion"
              current={data.not_merged}
              total={data.movements_in}
              color="#d97706"
            />
          </div>
        </div>

        {/* Status donut + Summary tiles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Donut */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-sm font-semibold text-gray-800">Répartition des statuts</p>
            <p className="text-xs text-gray-400 mb-2">Entrées par état</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [
                    `${fmt(val)} (${pct(val, data.movements_in)}%)`,
                    name,
                  ]}
                />
                <Legend
                  iconType="square" iconSize={10}
                  formatter={(val) => <span className="text-xs text-gray-500">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Summary tiles */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-sm font-semibold text-gray-800 mb-4">Résumé financier</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: ArrowDown,       label: "Valeur entrées",  value: fmtCurrency(data.value_in),  color: 'text-green-600', bg: 'bg-green-50' },
                { icon: CircleDollarSign, label: 'Valeur sorties', value: fmtCurrency(data.value_out), color: 'text-red-500',   bg: 'bg-red-50'   },
                { icon: PackageCheck,    label: 'Valeur en stock', value: fmtCurrency(data.value),     color: 'text-blue-600',  bg: 'bg-blue-50'  },
                { icon: GitMerge,        label: 'Non fusionnés',   value: fmt(data.not_merged),        color: 'text-orange-500',bg: 'bg-orange-50'},
              ].map(({ icon: Icon, label, value, color, bg }, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                    <Icon size={15} className={color} />
                  </div>
                  <p className="text-base font-semibold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total articles référencés</p>
                <p className="text-lg font-semibold text-gray-800">{fmt(data.total_articles)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Emplacements totaux</p>
                <p className="text-lg font-semibold text-gray-800">{fmt(data.emplacements)}</p>
              </div>
            </div>
          </div>
        </div>

      </Spin>
    </div>
  );
};

export default InventoryOverview;