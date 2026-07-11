import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { FileText, Search, PlusCircle, HelpCircle, AlertCircle, RefreshCw, Truck, BadgeCheck } from 'lucide-react';
import { Locale, Order, Feedback, FAQ } from '../../types/index.ts';

interface UserProfileProps {
  userId: string;
  locale: Locale;
}

export default function UserProfile({ userId, locale }: UserProfileProps) {
  const token = localStorage.getItem('token') || '';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'tickets' | 'faqs'>('profile');
  const [profileForm, setProfileForm] = useState({ oldPassword: '', newPassword: '', addressRecipient: '', addressPhone: '', addressDetail: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<Feedback[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Help desk Ticket Form States
  const [ticketType, setTicketType] = useState<'inquiry' | 'complaint' | 'suggestion'>('inquiry');
  const [ticketOrderNo, setTicketOrderNo] = useState('');
  const [ticketContent, setTicketContent] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // FAQ search query
  const [faqSearch, setFaqSearch] = useState('');

  const fetchUserData = () => {
    setLoading(true);
    Promise.all([
      apiFetch(`/api/orders/mine/${userId}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      apiFetch(`/api/feedbacks/mine/${userId}`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      apiFetch('/api/faqs', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ])
    .then(([ordersData, ticketsData, faqsData]) => {
      setOrders(ordersData);
      setTickets(ticketsData);
      setFaqs(faqsData);
      setLoading(false);
    })
    .catch(e => {
      console.error(e);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const handleConfirmReceipt = (orderId: string) => {
    apiFetch(`/api/orders/${orderId}/confirm-receipt`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(() => fetchUserData())
      .catch(e => console.error(e));
  };

  const handleCancelOrder = (orderId: string) => {
    apiFetch(`/api/orders/${orderId}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(() => fetchUserData())
      .catch(e => console.error(e));
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketContent) return;

    apiFetch('/api/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        type: ticketType,
        orderId: ticketOrderNo || undefined,
        content: ticketContent
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setFormSuccess(true);
        setTicketContent('');
        setTicketOrderNo('');
        fetchUserData();
        setTimeout(() => setFormSuccess(false), 3000);
      }
    })
    .catch(e => console.error(e));
  };

  const filteredFaqs = faqs.filter(faq => {
    const q = faqSearch.toLowerCase();
    return faq.questionZh.toLowerCase().includes(q) || 
           faq.questionEn.toLowerCase().includes(q) ||
           faq.answerZh.toLowerCase().includes(q) ||
           faq.answerEn.toLowerCase().includes(q);
  });

  const dict = {
    'zh-HK': {
      tabOrders: '我的訂單',
      tabTickets: '售後與反饋',
      tabFaq: '常見問題 FAQ',
      noOrders: '您目前沒有任何訂單記錄。',
      confirmReceipt: '確認收貨',
      cancelOrder: '取消訂單',
      orderNo: '訂單編號',
      paymentStatus: '付款狀態',
      shippingStatus: '配送狀態',
      ticketTitle: '提交反饋或投訴',
      ticketTypeLabel: '問題類型',
      ticketOrderLabel: '關聯訂單號 (選填)',
      ticketContentLabel: '詳細描述',
      ticketSubmit: '提交表單',
      ticketSuccess: '反饋提交成功！客服專員會盡快處理。',
      inquiry: '諮詢',
      complaint: '投訴',
      suggestion: '建議',
      ticketPending: '待處理',
      ticketReplied: '已回覆',
      faqSearchPlaceholder: '搜尋常見物流、退換貨、付款問題...',
      sfTracking: '順豐物流軌跡 (已發貨)',
      sfSorting: '順豐青衣分撥中心 - 正在分揀',
      sfDelivery: '順豐速運專員正在配送中',
      sfSigned: '順豐快遞已簽收 (感謝您的支持！)',
    },
    'en': {
      tabOrders: 'My Orders',
      tabTickets: 'Feedbacks & Support',
      tabFaq: 'FAQ Desk',
      noOrders: 'No order logs registered in your profile.',
      confirmReceipt: 'Confirm Delivery',
      cancelOrder: 'Cancel Order',
      orderNo: 'Order No',
      paymentStatus: 'Payment Status',
      shippingStatus: 'Shipping Status',
      ticketTitle: 'Submit a Support Case',
      ticketTypeLabel: 'Case Category',
      ticketOrderLabel: 'Order Number (Optional)',
      ticketContentLabel: 'Case Descriptions',
      ticketSubmit: 'Submit Ticket',
      ticketSuccess: 'Support ticket submitted successfully!',
      inquiry: 'Inquiry',
      complaint: 'Complaint',
      suggestion: 'Suggestion',
      ticketPending: 'Awaiting Review',
      ticketReplied: 'Resolved & Replied',
      faqSearchPlaceholder: 'Search logistics, payments, return policies...',
      sfTracking: 'SF Logistics Milestones (Shipped)',
      sfSorting: 'SF Tsing Yi Transit Hub - Sorting',
      sfDelivery: 'Out for delivery by SF specialist',
      sfSigned: 'Delivered and Signed. Thank you!',
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
      {/* Tab controls */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'orders', label: dict.tabOrders },
          { id: 'tickets', label: dict.tabTickets },
          { id: 'faqs', label: dict.tabFaq }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors mr-6 ${
              activeTab === tab.id ? 'border-neutral-950 text-neutral-950' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders log view */}
      {activeTab === 'profile' && (
        <div className="bg-white p-5 rounded-xl border border-gray-150 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-950 font-display mb-1">{locale === 'zh-HK' ? '帳戶資料' : 'Account Details'}</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">{locale === 'zh-HK' ? '電郵地址' : 'Email'}</span>
                <span className="text-xs font-bold text-gray-900">{user?.email}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">{locale === 'zh-HK' ? '會員等級' : 'Membership Tier'}</span>
                <span className="text-xs font-bold text-amber-600 uppercase">{(user as any)?.tier || 'STANDARD'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">{locale === 'zh-HK' ? '權限' : 'Role'}</span>
                <span className="text-xs font-bold text-emerald-600 uppercase">{(user as any)?.role || 'CUSTOMER'}</span>
              </div>
            </div>
            
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setEmailMsg('');
              const res = await apiFetch('/api/auth/profile/email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail })
              });
              const data = await res.json();
              if (data.success) {
                localStorage.setItem('user', JSON.stringify({ ...user, email: data.email })); window.location.reload();
                setNewEmail('');
                setEmailMsg('Email updated successfully');
              } else {
                setEmailMsg(data.message || 'Failed to update email');
              }
            }} className="mt-6 border-t pt-4">
              <h4 className="text-xs font-bold text-gray-900 mb-2">{locale === 'zh-HK' ? '修改電郵' : 'Change Email'}</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  required 
                  value={newEmail} 
                  onChange={e => setNewEmail(e.target.value)} 
                  placeholder={locale === 'zh-HK' ? '新電郵地址' : 'New Email Address'} 
                  className="flex-1 text-xs border border-gray-250 p-2 rounded-lg"
                />
                <button type="submit" className="bg-neutral-900 text-white text-xs px-4 py-2 rounded-lg font-bold">
                  {locale === 'zh-HK' ? '更新' : 'Update'}
                </button>
              </div>
              {emailMsg && <p className="text-[10px] text-gray-500 mt-1">{emailMsg}</p>}
            </form>
  
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await apiFetch('/api/user/profile', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ addressRecipient: profileForm.addressRecipient, addressPhone: profileForm.addressPhone, addressDetail: profileForm.addressDetail })
                });
                const data = await res.json();
                if (data.success) {
                  setProfileMessage(locale === 'zh-HK' ? '資料更新成功' : 'Profile updated successfully');
                }
              } catch (err) {}
            }} className="max-w-sm space-y-4 mt-6">
              <h4 className="text-xs font-bold text-gray-900">{locale === 'zh-HK' ? '收貨資料' : 'Shipping Details'}</h4>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '收貨人姓名' : 'Recipient Name'}</label>
                <input type="text" value={profileForm.addressRecipient} onChange={e => setProfileForm(p => ({...p, addressRecipient: e.target.value}))} className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '聯絡電話' : 'Phone'}</label>
                <input type="text" value={profileForm.addressPhone} onChange={e => setProfileForm(p => ({...p, addressPhone: e.target.value}))} className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '詳細地址' : 'Address'}</label>
                <textarea rows={3} value={profileForm.addressDetail} onChange={e => setProfileForm(p => ({...p, addressDetail: e.target.value}))} className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none" />
              </div>
              <button type="submit" className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors">
                {locale === 'zh-HK' ? '儲存資料' : 'Save Profile'}
              </button>
            </form>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-950 font-display mb-4">{locale === 'zh-HK' ? '修改密碼' : 'Change Password'}</h3>
            {profileMessage && (
              <div className="mb-4 p-3 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-800">
                {profileMessage}
              </div>
            )}
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await apiFetch('/api/user/password', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ oldPassword: profileForm.oldPassword, newPassword: profileForm.newPassword })
                });
                const data = await res.json();
                if (data.success) {
                  setProfileMessage(locale === 'zh-HK' ? '密碼修改成功' : 'Password updated successfully');
                  setProfileForm(p => ({ ...p, oldPassword: '', newPassword: '' }));
                } else {
                  setProfileMessage(data.message || 'Error updating password');
                }
              } catch (err) {
                setProfileMessage('Error updating password');
              }
            }} className="max-w-sm space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '目前密碼' : 'Current Password'}</label>
                <input
                  type="password"
                  required
                  value={profileForm.oldPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '新密碼' : 'New Password'}</label>
                <input
                  type="password"
                  required
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors"
              >
                {locale === 'zh-HK' ? '儲存' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-xs">{dict.noOrders}</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-150 space-y-4 hover:border-gray-300 transition-colors">
                <div className="flex flex-wrap justify-between items-center border-b border-gray-100 pb-3 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold uppercase">{dict.orderNo}</span>
                    <span className="text-xs font-bold font-mono text-gray-900">{order.orderNo}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-amber-600 font-display">
                      HK${(order.totalCents / 100).toFixed(2)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      order.status === 'cancelled' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Sub items snapshot list */}
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-3 text-xs">
                      <img src={item.productSnapshot.imageUrl} className="w-10 h-10 object-cover rounded border" />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900 block line-clamp-1">
                          {locale === 'zh-HK' ? item.productSnapshot.nameZh : item.productSnapshot.nameEn}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {locale === 'zh-HK' ? item.productSnapshot.specNameZh : item.productSnapshot.specNameEn} (×{item.qty})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking Logistics milestones */}
                {order.trackingNo && (
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
                    <div className="font-semibold text-gray-900 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500">
                      <Truck className="h-3.5 w-3.5 text-neutral-800" />
                      {dict.sfTracking} - SF #{order.trackingNo}
                    </div>
                    <div className="relative pl-4 border-l border-neutral-300 space-y-3.5 pt-1.5">
                      <div className="relative">
                        <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-neutral-900 ring-4 ring-white" />
                        <span className="font-semibold text-gray-950 block">{dict.sfSorting}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">{new Date(order.shippedAt || Date.now()).toLocaleTimeString()}</span>
                      </div>
                      {order.status === 'completed' ? (
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                          <span className="font-semibold text-emerald-700 block">{dict.sfSigned}</span>
                        </div>
                      ) : (
                        <div className="relative opacity-60">
                          <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-neutral-300 ring-4 ring-white" />
                          <span className="font-semibold text-gray-500 block">{dict.sfDelivery}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Confirm Deliver & voluntary cancel buttons */}
                <div className="flex justify-end gap-2 pt-1 border-t border-gray-100 mt-2">
                  {order.status === 'pending_payment' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="border border-red-200 hover:border-red-500 text-red-500 hover:text-red-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {dict.cancelOrder}
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleConfirmReceipt(order.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {dict.confirmReceipt}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Support cases submission */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-5 rounded-xl border border-gray-150 space-y-4">
            <h3 className="text-sm font-bold text-gray-950 font-display">
              {dict.ticketTitle}
            </h3>

            {formSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                <span>{dict.ticketSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs font-semibold text-gray-600">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400">{dict.ticketTypeLabel}</label>
                <div className="flex gap-2">
                  {[
                    { id: 'inquiry', label: dict.inquiry },
                    { id: 'complaint', label: dict.complaint },
                    { id: 'suggestion', label: dict.suggestion }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTicketType(t.id as any)}
                      className={`flex-1 py-2 rounded-lg border font-semibold text-center ${
                        ticketType === t.id ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400">{dict.ticketOrderLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. 2026071012..."
                  value={ticketOrderNo}
                  onChange={(e) => setTicketOrderNo(e.target.value)}
                  className="w-full border border-gray-250 p-2.5 rounded-lg text-xs font-mono text-gray-950 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400">{dict.ticketContentLabel}</label>
                <textarea
                  rows={4}
                  required
                  value={ticketContent}
                  onChange={(e) => setTicketContent(e.target.value)}
                  className="w-full border border-gray-250 p-2.5 rounded-lg text-xs text-gray-950 focus:outline-none min-h-[96px]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-3 rounded-lg text-xs transition-colors shadow-sm"
              >
                {dict.ticketSubmit}
              </button>
            </form>
          </div>

          {/* History support tickets log queue */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-950 font-display">
              {locale === 'zh-HK' ? '歷史處理記錄' : 'Filing Logs'}
            </h3>

            {tickets.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No tickets filed yet.</p>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="bg-white p-4 rounded-xl border border-gray-150 space-y-3">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-gray-400 border-b pb-2">
                    <span>Type: {ticket.type.toUpperCase()}</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full ${
                      ticket.status === 'replied' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {ticket.status === 'replied' ? dict.ticketReplied : dict.ticketPending}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {ticket.content}
                  </p>
                  {ticket.reply && (
                    <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-lg text-xs space-y-1">
                      <span className="font-bold text-neutral-800 block">CS Response:</span>
                      <p className="text-gray-600">{ticket.reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FAQ Search desks */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder={dict.faqSearchPlaceholder}
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-250 rounded-xl text-xs focus:outline-none"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-white p-5 rounded-xl border border-gray-150 space-y-2.5 hover:border-gray-300 transition-colors">
                <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 leading-snug">
                  <HelpCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                  {locale === 'zh-HK' ? faq.questionZh : faq.questionEn}
                </h4>
                <p className="text-xs text-gray-500 pl-6 leading-relaxed whitespace-pre-line font-medium">
                  {locale === 'zh-HK' ? faq.answerZh : faq.answerEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
