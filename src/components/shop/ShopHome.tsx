import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Tag, Eye, Heart, Volume2, ArrowRight } from 'lucide-react';
import { Locale, Category, Product, Banner, Announcement } from '../../types/index.ts';

interface ShopHomeProps {
  locale: Locale;
  onSelectProduct: (id: string) => void;
}

export default function ShopHome({ locale, onSelectProduct }: ShopHomeProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    // Parallel loading from API
    Promise.all([
      apiFetch('/api/banners').then(res => res.json()),
      apiFetch('/api/announcements').then(res => res.json()),
      apiFetch('/api/categories').then(res => res.json()),
      apiFetch('/api/products/recommendations').then(res => res.json())
    ]).then(([bannersData, annsData, catsData, recsData]) => {
      setBanners(bannersData);
      setAnnouncements(annsData);
      setCategories(catsData);
      setRecommendations(recsData);
    });
  }, []);

  // Fetch filtered products dynamically
  useEffect(() => {
    let url = `/api/products?keyword=${searchQuery}`;
    if (selectedCategory) url += `&categoryId=${selectedCategory}`;
    if (sortBy !== 'default') url += `&sort=${sortBy}`;

    if (priceRange === 'under100') url += `&priceMax=10000`;
    else if (priceRange === '100to200') url += `&priceMin=10000&priceMax=20000`;
    else if (priceRange === 'over200') url += `&priceMin=20000`;

    apiFetch(url)
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : data.data || []))
      .catch(err => console.error(err));
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const dict = {
    'zh-HK': {
      searchPlaceholder: '搜尋生活百貨、美妝、母嬰用品...',
      recommend: '精選推薦',
      recommendSub: '為您甄選優質港式與全球精品',
      hotProducts: '熱賣好物',
      allProducts: '所有商品',
      allCats: '全部分類',
      price: '價格區間',
      sort: '排序方式',
      sortDefault: '默認排序',
      sortPriceAsc: '價格由低到高',
      sortPriceDesc: '價格由高到低',
      originalPrice: '原價',
      nowPrice: '現價',
      outOfStock: '已售罄',
      seeDetail: '查看詳情',
      noProducts: '暫無相符商品',
      freeShipTip: '【熱門】全店消費滿 HK$300 即免運費！',
    },
    'en': {
      searchPlaceholder: 'Search department store, beauty, baby items...',
      recommend: 'Staff Picks',
      recommendSub: 'Selected quality products for you',
      hotProducts: 'Hot Deals',
      allProducts: 'All Products',
      allCats: 'All Categories',
      price: 'Price Range',
      sort: 'Sort By',
      sortDefault: 'Default',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      originalPrice: 'Reg.',
      nowPrice: 'Now',
      outOfStock: 'Sold Out',
      seeDetail: 'View Detail',
      noProducts: 'No products found',
      freeShipTip: '【Hot】Free delivery on orders over HK$300!',
    }
  }[locale];

  return (
    <div className="space-y-6">
      {/* Announcement ticker bar */}
      {announcements.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200/50 py-2.5 px-4 rounded-xl flex items-center gap-3 text-amber-800 text-sm animate-fade-in">
          <Volume2 className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="font-medium truncate">
            {locale === 'zh-HK' ? announcements[0].contentZh : announcements[0].contentEn}
          </span>
        </div>
      )}

      {/* Hero Banner Area */}
      {banners.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[21/9] md:aspect-[24/9] bg-gray-100 group">
          <img 
            src={banners[0].imageUrl} 
            alt="Hero promotion" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center p-6 md:p-12 text-white">
            <span className="bg-amber-500 text-black text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full w-max mb-3">
              {locale === 'zh-HK' ? '超值狂歡' : 'Mega Offer'}
            </span>
            <h1 className="text-xl md:text-3xl font-bold font-display max-w-lg leading-tight mb-4 drop-shadow-sm">
              {locale === 'zh-HK' ? banners[0].copyZh : banners[0].copyEn}
            </h1>
            <p className="text-white/80 text-xs md:text-sm mb-6 hidden md:block">
              {dict.freeShipTip}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`p-4 rounded-xl text-center border transition-all duration-300 ${
              selectedCategory === cat.id 
                ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm' 
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <ShoppingBag className="h-5 w-5 mx-auto mb-2 opacity-80" />
            <span className="text-sm font-medium block">
              {locale === 'zh-HK' ? cat.nameZh : cat.nameEn}
            </span>
          </button>
        ))}
      </div>

      {/* Bento Grid Featured Recommendations */}
      {recommendations.length > 0 && !selectedCategory && !searchQuery && (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 font-display flex items-center gap-2">
              <Tag className="h-5 w-5 text-amber-500" />
              {dict.recommend}
            </h2>
            <p className="text-xs text-gray-500 mt-1">{dict.recommendSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((prod) => (
              <div 
                key={prod.id} 
                onClick={() => onSelectProduct(prod.id)}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-50">
                  <img 
                    src={prod.images[0]} 
                    alt={prod.nameZh} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {locale === 'zh-HK' ? '推薦' : 'HOT'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {locale === 'zh-HK' ? prod.nameZh : prod.nameEn}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-amber-600 text-base font-bold">
                      HK${(prod.priceAfterCents / 100).toFixed(2)}
                    </span>
                    <span className="text-gray-400 text-xs line-through">
                      HK${(prod.priceOriginalCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Catalog View */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-display">
              {selectedCategory ? (locale === 'zh-HK' ? categories.find(c => c.id === selectedCategory)?.nameZh : categories.find(c => c.id === selectedCategory)?.nameEn) : dict.allProducts}
            </h2>
          </div>

          {/* Quick Search and Sorting Panel */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder={dict.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition-colors bg-white"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none"
            >
              <option value="all">{locale === 'zh-HK' ? '全部價格' : 'All Prices'}</option>
              <option value="under100">HK$100 {locale === 'zh-HK' ? '以下' : 'Below'}</option>
              <option value="100to200">HK$100 - HK$200</option>
              <option value="over200">HK$200 {locale === 'zh-HK' ? '以上' : 'Above'}</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none"
            >
              <option value="default">{dict.sortDefault}</option>
              <option value="priceAsc">{dict.sortPriceAsc}</option>
              <option value="priceDesc">{dict.sortPriceDesc}</option>
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{dict.noProducts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod.id)}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={prod.images[0]}
                    alt={prod.nameZh}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  {prod.priceAfterCents < prod.priceOriginalCents && (
                    <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      -{Math.round((1 - prod.priceAfterCents / prod.priceOriginalCents) * 100)}%
                    </span>
                  )}
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-relaxed">
                      {locale === 'zh-HK' ? prod.nameZh : prod.nameEn}
                    </h3>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-amber-600 text-sm font-bold">
                        HK${(prod.priceAfterCents / 100).toFixed(2)}
                      </span>
                      {prod.priceOriginalCents > prod.priceAfterCents && (
                        <span className="text-gray-400 text-[10px] line-through">
                          HK${(prod.priceOriginalCents / 100).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button className="mt-3 w-full border border-neutral-200 hover:border-neutral-900 text-neutral-800 hover:text-black hover:bg-neutral-50 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      {dict.seeDetail}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
