import React, { useState, useEffect } from 'react';
import { fetchWithAuth as apiFetch } from '../../utils/api';
import { Locale, Banner, Announcement, FAQ } from '../../types';
import { Image, Volume2, HelpCircle, PlusCircle, Trash } from 'lucide-react';

export default function AdminCMS({ locale }: { locale: Locale }) {
  const dict = {
    'zh-HK': {
      banners: '橫幅管理',
      announcements: '公告管理',
      faqs: '常見問題',
      addBanner: '新增橫幅',
      imgUrl: '圖片網址',
      linkUrl: '連結網址',
      addBtn: '新增',
      addAnn: '新增公告',
      titleZh: '標題 (中文)',
      titleEn: '標題 (英文)',
      addFaq: '新增常見問題',
      qZh: '問題 (中文)',
      qEn: '問題 (英文)',
      aZh: '答案 (中文)',
      aEn: '答案 (英文)',
    },
    'en': {
      banners: 'Banners',
      announcements: 'Announcements',
      faqs: 'FAQs',
      addBanner: 'Add Banner',
      imgUrl: 'Image URL',
      linkUrl: 'Link URL',
      addBtn: 'Add',
      addAnn: 'Add Announcement',
      titleZh: 'Title (ZH)',
      titleEn: 'Title (EN)',
      addFaq: 'Add FAQ',
      qZh: 'Question (ZH)',
      qEn: 'Question (EN)',
      aZh: 'Answer (ZH)',
      aEn: 'Answer (EN)',
    }
  }[locale];

  const [activeTab, setActiveTab] = useState<'banners' | 'announcements' | 'faqs'>('banners');
  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  
  // Banner Add
  const [newBannerImg, setNewBannerImg] = useState('');
  const [newBannerLink, setNewBannerLink] = useState('');

  // Announcement Add
  const [newAnnTitleZh, setNewAnnTitleZh] = useState('');
  const [newAnnTitleEn, setNewAnnTitleEn] = useState('');
  
  // FAQ Add
  const [newFaqQZh, setNewFaqQZh] = useState('');
  const [newFaqQEn, setNewFaqQEn] = useState('');
  const [newFaqAZh, setNewFaqAZh] = useState('');
  const [newFaqAEn, setNewFaqAEn] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'banners') {
      const res = await apiFetch('/api/banners');
      setBanners(await res.json());
    } else if (activeTab === 'announcements') {
      const res = await apiFetch('/api/announcements');
      setAnnouncements(await res.json());
    } else if (activeTab === 'faqs') {
      const res = await apiFetch('/api/faqs');
      setFaqs(await res.json());
    }
  };

  const addBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/admin/banners', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: newBannerImg, linkUrl: newBannerLink })
    });
    setNewBannerImg(''); setNewBannerLink('');
    fetchData();
  };

  const deleteBanner = async (id: string) => {
    await apiFetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/admin/announcements', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titleZh: newAnnTitleZh, titleEn: newAnnTitleEn, contentZh: newAnnTitleZh, contentEn: newAnnTitleEn })
    });
    setNewAnnTitleZh(''); setNewAnnTitleEn('');
    fetchData();
  };

  const deleteAnnouncement = async (id: string) => {
    await apiFetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/admin/faqs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionZh: newFaqQZh, questionEn: newFaqQEn, answerZh: newFaqAZh, answerEn: newFaqAEn })
    });
    setNewFaqQZh(''); setNewFaqQEn(''); setNewFaqAZh(''); setNewFaqAEn('');
    fetchData();
  };

  const deleteFaq = async (id: string) => {
    await apiFetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        <button onClick={() => setActiveTab('banners')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'banners' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
          <Image className="inline w-3.5 h-3.5 mr-1" /> {dict.banners}
        </button>
        <button onClick={() => setActiveTab('announcements')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'announcements' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
          <Volume2 className="inline w-3.5 h-3.5 mr-1" /> {dict.announcements}
        </button>
        <button onClick={() => setActiveTab('faqs')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'faqs' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
          <HelpCircle className="inline w-3.5 h-3.5 mr-1" /> {dict.faqs}
        </button>
      </div>

      {activeTab === 'banners' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <h3 className="font-bold mb-4">{dict.addBanner}</h3>
          <form onSubmit={addBanner} className="flex gap-2 mb-6">
            <input placeholder={dict.imgUrl} value={newBannerImg} onChange={e=>setNewBannerImg(e.target.value)} required className="border p-2 rounded-lg text-xs flex-1" />
            <input placeholder={dict.linkUrl} value={newBannerLink} onChange={e=>setNewBannerLink(e.target.value)} className="border p-2 rounded-lg text-xs flex-1" />
            <button className="bg-neutral-900 text-white px-4 rounded-lg text-xs font-bold"><PlusCircle className="inline w-4 h-4 mr-1" /> {dict.addBtn}</button>
          </form>
          <div className="grid grid-cols-2 gap-4">
            {banners.map(b => (
              <div key={b.id} className="border p-2 rounded-lg relative">
                <img src={b.imageUrl} className="w-full h-32 object-cover rounded" />
                <button onClick={() => deleteBanner(b.id)} className="absolute top-4 right-4 bg-red-500 text-white p-1 rounded-full"><Trash className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <h3 className="font-bold mb-4">{dict.addAnn}</h3>
          <form onSubmit={addAnnouncement} className="flex gap-2 mb-6">
            <input placeholder={dict.titleZh} value={newAnnTitleZh} onChange={e=>setNewAnnTitleZh(e.target.value)} required className="border p-2 rounded-lg text-xs flex-1" />
            <input placeholder={dict.titleEn} value={newAnnTitleEn} onChange={e=>setNewAnnTitleEn(e.target.value)} required className="border p-2 rounded-lg text-xs flex-1" />
            <button className="bg-neutral-900 text-white px-4 rounded-lg text-xs font-bold"><PlusCircle className="inline w-4 h-4 mr-1" /> {dict.addBtn}</button>
          </form>
          <div className="space-y-2">
            {announcements.map(a => (
              <div key={a.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{a.titleZh}</p>
                  <p className="text-xs text-gray-500">{a.titleEn}</p>
                </div>
                <button onClick={() => deleteAnnouncement(a.id)} className="text-red-500"><Trash className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'faqs' && (
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <h3 className="font-bold mb-4">{dict.addFaq}</h3>
          <form onSubmit={addFaq} className="grid grid-cols-2 gap-4 mb-6">
            <input placeholder={dict.qZh} value={newFaqQZh} onChange={e=>setNewFaqQZh(e.target.value)} required className="border p-2 rounded-lg text-xs" />
            <input placeholder={dict.qEn} value={newFaqQEn} onChange={e=>setNewFaqQEn(e.target.value)} required className="border p-2 rounded-lg text-xs" />
            <input placeholder={dict.aZh} value={newFaqAZh} onChange={e=>setNewFaqAZh(e.target.value)} required className="border p-2 rounded-lg text-xs" />
            <input placeholder={dict.aEn} value={newFaqAEn} onChange={e=>setNewFaqAEn(e.target.value)} required className="border p-2 rounded-lg text-xs" />
            <div className="col-span-2 text-right">
              <button className="bg-neutral-900 text-white px-6 py-2 rounded-lg text-xs font-bold"><PlusCircle className="inline w-4 h-4 mr-1" /> {dict.addFaq}</button>
            </div>
          </form>
          <div className="space-y-4">
            {faqs.map(f => (
              <div key={f.id} className="border p-4 rounded-lg flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm mb-1">{f.questionZh}</p>
                  <p className="text-xs text-gray-600 mb-2">{f.answerZh}</p>
                </div>
                <button onClick={() => deleteFaq(f.id)} className="text-red-500"><Trash className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
