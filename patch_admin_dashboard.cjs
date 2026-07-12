const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

const importTarget = `import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, ShoppingBag, AlertTriangle, Calendar } from 'lucide-react';
import { Locale } from '../../types/index.ts';`;

const importReplace = `import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, ShoppingBag, AlertTriangle, Calendar } from 'lucide-react';
import { Locale } from '../../types/index.ts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';`;

code = code.replace(importTarget, importReplace);

const chartTarget = `{/* Core Conversion Metrics block */}
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
                  style={{ width: \`\${stats.totalOrdersCount > 0 ? (stats.pendingOrders / stats.totalOrdersCount) * 100 : 0}%\` }}
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
                  style={{ width: \`\${stats.totalOrdersCount > 0 ? (stats.paidOrders / stats.totalOrdersCount) * 100 : 0}%\` }}
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
                  style={{ width: \`\${stats.totalOrdersCount > 0 ? (stats.shippedOrders / stats.totalOrdersCount) * 100 : 0}%\` }}
                />
              </div>
            </div>
          </div>
        </div>`;

const chartReplace = `{/* Data Visualization block */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4 lg:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-gray-950 font-display">{locale === 'zh-HK' ? '近 7 天銷售趨勢' : '7-Day Sales Trend'}</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="sales" name={locale === 'zh-HK' ? '銷售額 (HK$)' : 'Sales (HK$)'} stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="bg-amber-50 rounded-xl p-3 text-center">
               <span className="block text-[10px] text-amber-700 font-bold uppercase mb-1">Pending</span>
               <span className="text-xl font-black text-amber-900">{stats.pendingOrders}</span>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
               <span className="block text-[10px] text-emerald-700 font-bold uppercase mb-1">Paid</span>
               <span className="text-xl font-black text-emerald-900">{stats.paidOrders}</span>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
               <span className="block text-[10px] text-blue-700 font-bold uppercase mb-1">Shipped</span>
               <span className="text-xl font-black text-blue-900">{stats.shippedOrders}</span>
            </div>
          </div>
        </div>`;

code = code.replace(chartTarget, chartReplace);
fs.writeFileSync('src/components/admin/AdminDashboard.tsx', code);
