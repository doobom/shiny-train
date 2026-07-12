import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';

import { ShoppingBag, PlusCircle, AlertTriangle, Edit, RefreshCw, BadgeCheck, Trash2, Tag, Layers, CheckSquare } from 'lucide-react';
import { Locale, Category } from '../../types/index.ts';

interface AdminProductsProps {
  locale: Locale;
}

export default function AdminProducts({ locale }: AdminProductsProps) {
  const [activeTab, setActiveTab] = useState<'products'|'categories'|'warnings'>('products');
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Product State ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descriptionZh, setDescriptionZh] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [originalCents, setOriginalCents] = useState(10000); // HK$100.00
  const [afterCents, setAfterCents] = useState(8000);       // HK$80.00
  const [specNameZh, setSpecNameZh] = useState('標準規格');
  const [specNameEn, setSpecNameEn] = useState('Standard Option');
  const [initialStock, setInitialStock] = useState(100);
  const [warnThreshold, setWarnThreshold] = useState(15);
  
  const [editingSkuId, setEditingSkuId] = useState<string | null>(null);
  const [quickStock, setQuickStock] = useState<number>(0);
  const [quickThreshold, setQuickThreshold] = useState<number>(15);
  
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  // --- Category State ---
  const [newCatZh, setNewCatZh] = useState('');
  const [newCatEn, setNewCatEn] = useState('');

  const [notif, setNotif] = useState<string | null>(null);

  const fetchCatalog = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/api/categories').then(res => res.json()),
      apiFetch('/api/admin/products').then(res => res.json()),
      apiFetch('/api/admin/inventory/warnings').then(res => res.json().catch(() => ({ warnings: [] })))
    ])
    .then(([cats, prods, warns]) => {
      setCategories(cats || []);
      setProducts(prods || []);
      if (warns && warns.warnings) setWarnings(warns.warnings);
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
      nameZh, nameEn, descriptionZh, descriptionEn, priceOriginalCents: originalCents, priceAfterCents: afterCents,
      categoryId, imageUrls: imageUrl ? [imageUrl] : [],
      specs: [{ specNameZh, specNameEn, stock: initialStock, warnThreshold }]
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
      fetchCatalog();
      setTimeout(() => setNotif(null), 3000);
    });
  };

  const handleUpdateStock = (skuId: string) => {
    apiFetch(`/api/admin/inventory/${skuId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: quickStock, warnThreshold: quickThreshold })
    })
    .then(res => res.json())
    .then(() => {
      setNotif(locale === 'zh-HK' ? '庫存已更新' : 'Inventory updated');
      setEditingSkuId(null);
      fetchCatalog();
      setTimeout(() => setNotif(null), 3000);
    });
  };

  const toggleShelf = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'on_shelf' ? 'off_shelf' : 'on_shelf';
    apiFetch(`/api/admin/products/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    }).then(() => fetchCatalog());
  };
  
  const handleBatchDiscount = () => {
    if (!selectedProductIds.length) return;
    const discountStr = prompt(locale === 'zh-HK' ? '输入折扣百分比 (例如输入10表示打9折)' : 'Enter discount percentage (e.g. 10 for 10% off)');
    if (!discountStr) return;
    const discountPercent = Number(discountStr);
    if (isNaN(discountPercent) || discountPercent <= 0 || discountPercent > 100) return alert('Invalid discount');
    apiFetch('/api/admin/products/batch-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: selectedProductIds, discountPercent })
    }).then(() => {
      setNotif(locale === 'zh-HK' ? '批量折扣设置成功' : 'Batch discount applied');
      setSelectedProductIds([]);
      fetchCatalog();
      setTimeout(() => setNotif(null), 3000);
    });
  };

  const handleBatchStatus = (status: 'on_shelf' | 'off_shelf') => {
    if (!selectedProductIds.length) return;
    apiFetch('/api/admin/products/batch-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: selectedProductIds, status })
    })
    .then(() => {
      setNotif(locale === 'zh-HK' ? '批量操作完成' : 'Batch action completed');
      setSelectedProductIds([]);
      fetchCatalog();
      setTimeout(() => setNotif(null), 3000);
    });
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatZh) return;
    apiFetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nameZh: newCatZh, nameEn: newCatEn || newCatZh, sort: categories.length })
    })
    .then(() => {
      setNewCatZh('');
      setNewCatEn('');
      fetchCatalog();
    });
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm('Are you sure?')) return;
    apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' }).then(() => fetchCatalog());
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-950 font-display flex items-center gap-2">
          <ShoppingBag className="h-5.5 w-5.5 text-neutral-800" />
          {locale === 'zh-HK' ? '商品與類目管理' : 'Catalog Management'}
        </h1>
      </div>

      {notif && (
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs animate-fade-in">
          <BadgeCheck className="h-4 w-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      {/* Internal Tabs */}
      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'products' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Tag className="inline-block w-3.5 h-3.5 mr-1" /> {locale === 'zh-HK' ? '商品列表' : 'Products'}
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Layers className="inline-block w-3.5 h-3.5 mr-1" /> {locale === 'zh-HK' ? '類目設置' : 'Categories'}
        </button>
        <button 
          onClick={() => setActiveTab('warnings')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'warnings' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'}`}
        >
          <AlertTriangle className="inline-block w-3.5 h-3.5 mr-1" /> {locale === 'zh-HK' ? '庫存預警' : 'Stock Alerts'} 
          {warnings.length > 0 && <span className="ml-1.5 bg-white text-red-600 px-1.5 py-0.5 rounded-full text-[9px]">{warnings.length}</span>}
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div className="flex gap-2">
              <button 
                onClick={() => handleBatchStatus('on_shelf')}
                disabled={selectedProductIds.length === 0}
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 text-xs font-bold px-3 py-2 rounded-lg"
              >
                {locale === 'zh-HK' ? '批量上架' : 'Batch Publish'}
              </button>
              <button 
                onClick={() => handleBatchStatus('off_shelf')}
                disabled={selectedProductIds.length === 0}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 text-xs font-bold px-3 py-2 rounded-lg"
              >
                {locale === 'zh-HK' ? '批量下架' : 'Batch Unpublish'}
              </button>
            </div>
            <div className="flex gap-2">
            <label className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                if(!e.target.files?.length) return;
                const formData = new FormData();
                formData.append('file', e.target.files[0]);
                setLoading(true);
                const res = await apiFetch('/api/admin/products/import', { method: 'POST', body: formData });
                await res.json();
                setLoading(false);
                fetchCatalog();
              }} />
              {locale === 'zh-HK' ? '匯入' : 'Import'}
            </label>
            <button onClick={() => {
              const csv = 'ID,NameZh,NameEn,CategoryId,PriceOriginal,PriceAfter,Status\n' + products.map(p => `"${p.id}","${p.nameZh}","${p.nameEn}","${p.categoryId}","${p.priceOriginalCents}","${p.priceAfterCents}","${p.status}"`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'products.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5">
              {locale === 'zh-HK' ? '匯出' : 'Export'}
            </button>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-neutral-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {locale === 'zh-HK' ? '發布新商品' : 'Add Product'}
            </button>
          </div>
          </div>

          
          {showAddForm && (
            <form onSubmit={handleCreateProduct} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mb-4 space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Product Name (ZH)</label>
                  <input type="text" required value={nameZh} onChange={e=>setNameZh(e.target.value)} className="w-full border p-2 rounded text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Product Name (EN)</label>
                  <input type="text" required value={nameEn} onChange={e=>setNameEn(e.target.value)} className="w-full border p-2 rounded text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                  <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full border p-2 rounded text-xs bg-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nameZh}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Image URL (or upload)</label>
                  <div className="flex gap-2">
                    <input type="text" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} className="flex-1 border p-2 rounded text-xs" />
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-xs font-bold flex items-center">
                      {isUploading ? '...' : 'Upload'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Description (ZH)</label>
                  <textarea rows={4} value={descriptionZh} onChange={e => setDescriptionZh(e.target.value)} className="w-full border p-2 rounded text-xs bg-white focus:outline-none focus:border-neutral-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Description (EN)</label>
                  <textarea rows={4} value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} className="w-full border p-2 rounded text-xs bg-white focus:outline-none focus:border-neutral-900" />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => { setShowAddForm(false); setEditingProductId(null); }} className="px-4 py-2 text-xs font-bold border rounded-lg text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold bg-gray-900 text-white rounded-lg">{editingProductId ? 'Update' : 'Publish'}</button>
              </div>
            </form>
          )}

          {/* Quick Stock Edit */}
          {editingSkuId && (
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-4">
              <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase">
                <Edit className="h-4 w-4" /> Edit Stock Level
              </h3>
              <div className="flex gap-4">
                <div>
                  <label className="text-[10px] text-amber-700 uppercase block mb-1">Stock</label>
                  <input type="number" value={quickStock} onChange={e => setQuickStock(Number(e.target.value))} className="p-2 rounded border w-24 text-xs font-mono" />
                </div>
                <div>
                  <label className="text-[10px] text-amber-700 uppercase block mb-1">Warn Threshold</label>
                  <input type="number" value={quickThreshold} onChange={e => setQuickThreshold(Number(e.target.value))} className="p-2 rounded border w-24 text-xs font-mono" />
                </div>
                <div className="flex items-end gap-2">
                  <button onClick={() => handleUpdateStock(editingSkuId)} className="bg-amber-600 text-white px-3 py-2 rounded text-xs font-bold">Save</button>
                  <button onClick={() => setEditingSkuId(null)} className="bg-white text-gray-600 px-3 py-2 rounded text-xs font-bold border">Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase">
                  <th className="p-4 w-10">
                    <input 
                      type="checkbox" 
                      onChange={e => setSelectedProductIds(e.target.checked ? products.map(p => p.id) : [])}
                      checked={selectedProductIds.length === products.length && products.length > 0}
                    />
                  </th>
                  <th className="p-4">{locale === 'zh-HK' ? '商品' : 'Product'}</th>
                  <th className="p-4">{locale === 'zh-HK' ? '分類' : 'Category'}</th>
                  <th className="p-4">SKU / Stock</th>
                  <th className="p-4">{locale === 'zh-HK' ? '狀態' : 'Status'}</th>
                  <th className="p-4 text-right">{locale === 'zh-HK' ? '操作' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {products.map(prod => (
                  <tr key={prod.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedProductIds.includes(prod.id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedProductIds([...selectedProductIds, prod.id]);
                          else setSelectedProductIds(selectedProductIds.filter(id => id !== prod.id));
                        }}
                      />
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      <span className="font-bold text-gray-950 block">{locale === 'zh-HK' ? prod.nameZh : prod.nameEn}</span>
                      <span className="text-[10px] text-gray-400">HK${(prod.priceAfterCents/100).toFixed(2)}</span>
                    </td>
                    <td className="p-4 text-gray-500 font-bold">
                      {categories.find(c => c.id === prod.categoryId)?.nameZh || 'Direct'}
                    </td>
                    <td className="p-4 space-y-1">
                      {prod.specs?.map((spec: any) => (
                        <div 
                          key={spec.id} 
                          onClick={() => { setEditingSkuId(spec.id); setQuickStock(spec.stock); setQuickThreshold(spec.warnThreshold || 15); }}
                          className="flex justify-between items-center p-1.5 rounded bg-gray-50 hover:bg-amber-50 cursor-pointer border border-transparent hover:border-amber-200"
                        >
                          <span className="text-[10px] text-gray-600 line-clamp-1">{locale === 'zh-HK' ? spec.specNameZh : spec.specNameEn}</span>
                          <span className="font-mono font-bold text-gray-900 shrink-0 ml-4">{spec.stock}</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${prod.status === 'on_shelf' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {prod.status === 'on_shelf' ? (locale==='zh-HK'?'已上架':'Active') : (locale==='zh-HK'?'未上架':'Hidden')}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleEditProduct(prod)} className="border border-amber-200 hover:bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-1 rounded">
                        {locale === 'zh-HK' ? '編輯' : 'Edit'}
                      </button>
                      <button onClick={() => toggleShelf(prod.id, prod.status)} className="border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-[10px] font-bold px-2 py-1 rounded">
                        {prod.status === 'on_shelf' ? '下架' : '上架'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <form onSubmit={handleAddCategory} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 items-end">
            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Category Name (ZH)</label>
              <input type="text" required value={newCatZh} onChange={e=>setNewCatZh(e.target.value)} className="w-full border border-gray-200 p-2.5 rounded-lg text-xs" />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Category Name (EN)</label>
              <input type="text" required value={newCatEn} onChange={e=>setNewCatEn(e.target.value)} className="w-full border border-gray-200 p-2.5 rounded-lg text-xs" />
            </div>
            <button type="submit" className="bg-gray-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg h-10">Add</button>
          </form>

          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase">
                  <th className="p-4">Name (ZH)</th>
                  <th className="p-4">Name (EN)</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td className="p-4">{cat.nameZh}</td>
                    <td className="p-4">{cat.nameEn}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'warnings' && (
        <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
          {warnings.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm font-bold">No low stock warnings.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-red-50 border-b border-red-100 text-red-800 font-bold uppercase">
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Spec</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {warnings.map((w, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4">{locale === 'zh-HK' ? w.name_zh : w.name_en}</td>
                    <td className="p-4 text-gray-500">{locale === 'zh-HK' ? w.spec_name_zh : w.spec_name_en}</td>
                    <td className="p-4 font-mono font-bold text-red-600">{w.stock}</td>
                    <td className="p-4 font-mono text-gray-400">{w.warn_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
