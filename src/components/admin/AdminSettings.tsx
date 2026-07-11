import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Settings, Save, Database, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import { Locale } from '../../types/index.ts';

interface AdminSettingsProps {
  locale: Locale;
}

export default function AdminSettings({ locale }: AdminSettingsProps) {
  const [cancelMin, setCancelMin] = useState(30);
  const [cartTtl, setCartTtl] = useState(7);
  const [firstWeight, setFirstWeight] = useState(30);
  const [extraWeight, setExtraWeight] = useState(10);
  const [warnThreshold, setWarnThreshold] = useState(15);
  const [maxPerItem, setMaxPerItem] = useState(999);
  const [maxTotal, setMaxTotal] = useState(9999);
  
  const [backupLogs, setBackupLogs] = useState<any[]>([]);
  const [backingUp, setBackingUp] = useState(false);
  const [saving, setSubmitting] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        const cMin = data.find((s: any) => s.key === 'order_auto_cancel_minutes');
        if (cMin) setCancelMin(cMin.value);

        const cTtl = data.find((s: any) => s.key === 'cart_ttl_days');
        if (cTtl) setCartTtl(cTtl.value);

        const fWt = data.find((s: any) => s.key === 'shipping_first_weight_cents');
        if (fWt) setFirstWeight(fWt.value / 100);

        const eWt = data.find((s: any) => s.key === 'shipping_extra_weight_cents');
        if (eWt) setExtraWeight(eWt.value / 100);

        const wTh = data.find((s: any) => s.key === 'stock_warn_threshold_default');
        if (wTh) setWarnThreshold(wTh.value);
      });
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      settings: [
        { key: 'order_auto_cancel_minutes', value: Number(cancelMin) },
        { key: 'cart_ttl_days', value: Number(cartTtl) },
        { key: 'shipping_first_weight_cents', value: Math.round(Number(firstWeight) * 100) },
        { key: 'shipping_extra_weight_cents', value: Math.round(Number(extraWeight) * 100) },
        { key: 'stock_warn_threshold_default', value: Number(warnThreshold) }
      ]
    };

    apiFetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      setSubmitting(false);
      setNotif(locale === 'zh-HK' ? '系統全局設定已成功保存並套用。' : 'System preferences updated globally.');
      setTimeout(() => setNotif(null), 3000);
    })
    .catch(e => {
      console.error(e);
      setSubmitting(false);
    });
  };

  const handleTriggerBackup = () => {
    setBackingUp(true);
    apiFetch('/api/admin/backups/trigger', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setBackingUp(false);
        setBackupLogs([data, ...backupLogs]);
        setNotif(locale === 'zh-HK' ? '數據庫安全備份已成功生成！' : 'Database backup generated successfully.');
        setTimeout(() => setNotif(null), 3000);
      })
      .catch(e => {
        console.error(e);
        setBackingUp(false);
      });
  };

  const dict = {
    'zh-HK': {
      title: '交易與系統參數配置',
      desc: '根據SDRS v2.2規範《系統默認值登記冊 D20》，管理員可在下方調整系統自動化的超時與計費參數。',
      cancelMinLabel: '訂單未付款自動取消時間 (分鐘)',
      cartTtlLabel: '未登入購物車保留時效 (天數)',
      firstWtLabel: '順豐物流首重計費 (HK$ / 1KG)',
      extraWtLabel: '順豐物流續重計費 (HK$ / 每增加1KG)',
      thresholdLabel: '默認低庫存預警警戒線 (商品規格數)',
      maxPerItemLabel: '單品限購數量上限 (D20)',
      maxTotalLabel: '單次購物總件數上限 (D20)',
      backupTitle: '系統數據庫定點備份 (PITR)',
      backupBtn: '手動觸發定點備份',
      backupLogs: '最近備份歷史記錄',
      backingUp: '數據庫導出備份中...',
      saveBtn: '儲存設定',
      saving: '保存全局參數中...',
    },
    'en': {
      title: 'Transaction & Settings Presets',
      desc: 'Customize automatic timeouts and shipping standards aligned with SDRS v2.2 "Default Registry D20" requirements.',
      cancelMinLabel: 'Order Auto Cancel Timeout (Minutes)',
      cartTtlLabel: 'Unchecked Cart Items Lifespan (Days)',
      firstWtLabel: 'SF Express Standard First 1KG Carriage (HK$)',
      extraWtLabel: 'SF Express Extra Carriage Per KG (HK$)',
      thresholdLabel: 'Default Inventory Alert Threshold',
      maxPerItemLabel: 'Max Qty Per Item (D20)',
      maxTotalLabel: 'Max Total Qty Per Order (D20)',
      backupTitle: 'Database Point-In-Time Backup (PITR)',
      backupBtn: 'Manually Trigger Backup',
      backupLogs: 'Recent Backup Log Registry',
      backingUp: 'Generating backup archive...',
      saveBtn: 'Save Settings',
      saving: 'Updating platform parameters...',
    }
  }[locale];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-950 font-display flex items-center gap-2">
          <Settings className="h-5.5 w-5.5 text-neutral-800" />
          {dict.title}
        </h1>
      </div>

      {notif && (
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      {/* Main settings Form grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
          <p className="text-xs text-gray-500 leading-relaxed">
            {dict.desc}
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-semibold text-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label>{dict.cancelMinLabel}</label>
                <input 
                  type="number" 
                  value={cancelMin} 
                  onChange={e => setCancelMin(Number(e.target.value))} 
                  className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" 
                />
              </div>

              <div className="space-y-1.5">
                <label>{dict.cartTtlLabel}</label>
                <input 
                  type="number" 
                  value={cartTtl} 
                  onChange={e => setCartTtl(Number(e.target.value))} 
                  className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" 
                />
              </div>

              <div className="space-y-1.5">
                <label>{dict.firstWtLabel}</label>
                <input 
                  type="number" 
                  value={firstWeight} 
                  onChange={e => setFirstWeight(Number(e.target.value))} 
                  className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" 
                />
              </div>

              <div className="space-y-1.5">
                <label>{dict.extraWtLabel}</label>
                <input 
                  type="number" 
                  value={extraWeight} 
                  onChange={e => setExtraWeight(Number(e.target.value))} 
                  className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" 
                />
              </div>

              <div className="space-y-1.5">
                <label>{dict.thresholdLabel}</label>
                <input 
                  type="number" 
                  value={warnThreshold} 
                  onChange={e => setWarnThreshold(Number(e.target.value))} 
                  className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" 
                />
              </div>
            </div>

            
              <div className="space-y-1.5">
                <label>{dict.maxPerItemLabel}</label>
                <input 
                  type="number" 
                  value={maxPerItem} 
                  onChange={e => setMaxPerItem(Number(e.target.value))} 
                  className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" 
                />
              </div>
              <div className="space-y-1.5">
                <label>{dict.maxTotalLabel}</label>
                <input 
                  type="number" 
                  value={maxTotal} 
                  onChange={e => setMaxTotal(Number(e.target.value))} 
                  className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" 
                />
              </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? dict.saving : dict.saveBtn}
              </button>
            </div>
          </form>
        </div>

        {/* Database backup PITR triggers */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 h-max space-y-5">
          <div className="flex items-center gap-2 text-gray-950 font-bold text-sm">
            <Database className="h-5 w-5 text-neutral-800" />
            {dict.backupTitle}
          </div>

          <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
            {locale === 'zh-HK' 
              ? '支持定點時間點恢復 (PITR)。數據定時同步至安全加密對象存儲。手動觸發可為當前庫存與配置生成靜態鏡像下載。'
              : 'Point-In-Time recovery (PITR) active. Manual snapshot trigger produces local static backup JSON array for quick restore.'}
          </p>

          <button
            disabled={backingUp}
            onClick={handleTriggerBackup}
            className="w-full bg-white border border-neutral-900 hover:bg-neutral-50 text-neutral-900 font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {backingUp ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {backingUp ? dict.backingUp : dict.backupBtn}
          </button>

          {/* List of generated archives */}
          {backupLogs.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {dict.backupLogs}
              </span>
              <div className="divide-y divide-gray-100 bg-white p-3 rounded-xl border border-gray-150 space-y-2">
                {backupLogs.map((log, idx) => (
                  <div key={idx} className="text-[10px] leading-relaxed pt-2 first:pt-0">
                    <span className="font-mono text-gray-600 block truncate">{log.fileUrl}</span>
                    <span className="text-gray-400 font-mono mt-0.5 block">{new Date(log.timestamp).toLocaleTimeString()} ({log.sizeBytes} bytes)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
