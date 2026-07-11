import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, ShoppingBag, AlertTriangle, ArrowUpRight, Percent, Calendar } from 'lucide-react';
import { Locale } from '../../types/index.ts';

interface AdminDashboardProps {
  locale: Locale;
}

export default function AdminDashboard({ locale }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data));

    apiFetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => setLogs(data.slice(0, 5))); // Last 5 logs
  }, []);

  const dict = {
    'zh-HK': {
      title: '商城控制台概覽',
      sales: '累計銷售額 (HKD)',
      orders: '訂單總件數',
      products: '在售商品數',
      stockAlerts: '低庫存預警',
      metrics: '各渠道營收與狀態指標',
      auditTitle: '最近審計操作日誌',
      auditMsg: '記錄管理員在系統內的操作、改價、改設定等安全歷史。',
    },
    'en': {
      title: 'Dashboard Overview',
      sales: 'Total Revenue (HKD)',
      orders: 'Orders Processed',
      products: 'Active Products',
      stockAlerts: 'Low Stock Alerts',
      metrics: 'Status Metrics & Conversion Indicators',
      auditTitle: 'Recent System Audit Trails',
      auditMsg: 'Tracks administrative events, adjustments, and preferences tuning.',
    }
  }[locale];

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-950 font-display">
          {dict.title}
        </h1>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold bg-white px-3.5 py-1.5 rounded-xl border border-gray-150">
          <Calendar className="h-4 w-4 text-neutral-800" />
          <span>UTC: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">{dict.sales}</span>
            <span className="text-xl font-black text-gray-950 font-display">
              HK${(stats.totalSalesCents / 100).toFixed(2)}
            </span>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">{dict.orders}</span>
            <span className="text-xl font-black text-gray-950 font-display">
              {stats.totalOrdersCount}
            </span>
          </div>
          <div className="bg-neutral-50 p-3 rounded-xl border border-gray-200 text-neutral-600">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">{dict.products}</span>
            <span className="text-xl font-black text-gray-950 font-display">
              {stats.productsCount}
            </span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-600">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        <div className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-all ${
          stats.stockAlerts > 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-150'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">{dict.stockAlerts}</span>
            <span className={`text-xl font-black font-display ${stats.stockAlerts > 0 ? 'text-red-600' : 'text-gray-950'}`}>
              {stats.stockAlerts}
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${
            stats.stockAlerts > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Layout Metrics Visualization & Audit logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Conversion Metrics block */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-gray-950 font-display">{dict.metrics}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>待付款訂單 (Pending Payment)</span>
                <span className="font-mono text-gray-900 font-bold">{stats.pendingOrders}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all" 
                  style={{ width: `${stats.totalOrdersCount > 0 ? (stats.pendingOrders / stats.totalOrdersCount) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>已付款待發貨 (Paid Awaiting Ship)</span>
                <span className="font-mono text-gray-900 font-bold">{stats.paidOrders}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all" 
                  style={{ width: `${stats.totalOrdersCount > 0 ? (stats.paidOrders / stats.totalOrdersCount) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                <span>已發貨在途 (Shipped & Out for Delivery)</span>
                <span className="font-mono text-gray-900 font-bold">{stats.shippedOrders}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all" 
                  style={{ width: `${stats.totalOrdersCount > 0 ? (stats.shippedOrders / stats.totalOrdersCount) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audit logs trail */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-950 font-display">{dict.auditTitle}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">{dict.auditMsg}</p>
          </div>

          <div className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4">No audit trails logged yet.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="py-2.5 text-xs">
                  <p className="text-gray-800 font-medium leading-relaxed">
                    {log.action}
                  </p>
                  <span className="text-[9px] text-gray-400 font-mono mt-1 block">
                    {new Date(log.createdAt).toLocaleTimeString()} by admin
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
