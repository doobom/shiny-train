import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { CreditCard, Truck, ChevronRight, MessageSquare, AlertCircle, Tag } from 'lucide-react';
import { Locale } from '../../types/index';

interface CheckoutViewProps {
  locale: Locale;
  userId: string;
  onOrderPlaced: (orderId: string) => void;
}

export default function CheckoutView({ locale, userId, onOrderPlaced }: CheckoutViewProps) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [address, setAddress] = useState<any>({
    recipient: '陳小明 Chan Siu Ming',
    phone: '+852 9123 4567',
    detail: '香港九龍尖沙咀彌敦道100號 THE ONE 15樓'
  });
  
  const [selectedPayment, setSelectedPayment] = useState<'fps' | 'payme' | 'alipayhk' | 'bank_transfer'>('fps');
  const [remark, setRemark] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const fetchPreview = (items: any[], code: string) => {
    if (items.length === 0) return;
    const payload = items.map((c: any) => ({ skuId: c.skuId, qty: c.qty }));
    apiFetch('/api/checkout/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: payload, promoCode: code || undefined })
    })
    .then(res => res.json())
    .then(previewData => {
      if (previewData.code || previewData.error) {
        setErr(previewData.message || previewData.error);
        setPromoCode('');
        if (code) {
          // If code was applied and invalid, re-fetch without code to ensure preview is correct
          fetchPreview(items, '');
        }
      } else {
        setPreview(previewData);
        setErr(null);
      }
    })
    .catch(e => console.error(e));
  };

  useEffect(() => {
    // 1. Fetch checked cart items
    apiFetch(`/api/cart/${userId}`)
      .then(res => res.json())
      .then(data => {
        const checked = data.filter((i: any) => i.checked);
        setCartItems(checked);
        if (checked.length > 0) {
          fetchPreview(checked, promoCode);
        }
      });
  }, [userId]);

  const applyPromoCode = () => {
    setErr(null);
    setPromoCode(promoCodeInput);
    fetchPreview(cartItems, promoCodeInput);
  };

  const handleSubmit = () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    setErr(null);

    const payload = {
      userId,
      items: cartItems.map((c: any) => ({ skuId: c.skuId, qty: c.qty })),
      promoCode: promoCode ? promoCode : undefined,
      address: {
        recipient: address.recipient,
        phoneEncrypted: address.phone, // simplicity in preview
        detail: address.detail
      },
      paymentMethod: selectedPayment,
      remark
    };

    apiFetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      setSubmitting(false);
      if (data.success) {
        onOrderPlaced(data.order.id);
      } else {
        setErr(data.message);
      }
    })
    .catch(e => {
      console.error(e);
      setSubmitting(false);
      setErr('Order submission failed. Please try again.');
    });
  };

  const dict = {
    'zh-HK': {
      title: '確認訂單',
      addrSection: '收貨人與地址資訊',
      delivery: '默認物流：順豐速運 (1-2日送達)',
      itemsLabel: '商品清單',
      paymentLabel: '支付方式',
      remarkLabel: '訂單備註 (選填)',
      subtotal: '商品總計',
      discount: '滿減優惠',
      shipping: '運費金額',
      total: '應付總額',
      submit: '確認支付',
      submitting: '正在鎖庫並生成訂單...',
      remarkPlaceholder: '例如：請於下午送貨，門口放箱子等...',
      purchaseLimitTip: '注意：根據香港防刷貨政策，單筆訂單商品總件數不得超過 5 件。',
    },
    'en': {
      title: 'Checkout Confirmation',
      addrSection: 'Recipient & Delivery Address',
      delivery: 'Logistics: SF Express (1-2 Days Deliver)',
      itemsLabel: 'Items in Order',
      paymentLabel: 'Payment Methods',
      remarkLabel: 'Order Remark (Optional)',
      subtotal: 'Items Subtotal',
      discount: 'Discounts',
      shipping: 'Shipping Carriage',
      total: 'Total Due',
      submit: 'Submit Order',
      submitting: 'Securing stocks & generating invoice...',
      remarkPlaceholder: 'E.g., leave at front door, deliver after 3PM...',
      purchaseLimitTip: 'Note: Storewide limits allow max 5 items per transaction.',
    }
  }[locale];

  if (err) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-900 font-medium">{err}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-neutral-900 text-white rounded">Retry</button>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-900 font-display">
          {dict.title}
        </h1>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs">
          <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Recipient details */}
          <div className="bg-white p-5 rounded-xl border border-gray-150 space-y-4">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-amber-500" />
              {dict.addrSection}
            </h3>

            <div className="space-y-1 text-sm bg-gray-50/50 p-4 rounded-lg border border-gray-100">
              <div className="font-semibold text-gray-900">{address.recipient}</div>
              <div className="text-gray-600 font-mono text-xs">{address.phone}</div>
              <div className="text-gray-500 text-xs mt-1">{address.detail}</div>
            </div>

            <p className="text-[10px] text-gray-400 italic">
              {dict.delivery}
            </p>
          </div>

          {/* List of checked products */}
          <div className="bg-white p-5 rounded-xl border border-gray-150 space-y-4">
            <h3 className="text-sm font-bold text-gray-950">
              {dict.itemsLabel} ({cartItems.length})
            </h3>

            <div className="divide-y divide-gray-100">
              {preview.itemDetails.map((detail: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div className="max-w-md">
                    <span className="font-medium text-gray-950 line-clamp-1">
                      {locale === 'zh-HK' ? detail.product.nameZh : detail.product.nameEn}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {locale === 'zh-HK' ? detail.spec.specNameZh : detail.spec.specNameEn}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs text-gray-400">×{detail.qty}</span>
                    <span className="font-mono font-semibold ml-3 block text-gray-950">
                      HK${((detail.unitPriceCents * detail.qty) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment selector */}
          <div className="bg-white p-5 rounded-xl border border-gray-150 space-y-4">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-amber-500" />
              {dict.paymentLabel}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'fps', label: '轉數快 FPS', tag: 'Fast' },
                { id: 'payme', label: 'PayMe', tag: 'Instant' },
                { id: 'alipayhk', label: 'AlipayHK', tag: 'Coupon' },
                { id: 'bank_transfer', label: '銀行戶口轉賬', tag: 'Audit' }
              ].map((pay) => (
                <button
                  key={pay.id}
                  onClick={() => setSelectedPayment(pay.id as any)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedPayment === pay.id
                      ? 'border-neutral-900 bg-neutral-50 shadow-sm ring-1 ring-neutral-900'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-xs font-bold text-gray-900 block">{pay.label}</span>
                  <span className="text-[10px] text-gray-400 mt-1 block">{pay.tag} Transfer</span>
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-white p-5 rounded-xl border border-gray-150 space-y-3">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-amber-500" />
              {dict.remarkLabel}
            </h3>
            <textarea
              placeholder={dict.remarkPlaceholder}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full border border-gray-250 p-3 rounded-lg text-xs focus:outline-none focus:border-neutral-950 min-h-[64px]"
            />
          </div>
        </div>

          {/* Purchase Summary card */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 h-max space-y-6">
          <h2 className="text-base font-bold text-gray-950 font-display">
            {locale === 'zh-HK' ? '結算清單' : 'Pricing Summary'}
          </h2>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={locale === 'zh-HK' ? '輸入優惠碼' : 'Enter Promo Code'}
              value={promoCodeInput}
              onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-250 p-3 rounded-lg text-xs font-mono focus:outline-none focus:border-neutral-950"
            />
            <button
              onClick={applyPromoCode}
              disabled={!promoCodeInput.trim()}
              className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white px-4 py-3 rounded-lg text-xs font-bold transition-colors"
            >
              {locale === 'zh-HK' ? '應用' : 'Apply'}
            </button>
          </div>
          {promoCode && !err && (
            <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
              Promo code <strong>{promoCode}</strong> applied.
            </div>
          )}

          <div className="space-y-3.5 border-b border-gray-200 pb-5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{dict.subtotal}</span>
              <span className="font-mono">HK${(preview.subtotalCents / 100).toFixed(2)}</span>
            </div>
            {preview.discountCents > 0 && (
              <div className="flex justify-between text-xs text-emerald-600">
                <span>{dict.discount}</span>
                <span className="font-mono font-bold">-HK${(preview.discountCents / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>{dict.shipping}</span>
              <span className="font-mono">
                {preview.shippingFeeCents === 0 ? 'FREE' : `HK$${(preview.shippingFeeCents / 100).toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-sm font-bold text-gray-950">{dict.total}</span>
            <span className="text-2xl font-black text-amber-600 font-display">
              HK${(preview.totalCents / 100).toFixed(2)}
            </span>
          </div>

          <p className="text-[10px] text-gray-400 bg-white p-3 rounded-lg border border-gray-100">
            {dict.purchaseLimitTip}
          </p>

          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
          >
            {submitting ? dict.submitting : dict.submit}
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
