import React, { useState, useEffect } from 'react';
import { Tag, PlusCircle, AlertCircle, Percent, Check, Calendar } from 'lucide-react';
import { Locale, Category, FullReduction } from '../../types/index.ts';

interface AdminMarketingProps {
  locale: Locale;
}

export default function AdminMarketing({ locale }: AdminMarketingProps) {
  const [reductions, setReductions] = useState<FullReduction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for Full Reduction Addition
  const [showAddForm, setShowAddForm] = useState(false);
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [threshold, setThreshold] = useState(20000); // HK$200
  const [reduction, setReduction] = useState(3000);   // HK$30
  const [stackable, setStackable] = useState(false);
  const [scope, setScope] = useState<'all' | 'category'>('all');
  const [categoryId, setCategoryId] = useState('');

  const [notif, setNotif] = useState<string | null>(null);

  const fetchCampaigns = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/admin/settings').then(res => res.json()) // we read reductions or defaults
    ])
    .then(([cats, settings]) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);

      // Simple fetch campaigns mock
      fetch('/api/checkout/preview', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [] }) // we can extract static rules from server files or local presets
      });

      // Load static preset reductions since they are simulated
      setReductions([
        { id: 'fr_1', nameZh: '零食食品專區滿$80減$20', nameEn: 'Snacks & Food Section Buy $80 Save $20', thresholdCents: 8000, reductionCents: 2000, stackable: false, scope: 'category', categoryId: 'cat_3', startAt: new Date().toISOString(), endAt: new Date(Date.now()+864000000).toISOString(), status: 'active' },
        { id: 'fr_2', nameZh: '全店狂歡滿$250減$30', nameEn: 'Storewide Mega Sale Spend $250 Save $30', thresholdCents: 25000, reductionCents: 3000, stackable: false, scope: 'all', startAt: new Date().toISOString(), endAt: new Date(Date.now()+864000000).toISOString(), status: 'active' },
        { id: 'fr_3', nameZh: '全店大促加疊滿$200減$10', nameEn: 'Storewide Extra Stackable $200 Save $10', thresholdCents: 20000, reductionCents: 1000, stackable: true, scope: 'all', startAt: new Date().toISOString(), endAt: new Date(Date.now()+864000000).toISOString(), status: 'active' }
      ]);

      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleAddReduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameZh || !nameEn) return;

    const newRule: FullReduction = {
      id: `fr_custom_${Date.now()}`,
      nameZh,
      nameEn,
      thresholdCents: threshold,
      reductionCents: reduction,
      stackable,
      scope,
      categoryId: scope === 'category' ? categoryId : undefined,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 864000000).toISOString(),
      status: 'active'
    };

    setReductions([newRule, ...reductions]);
    setShowAddForm(false);
    setNotif(locale === 'zh-HK' ? '滿減活動發布成功！' : 'Full Reduction campaign scheduled.');
    setNameZh('');
    setNameEn('');
    setTimeout(() => setNotif(null), 3000);
  };

  const dict = {
    'zh-HK': {
      title: '促銷與滿減管理',
      addBtn: '新建滿減活動',
      reductionList: '當前生效中的滿減規則',
      rulesTip: '系統採用「最優單條」多規則算法。凡未標記「可疊加」的規則，系統自動挑選對消費者減免金額最大的一條生效。標記「可疊加」的規則，則可在此基礎上累加扣減。',
      thresholdCol: '門檻金額',
      reductionCol: '減免金額',
      stackableCol: '疊加標籤',
      scopeCol: '適用範圍',
      formTitle: '建立全新滿減規則',
      nameZhLabel: '滿減繁中描述',
      nameEnLabel: '滿減英文描述',
      thresholdLabel: '達標門檻 (分 - cents)',
      reductionLabel: '減免金額 (分 - cents)',
      stackableLabel: '是否允許與其它滿減規則疊加',
      scopeLabel: '滿減範圍',
      allShop: '全店適用',
      catShop: '指定類別適用',
      submitBtn: '立即生效',
    },
    'en': {
      title: 'Promotions & Full Reductions',
      addBtn: 'Create Campaign',
      reductionList: 'Active Full Reduction Schemes',
      rulesTip: 'The system resolves overlapping discounts. Standard rules are exclusive (maximizing buyer discount); stackable rules can be combined on top of standard ones.',
      thresholdCol: 'Spend Threshold',
      reductionCol: 'Discount Cents',
      stackableCol: 'Stackable',
      scopeCol: 'Applies to',
      formTitle: 'Launch New Campaign Scheme',
      nameZhLabel: 'Chinese Campaign Label',
      nameEnLabel: 'English Campaign Label',
      thresholdLabel: 'Spend Threshold (Cents)',
      reductionLabel: 'Discount Value (Cents)',
      stackableLabel: 'Allow stacking with other active campaigns',
      scopeLabel: 'Campaign Scope',
      allShop: 'Storewide',
      catShop: 'Categorized Specifics',
      submitBtn: 'Activate Scheme',
    }
  }[locale];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-950 font-display flex items-center gap-2">
          <Tag className="h-5.5 w-5.5 text-neutral-800" />
          {dict.title}
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          {dict.addBtn}
        </button>
      </div>

      {notif && (
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs animate-fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      {/* Rules policy alert bar */}
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-2.5 text-xs text-amber-800 leading-relaxed font-semibold">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
        <p>{dict.rulesTip}</p>
      </div>

      {/* Campaign creator form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm animate-fade-in">
          <h2 className="text-sm font-bold text-gray-950 font-display mb-4 border-b pb-2">
            {dict.formTitle}
          </h2>

          <form onSubmit={handleAddReduction} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
            <div className="space-y-1.5">
              <label>{dict.nameZhLabel}</label>
              <input type="text" required value={nameZh} onChange={e => setNameZh(e.target.value)} className="w-full border p-2.5 rounded-lg text-gray-950 font-medium" />
            </div>

            <div className="space-y-1.5">
              <label>{dict.nameEnLabel}</label>
              <input type="text" required value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full border p-2.5 rounded-lg text-gray-950 font-medium" />
            </div>

            <div className="space-y-1.5">
              <label>{locale === 'zh-HK' ? '達標門檻 (HK$ 元)' : 'Threshold Value (HK$)'}</label>
              <input type="number" required value={threshold / 100} onChange={e => setThreshold(Math.round(Number(e.target.value) * 100))} className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" />
            </div>

            <div className="space-y-1.5">
              <label>{locale === 'zh-HK' ? '減免金額 (HK$ 元)' : 'Discount Value (HK$)'}</label>
              <input type="number" required value={reduction / 100} onChange={e => setReduction(Math.round(Number(e.target.value) * 100))} className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" />
            </div>

            <div className="space-y-1.5">
              <label>{dict.scopeLabel}</label>
              <select value={scope} onChange={e => setScope(e.target.value as any)} className="w-full border p-2.5 rounded-lg text-gray-950 bg-white font-medium">
                <option value="all">{dict.allShop}</option>
                <option value="category">{dict.catShop}</option>
              </select>
            </div>

            {scope === 'category' && (
              <div className="space-y-1.5">
                <label>{dict.catShop}</label>
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
              <label htmlFor="stackable_chk" className="text-xs font-semibold text-gray-700 cursor-pointer">{dict.stackableLabel}</label>
            </div>

            <div className="md:col-span-2 pt-2 flex gap-3">
              <button type="submit" className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-xl">
                {dict.submitBtn}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Active campaigns grid */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-950 font-display">
            {dict.reductionList}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">{locale === 'zh-HK' ? '描述 / 詳情' : 'Campaign Descriptions'}</th>
                <th className="p-4">{dict.thresholdCol}</th>
                <th className="p-4">{dict.reductionCol}</th>
                <th className="p-4">{dict.stackableCol}</th>
                <th className="p-4">{dict.scopeCol}</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {reductions.map(rule => (
                <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 max-w-xs">
                    <span className="font-bold text-gray-950 block">{locale === 'zh-HK' ? rule.nameZh : rule.nameEn}</span>
                  </td>
                  <td className="p-4 font-mono font-bold text-gray-900">
                    HK${(rule.thresholdCents / 100).toFixed(2)}
                  </td>
                  <td className="p-4 font-mono font-bold text-amber-600">
                    -HK${(rule.reductionCents / 100).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.stackable ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rule.stackable ? 'STACKABLE' : 'EXCLUSIVE'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-gray-500">
                    {rule.scope === 'all' ? 'Storewide' : (categories.find(c => c.id === rule.categoryId)?.nameZh || 'Categorized')}
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase">
                      <Percent className="h-3 w-3" />
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
