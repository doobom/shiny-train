import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, RefreshCw, Send, AlertCircle } from 'lucide-react';
import { Locale, Feedback } from '../../types/index.ts';

interface AdminFeedbackProps {
  locale: Locale;
}

export default function AdminFeedback({ locale }: AdminFeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Replying state
  const [selectedFbId, setSelectedFbId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [notif, setNotif] = useState<string | null>(null);

  const fetchFeedbacks = () => {
    setLoading(true);
    apiFetch('/api/admin/feedbacks')
      .then(res => res.json())
      .then(data => {
        setFeedbacks(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSendReply = (fbId: string) => {
    if (!replyText) return;
    setSubmitting(true);

    apiFetch(`/api/admin/feedbacks/${fbId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: replyText })
    })
    .then(res => res.json())
    .then(() => {
      setSubmitting(false);
      setSelectedFbId(null);
      setReplyText('');
      setNotif(locale === 'zh-HK' ? '回覆發送成功！顧客已收到通知。' : 'Reply successfully dispatched.');
      fetchFeedbacks();
      setTimeout(() => setNotif(null), 3000);
    })
    .catch(e => {
      console.error(e);
      setSubmitting(false);
    });
  };

  const dict = {
    'zh-HK': {
      title: '售後反饋投訴中心',
      desc: '處理顧客前台提交的投訴、建議和商品諮詢。回覆後，顧客前台我的帳戶中即可實時查看。',
      typeCol: '反饋類型',
      descCol: '反饋詳細內容',
      statusCol: '處理狀態',
      actionCol: '操作',
      pending: '待處理',
      replied: '已回覆',
      replyFormTitle: '編輯在線答覆',
      replyPlaceholder: '請輸入答覆內容...',
      sendReply: '發送回覆',
      associatedOrder: '關聯訂單號',
      anonymous: '遊客（未登入）',
    },
    'en': {
      title: 'Customer Support Tickets',
      desc: 'Manage suggestions, inquiries, and complaints lodged by shopfront users. Dispatched replies are instantly visible in the user profile dashboard.',
      typeCol: 'Category',
      descCol: 'Filing Description',
      statusCol: 'Status',
      actionCol: 'Actions',
      pending: 'Pending Review',
      replied: 'Resolved',
      replyFormTitle: 'Compose Online Response',
      replyPlaceholder: 'Type response text here...',
      sendReply: 'Send Reply',
      associatedOrder: 'Related Order No',
      anonymous: 'Guest Customer',
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <h1 className="text-xl font-bold text-gray-950 font-display flex items-center gap-2">
          <MessageSquare className="h-5.5 w-5.5 text-neutral-800" />
          {dict.title}
        </h1>
      </div>

      {notif && (
        <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>{notif}</span>
        </div>
      )}

      {/* Overview tips */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex items-start gap-2.5 text-xs text-gray-500 leading-relaxed font-semibold">
        <AlertCircle className="h-5 w-5 text-gray-400 shrink-0" />
        <p>{dict.desc}</p>
      </div>

      {/* Interactive Quick reply popup panel */}
      {selectedFbId && (
        <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-4 animate-fade-in">
          <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Send className="h-4 w-4" />
            {dict.replyFormTitle}
          </h3>

          <div className="space-y-3">
            <textarea
              placeholder={dict.replyPlaceholder}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              rows={3}
              className="w-full border border-gray-250 p-3 rounded-lg text-xs bg-white text-gray-950 focus:outline-none"
            />
            <div className="flex gap-2">
              <button 
                disabled={submitting || !replyText}
                onClick={() => handleSendReply(selectedFbId)}
                className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {submitting && <RefreshCw className="h-3 w-3 animate-spin" />}
                {dict.sendReply}
              </button>
              <button 
                disabled={submitting}
                onClick={() => {
                  setSelectedFbId(null);
                  setReplyText('');
                }}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main feedbacks table queue */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                <th className="p-4">{dict.typeCol}</th>
                <th className="p-4">{dict.descCol}</th>
                <th className="p-4">{dict.statusCol}</th>
                <th className="p-4 text-right">{dict.actionCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                    Queue is currently empty.
                  </td>
                </tr>
              ) : (
                feedbacks.map(fb => (
                  <tr key={fb.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-gray-950 block">{fb.type.toUpperCase()}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{fb.contact || dict.anonymous}</span>
                    </td>
                    <td className="p-4 max-w-sm">
                      <p className="font-medium text-gray-900 leading-relaxed">{fb.content}</p>
                      {fb.orderId && (
                        <span className="text-[10px] text-gray-400 block mt-1 font-semibold uppercase font-mono">
                          {dict.associatedOrder}: {fb.orderId}
                        </span>
                      )}
                      {fb.reply && (
                        <div className="mt-2.5 bg-gray-50 p-3.5 rounded-lg border border-gray-100 text-gray-600">
                          <span className="font-bold text-neutral-800 block text-[10px] mb-0.5">My Response:</span>
                          {fb.reply}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {fb.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-[10px] font-bold">
                          <Clock className="h-3.5 w-3.5" />
                          {dict.pending}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {dict.replied}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {fb.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedFbId(fb.id);
                            setReplyText('');
                          }}
                          className="bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
                        >
                          回覆
                        </button>
                      )}
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
