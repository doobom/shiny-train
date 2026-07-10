import fs from 'fs';
import path from 'path';
import { 
  User, Category, Product, ProductSpec, Inventory, 
  CartItem, Discount, FullReduction, ShippingTemplate, 
  Order, OrderItem, Payment, FAQ, Feedback, 
  Admin, Role, RolePermission, AuditLog, PlatformSettings, Locale, Banner, Announcement, Recommendation
} from '../types/index.ts';

// Simple database file location
const DATA_FILE = path.join(process.cwd(), 'data.json');

interface DatabaseState {
  users: User[];
  categories: Category[];
  products: Product[];
  productSpecs: ProductSpec[];
  inventory: Inventory[];
  carts: { id: string; userId: string; updatedAt: string }[];
  cartItems: CartItem[];
  discounts: Discount[];
  fullReductions: FullReduction[];
  shippingTemplates: ShippingTemplate[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  banners: Banner[];
  announcements: Announcement[];
  recommendations: Recommendation[];
  faqs: FAQ[];
  feedbacks: Feedback[];
  admins: Admin[];
  roles: Role[];
  rolePermissions: RolePermission[];
  auditLogs: AuditLog[];
  platformSettings: PlatformSettings[];
}

// Initial seed data definition
const DEFAULT_STATE: DatabaseState = {
  users: [
    {
      id: 'usr_1',
      email: 'customer@example.com',
      passwordHash: '$2a$10$Un6O0k1vS59k1v...', // Mock hash for customer
      phoneEncrypted: 'U2FsdGVkX19v...', // AES-256 Mock
      locale: 'zh-HK',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  categories: [
    { id: 'cat_1', nameZh: '母嬰用品', nameEn: 'Baby & Maternal', sort: 1, disabled: false },
    { id: 'cat_2', nameZh: '美妝個護', nameEn: 'Beauty & Cosmetics', sort: 2, disabled: false },
    { id: 'cat_3', nameZh: '零食食品', nameEn: 'Snacks & Food', sort: 3, disabled: false },
    { id: 'cat_4', nameZh: '家居百貨', nameEn: 'Home & Household', sort: 4, disabled: false }
  ],
  products: [
    {
      id: 'prod_1',
      nameZh: '日本進口頂級嬰兒紙尿褲',
      nameEn: 'Premium Baby Diapers Imported from Japan',
      descriptionZh: '<p>日本原裝進口，極致透氣，貼身護衛。12小時超強吸水，守護寶寶嬌嫩肌膚。</p>',
      descriptionEn: '<p>Directly imported from Japan. Ultra-breathable and perfectly fitting. 12-hour super absorption to protect baby\'s skin.</p>',
      priceOriginalCents: 18000, // HK$180.00
      priceAfterCents: 15000,    // HK$150.00
      categoryId: 'cat_1',
      status: 'on_shelf',
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_2',
      nameZh: '大馬士革玫瑰保濕爽膚水',
      nameEn: 'Damask Rose Hydrating Toner',
      descriptionZh: '<p>天然玫瑰蒸餾，深度保濕，提亮膚色，無添加酒精與防腐劑。</p>',
      descriptionEn: '<p>Distilled from natural roses. Deep hydrating and skin-brightening. Alcohol and paraben free.</p>',
      priceOriginalCents: 24000, // HK$240.00
      priceAfterCents: 19800,    // HK$198.00
      categoryId: 'cat_2',
      status: 'on_shelf',
      images: [
        'https://images.unsplash.com/photo-1608248597481-496100c80836?w=500&q=80'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_3',
      nameZh: '極致香脆原味手工曲奇餅乾',
      nameEn: 'Crispy Original Handmade Butter Cookies',
      descriptionZh: '<p>選用進口新西蘭黃油，匠心手工烘焙，濃郁奶香，入口即化。</p>',
      descriptionEn: '<p>Made with imported New Zealand butter. Artisan hand-baked, rich dairy aroma, melts in your mouth.</p>',
      priceOriginalCents: 9800, // HK$98.00
      priceAfterCents: 7800,    // HK$78.00
      categoryId: 'cat_3',
      status: 'on_shelf',
      images: [
        'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&q=80'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod_4',
      nameZh: '簡約純棉親膚抑菌毛巾三件套',
      nameEn: 'Minimalist Cotton Antibacterial Towel 3-Piece Set',
      descriptionZh: '<p>100%精梳長絨棉，獨特抑菌編織，柔軟吸水，無化學添加物。</p>',
      descriptionEn: '<p>100% combed long-staple cotton with antibacterial weave. Super soft and highly absorbent.</p>',
      priceOriginalCents: 13000, // HK$130.00
      priceAfterCents: 11000,    // HK$110.00
      categoryId: 'cat_4',
      status: 'on_shelf',
      images: [
        'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=500&q=80'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  productSpecs: [
    { id: 'spec_1_1', productId: 'prod_1', specNameZh: '紙尿褲-S號 (單包裝)', specNameEn: 'Diapers-S Size (Single Pack)', priceOriginalCents: 18000, priceAfterCents: 15000 },
    { id: 'spec_1_2', productId: 'prod_1', specNameZh: '紙尿褲-M號 (單包裝)', specNameEn: 'Diapers-M Size (Single Pack)', priceOriginalCents: 20000, priceAfterCents: 16500 },
    { id: 'spec_2_1', productId: 'prod_2', specNameZh: '保濕爽膚水-150ml', specNameEn: 'Hydrating Toner-150ml', priceOriginalCents: 24000, priceAfterCents: 19800 },
    { id: 'spec_2_2', productId: 'prod_2', specNameZh: '保濕爽膚水-300ml', specNameEn: 'Hydrating Toner-300ml', priceOriginalCents: 42000, priceAfterCents: 35000 },
    { id: 'spec_3_1', productId: 'prod_3', specNameZh: '手工曲奇-盒裝 250g', specNameEn: 'Cookies-Box Pack 250g', priceOriginalCents: 9800, priceAfterCents: 7800 },
    { id: 'spec_4_1', productId: 'prod_4', specNameZh: '純棉毛巾三件套-煙灰色', specNameEn: 'Towel 3-Piece Set-Charcoal Grey', priceOriginalCents: 13000, priceAfterCents: 11000 },
    { id: 'spec_4_2', productId: 'prod_4', specNameZh: '純棉毛巾三件套-象牙白', specNameEn: 'Towel 3-Piece Set-Ivory White', priceOriginalCents: 13000, priceAfterCents: 11000 }
  ],
  inventory: [
    { skuId: 'spec_1_1', stock: 150, lockedStock: 0, warnThreshold: 20 },
    { skuId: 'spec_1_2', stock: 100, lockedStock: 0, warnThreshold: 15 },
    { skuId: 'spec_2_1', stock: 80, lockedStock: 0, warnThreshold: 10 },
    { skuId: 'spec_2_2', stock: 5, lockedStock: 0, warnThreshold: 10 }, // Specially low for stock warnings
    { skuId: 'spec_3_1', stock: 300, lockedStock: 0, warnThreshold: 50 },
    { skuId: 'spec_4_1', stock: 120, lockedStock: 0, warnThreshold: 15 },
    { skuId: 'spec_4_2', stock: 0, lockedStock: 0, warnThreshold: 15 } // Out of stock specimen
  ],
  carts: [
    { id: 'cart_usr_1', userId: 'usr_1', updatedAt: new Date().toISOString() }
  ],
  cartItems: [],
  discounts: [
    {
      id: 'disc_1',
      productId: 'prod_1',
      type: 'percent',
      percentValue: 0.833, // approx 150/180
      startAt: new Date(Date.now() - 86400000).toISOString(), // active since yesterday
      endAt: new Date(Date.now() + 864000000).toISOString(),  // active for 10 days
      status: 'active'
    }
  ],
  fullReductions: [
    {
      id: 'fr_1',
      nameZh: '零食食品專區滿$80減$20',
      nameEn: 'Snacks & Food Section Buy $80 Save $20',
      thresholdCents: 8000,
      reductionCents: 2000,
      stackable: false,
      scope: 'category',
      categoryId: 'cat_3',
      startAt: new Date(Date.now() - 86400000).toISOString(),
      endAt: new Date(Date.now() + 864000000).toISOString(),
      status: 'active'
    },
    {
      id: 'fr_2',
      nameZh: '全店狂歡滿$250減$30',
      nameEn: 'Storewide Mega Sale Spend $250 Save $30',
      thresholdCents: 25000,
      reductionCents: 3000,
      stackable: false,
      scope: 'all',
      startAt: new Date(Date.now() - 86400000).toISOString(),
      endAt: new Date(Date.now() + 864000000).toISOString(),
      status: 'active'
    },
    {
      id: 'fr_3',
      nameZh: '全店大促加疊滿$200減$10',
      nameEn: 'Storewide Extra Stackable $200 Save $10',
      thresholdCents: 20000,
      reductionCents: 1000,
      stackable: true,
      scope: 'all',
      startAt: new Date(Date.now() - 86400000).toISOString(),
      endAt: new Date(Date.now() + 864000000).toISOString(),
      status: 'active'
    }
  ],
  shippingTemplates: [
    {
      id: 'ship_default',
      nameZh: '順豐快遞標準模板',
      nameEn: 'SF Express Standard Template',
      firstWeightCents: 3000, // HK$30
      firstWeightKg: 1.0,
      extraWeightCents: 1000, // HK$10/kg
      freeShippingThresholdCents: 30000, // HK$300 free shipping
      isDefault: true,
      enabled: true,
      createdAt: new Date().toISOString()
    }
  ],
  orders: [],
  orderItems: [],
  payments: [],
  banners: [
    {
      id: 'ban_1',
      copyZh: '極致品質 母嬰健康呵護季',
      copyEn: 'Ultimate Quality - Baby Health & Care Season',
      imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
      link: '/products',
      sort: 1,
      enabled: true
    },
    {
      id: 'ban_2',
      copyZh: '美妝狂歡 玫瑰補水專題低至7折',
      copyEn: 'Beauty Carnival - Rose Hydrating up to 30% Off',
      imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80',
      link: '/products',
      sort: 2,
      enabled: true
    }
  ],
  announcements: [
    {
      id: 'ann_1',
      contentZh: '【公告】慶祝香港生活百貨商城開張，全店消費滿 HK$300 即享免運費送貨上門！',
      contentEn: '【Notice】Celebrate the Grand Opening! Enjoy Free SF Home Delivery for orders over HK$300!',
      publishedAt: new Date().toISOString(),
      enabled: true
    }
  ],
  recommendations: [
    { id: 'rec_1', productId: 'prod_1', slot: 'recommend', sort: 1 },
    { id: 'rec_2', productId: 'prod_2', slot: 'hot', sort: 2 },
    { id: 'rec_3', productId: 'prod_3', slot: 'new', sort: 3 }
  ],
  faqs: [
    {
      id: 'faq_1',
      questionZh: '商城支持哪些支付方式？',
      questionEn: 'What payment methods are supported?',
      answerZh: '我們目前支持轉數快 (FPS)、PayMe、Alipay HK 支付以及線下銀行轉賬。線下轉賬需上傳匯款憑證，經財務人員核對後為您發貨。',
      answerEn: 'We support Faster Payment System (FPS), PayMe, Alipay HK, and offline bank transfers. For offline bank transfers, please upload your transfer voucher, and we will ship after our financial team approves it.',
      sort: 1,
      enabled: true
    },
    {
      id: 'faq_2',
      questionZh: '運費如何計算？',
      questionEn: 'How are shipping fees calculated?',
      answerZh: '我們默認使用順豐速運發貨。基礎首重 1kg 為 HK$30，續重每 1kg 收取 HK$10。單筆訂單消費滿 HK$300 即可享受香港免運費包郵送達。',
      answerEn: 'We ship via SF Express by default. The basic shipping is HK$30 for the first 1kg, and HK$10 for each extra kg. Order over HK$300 to enjoy free shipping in Hong Kong.',
      sort: 2,
      enabled: true
    },
    {
      id: 'faq_3',
      questionZh: '下單後多久可以收到商品？',
      questionEn: 'How long does it take to receive goods after placing an order?',
      answerZh: '工作日 16:00 前完成支付的訂單將在當天寄出，通常 1-2 個工作日即可由順豐送達。偏遠地區或公眾假期可能增加 1 天。',
      answerEn: 'Orders paid before 16:00 on weekdays will be shipped on the same day. Usually it takes 1-2 working days to be delivered by SF Express. Remote areas or public holidays may take an extra day.',
      sort: 3,
      enabled: true
    }
  ],
  feedbacks: [],
  admins: [
    {
      id: 'adm_1',
      username: 'admin',
      passwordHash: 'admin123', // Clean password for mock login
      roleId: 'role_super_admin',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  roles: [
    { id: 'role_super_admin', key: 'super_admin', nameZh: '超級管理員', nameEn: 'Super Admin', isBuiltin: true, createdAt: new Date().toISOString() },
    { id: 'role_product_manager', key: 'product_manager', nameZh: '商品管理員', nameEn: 'Product Manager', isBuiltin: true, createdAt: new Date().toISOString() },
    { id: 'role_order_manager', key: 'order_manager', nameZh: '訂單管理員', nameEn: 'Order Manager', isBuiltin: true, createdAt: new Date().toISOString() },
    { id: 'role_marketing_manager', key: 'marketing_manager', nameZh: '營銷管理員', nameEn: 'Marketing Manager', isBuiltin: true, createdAt: new Date().toISOString() },
    { id: 'role_customer_service', key: 'customer_service', nameZh: '客服人員', nameEn: 'Customer Service', isBuiltin: true, createdAt: new Date().toISOString() },
    { id: 'role_finance', key: 'finance', nameZh: '財務人員', nameEn: 'Finance Officer', isBuiltin: true, createdAt: new Date().toISOString() },
    { id: 'role_auditor', key: 'auditor', nameZh: '審計人員', nameEn: 'System Auditor', isBuiltin: true, createdAt: new Date().toISOString() }
  ],
  rolePermissions: [
    // Super admin full permissions mock
    { id: 'rp_1', roleId: 'role_super_admin', permission: 'dashboard:read', access: 'full' },
    { id: 'rp_2', roleId: 'role_super_admin', permission: 'product:manage', access: 'full' },
    { id: 'rp_3', roleId: 'role_super_admin', permission: 'order:manage', access: 'full' },
    { id: 'rp_4', roleId: 'role_super_admin', permission: 'marketing:manage', access: 'full' },
    { id: 'rp_5', roleId: 'role_super_admin', permission: 'user:manage', access: 'full' },
    { id: 'rp_6', roleId: 'role_super_admin', permission: 'payment:manage', access: 'full' },
    { id: 'rp_7', roleId: 'role_super_admin', permission: 'system:settings', access: 'full' }
  ],
  auditLogs: [],
  platformSettings: [
    { key: 'order_auto_cancel_minutes', value: 30, updatedAt: new Date().toISOString() },
    { key: 'cart_ttl_days', value: 7, updatedAt: new Date().toISOString() },
    { key: 'receipt_confirm_timeout_days', value: 14, updatedAt: new Date().toISOString() },
    { key: 'payment_timeout_minutes', value: 30, updatedAt: new Date().toISOString() },
    { key: 'shipping_first_weight_cents', value: 3000, updatedAt: new Date().toISOString() },
    { key: 'shipping_extra_weight_cents', value: 1000, updatedAt: new Date().toISOString() },
    { key: 'stock_warn_threshold_default', value: 15, updatedAt: new Date().toISOString() },
    { key: 'purchase_limit_per_order_default', value: 5, updatedAt: new Date().toISOString() },
    { key: 'shop_name_zh', value: '香港生活百貨商城', updatedAt: new Date().toISOString() },
    { key: 'shop_name_en', value: 'HK Department Store', updatedAt: new Date().toISOString() },
    { key: 'privacy_policy_zh', value: '我們承諾保障您的個人隱私。本系統數據處理可能跨境傳輸至新加坡(SG)及經由Resend郵件發送服務器處理，符合PDPO隱私指引。', updatedAt: new Date().toISOString() },
    { key: 'privacy_policy_en', value: 'We respect your privacy. All user database files may be securely stored in Singapore(SG) and processed via Resend email delivery systems, fully compliant with PDPO regulations.', updatedAt: new Date().toISOString() },
    { key: 'contact_info', value: 'email: cs@apcube.com | Tel: +852 2345 6789', updatedAt: new Date().toISOString() }
  ]
};

class FileDatabase {
  private state: DatabaseState = DEFAULT_STATE;

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        this.state = JSON.parse(data);
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading database file, using fallback state:', e);
      this.state = DEFAULT_STATE;
    }
  }

  private save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving state to database file:', e);
    }
  }

  // Atomic state transaction helper
  public transaction<T>(callback: (state: DatabaseState) => T): T {
    this.load(); // Refresh state from file before operation
    const result = callback(this.state);
    this.save(); // Save updated state to file
    return result;
  }

  // General Accessors
  public getUsers() { return this.state.users; }
  public getCategories() { return this.state.categories; }
  public getProducts() { return this.state.products; }
  public getProductSpecs() { return this.state.productSpecs; }
  public getInventory() { return this.state.inventory; }
  public getCarts() { return this.state.carts; }
  public getCartItems() { return this.state.cartItems; }
  public getDiscounts() { return this.state.discounts; }
  public getFullReductions() { return this.state.fullReductions; }
  public getShippingTemplates() { return this.state.shippingTemplates; }
  public getOrders() { return this.state.orders; }
  public getOrderItems() { return this.state.orderItems; }
  public getPayments() { return this.state.payments; }
  public getBanners() { return this.state.banners; }
  public getAnnouncements() { return this.state.announcements; }
  public getRecommendations() { return this.state.recommendations; }
  public getFAQs() { return this.state.faqs; }
  public getFeedbacks() { return this.state.feedbacks; }
  public getAdmins() { return this.state.admins; }
  public getRoles() { return this.state.roles; }
  public getRolePermissions() { return this.state.rolePermissions; }
  public getAuditLogs() { return this.state.auditLogs; }
  public getPlatformSettings() { return this.state.platformSettings; }
}

export const dbInstance = new FileDatabase();
export default dbInstance;
