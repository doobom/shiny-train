import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Shield, HelpCircle, LogIn, LogOut, CheckCircle, Store, Layers } from 'lucide-react';
import { Locale } from './types/index.ts';

// Core views
import ShopHome from './components/shop/ShopHome.tsx';
import ProductDetail from './components/shop/ProductDetail.tsx';
import CartView from './components/shop/CartView.tsx';
import CheckoutView from './components/shop/CheckoutView.tsx';
import PaymentView from './components/shop/PaymentView.tsx';
import UserProfile from './components/shop/UserProfile.tsx';

// Admin modules
import AdminDashboard from './components/admin/AdminDashboard.tsx';
import AdminProducts from './components/admin/AdminProducts.tsx';
import AdminOrders from './components/admin/AdminOrders.tsx';
import AdminMarketing from './components/admin/AdminMarketing.tsx';
import AdminFeedback from './components/admin/AdminFeedback.tsx';
import AdminSettings from './components/admin/AdminSettings.tsx';

type ViewState = 'shop_home' | 'product_detail' | 'cart' | 'checkout' | 'payment' | 'profile';
type AdminTab = 'dashboard' | 'products' | 'orders' | 'marketing' | 'feedback' | 'settings';

export default function App() {
  const [locale, setLocale] = useState<Locale>('zh-HK');
  const appMode = import.meta.env.VITE_APP_MODE || 'both'; // 'user' | 'admin' | 'both'
  const [isAdminMode, setIsAdminMode] = useState<boolean>(appMode === 'admin');
  const [currentView, setCurrentView] = useState<ViewState>('shop_home');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');

  // Simulation user auth states
  const [userId, setUserId] = useState<string>('user_1');
  const [userEmail, setUserEmail] = useState<string>('siuming@gmail.com');
  const [tokenReady, setTokenReady] = useState<boolean>(false);
  
  // Selection references
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activePaymentOrderId, setActivePaymentOrderId] = useState<string | null>(null);

  // Global Cart counts
  const [cartCount, setCartCount] = useState<number>(0);

  // Sync token whenever userId changes
  useEffect(() => {
    setTokenReady(false);
    fetch('/api/auth/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.token) {
          localStorage.setItem('jwt_token', data.token);
          setTokenReady(true);
        }
      })
      .catch(e => console.error('Simulate auth error:', e));
  }, [userId]);

  const fetchCartCount = () => {
    if (!tokenReady) return;
    fetch(`/api/cart/${userId}`)
      .then(res => res.json())
      .then(data => {
        const total = (data || []).reduce((sum: number, item: any) => sum + item.qty, 0);
        setCartCount(total);
      })
      .catch(e => console.error(e));
  };

  useEffect(() => {
    if (tokenReady) {
      fetchCartCount();
    }
  }, [tokenReady, userId]);

  // Handle direct buy triggers
  const handleDirectBuy = (orderId: string) => {
    setActivePaymentOrderId(orderId);
    setCurrentView('payment');
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product_detail');
  };

  const handleOrderSubmitted = (orderId: string) => {
    setActivePaymentOrderId(orderId);
    setCurrentView('payment');
    fetchCartCount(); // Clear checked items
  };

  const handlePaymentSuccess = () => {
    // Redirect to profile to track shipping
    setCurrentView('profile');
  };

  const toggleLanguage = () => {
    setLocale(prev => prev === 'zh-HK' ? 'en' : 'zh-HK');
  };

  const dict = {
    'zh-HK': {
      brand: 'APCUBE 香港精品百貨',
      tagline: '正品直郵 • 極速順豐 • 安全支付',
      shopTab: '精品商城',
      adminConsole: '後台管理系統',
      cartLabel: '購物車',
      profileLabel: '我的帳戶',
      customerSwitch: '切換顧客身份',
      userSiuMing: '陳小明 (Chan Siu Ming)',
      userDavid: '張偉 (David Cheung - Guest)',
      footerMsg: '© 2026 APCUBE DEPARTMENT STORE LIMITED. 根據 SDRS v2.2 安全架構規範部署。',
    },
    'en': {
      brand: 'APCUBE HK Luxury Goods',
      tagline: 'Direct Dispatch • SF Express • Secured Pay',
      shopTab: 'Shop Catalog',
      adminConsole: 'Admin Console',
      cartLabel: 'My Cart',
      profileLabel: 'My Profile',
      customerSwitch: 'Switch Persona',
      userSiuMing: 'Chan Siu Ming (Member)',
      userDavid: 'David Cheung (Guest User)',
      footerMsg: '© 2026 APCUBE DEPARTMENT STORE LIMITED. Configured to SDRS v2.2 compliance protocols.',
    }
  }[locale];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900 text-gray-800 antialiased">
      {/* Simulation Persona Bar */}
      <div className="bg-neutral-900 text-white/90 text-[10px] px-6 py-2 border-b border-neutral-800 flex flex-wrap justify-between items-center gap-3 font-semibold font-mono">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-amber-500" />
          <span>SDRS v2.2 RUNTIME CONTAINER</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-white/50">{dict.customerSwitch}:</span>
            <select 
              value={userId} 
              onChange={e => {
                const sel = e.target.value;
                setUserId(sel);
                setUserEmail(sel === 'user_1' ? 'siuming@gmail.com' : 'david@gmail.com');
              }}
              className="bg-neutral-800 text-amber-300 border border-neutral-700 rounded px-2 py-0.5 text-[10px] font-semibold cursor-pointer outline-none"
            >
              <option value="user_1">{dict.userSiuMing}</option>
              <option value="user_2">{dict.userDavid}</option>
            </select>
          </div>
          {appMode === 'both' && (
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="bg-amber-500 hover:bg-amber-600 text-black px-2.5 py-0.5 rounded font-bold transition-all text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm"
            >
              <Shield className="h-3 w-3" />
              {isAdminMode ? 'Exit Admin' : 'Enter Admin'}
            </button>
          )}
        </div>
      </div>

      {/* Primary Header Section */}
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo Info */}
          <div 
            onClick={() => {
              setIsAdminMode(false);
              setCurrentView('shop_home');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-neutral-950 text-white rounded-xl flex items-center justify-center font-black text-lg tracking-wider shadow-md group-hover:bg-amber-500 group-hover:text-black transition-all">
              AP
            </div>
            <div>
              <span className="font-black text-base text-gray-950 font-display tracking-tight block">
                {dict.brand}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5 font-medium tracking-wide">
                {dict.tagline}
              </span>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Locale Selector */}
            <button
              onClick={toggleLanguage}
              className="border border-gray-200 hover:border-neutral-950 hover:bg-gray-50 text-neutral-800 font-bold px-3 py-2 rounded-xl text-xs transition-colors"
            >
              {locale === 'zh-HK' ? 'English' : '繁中 (HK)'}
            </button>

            {!isAdminMode && (
              <>
                {/* Shop catalogue selector */}
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setCurrentView('shop_home');
                  }}
                  className={`font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    !isAdminMode && currentView === 'shop_home'
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  <span className="hidden sm:inline">{dict.shopTab}</span>
                </button>

                {/* Shopping Cart button trigger */}
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setCurrentView('cart');
                  }}
                  className={`font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 relative ${
                    !isAdminMode && currentView === 'cart'
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">{dict.cartLabel}</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white font-mono shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Customer center button trigger */}
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setCurrentView('profile');
                  }}
                  className={`font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    !isAdminMode && currentView === 'profile'
                      ? 'bg-neutral-950 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{dict.profileLabel}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {!tokenReady ? (
          <div className="flex h-full items-center justify-center py-20 text-gray-400 font-mono text-xs">
            Authenticating Sandbox...
          </div>
        ) : !isAdminMode ? (
          // Renders C-End Customer shopping screens
          <div className="space-y-6">
            {currentView === 'shop_home' && (
              <ShopHome 
                locale={locale} 
                onSelectProduct={handleSelectProduct} 
              />
            )}

            {currentView === 'product_detail' && selectedProductId && (
              <ProductDetail
                productId={selectedProductId}
                locale={locale}
                userId={userId}
                onBack={() => setCurrentView('shop_home')}
                onAddToCart={() => {
                  fetchCartCount();
                }}
                onInstantBuy={(skuId, qty) => {
                  fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, skuId, qty })
                  })
                  .then(res => res.json())
                  .then(() => {
                    fetchCartCount();
                    setCurrentView('checkout');
                  })
                  .catch(e => console.error(e));
                }}
              />
            )}

            {currentView === 'cart' && (
              <CartView
                locale={locale}
                userId={userId}
                onGoToCheckout={() => setCurrentView('checkout')}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentView === 'checkout' && (
              <CheckoutView
                locale={locale}
                userId={userId}
                onOrderPlaced={handleOrderSubmitted}
              />
            )}

            {currentView === 'payment' && activePaymentOrderId && (
              <PaymentView
                orderId={activePaymentOrderId}
                locale={locale}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}

            {currentView === 'profile' && (
              <UserProfile
                userId={userId}
                locale={locale}
              />
            )}
          </div>
        ) : (
          // Renders B-End Admin control console with a left panel sidebar
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Admin sidebar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 h-max space-y-4">
              <div className="border-b pb-3.5 mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Administrator Drawer</span>
                <h3 className="text-sm font-black text-gray-950 mt-1 font-display flex items-center gap-1">
                  <Shield className="h-4 w-4 text-amber-500" />
                  {dict.adminConsole}
                </h3>
              </div>

              <div className="flex flex-col gap-1 text-xs font-semibold">
                {[
                  { id: 'dashboard', label: locale === 'zh-HK' ? '控制台概覽' : 'Dashboard' },
                  { id: 'products', label: locale === 'zh-HK' ? '產品與庫存' : 'Products & Stock' },
                  { id: 'orders', label: locale === 'zh-HK' ? '訂單履約' : 'Fulfillment' },
                  { id: 'marketing', label: locale === 'zh-HK' ? '行銷與滿減' : 'Promotions' },
                  { id: 'feedback', label: locale === 'zh-HK' ? '客服售後' : 'Support Tickets' },
                  { id: 'settings', label: locale === 'zh-HK' ? '參數與設定' : 'Settings & PITR' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveAdminTab(item.id as any)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all ${
                      activeAdminTab === item.id
                        ? 'bg-neutral-950 text-white font-bold shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin focus layout */}
            <div className="lg:col-span-3">
              {activeAdminTab === 'dashboard' && <AdminDashboard locale={locale} />}
              {activeAdminTab === 'products' && <AdminProducts locale={locale} />}
              {activeAdminTab === 'orders' && <AdminOrders locale={locale} />}
              {activeAdminTab === 'marketing' && <AdminMarketing locale={locale} />}
              {activeAdminTab === 'feedback' && <AdminFeedback locale={locale} />}
              {activeAdminTab === 'settings' && <AdminSettings locale={locale} />}
            </div>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-white border-t border-gray-150 py-6 text-center text-xs text-gray-400 font-semibold">
        <div className="max-w-7xl mx-auto px-6">
          <p>{dict.footerMsg}</p>
        </div>
      </footer>
    </div>
  );
}
