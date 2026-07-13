import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { FileText, Search, Truck, DollarSign, Ban, Check, X, ShieldAlert, Edit } from 'lucide-react';
import { Locale } from '../../types/index.ts';

interface AdminOrdersProps {
  locale: Locale;
}

export default function AdminOrders({ locale }: AdminOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchNo, setSearchNo] = useState('');

  // SF Express tracking input panel
  const [selectedOrderIdForTracking, setSelectedOrderIdForTracking] = useState<string | null>(null);
  const [trackingNo, setTrackingNo] = useState('');

  // Price adjustments panel (改價 D20/SDRS §6.2)
  const [selectedOrderIdForPrice, setSelectedOrderIdForPrice] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  const [notif, setNotif] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    apiFetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleShip = (orderId: string) => {
    if (!trackingNo) return;
    apiFetch(`/api/admin/orders/${orderId}/ship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNo })
    })
    .then(res => res.json())
    .then(() => {
      setSelectedOrderIdForTracking(null);
      setTrackingNo('');
      setNotif(locale === 'zh-HK' ? '訂單已發貨，順豐單號已記錄。' : 'Order marked shipped with SF Express tracking.');
      fetchOrders();
      setTimeout(() => setNotif(null), 3000);
    });
  };

  const handleAdjustPrice = (orderId: string) => {
    apiFetch(`/api/admin/orders/${orderId}/price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newTotalCents: newPrice,
        adminUsername: 'admin'
      })
    })
    .then(res => res.json())
    .then(() => {
      setSelectedOrderIdForPrice(null);
      setNotif(locale === 'zh-HK' ? '改價成功！審計日誌已寫入。' : 'Price adjusted. Audit trail registered.');
      fetchOrders();
      setTimeout(() => setNotif(null), 3000);
    });
  };

  const handleApprovePayment = (orderId: string) => {
    apiFetch(`/api/admin/orders/${orderId}/approve-payment`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        setNotif(locale === 'zh-HK' ? '匯款憑證審核通過，訂單已確認。' : 'Bank transfer approved. Stock released.');
        fetchOrders();
        setTimeout(() => setNotif(null), 3000);
      });
  };

  const handleRejectPayment = (orderId: string) => {
    apiFetch(`/api/admin/orders/${orderId}/reject-payment`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        setNotif(locale === 'zh-HK' ? '已駁回匯款憑證，已通知顧客重傳。' : 'Bank transfer rejected.');
        fetchOrders();
        setTimeout(() => setNotif(null), 3000);
      });
  };

  const handleCloseOrder = (orderId: string) => {
    apiFetch(`/api/admin/orders/${orderId}/close`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        setNotif(locale === 'zh-HK' ? '訂單已關閉，鎖定庫存已釋放。' : 'Order closed. Stock released.');
        fetchOrders();
        setTimeout(() => setNotif(null), 3000);
      });
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesNo = !searchNo || o.orderNo.includes(searchNo);
    return matchesStatus && matchesNo;
  });

  const dict = {
    'zh-HK': {
      title: '訂單履約與管理',
      filterAll: '全部訂单',
      filterPending: '待付款',
      filterPaid: '待發貨 (已付)',
      filterShipped: '已發貨在途',
      filterCompleted: '已完成',
      filterCancelled: '已取消',
      searchPlaceholder: '輸入訂單號搜尋...',
      orderNoCol: '訂單號',
      userCol: '顧客',
      amountCol: '金額小計',
      payMethodCol: '支付方式',
      logisticsCol: '物流單號',
      actionCol: '履約操作',
      voucherReviewTitle: '銀行匯款憑證待審核',
      voucherReviewMsg: '顧客已上傳ATM/網銀付款憑證，請財務核對無誤後批准。',
      reviewApprove: '核准通過',
      reviewReject: '駁回憑證',
      closeBtn: '取消/關單',
      shipBtn: '順豐發貨',
      adjustPriceBtn: '改價',
      adjustFormTitle: '修改訂單應付總額 (改價)',
      shipFormTitle: '錄入順豐速運運單號',
    },
    'en': {
      title: 'Orders Fulfillment Desk',
      filterAll: 'All Orders',
      filterPending: 'Pending Pay',
      filterPaid: 'Paid (Awaiting Ship)',
      filterShipped: 'Shipped',
      filterCompleted: 'Completed',
      filterCancelled: 'Cancelled',
      searchPlaceholder: 'Search order number...',
      orderNoCol: 'Order No',
      userCol: 'Buyer',
      amountCol: 'Total Due',
      payMethodCol: 'Method',
      logisticsCol: 'Logistics No',
      actionCol: 'Fulfillment',
      voucherReviewTitle: 'Pending Bank Voucher Audit',
      voucherReviewMsg: 'The buyer uploaded an ATM slip or screenshot. Verify bank statement before approving.',
      reviewApprove: 'Approve',
      reviewReject: 'Reject',
      closeBtn: 'Cancel Order',
      shipBtn: 'SF Ship',
      adjustPriceBtn: 'Adjust Price',
      adjustFormTitle: 'Adjust Order Total (Cents)',
      shipFormTitle: 'Enter SF Express Waybill',
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
          <FileText className="h-5.5 w-5.5 text-neutral-800" />
          {dict.title}
        </h1>
      </div>

      {notif && (
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs animate-fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      <button onClick={() => {
        
    const csv = 'OrderID,Status,UserId,TotalCents,CreatedAt\n' + orders.map(o => `"${o.id}","${o.status}","${o.userId}","${o.grandTotalCents}","${o.createdAt}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

      }} className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-800 absolute right-6 top-6">
        {locale === 'zh-HK' ? '匯出報表' : 'Export CSV'}
      </button>
      {/* Filter and search bars */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-gray-50/50 p-4 rounded-xl border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: dict.filterAll },
            { id: 'pending_payment', label: dict.filterPending },
            { id: 'paid', label: dict.filterPaid },
            { id: 'shipped', label: dict.filterShipped },
            { id: 'completed', label: dict.filterCompleted },
            { id: 'cancelled', label: dict.filterCancelled }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === tab.id
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder={dict.searchPlaceholder}
            value={searchNo}
            onChange={e => setSearchNo(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Modal - Price adjustment */}
      {selectedOrderIdForPrice && (
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-4 animate-fade-in">
          <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
            <DollarSign className="h-4 w-4" />
            {dict.adjustFormTitle}
          </h3>
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              value={newPrice / 100} 
              onChange={e => setNewPrice(Math.round(Number(e.target.value) * 100))}
              className="border border-amber-200 bg-white p-2.5 rounded-lg text-xs font-bold font-mono text-gray-950 w-44" 
            />
            <button onClick={() => handleAdjustPrice(selectedOrderIdForPrice)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg">
              {locale === 'zh-HK' ? '確認改價並記錄審計' : 'Save'}
            </button>
            <button onClick={() => setSelectedOrderIdForPrice(null)} className="border border-amber-200 hover:bg-amber-100 text-amber-800 text-xs font-bold px-4 py-2.5 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal - SF Express shipping Waybill */}
      {selectedOrderIdForTracking && (
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 space-y-4 animate-fade-in">
          <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Truck className="h-4.5 w-4.5" />
            {dict.shipFormTitle}
          </h3>
          <div className="flex items-center gap-3">
            <input 
              type="text" 
              placeholder="e.g. SF123456789"
              value={trackingNo} 
              onChange={e => setTrackingNo(e.target.value)}
              className="border border-blue-200 bg-white p-2.5 rounded-lg text-xs font-mono text-gray-950 w-52" 
            />
            <button onClick={() => handleShip(selectedOrderIdForTracking)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg">
              {locale === 'zh-HK' ? '確認順豐發貨' : 'Ship'}
            </button>
            <button onClick={() => setSelectedOrderIdForTracking(null)} className="border border-blue-200 hover:bg-blue-100 text-blue-800 text-xs font-bold px-4 py-2.5 rounded-lg">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Orders queue Grid table */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">{dict.orderNoCol}</th>
                <th className="p-4">{dict.userCol}</th>
                <th className="p-4">{dict.amountCol}</th>
                <th className="p-4">{dict.payMethodCol}</th>
                <th className="p-4">{dict.logisticsCol}</th>
                <th className="p-4 text-right">{dict.actionCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                    No orders matching this criterion.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-gray-950 font-mono block">{order.orderNo}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {order.userEmail}
                    </td>
                    <td className="p-4 font-mono font-bold text-gray-950">
                      HK${(order.totalCents / 100).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className="text-gray-900 block font-bold uppercase text-[10px]">{order.paymentStatus}</span>
                      <span className="text-[10px] text-gray-400 block uppercase mt-0.5">{order.shippingMethod}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-blue-600">
                      {order.trackingNo || '--'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-end">
                        {/* Pending payment 改價 and cancellation */}
                        {order.status === 'pending_payment' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedOrderIdForPrice(order.id);
                                setNewPrice(order.totalCents);
                              }}
                              className="border border-amber-300 text-amber-700 hover:bg-amber-50 text-[10px] px-2 py-1 rounded font-bold"
                            >
                              {dict.adjustPriceBtn}
                            </button>
                            <button
                              onClick={() => handleCloseOrder(order.id)}
                              className="border border-red-200 text-red-500 hover:bg-red-50 text-[10px] px-2 py-1 rounded font-bold"
                            >
                              {dict.closeBtn}
                            </button>
                          </div>
                        )}

                        {/* Paid orders shipment triggers */}
                        {order.status === 'paid' && (
                          <button
                            onClick={() => {
                              setSelectedOrderIdForTracking(order.id);
                              setTrackingNo('');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded-lg font-bold flex items-center gap-1"
                          >
                            <Truck className="h-3 w-3" />
                            {dict.shipBtn}
                          </button>
                        )}

                        {/* Bank Transfer Receipt reviews */}
                        {order.paymentStatus === 'pending_review' && (
                          <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 space-y-2 text-right">
                            <span className="text-[10px] font-bold text-amber-800 block text-center uppercase tracking-wider">{dict.voucherReviewTitle}</span>
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleApprovePayment(order.id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] px-2.5 py-1 rounded font-bold flex items-center gap-0.5"
                              >
                                <Check className="h-3 w-3" /> {dict.reviewApprove}
                              </button>
                              <button
                                onClick={() => handleRejectPayment(order.id)}
                                className="bg-red-500 hover:bg-red-600 text-white text-[9px] px-2.5 py-1 rounded font-bold flex items-center gap-0.5"
                              >
                                <X className="h-3 w-3" /> {dict.reviewReject}
                              </button>
                            </div>
                          </div>
                        )}

                        {order.status === 'completed' && (
                          <span className="text-emerald-600 text-[10px] font-bold uppercase">FULFILLED</span>
                        )}

                        {order.status === 'cancelled' && (
                          <span className="text-gray-400 text-[10px] font-bold uppercase">CLOSED</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
