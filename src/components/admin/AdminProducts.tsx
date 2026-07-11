import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { ShoppingBag, PlusCircle, AlertTriangle, Edit, RefreshCw, BadgeCheck, Trash2 } from 'lucide-react';
import { Locale, Category } from '../../types/index.ts';

interface AdminProductsProps {
  locale: Locale;
}

export default function AdminProducts({ locale }: AdminProductsProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form togglers & state
  const [showAddForm, setShowAddForm] = useState(false);
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [originalCents, setOriginalCents] = useState(10000); // HK$100.00
  const [afterCents, setAfterCents] = useState(8000);       // HK$80.00
  const [specNameZh, setSpecNameZh] = useState('標準規格');
  const [specNameEn, setSpecNameEn] = useState('Standard Option');
  const [initialStock, setInitialStock] = useState(100);
  const [warnThreshold, setWarnThreshold] = useState(15);

  // Quick stock edit panel
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [quickStock, setQuickStock] = useState<number>(0);
  const [quickThreshold, setQuickThreshold] = useState<number>(15);

  const [notif, setNotif] = useState<string | null>(null);

  const fetchCatalog = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/categories').then(res => res.json()),
      apiFetch('/api/admin/products').then(res => res.json())
    ])
    .then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    
    try {
      // Need a way to pass authorization token
      const token = localStorage.getItem('jwt_token');
      const res = await apiFetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameZh || !nameEn) return;

    const payload = {
      nameZh,
      nameEn,
      priceOriginalCents: originalCents,
      priceAfterCents: afterCents,
      categoryId,
      specs: [
        {
          specNameZh,
          specNameEn,
          stock: initialStock,
          warnThreshold
        }
      ]
    };

    apiFetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      setNotif(locale === 'zh-HK' ? '商品發布成功！' : 'Product launched successfully!');
      setShowAddForm(false);
      setNameZh('');
      setNameEn('');
      setImageUrl('');
      fetchCatalog();
      setTimeout(() => setNotif(null), 3000);
    })
    .catch(e => console.error(e));
  };

  const handleUpdateStock = (skuId: string) => {
    apiFetch(`/api/admin/inventory/${skuId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock: quickStock,
        warnThreshold: quickThreshold
      })
    })
    .then(res => res.json())
    .then(() => {
      setEditingSkuId(null);
      setNotif(locale === 'zh-HK' ? '庫存更新成功！' : 'Stock updated successfully!');
      fetchCatalog();
      setTimeout(() => setNotif(null), 3000);
    })
    .catch(e => console.error(e));
  };

  const toggleShelf = (productId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'on_shelf' ? 'off_shelf' : 'on_shelf';
    apiFetch(`/api/admin/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    })
    .then(res => res.json())
    .then(() => {
      fetchCatalog();
    })
    .catch(e => console.error(e));
  };

  const dict = {
    'zh-HK': {
      title: '商品與庫存管理',
      addBtn: '新增上架商品',
      lowStockTitle: '庫存預警警報',
      lowStockMsg: '以下商品規格的現有庫存已低於警戒閾值，請及時補貨。',
      productList: '商品目錄清單',
      catLabel: '類別',
      stockCol: '現有庫存 / 鎖定',
      statusCol: '狀態',
      actionCol: '操作',
      onShelf: '已上架',
      offShelf: '已下架',
      toggleShelfOn: '上架',
      toggleShelfOff: '下架',
      formTitle: '錄入全新商品',
      titleZh: '商品繁中名稱',
      titleEn: '商品英文名稱',
      originalPrice: '原價 (分 - 港幣 cents)',
      salePrice: '現價 (分 - 港幣 cents)',
      specZh: '初始規格繁中名稱',
      specEn: '初始規格英文名稱',
      initialQty: '初始庫存量',
      threshold: '警戒預警閾值',
      submitBtn: '發布並上架',
      quickEditTitle: '快速調整庫存',
    },
    'en': {
      title: 'Catalog & Inventory Control',
      addBtn: 'Add New Product',
      lowStockTitle: 'Stock Alert Desk',
      lowStockMsg: 'The following item configurations have stocks running below warn thresholds.',
      productList: 'System Product Catalog',
      catLabel: 'Category',
      stockCol: 'Stock (Total / Locked)',
      statusCol: 'Status',
      actionCol: 'Actions',
      onShelf: 'On Shelf',
      offShelf: 'Draft/Off',
      toggleShelfOn: 'Publish',
      toggleShelfOff: 'Unpublish',
      formTitle: 'Launch New Product',
      titleZh: 'Traditional Chinese Name',
      titleEn: 'English Product Name',
      originalPrice: 'Original Price (Cents)',
      salePrice: 'Selling Price (Cents)',
      specZh: 'Initial Spec Chinese Name',
      specEn: 'Initial Spec English Name',
      initialQty: 'Initial Stock Qty',
      threshold: 'Stock Warning Threshold',
      submitBtn: 'Launch & Publish',
      quickEditTitle: 'Quick Stock Adjustment',
    }
  }[locale];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  // Identify low stocks
  const lowStockItems: any[] = [];
  products.forEach(p => {
    p.specs?.forEach((s: any) => {
      const threshold = s.warnThreshold || 15;
      if (s.stock <= threshold) {
        lowStockItems.push({
          productName: locale === 'zh-HK' ? p.nameZh : p.nameEn,
          specName: locale === 'zh-HK' ? s.specNameZh : s.specNameEn,
          skuId: s.id,
          stock: s.stock,
          threshold
        });
      }
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-950 font-display flex items-center gap-2">
          <ShoppingBag className="h-5.5 w-5.5 text-neutral-800" />
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
          <BadgeCheck className="h-4 w-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      {/* Low Stock alarms banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl space-y-3.5">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            {dict.lowStockTitle} ({lowStockItems.length})
          </div>
          <p className="text-xs text-red-700/80">
            {dict.lowStockMsg}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {lowStockItems.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  setEditingSkuId(item.skuId);
                  setQuickStock(item.stock);
                  setQuickThreshold(item.threshold);
                }}
                className="bg-white p-3 rounded-xl border border-red-150 flex justify-between items-center text-xs cursor-pointer hover:border-red-400 transition-colors"
              >
                <div>
                  <span className="font-bold text-gray-950 block truncate max-w-[200px]">{item.productName}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{item.specName}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black font-mono text-red-600">{item.stock}</span>
                  <span className="text-gray-400 text-[10px] block mt-0.5">Alert &lt;= {item.threshold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Launch new product Form panel */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm animate-fade-in">
          <h2 className="text-sm font-bold text-gray-950 font-display mb-4 border-b pb-2">
            {dict.formTitle}
          </h2>

          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
            <div className="space-y-1.5">
              <label>{dict.titleZh}</label>
              <input type="text" required value={nameZh} onChange={e => setNameZh(e.target.value)} className="w-full border p-2.5 rounded-lg font-medium text-gray-950" />
            </div>

            <div className="space-y-1.5">
              <label>{dict.titleEn}</label>
              <input type="text" required value={nameEn} onChange={e => setNameEn(e.target.value)} className="w-full border p-2.5 rounded-lg font-medium text-gray-950" />
            </div>

            <div className="space-y-1.5">
              <label>{dict.catLabel}</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border p-2.5 rounded-lg font-medium text-gray-950 bg-white">
                {categories.map(c => <option key={c.id} value={c.id}>{locale === 'zh-HK' ? c.nameZh : c.nameEn}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label>{locale === 'zh-HK' ? '原價 (HK$ 元)' : 'Original Price (HK$)'}</label>
              <input type="number" required value={originalCents / 100} onChange={e => setOriginalCents(Math.round(Number(e.target.value) * 100))} className="w-full border p-2.5 rounded-lg font-medium text-gray-950 font-mono" />
            </div>

            <div className="space-y-1.5">
              <label>{locale === 'zh-HK' ? '現價 (HK$ 元)' : 'Selling Price (HK$)'}</label>
              <input type="number" required value={afterCents / 100} onChange={e => setAfterCents(Math.round(Number(e.target.value) * 100))} className="w-full border p-2.5 rounded-lg font-medium text-gray-950 font-mono" />
            </div>

            <div className="space-y-1.5">
              <label>{dict.specZh}</label>
              <input type="text" required value={specNameZh} onChange={e => setSpecNameZh(e.target.value)} className="w-full border p-2.5 rounded-lg font-medium text-gray-950" />
            </div>

            <div className="space-y-1.5">
              <label>{dict.specEn}</label>
              <input type="text" required value={specNameEn} onChange={e => setSpecNameEn(e.target.value)} className="w-full border p-2.5 rounded-lg font-medium text-gray-950" />
            </div>

            <div className="space-y-1.5">
              <label>{dict.initialQty}</label>
              <input type="number" required value={initialStock} onChange={e => setInitialStock(Number(e.target.value))} className="w-full border p-2.5 rounded-lg font-medium text-gray-950 font-mono" />
            </div>

            <div className="space-y-1.5">
              <label>{dict.threshold}</label>
              <input type="number" required value={warnThreshold} onChange={e => setWarnThreshold(Number(e.target.value))} className="w-full border p-2.5 rounded-lg font-medium text-gray-950 font-mono" />
            </div>

            <div className="md:col-span-2 pt-2 flex gap-3">
              <button type="submit" className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold px-6 py-2.5 rounded-xl">
                {dict.submitBtn}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl">
                {locale === 'zh-HK' ? '取消' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick stock adjustment modal */}
      {editingSkuId && (
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-4 animate-fade-in">
          <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Edit className="h-4 w-4" />
            {dict.quickEditTitle}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-amber-800">
            <div className="space-y-1">
              <label className="text-[10px] text-amber-700 uppercase tracking-wider block">Stock Level</label>
              <input 
                type="number" 
                value={quickStock} 
                onChange={e => setQuickStock(Number(e.target.value))}
                className="border border-amber-200 bg-white p-2 rounded-lg w-28 font-mono text-gray-950" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-amber-700 uppercase tracking-wider block">Warn Threshold</label>
              <input 
                type="number" 
                value={quickThreshold} 
                onChange={e => setQuickThreshold(Number(e.target.value))}
                className="border border-amber-200 bg-white p-2 rounded-lg w-28 font-mono text-gray-950" 
              />
            </div>

            <div className="pt-5 flex gap-2">
              <button 
                onClick={() => handleUpdateStock(editingSkuId)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg"
              >
                {locale === 'zh-HK' ? '保存更改' : 'Save'}
              </button>
              <button 
                onClick={() => setEditingSkuId(null)}
                className="border border-amber-200 hover:bg-amber-100 text-amber-800 px-4 py-2 rounded-lg"
              >
                {locale === 'zh-HK' ? '取消' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main product listings */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-950 font-display">
            {dict.productList}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">{locale === 'zh-HK' ? '產品名稱' : 'Product Name'}</th>
                <th className="p-4">{dict.catLabel}</th>
                <th className="p-4">SKU / {dict.stockCol}</th>
                <th className="p-4">{dict.statusCol}</th>
                <th className="p-4 text-right">{dict.actionCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {products.map(prod => (
                <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 max-w-xs">
                    <span className="font-bold text-gray-950 block truncate">{locale === 'zh-HK' ? prod.nameZh : prod.nameEn}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">HK${(prod.priceAfterCents/100).toFixed(2)}</span>
                  </td>
                  <td className="p-4 text-gray-500 font-bold">
                    {categories.find(c => c.id === prod.categoryId)?.nameZh || 'Direct'}
                  </td>
                  <td className="p-4 space-y-1">
                    {prod.specs?.map((spec: any) => (
                      <div 
                        key={spec.id} 
                        onClick={() => {
                          setEditingSkuId(spec.id);
                          setQuickStock(spec.stock);
                          setQuickThreshold(spec.warnThreshold || 15);
                        }}
                        className="flex justify-between items-center p-1.5 rounded bg-gray-50 hover:bg-amber-50 cursor-pointer border border-transparent hover:border-amber-200"
                        title="Click to quickly adjust stock"
                      >
                        <span className="text-[10px] text-gray-600 line-clamp-1 max-w-[120px]">
                          {locale === 'zh-HK' ? spec.specNameZh : spec.specNameEn}
                        </span>
                        <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">
                          {spec.stock} <span className="text-[9px] text-gray-400">/ {spec.lockedStock}</span>
                        </span>
                      </div>
                    ))}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      prod.status === 'on_shelf' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {prod.status === 'on_shelf' ? dict.onShelf : dict.offShelf}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleShelf(prod.id, prod.status)}
                      className="border border-neutral-200 hover:border-neutral-950 hover:bg-neutral-50 text-neutral-800 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      {prod.status === 'on_shelf' ? dict.toggleShelfOff : dict.toggleShelfOn}
                    </button>
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
