import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Tag, PlusCircle, AlertCircle, Percent, Check, Calendar, Trash2 } from 'lucide-react';
import { Locale, Category } from '../../types/index';

interface AdminMarketingProps {
  locale: Locale;
}

export default function AdminMarketing({ locale }: AdminMarketingProps) {


  const dict = {
    'zh-HK': {
      reductionsTab: '滿減活動',
      couponsTab: '優惠碼',
      addReduction: '添加滿減',
      addCoupon: '添加優惠碼',
      nameZh: '中文名稱',
      nameEn: '英文名稱',
      threshold: '門檻金額',
      reductionValue: '減免金額',
      stackable: '可疊加使用',
      scope: '適用範圍',
      allProducts: '所有商品',
      specificCategory: '特定分類',
      category: '分類',
      couponCode: '優惠碼',
      type: '類型',
      fixedAmount: '固定金額 (分)',
      percentage: '百分比折扣 (%)',
      value: '折扣數值',
      minOrder: '最低訂單金額 (選填) (分)',
      save: '儲存',
      cancel: '取消',
      active: '啟用中',
      inactive: '已停用',
      thresholdFormat: '滿 $',
      reduceFormat: '減 $',
      offFormat: '% OFF',
      minOrderFormat: '最低訂單: $',
      noMinOrder: '無門檻',
      descriptions: '描述',
      action: '操作',
      yes: '是',
      no: '否',
      storewide: '全店',
      code: '代碼',
      allowStacking: '允許疊加',
      none: '無',
      noCouponCodes: '尚未配置優惠碼',
    },
    'en': {
      reductionsTab: 'Full Reductions',
      couponsTab: 'Coupons',
      addReduction: 'Add Reduction',
      addCoupon: 'Add Coupon',
      nameZh: 'Name (ZH)',
      nameEn: 'Name (EN)',
      threshold: 'Threshold',
      reductionValue: 'Reduction Value',
      stackable: 'Stackable',
      scope: 'Scope',
      allProducts: 'All Products',
      specificCategory: 'Specific Category',
      category: 'Category',
      couponCode: 'Coupon Code',
      type: 'Type',
      fixedAmount: 'Fixed Amount (Cents)',
      percentage: 'Percentage (%)',
      value: 'Value',
      minOrder: 'Min Order Value (Optional) (Cents)',
      save: 'Save',
      cancel: 'Cancel',
      active: 'Active',
      inactive: 'Inactive',
      thresholdFormat: 'Spend $',
      reduceFormat: 'Get $ off',
      offFormat: '% OFF',
      minOrderFormat: 'Min Order: $',
      noMinOrder: 'No Min Order',
      descriptions: 'Descriptions',
      action: 'Action',
      yes: 'YES',
      no: 'NO',
      storewide: 'Storewide',
      code: 'Code',
      allowStacking: 'Allow stacking',
      none: 'None',
      noCouponCodes: 'No coupon codes configured',
    }
  }[locale];
  const [activeTab, setActiveTab] = useState<'reductions' | 'coupons'>('reductions');
  const [reductions, setReductions] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Full Reduction Addition
  const [showAddReduction, setShowAddReduction] = useState(false);
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [threshold, setThreshold] = useState(20000);
  const [reductionValue, setReductionValue] = useState(3000);
  const [stackable, setStackable] = useState(false);
  const [scope, setScope] = useState<'all' | 'category'>('all');
  const [categoryId, setCategoryId] = useState('');

  // Form states for Coupons
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('fixed');
  const [couponValue, setCouponValue] = useState(0);
  const [couponMinOrder, setCouponMinOrder] = useState(0);

  const [notif, setNotif] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, redRes, discRes] = await Promise.all([
        apiFetch('/api/categories').then(r => r.json()),
        apiFetch('/api/admin/reductions').then(r => r.json()),
        apiFetch('/api/admin/discounts').then(r => r.json()).catch(() => []) // fallback if not array
      ]);
      setCategories(catsRes || []);
      if (catsRes && catsRes.length > 0) setCategoryId(catsRes[0].id);
      setReductions(redRes || []);
      setDiscounts(discRes.success && Array.isArray(discRes.discounts) ? discRes.discounts : (Array.isArray(discRes) ? discRes : []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddReduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameZh || !nameEn) return;
    const payload = {
      nameZh, nameEn, thresholdCents: threshold, reductionCents: reductionValue,
      stackable, scope, categoryId: scope === 'category' ? categoryId : null, status: 'active'
    };
    await apiFetch('/api/admin/reductions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setNotif('Full reduction scheme activated');
    setShowAddReduction(false);
    fetchData();
    setTimeout(() => setNotif(null), 3000);
  };

  const handleDeleteReduction = async (id: string) => {
    if (!confirm('Delete this scheme?')) return;
    await apiFetch('/api/admin/reductions/' + id, { method: 'DELETE' });
    fetchData();
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    const payload = {
      code: couponCode,
      type: couponType,
      value: couponValue,
      minOrderValueCents: couponMinOrder,
      active: true
    };
    await apiFetch('/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setNotif('Coupon code added');
    setShowAddCoupon(false);
    setCouponCode('');
    fetchData();
    setTimeout(() => setNotif(null), 3000);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await apiFetch('/api/admin/discounts/' + id, { method: 'DELETE' });
    fetchData();
  };

  if (loading) return <div className="p-8 text-center text-sm font-bold text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-950 font-display flex items-center gap-2">
          <Tag className="h-5.5 w-5.5 text-neutral-800" />
          {locale === 'zh-HK' ? '營銷管理' : 'Marketing Admin'}
        </h1>
      </div>

      <div className="flex gap-4 border-b border-gray-100 mb-6">
        <button 
          onClick={() => setActiveTab('reductions')} 
          className={`pb-2 px-1 text-sm font-bold ${activeTab === 'reductions' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-gray-400 hover:text-gray-600'}`}
        >
          {dict.reductionsTab}
        </button>
        <button 
          onClick={() => setActiveTab('coupons')} 
          className={`pb-2 px-1 text-sm font-bold ${activeTab === 'coupons' ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-gray-400 hover:text-gray-600'}`}
        >
          {dict.couponsTab}
        </button>
      </div>

      {notif && (
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs animate-fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      {activeTab === 'reductions' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddReduction(!showAddReduction)}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" /> {dict.addReduction}
            </button>
          </div>
          {showAddReduction && (
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm animate-fade-in">
              <h2 className="text-sm font-bold text-gray-950 font-display mb-4 border-b pb-2">{dict.addReduction}</h2>
              <form onSubmit={handleAddReduction} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                <div className="space-y-1.5">
                  <label>{dict.nameZh}</label>
                  <input type="text" required value={nameZh} onChange={e => setNameZh(e.target.value)} className="w-full border p-2.5 rounded-lg text-gray-950 font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label>{dict.nameEn}</label>
                  <input type="text" required value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full border p-2.5 rounded-lg text-gray-950 font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label>{dict.threshold} (HK$)</label>
                  <input type="number" required value={threshold / 100} onChange={e => setThreshold(Math.round(Number(e.target.value) * 100))} className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label>{dict.reductionValue} (HK$)</label>
                  <input type="number" required value={reductionValue / 100} onChange={e => setReductionValue(Math.round(Number(e.target.value) * 100))} className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label>{dict.scope}</label>
                  <select value={scope} onChange={e => setScope(e.target.value as any)} className="w-full border p-2.5 rounded-lg text-gray-950 bg-white font-medium">
                    <option value="all">{dict.allProducts}</option>
                    <option value="category">{dict.specificCategory}</option>
                  </select>
                </div>
                {scope === 'category' && (
                  <div className="space-y-1.5">
                    <label>{dict.category}</label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border p-2.5 rounded-lg text-gray-950 bg-white font-medium">
                      {categories.map(c => <option key={c.id} value={c.id}>{locale === 'zh-HK' ? c.nameZh : c.nameEn}</option>)}
                    </select>
                  </div>
                )}
                <div className="md:col-span-2 flex items-center gap-2 py-2">
                  <input 
                    type="checkbox" 
                    id="stackable_chk" 
                    checked={stackable} 
                    onChange={e => setStackable(e.target.checked)} 
                    className="w-4 h-4 rounded text-neutral-900 border-gray-300 focus:ring-neutral-900"
                  />
                  <label htmlFor="stackable_chk" className="text-xs font-semibold text-gray-700 cursor-pointer">{dict.allowStacking}</label>
                </div>
                <div className="md:col-span-2 pt-2 flex gap-3">
                  <button type="submit" className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-xl">{dict.save}</button>
                  <button type="button" onClick={() => setShowAddReduction(false)} className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl">{dict.cancel}</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="p-4">{dict.descriptions}</th>
                    <th className="p-4">{dict.threshold}</th>
                    <th className="p-4">{dict.reductionValue}</th>
                    <th className="p-4">{dict.stackable}</th>
                    <th className="p-4">{dict.scope}</th>
                    <th className="p-4 text-right">{dict.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {reductions.map(rule => (
                    <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4"><span className="font-bold text-gray-950 block">{locale === 'zh-HK' ? rule.nameZh : rule.nameEn}</span></td>
                      <td className="p-4 font-mono font-bold text-gray-900">HK${(rule.thresholdCents / 100).toFixed(2)}</td>
                      <td className="p-4 font-mono font-bold text-amber-600">-HK${(rule.reductionCents / 100).toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rule.stackable ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {rule.stackable ? dict.yes : dict.no}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-500">{rule.scope === 'all' ? dict.storewide : dict.category}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteReduction(rule.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddCoupon(!showAddCoupon)}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" /> {dict.addCoupon}
            </button>
          </div>

          {showAddCoupon && (
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm animate-fade-in">
              <h2 className="text-sm font-bold text-gray-950 font-display mb-4 border-b pb-2">{dict.addCoupon}</h2>
              <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                <div className="space-y-1.5">
                  <label>{dict.couponCode}</label>
                  <input type="text" required value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="w-full border p-2.5 rounded-lg text-gray-950 font-medium uppercase" />
                </div>
                <div className="space-y-1.5">
                  <label>{dict.type}</label>
                  <select value={couponType} onChange={e => setCouponType(e.target.value as any)} className="w-full border p-2.5 rounded-lg text-gray-950 bg-white font-medium">
                    <option value="fixed">{dict.fixedAmount}</option>
                    <option value="percentage">{dict.percentage}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label>{dict.value}</label>
                  <input type="number" required value={couponValue} onChange={e => setCouponValue(Number(e.target.value))} className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label>{dict.minOrder}</label>
                  <input type="number" value={couponMinOrder} onChange={e => setCouponMinOrder(Number(e.target.value))} className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" />
                </div>
                <div className="md:col-span-2 pt-2 flex gap-3">
                  <button type="submit" className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-xl">{dict.save}</button>
                  <button type="button" onClick={() => setShowAddCoupon(false)} className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl">{dict.cancel}</button>
                </div>
              </form>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="p-4">{dict.code}</th>
                    <th className="p-4">{dict.type}</th>
                    <th className="p-4">{dict.value}</th>
                    <th className="p-4">{dict.minOrder}</th>
                    <th className="p-4">{dict.active}</th>
                    <th className="p-4 text-right">{dict.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {discounts.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4"><span className="font-bold text-gray-950 font-mono tracking-wider bg-gray-100 px-2 py-1 rounded">{d.code}</span></td>
                      <td className="p-4 uppercase text-[10px]">{d.type}</td>
                      <td className="p-4 font-mono font-bold text-amber-600">
                        {d.type === 'percentage' ? `${d.value}%` : `-HK${(d.value / 100).toFixed(2)}`}
                      </td>
                      <td className="p-4 font-mono text-gray-500">{d.minOrderValueCents ? `HK${(d.minOrderValueCents / 100).toFixed(2)}` : dict.none}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                          {d.active ? dict.yes : dict.no}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteCoupon(d.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {discounts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">{dict.noCouponCodes}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}