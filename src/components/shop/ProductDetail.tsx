import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, ShieldAlert, BadgeCheck, Share2, AlertCircle } from 'lucide-react';
import { Locale, ProductSpec } from '../../types/index.ts';

interface ProductDetailProps {
  productId: string;
  locale: Locale;
  userId: string | null;
  onBack: () => void;
  onRequestLogin: () => void;
  onAddToCart: () => void;
  onInstantBuy: (skuId: string, qty: number) => void;
}

export default function ProductDetail({ 
  productId, locale, userId, onBack, onRequestLogin, onAddToCart, onInstantBuy 
}: ProductDetailProps) {
  const [product, setProduct] = useState<any>(null);
  const [selectedSpec, setSelectedSpec] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'shipping'>('desc');
  const [activeImage, setActiveImage] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) return;
        setProduct(data);
        if (data.specs && data.specs.length > 0) {
          setSelectedSpec(data.specs[0]);
        }
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        }
      })
      .catch(e => console.error(e));
  }, [productId]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  const dict = {
    'zh-HK': {
      back: '返回商城',
      specLabel: '商品規格',
      stockLabel: '庫存狀態',
      available: '有貨',
      lowStock: '僅餘少量',
      outOfStock: '已售罄',
      qtyLabel: '購買數量',
      addToCart: '加入購物車',
      buyNow: '立即購買',
      descTab: '商品詳情',
      shippingTab: '配送與售後',
      authRequired: '請先登入後才能購買。',
      addedToCart: '成功加入購物車！',
      limitExceeded: '購買數量超出限購規定 (每單限購5件)。',
      sfDesc: '本商品默認使用順豐快遞發貨，支持全港配送。16:00前完成付款的訂單均為當天發貨。',
    },
    'en': {
      back: 'Back to Shop',
      specLabel: 'Product Specification',
      stockLabel: 'Stock Status',
      available: 'In Stock',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
      qtyLabel: 'Quantity',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      descTab: 'Details',
      shippingTab: 'Delivery & Policy',
      authRequired: 'Please login to make purchases.',
      addedToCart: 'Successfully added to cart!',
      limitExceeded: 'Quantity exceeds single order purchase limits (Max 5 units).',
      sfDesc: 'This item ships via SF Express with trackable services across Hong Kong. Paid before 16:00 ships same day.',
    }
  }[locale];

  const handleAddToCart = () => {
    if (quantity > 5) {
      setErr(dict.limitExceeded);
      return;
    }

    if (!userId) {
      // Local Cart
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const existing = localCart.find((i: any) => i.skuId === selectedSpec.id);
      if (existing) {
        existing.qty += quantity;
      } else {
        localCart.push({
          skuId: selectedSpec.id,
          qty: quantity,
          addedAt: new Date().toISOString()
        });
      }
      localStorage.setItem('localCart', JSON.stringify(localCart));
      setNotification(dict.addedToCart);
      onAddToCart();
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    if (quantity > 5) {
      setErr(dict.limitExceeded);
      return;
    }

    apiFetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        skuId: selectedSpec.id,
        qty: quantity
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setNotification(dict.addedToCart);
        onAddToCart();
        setTimeout(() => setNotification(null), 3000);
      } else {
        setErr(data.message);
      }
    })
    .catch(e => console.error(e));
  };

  const handleInstantBuy = () => {
    if (quantity > 5) {
      setErr(dict.limitExceeded);
      return;
    }
    onInstantBuy(selectedSpec.id, quantity);
  };

  const isOutOfStock = !selectedSpec || selectedSpec.availableStock <= 0;
  const isLowStock = selectedSpec && selectedSpec.availableStock > 0 && selectedSpec.availableStock <= 5;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-neutral-950 font-medium transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        {dict.back}
      </button>

      {/* Notifications and Error boundaries */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm animate-fade-in">
          <BadgeCheck className="h-4 w-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm animate-fade-in">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          <span>{err}</span>
          <button onClick={() => setErr(null)} className="ml-auto font-bold opacity-60">×</button>
        </div>
      )}

      {/* Product Information columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images display */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <img 
              src={activeImage} 
              alt={product.nameZh} 
              className="w-full h-full object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === img ? 'border-neutral-950' : 'border-transparent bg-gray-50'
                  }`}
                >
                  <img src={img} alt="Spec variant" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Configurations */}
        <div className="flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 font-display leading-snug">
                {locale === 'zh-HK' ? product.nameZh : product.nameEn}
              </h1>
            </div>

            {/* Slashed Prices */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black text-amber-600 font-display">
                  HK${((selectedSpec ? selectedSpec.priceAfterCents : product.priceAfterCents) / 100).toFixed(2)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  HK${((selectedSpec ? selectedSpec.priceOriginalCents : product.priceOriginalCents) / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Specs selector */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {dict.specLabel}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {product.specs.map((spec: any) => (
                  <button
                    key={spec.id}
                    onClick={() => {
                      setSelectedSpec(spec);
                      setQuantity(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedSpec?.id === spec.id
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {locale === 'zh-HK' ? spec.specNameZh : spec.specNameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time stock counts */}
            {selectedSpec && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  {dict.stockLabel}
                </span>
                <div className="flex items-center gap-2">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {dict.outOfStock}
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {dict.lowStock} ({locale === 'zh-HK' ? '僅餘' : 'Only'} {selectedSpec.availableStock} {locale === 'zh-HK' ? '件' : 'left'})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {dict.available}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quantity adjustment */}
            {!isOutOfStock && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  {dict.qtyLabel}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(quantity - 1)}
                    className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-gray-950 font-mono">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= Math.min(5, selectedSpec?.availableStock || 5)}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action triggers */}
          <div className="mt-8 flex gap-3.5">
            <button
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 border border-neutral-900 text-neutral-900 hover:bg-neutral-50 font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-4 w-4" />
              {dict.addToCart}
            </button>
            <button
              disabled={isOutOfStock}
              onClick={handleInstantBuy}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {dict.buyNow}
            </button>
          </div>
        </div>
      </div>

      {/* Details Description tabs ( purifications and compliant styles ) */}
      <div className="border-t border-gray-100 pt-8 mt-12">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'desc' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {dict.descTab}
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3.5 text-sm font-semibold border-b-2 ml-8 transition-colors ${
              activeTab === 'shipping' ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {dict.shippingTab}
          </button>
        </div>

        {activeTab === 'desc' ? (
          <div className="prose max-w-none text-gray-700 text-sm leading-relaxed">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: locale === 'zh-HK' ? product.descriptionZh : product.descriptionEn 
              }} 
            />
          </div>
        ) : (
          <div className="text-gray-700 text-sm leading-relaxed space-y-4">
            <p className="font-medium text-gray-950">{dict.sfDesc}</p>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-xs">
              {locale === 'zh-HK' 
                ? '根據香港消委會指引，本品支持收到貨品後14天內在未拆封狀態下無條件退換，運費需自理。詳情請諮詢在線客服。'
                : 'Under HK Consumer Council code, unsealed items are returnable within 14 days. Customer pays return carriage.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
