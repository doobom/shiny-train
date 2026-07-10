import React, { useState, useEffect } from 'react';
import { CreditCard, BadgeCheck, Clock, FileText, Upload, RefreshCw } from 'lucide-react';
import { Locale } from '../../types/index.ts';

interface PaymentViewProps {
  orderId: string;
  locale: Locale;
  onPaymentSuccess: () => void;
}

export default function PaymentView({ orderId, locale, onPaymentSuccess }: PaymentViewProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [voucherUrl, setVoucherUrl] = useState('');
  const [status, setStatus] = useState<string>('pending');

  const fetchOrder = () => {
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setStatus(data.payment?.status || 'pending');
        setLoading(false);

        if (data.payment?.status === 'paid') {
          onPaymentSuccess();
        }
      })
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchOrder();

    // Auto polling for payment updates
    const timer = setInterval(() => {
      fetch(`/api/payments/${orderId}/poll`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'paid') {
            clearInterval(timer);
            onPaymentSuccess();
          } else {
            setStatus(data.status);
          }
        })
        .catch(e => console.error(e));
    }, 4000);

    return () => clearInterval(timer);
  }, [orderId]);

  const triggerInstantPayment = () => {
    // Simulated instant success for online channels (FPS / PayMe / AlipayHK)
    fetch(`/api/payments/${orderId}/charge`, {
      method: 'POST'
    })
    .then(res => res.json())
    .then(() => fetchOrder())
    .catch(e => console.error(e));
  };

  const uploadReceiptPlaceholder = () => {
    setUploading(true);
    setTimeout(() => {
      const mockUrl = `https://api.apcube.com/receipts/mock_voucher_${Date.now()}.png`;
      fetch(`/api/payments/${orderId}/voucher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voucherUrl: mockUrl })
      })
      .then(res => res.json())
      .then(() => {
        setUploading(false);
        setVoucherUrl(mockUrl);
        fetchOrder();
      })
      .catch(e => {
        console.error(e);
        setUploading(false);
      });
    }, 1500);
  };

  const dict = {
    'zh-HK': {
      title: '訂單付款',
      totalDue: '應付總額',
      statusPending: '待付款',
      statusReview: '憑證審核中',
      statusPaid: '支付成功',
      statusFailed: '支付失敗',
      fpsTitle: '轉數快 (FPS) 掃碼付款',
      fpsTip: '請使用手機銀行或電子錢包，掃描下方二維碼完成付款。付款後系統將自動跳轉。',
      paymeTitle: 'PayMe 快捷付款',
      paymeTip: '請掃描二維碼或點擊按鈕跳轉至 PayMe App 完成交易。',
      bankTitle: '線下銀行櫃台 / 網銀轉賬',
      bankDetails: '收款銀行：香港上海匯豐銀行 (HSBC)\n戶口名稱：APCUBE DEPARTMENT STORE LIMITED\n港幣戶口號碼：123-456789-001',
      bankTip: '轉賬完成後，請在下方上傳「匯款收據/ATM憑證截圖」供我們財務審核。審核通常在1個工作日內完成。',
      uploadBtn: '模擬上傳付款憑證',
      uploading: '正在上傳憑證...',
      simulationPaid: '【模擬】一鍵在線付款成功',
      uploadedSuccess: '憑證上傳成功！等待管理員審核。',
    },
    'en': {
      title: 'Invoice Payment',
      totalDue: 'Total Due',
      statusPending: 'Pending Payment',
      statusReview: 'Reviewing Voucher',
      statusPaid: 'Payment Succeeded',
      statusFailed: 'Payment Failed',
      fpsTitle: 'FPS Faster Payment Scanner',
      fpsTip: 'Open your mobile banking app and scan the QR code to finish paying. The page redirects automatically.',
      paymeTitle: 'PayMe Direct Checkout',
      paymeTip: 'Scan the QR code or tap the link to transition into your PayMe application.',
      bankTitle: 'HSBC Offline Bank Transfer',
      bankDetails: 'Bank Name: HSBC Hong Kong\nAccount Holder: APCUBE DEPARTMENT STORE LIMITED\nHKD Account No.: 123-456789-001',
      bankTip: 'Please upload a screenshot of your ATM slip or online receipt below. Our financial desk processes auditing within 1 working day.',
      uploadBtn: 'Simulate Receipt Upload',
      uploading: 'Uploading screenshot...',
      simulationPaid: '【MOCK】Simulate Instant Gateway Pay Success',
      uploadedSuccess: 'Receipt uploaded successfully! Awaiting admin audit.',
    }
  }[locale];

  if (loading || !order) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  const isBankTransfer = order.payment?.method === 'bank_transfer';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="border-b border-gray-100 pb-4 text-center">
        <h1 className="text-xl font-bold text-gray-900 font-display">
          {dict.title}
        </h1>
        <p className="text-xs text-gray-400 mt-1">Order No: {order.orderNo}</p>
      </div>

      {/* Pricing Header panel */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 text-center space-y-2">
        <span className="text-xs text-white/60 font-semibold uppercase tracking-wider block">
          {dict.totalDue}
        </span>
        <h2 className="text-3xl font-black font-display text-amber-400">
          HK${(order.totalCents / 100).toFixed(2)}
        </h2>

        {/* Dynamic status Pill */}
        <div className="pt-2 flex justify-center">
          {status === 'pending' ? (
            <span className="inline-flex items-center gap-1 bg-white/10 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold">
              <Clock className="h-3.5 w-3.5" />
              {dict.statusPending}
            </span>
          ) : status === 'pending_review' ? (
            <span className="inline-flex items-center gap-1 bg-white/10 text-sky-300 text-xs px-3 py-1 rounded-full font-semibold">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              {dict.statusReview}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-white/10 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold">
              <BadgeCheck className="h-3.5 w-3.5" />
              {dict.statusPaid}
            </span>
          )}
        </div>
      </div>

      {/* Payment Details Container */}
      <div className="bg-white p-6 rounded-xl border border-gray-150 space-y-6">
        {isBankTransfer ? (
          // HSBC Offline Bank Transfer Interface
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-amber-500" />
              {dict.bankTitle}
            </h3>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs font-mono text-gray-700 whitespace-pre-line leading-relaxed">
              {dict.bankDetails}
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              {dict.bankTip}
            </p>

            {/* Simulated file upload button */}
            {status === 'pending' && (
              <button
                disabled={uploading}
                onClick={uploadReceiptPlaceholder}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {uploading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? dict.uploading : dict.uploadBtn}
              </button>
            )}

            {status === 'pending_review' && (
              <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl text-sky-800 text-xs">
                {dict.uploadedSuccess}
              </div>
            )}
          </div>
        ) : (
          // QR codes interfaces for FPS, PayMe, AlipayHK
          <div className="space-y-5 text-center">
            <h3 className="text-sm font-bold text-gray-950 flex items-center justify-center gap-2">
              <CreditCard className="h-4.5 w-4.5 text-amber-500" />
              {order.payment?.method === 'fps' ? dict.fpsTitle : dict.paymeTitle}
            </h3>

            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              {order.payment?.method === 'fps' ? dict.fpsTip : dict.paymeTip}
            </p>

            {/* Dummy scan visualizer */}
            {status === 'pending' && (
              <div className="space-y-4 pt-2">
                <div className="w-40 h-40 bg-gray-100 border border-gray-200 mx-auto rounded-xl flex items-center justify-center p-3">
                  {/* Visual simulated QR */}
                  <div className="w-full h-full bg-neutral-950 rounded p-1 border-4 border-white flex flex-wrap content-start">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1/4 h-1/4 border-2 border-neutral-950 ${
                          (i % 3 === 0 || i % 5 === 1) ? 'bg-white' : 'bg-neutral-900'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={triggerInstantPayment}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                >
                  {dict.simulationPaid}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
