import { fetchWithAuth as apiFetch } from './utils/api';
import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Shield, HelpCircle, LogIn, LogOut, CheckCircle, Store, Layers, Moon, Sun } from 'lucide-react';
import { Locale } from './types/index.ts';

// Core views
import ShopHome from './components/shop/ShopHome.tsx';
import ProductDetail from './components/shop/ProductDetail.tsx';
import CartView from './components/shop/CartView.tsx';
import CheckoutView from './components/shop/CheckoutView.tsx';
import PaymentView from './components/shop/PaymentView.tsx';
import UserProfile from './components/shop/UserProfile.tsx';
import PasswordReset from './components/shop/PasswordReset.tsx';
import AuthView from './components/shop/AuthView.tsx';

// Admin modules
import AdminDashboard from './components/admin/AdminDashboard.tsx';
import AdminProducts from './components/admin/AdminProducts.tsx';
import AdminOrders from './components/admin/AdminOrders.tsx';
import AdminMarketing from './components/admin/AdminMarketing.tsx';
import AdminFeedback from './components/admin/AdminFeedback.tsx';
import AdminSettings from './components/admin/AdminSettings.tsx';
import AdminUsers from './components/admin/AdminUsers.tsx';
import AdminCMS from './components/admin/AdminCMS.tsx';

type ViewState = 'shop_home' | 'product_detail' | 'cart' | 'checkout' | 'payment' | 'profile';
type AdminTab = 'dashboard' | 'products' | 'orders' | 'marketing' | 'feedback' | 'settings' | 'users';

export default function App() {
  const [locale, setLocale] = useState<Locale>('zh-HK');
  // @ts-ignore
  const appMode = import.meta.env.VITE_APP_MODE || 'both'; // 'user' | 'admin' | 'both'
  const [isAdminMode, setIsAdminMode] = useState<boolean>(appMode === 'admin' || window.location.search.includes('mode=admin'));
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('shop_home');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');

  // Authentication state
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [tokenReady, setTokenReady] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activePaymentOrderId, setActivePaymentOrderId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartBounce, setCartBounce] = useState<boolean>(false);

    useEffect(() => {
    document.title = locale === 'zh-HK' ? '香港生活百貨商城' : 'HK Life Mall';
  }, [locale]);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedUserId = localStorage.getItem('user_id');
    const storedUserEmail = localStorage.getItem('user_email');
    if (token && storedUserId) {
      setUserId(storedUserId);
      setUserEmail(storedUserEmail || '');
      setTokenReady(true);
    }

    const handleAuthError = () => {
      setTokenReady(false);
      setUserId('');
      setUserEmail('');
      setCurrentView('auth');
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('token', token); // For UserProfile
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_email', user.email);
    localStorage.setItem('user', JSON.stringify(user));
    setUserId(user.id);
    setUserEmail(user.email);
    // Automatically switch to admin mode if the user is an admin and appMode isn't strictly 'user'
    if (user.role === 'admin' && appMode !== 'user') {
      setIsAdminMode(true);
    }
    
    // Merge local cart
    const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
    if (localCart.length > 0) {
      fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, localItems: localCart })
      })
      .then(() => {
        localStorage.removeItem('localCart');
        fetchCartCount(user.id);
        setTokenReady(true);
      })
      .catch(e => {
        console.error(e);
        setTokenReady(true);
      });
    } else {
      setTokenReady(true);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    setUserId('');
    setUserEmail('');
    setTokenReady(false);
    setCurrentView('shop_home');
  };

  const fetchCartCount = (uid?: string) => {
    if (!tokenReady) {
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const total = localCart.reduce((sum: number, item: any) => sum + item.qty, 0);
      setCartCount(total);
      return;
    }
    apiFetch(`/api/cart/${uid || userId}`)
      .then(res => res.json())
      .then(data => {
        const total = (data || []).reduce((sum: number, item: any) => sum + item.qty, 0);
        setCartCount(total);
      })
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetchCartCount();
  }, [tokenReady, userId, currentView]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get('product');
    if (productParam) {
      setSelectedProductId(productParam);
      setCurrentView('product_detail');
    }
  }, []);

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
      brand: '香港生活百貨商城',
      tagline: '正品直郵 • 極速順豐 • 安全支付',
      shopTab: '精品商城',
      adminConsole: '後台管理系統',
      adminDrawer: '管理員面板',
      cartLabel: '購物車',
      profileLabel: '我的帳戶',
      customerSwitch: '切換顧客身份',
      userSiuMing: '陳小明 (Chan Siu Ming)',
      userDavid: '張偉 (David Cheung - Guest)',
      footerMsg: '© 2026 香港生活百貨商城 (HK Life Mall) 版權所有。',
    },
    'en': {
      brand: 'HK Life Mall',
      tagline: 'Direct Dispatch • SF Express • Secured Pay',
      shopTab: 'Shop Catalog',
      adminConsole: 'Admin Console',
      adminDrawer: 'Administrator Drawer',
      cartLabel: 'My Cart',
      profileLabel: 'My Profile',
      customerSwitch: 'Switch Persona',
      userSiuMing: 'Chan Siu Ming (Member)',
      userDavid: 'David Cheung (Guest User)',
      footerMsg: '© 2026 HK Life Mall. All Rights Reserved.',
    }
  }[locale];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900 text-gray-800 antialiased">
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
            {tokenReady ? (
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 font-bold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === 'zh-HK' ? '登出' : 'Logout'}</span>
              </button>
            ) : !isAdminMode && (
              <button
                onClick={() => setCurrentView('profile')}
                className="text-neutral-900 bg-amber-400 hover:bg-amber-500 font-bold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-1 shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === 'zh-HK' ? '登入' : 'Login'}</span>
              </button>
            )}
            {tokenReady && JSON.parse(localStorage.getItem('user') || '{}')?.role === 'admin' && !isAdminMode && (
              (import.meta.env.B_FRONTEND_URL || import.meta.env.VITE_B_FRONTEND_URL) ? (
                <a
                  href={(import.meta.env.B_FRONTEND_URL || import.meta.env.VITE_B_FRONTEND_URL)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-gray-500 hover:text-gray-950"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">{dict.adminConsole}</span>
                </a>
              ) : (
                <button
                  onClick={() => setIsAdminMode(true)}
                  className="font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-gray-500 hover:text-gray-950"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">{dict.adminConsole}</span>
                </button>
              )
            )}
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
                    <span className={`absolute -top-1 -right-1 bg-amber-500 text-black font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white font-mono shadow-sm transition-transform duration-300 ${cartBounce ? "scale-150" : "scale-100"}`}>
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
        {window.location.pathname === '/password/reset' ? (
          <PasswordReset />
        ) : !tokenReady && (isAdminMode || !['shop_home', 'product_detail', 'cart'].includes(currentView)) ? (
          <AuthView locale={locale} onLoginSuccess={handleLoginSuccess} />
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
                onRequestLogin={() => setCurrentView('profile')}
                onAddToCart={() => {
                  fetchCartCount();
                  setCartBounce(true);
                  setTimeout(() => setCartBounce(false), 300);
                }}
                onInstantBuy={(skuId, qty) => {
                  if (!userId) {
                    const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
                    const existing = localCart.find((i: any) => i.skuId === skuId);
                    if (existing) {
                      existing.qty += qty;
                      existing.checked = true;
                    } else {
                      localCart.push({ skuId, qty, addedAt: new Date().toISOString(), checked: true });
                    }
                    localStorage.setItem('localCart', JSON.stringify(localCart));
                    fetchCartCount();
                    setCurrentView('checkout');
                    return;
                  }
                  
                  apiFetch('/api/cart', {
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
                onPayNow={handleDirectBuy}
              />
            )}
          </div>
        ) : (
          // Renders B-End Admin control console with a left panel sidebar
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Admin sidebar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 h-max space-y-4">
              <div className="border-b pb-3.5 mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{dict.adminDrawer}</span>
                {(import.meta.env.C_FRONTEND_URL || import.meta.env.VITE_C_FRONTEND_URL) ? (
                  <a href={(import.meta.env.C_FRONTEND_URL || import.meta.env.VITE_C_FRONTEND_URL)} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-gray-950 mt-1 font-display flex items-center gap-1 hover:underline">
                    <Shield className="h-4 w-4 text-amber-500" />
                    {dict.adminConsole}
                  </a>
                ) : (
                  <h3 className="text-sm font-black text-gray-950 mt-1 font-display flex items-center gap-1">
                    <Shield className="h-4 w-4 text-amber-500" />
                    {dict.adminConsole}
                  </h3>
                )}
              </div>

              <div className="flex flex-col gap-1 text-xs font-semibold">
                {[
                  { id: 'dashboard', label: locale === 'zh-HK' ? '控制台概覽' : 'Dashboard' },
                  { id: 'products', label: locale === 'zh-HK' ? '產品與庫存' : 'Products & Stock' },
                  { id: 'orders', label: locale === 'zh-HK' ? '訂單履約' : 'Fulfillment' },
                  { id: 'marketing', label: locale === 'zh-HK' ? '行銷與滿減' : 'Promotions' },
                  { id: 'feedback', label: locale === 'zh-HK' ? '客服售後' : 'Support Tickets' },
                  { id: 'settings', label: locale === 'zh-HK' ? '參數與設定' : 'Settings & PITR' },
                  { id: 'users', label: locale === 'zh-HK' ? '用戶權限' : 'Users & Roles' }
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
              {activeAdminTab === 'cms' && <AdminCMS locale={locale} />}
              {activeAdminTab === 'feedback' && <AdminFeedback locale={locale} />}
              {activeAdminTab === 'settings' && <AdminSettings locale={locale} />}
              {activeAdminTab === 'users' && <AdminUsers locale={locale} />}
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
