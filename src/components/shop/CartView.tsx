import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, CheckSquare, Square, ChevronRight } from 'lucide-react';
import { Locale } from '../../types/index';

interface CartViewProps {
  locale: Locale;
  userId: string;
  onGoToCheckout: () => void;
  onSelectProduct: (id: string) => void;
}

export default function CartView({ locale, userId, onGoToCheckout, onSelectProduct }: CartViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = () => {
    setLoading(true);
    if (!userId) {
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      if (localCart.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      fetch('/api/cart/local-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localItems: localCart })
      })
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
      return;
    }
    
    apiFetch(`/api/cart/${userId}`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const updateItem = (itemId: string, qty?: number, checked?: boolean) => {
    if (!userId && String(itemId).startsWith('local_')) {
      const idx = parseInt(itemId.replace('local_', ''));
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      if (localCart[idx]) {
        if (qty !== undefined) localCart[idx].qty = qty;
        if (checked !== undefined) localCart[idx].checked = checked;
        localStorage.setItem('localCart', JSON.stringify(localCart));
        fetchCart();
      }
      return;
    }
    apiFetch(`/api/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty, checked })
    })
    .then(res => res.json())
    .then(() => fetchCart())
    .catch(e => console.error(e));
  };

  const deleteItem = (itemId: string) => {
    if (!userId && String(itemId).startsWith('local_')) {
      const idx = parseInt(itemId.replace('local_', ''));
      let localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      localCart.splice(idx, 1);
      localStorage.setItem('localCart', JSON.stringify(localCart));
      fetchCart();
      return;
    }
    apiFetch(`/api/cart/items/${itemId}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(() => fetchCart())
    .catch(e => console.error(e));
  };


  const handleSelectAll = (checked: boolean) => {
    if (!userId) {
      let localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      localCart = localCart.map((i: any) => ({ ...i, checked }));
      localStorage.setItem('localCart', JSON.stringify(localCart));
      fetchCart();
      return;
    }
    apiFetch('/api/cart/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check', itemIds: items.map(i => i.id), checked })
    })
    .then(() => fetchCart())
    .catch(e => console.error(e));
  };

  const handleDeleteSelected = () => {
    if (!userId) {
      let localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      localCart = localCart.filter((i: any) => i.checked === false);
      localStorage.setItem('localCart', JSON.stringify(localCart));
      fetchCart();
      return;
    }
    
    const selectedIds = items.filter(i => i.checked).map(i => i.id);
    if (selectedIds.length === 0) return;
    
    apiFetch('/api/cart/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', itemIds: selectedIds })
    })
    .then(() => fetchCart())
    .catch(e => console.error(e));
  };

  const selectedItems = items.filter(i => i.checked);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  
  // Calculate pricing totals directly
  const totalOriginalCents = selectedItems.reduce((sum, item) => {
    const originalPrice = item.spec.priceOriginalCents || item.product.priceOriginalCents;
    return sum + (originalPrice * item.qty);
  }, 0);

  const totalAfterCents = selectedItems.reduce((sum, item) => {
    const sellingPrice = item.spec.priceAfterCents || item.spec.priceOriginalCents || item.product.priceAfterCents || item.product.priceOriginalCents;
    return sum + (sellingPrice * item.qty);
  }, 0);

  const totalSavingsCents = totalOriginalCents - totalAfterCents;

  const dict = {
    'zh-HK': {
      title: '我的購物車',
      empty: '購物車目前是空的。去逛逛吧！',
      original: '原價小計',
      savings: '促銷省下',
      selectedTotal: '已勾選總額',
      checkout: '前往結算',
      qtyLimit: '已達購買上限',
      outOfStock: '無庫存可用',
      deleteTip: '刪除商品',
    },
    'en': {
      title: 'My Shopping Cart',
      empty: 'Your cart is empty. Go find some deals!',
      original: 'Original Subtotal',
      savings: 'Promo Savings',
      selectedTotal: 'Subtotal After Promo',
      checkout: 'Checkout Now',
      qtyLimit: 'Max Limit Reached',
      outOfStock: 'Out of Stock',
      deleteTip: 'Delete item',
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
      <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
          <ShoppingBag className="h-5.5 w-5.5 text-amber-500" />
          {dict.title} ({items.length})
        </h1>
        {items.length > 0 && (
          <div className="flex items-center gap-4 text-sm font-semibold">
            <button 
              onClick={() => handleSelectAll(!allSelected)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {allSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
              {locale === 'zh-HK' ? '全選' : 'Select All'}
            </button>
            <button 
              onClick={handleDeleteSelected}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-1 text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {locale === 'zh-HK' ? '刪除已選' : 'Delete Selected'}
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">{dict.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List of items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={item.id}
                className="bg-white p-4 rounded-xl border border-gray-150 flex gap-4 transition-all hover:border-gray-300"
              >
                {/* Checkbox */}
                <button
                  onClick={() => updateItem(item.id, undefined, !item.checked)}
                  className="text-gray-400 hover:text-neutral-950 flex items-center shrink-0"
                >
                  {item.checked ? (
                    <CheckSquare className="h-5.5 w-5.5 text-neutral-950" />
                  ) : (
                    <Square className="h-5.5 w-5.5" />
                  )}
                </button>

                {/* Product Thumbnail */}
                <div 
                  onClick={() => onSelectProduct(item.product.id)}
                  className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0 cursor-pointer"
                >
                  <img src={item.product.images[0]} alt={item.product.nameZh} className="w-full h-full object-cover" />
                </div>

                {/* Core description block */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 
                      onClick={() => onSelectProduct(item.product.id)}
                      className="text-xs font-bold text-gray-950 hover:text-amber-600 cursor-pointer line-clamp-1"
                    >
                      {locale === 'zh-HK' ? item.product.nameZh : item.product.nameEn}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">
                      {locale === 'zh-HK' ? item.spec.specNameZh : item.spec.specNameEn}
                    </p>
                  </div>

                  {/* Pricing and Adjusters */}
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-amber-600">
                        HK${((item.spec.priceAfterCents || item.product.priceAfterCents) / 100).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={item.qty <= 1}
                        onClick={() => updateItem(item.id, item.qty - 1)}
                        className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono text-gray-950">
                        {item.qty}
                      </span>
                      <button
                        disabled={item.qty >= Math.min(5, item.availableStock)}
                        onClick={() => updateItem(item.id, item.qty + 1)}
                        className="w-7 h-7 border border-gray-200 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trash Deletion */}
                <button
                  onClick={() => deleteItem(item.id)}
                  title={dict.deleteTip}
                  className="text-gray-400 hover:text-red-500 flex items-center shrink-0 self-start p-1"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Pricing Summary Sidepanel */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 h-max space-y-5">
            <h2 className="text-base font-bold text-gray-950 font-display">
              {locale === 'zh-HK' ? '結算小計' : 'Order Summary'}
            </h2>

            <div className="space-y-3.5 border-b border-gray-200 pb-4">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{dict.original}</span>
                <span className="font-mono">HK${(totalOriginalCents / 100).toFixed(2)}</span>
              </div>
              {totalSavingsCents > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>{dict.savings}</span>
                  <span className="font-mono font-bold">-HK${(totalSavingsCents / 100).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-bold text-gray-950">{dict.selectedTotal}</span>
              <span className="text-xl font-black text-amber-600 font-display">
                HK${(totalAfterCents / 100).toFixed(2)}
              </span>
            </div>

            <button
              disabled={selectedItems.length === 0}
              onClick={onGoToCheckout}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {dict.checkout}
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
