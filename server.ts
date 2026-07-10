import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dbInstance from './src/server/db.ts';
import { 
  generateId, generateOrderNo, encrypt, decrypt, 
  calculateShippingAndDiscount 
} from './src/server/controllers.ts';
import { 
  User, CartItem, Order, OrderItem, Payment, Feedback, FAQ, Category, Product, ProductSpec, Inventory 
} from './src/types/index.ts';

const app = express();
const PORT = 3000;

// Enable CORS for frontend domains (e.g. Vercel)
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';

// JWT Middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ code: 'FORBIDDEN', message: 'Token invalid' });
    // @ts-ignore
    req.user = user;
    next();
  });
};

// Log incoming API calls
app.use((req, res, next) => {
  console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * ============================================================================
 * C-END AUTHENTICATION ENDPOINTS (SDRS §5.8)
 * ============================================================================
 */

// Register standard email & password
app.post('/api/auth/register', (req, res) => {
  const { email, password, phone } = req.body;
  if (!email || !password) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email and password are required.' });
  }

  const result = dbInstance.transaction((state) => {
    const exists = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, code: 'EMAIL_EXISTS', message: 'Email already registered.' };
    }

    const newUser: User = {
      id: generateId('usr'),
      email: email.toLowerCase(),
      passwordHash: password, // Simple pass in preview
      phoneEncrypted: phone ? encrypt(phone) : undefined,
      locale: 'zh-HK',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.users.push(newUser);

    // Initial cart provisioning
    state.carts.push({
      id: `cart_${newUser.id}`,
      userId: newUser.id,
      updatedAt: new Date().toISOString()
    });

    return { success: true, user: newUser };
  });

  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json({ success: true, user: { id: result.user?.id, email: result.user?.email, locale: result.user?.locale } });
});

// Real Login using JWT
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = dbInstance.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password);
  if (!user) {
    return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
  }
  if (user.status === 'disabled') {
    return res.status(403).json({ code: 'USER_DISABLED', message: 'Your account has been disabled by an administrator.' });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, email: user.email, locale: user.locale } });
});

// Simulate Login for dropdown persona switcher (NO password required)
app.post('/api/auth/simulate', (req, res) => {
  const { userId } = req.body;
  // Fallback map user_1 to usr_1 if needed
  const mappedId = userId === 'user_1' ? 'usr_1' : (userId === 'user_2' ? 'usr_2' : userId);
  let user = dbInstance.getUsers().find(u => u.id === mappedId);
  
  // If user_2 doesn't exist, create it for the simulation
  if (!user && mappedId === 'usr_2') {
    user = {
      id: 'usr_2',
      email: 'david@gmail.com',
      passwordHash: 'dummy',
      locale: 'zh-HK',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbInstance.getUsers().push(user);
    dbInstance.getCarts().push({ id: `cart_${user.id}`, userId: user.id, updatedAt: new Date().toISOString() });
  }

  if (!user) {
    return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found.' });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, email: user.email, locale: user.locale } });
});

// Password Reset Token submission (D18)
app.post('/api/auth/password/forgot', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ code: 'INVALID_EMAIL', message: 'Email is required.' });
  }
  const user = dbInstance.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // Standard response even if email doesn't exist to prevent enumeration
    return res.json({ success: true, message: 'If the email exists, a reset link has been dispatched.' });
  }

  // Create temporary token and alert
  console.log(`[Resend Mock Email Dispatch] Password reset token generated for ${email}: mock_token_${user.id}`);
  res.json({ 
    success: true, 
    message: 'If the email exists, a reset link has been dispatched.',
    previewToken: `mock_token_${user.id}` // Left in API for easy previewing
  });
});

app.post('/api/auth/password/reset', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Token and new password are required.' });
  }

  const userId = token.replace('mock_token_', '');
  const result = dbInstance.transaction((state) => {
    const user = state.users.find(u => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPassword;
    user.updatedAt = new Date().toISOString();
    return true;
  });

  if (!result) {
    return res.status(400).json({ code: 'TOKEN_INVALID', message: 'Password reset link has expired or is invalid.' });
  }
  res.json({ success: true, message: 'Password updated successfully.' });
});

/**
 * ============================================================================
 * SHOP CONTENT & PRODUCTS ENDPOINTS (SDRS §5.1-5.4)
 * ============================================================================
 */

app.get('/api/banners', (req, res) => {
  const activeBanners = dbInstance.getBanners().filter(b => b.enabled);
  res.json(activeBanners);
});

app.get('/api/announcements', (req, res) => {
  const activeAnns = dbInstance.getAnnouncements().filter(a => a.enabled);
  res.json(activeAnns);
});

app.get('/api/categories', (req, res) => {
  const enabledCategories = dbInstance.getCategories().filter(c => !c.disabled);
  res.json(enabledCategories);
});

app.get('/api/products', (req, res) => {
  const { categoryId, keyword, priceMin, priceMax, sort } = req.query;
  let list = dbInstance.getProducts().filter(p => p.status === 'on_shelf');

  if (categoryId) {
    list = list.filter(p => p.categoryId === categoryId);
  }

  if (keyword) {
    const kw = String(keyword).toLowerCase();
    list = list.filter(p => p.nameZh.toLowerCase().includes(kw) || p.nameEn.toLowerCase().includes(kw));
  }

  if (priceMin) {
    list = list.filter(p => p.priceAfterCents >= Number(priceMin));
  }

  if (priceMax) {
    list = list.filter(p => p.priceAfterCents <= Number(priceMax));
  }

  // Sort options
  if (sort === 'sales' || sort === 'new') {
    list = list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } else if (sort === 'priceAsc') {
    list = list.sort((a, b) => a.priceAfterCents - b.priceAfterCents);
  } else if (sort === 'priceDesc') {
    list = list.sort((a, b) => b.priceAfterCents - a.priceAfterCents);
  }

  res.json(list);
});

// Single Product detail with specs and real inventory counts
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = dbInstance.getProducts().find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' });
  }

  const specs = dbInstance.getProductSpecs().filter(s => s.productId === id);
  const specInventory = specs.map(spec => {
    const inv = dbInstance.getInventory().find(i => i.skuId === spec.id) || { stock: 0, lockedStock: 0 };
    return {
      ...spec,
      availableStock: Math.max(0, inv.stock - inv.lockedStock),
      totalStock: inv.stock
    };
  });

  res.json({
    ...product,
    specs: specInventory
  });
});

app.get('/api/products/recommendations', (req, res) => {
  const recs = dbInstance.getRecommendations();
  const list = recs.map(r => {
    const p = dbInstance.getProducts().find(prod => prod.id === r.productId);
    return p ? { ...p, slot: r.slot, sort: r.sort } : null;
  }).filter(Boolean);
  res.json(list);
});

/**
 * ============================================================================
 * SHOP CART ENDPOINTS (SDRS §5.5)
 * ============================================================================
 */

app.get('/api/cart/:userId', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const cartId = `cart_${userId}`;
  const items = dbInstance.getCartItems().filter(i => i.cartId === cartId);

  // Map product details onto cart items
  const mappedItems = items.map(item => {
    const spec = dbInstance.getProductSpecs().find(s => s.id === item.skuId);
    if (!spec) return null;
    const product = dbInstance.getProducts().find(p => p.id === spec.productId);
    if (!product) return null;

    const inv = dbInstance.getInventory().find(i => i.skuId === item.skuId) || { stock: 0, lockedStock: 0 };

    return {
      ...item,
      spec,
      product,
      availableStock: Math.max(0, inv.stock - inv.lockedStock)
    };
  }).filter(Boolean);

  res.json(mappedItems);
});

app.post('/api/cart/items', authenticateToken, (req, res) => {
  const { skuId, qty } = req.body;
  const userId = (req as any).user.id;
  if (!userId || !skuId || !qty) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'User ID, SKU ID and Quantity are required.' });
  }

  const result = dbInstance.transaction((state) => {
    const cartId = `cart_${userId}`;
    const spec = state.productSpecs.find(s => s.id === skuId);
    if (!spec) return { success: false, message: 'SKU not found.' };

    const inv = state.inventory.find(i => i.skuId === skuId) || { stock: 0, lockedStock: 0 };
    const available = inv.stock - inv.lockedStock;
    if (available < qty) {
      return { success: false, code: 'INSUFFICIENT_STOCK', message: 'Insufficient stock available.' };
    }

    const existing = state.cartItems.find(i => i.cartId === cartId && i.skuId === skuId);
    if (existing) {
      existing.qty = Math.min(available, existing.qty + qty);
    } else {
      state.cartItems.push({
        id: generateId('cti'),
        cartId,
        skuId,
        qty,
        checked: true,
        createdAt: new Date().toISOString()
      });
    }

    return { success: true };
  });

  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json({ success: true });
});

app.patch('/api/cart/items/:itemId', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const { itemId } = req.params;
  const { qty, checked } = req.body;

  const result = dbInstance.transaction((state) => {
    const item = state.cartItems.find(i => i.id === itemId);
    if (!item) return false;

    if (qty !== undefined) {
      const inv = state.inventory.find(i => i.skuId === item.skuId) || { stock: 0, lockedStock: 0 };
      const available = inv.stock - inv.lockedStock;
      item.qty = Math.min(available, Math.max(1, qty));
    }

    if (checked !== undefined) {
      item.checked = checked;
    }

    return true;
  });

  if (!result) {
    return res.status(404).json({ message: 'Cart item not found.' });
  }
  res.json({ success: true });
});

app.delete('/api/cart/items/:itemId', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const { itemId } = req.params;
  const result = dbInstance.transaction((state) => {
    const idx = state.cartItems.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    state.cartItems.splice(idx, 1);
    return true;
  });

  if (!result) {
    return res.status(404).json({ message: 'Cart item not found.' });
  }
  res.json({ success: true });
});

/**
 * ============================================================================
 * CHECKOUT PREVIEW & ORDER SUBMISSION (SDRS §5.6, §7.3, §7.4, §7.7)
 * ============================================================================
 */

// Preview calculations (Read-only, no stock lock)
app.post('/api/checkout/preview', authenticateToken, (req, res) => {
  const { items, addressId } = req.body; // Array of { skuId, qty }
  const userId = (req as any).user.id;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ code: 'EMPTY_CHECKOUT', message: 'No items provided for checkout.' });
  }

  const preview = calculateShippingAndDiscount(items, addressId);
  res.json(preview);
});

// Submit Order (Atomic transaction with interactive lockedStock adjustments)
app.post('/api/orders', authenticateToken, (req, res) => {
  const { items, address, paymentMethod, remark } = req.body;
  const userId = (req as any).user.id;
  if (!userId || !items || !items.length || !address || !paymentMethod) {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Missing fields for order.' });
  }

  const result = dbInstance.transaction((state) => {
    // 1. Strict limit validations (D20⑦ & §7.7)
    const limitSetting = state.platformSettings.find(s => s.key === 'purchase_limit_per_order_default');
    const orderLimit = limitSetting?.value || 10;

    const totalQty = items.reduce((sum: number, it: any) => sum + it.qty, 0);
    if (totalQty > orderLimit) {
      return { 
        success: false, 
        code: 'PURCHASE_LIMIT_EXCEEDED', 
        message: `Order limit exceeded. Maximum items allowed per order is ${orderLimit}. (You have ${totalQty})` 
      };
    }

    // Single item limit validation
    for (const item of items) {
      if (item.qty > 5) {
        return { 
          success: false, 
          code: 'PURCHASE_LIMIT_EXCEEDED', 
          message: `Single item purchase limit exceeded. Sku limit is 5 units per order.` 
        };
      }
    }

    // 2. Perform atomic inventory stock verification & locking (SDRS §7.3)
    for (const item of items) {
      const inv = state.inventory.find(i => i.skuId === item.skuId);
      if (!inv) {
        return { success: false, code: 'PRODUCT_UNAVAILABLE', message: 'Product SKU is no longer available.' };
      }
      const available = inv.stock - inv.lockedStock;
      if (available < item.qty) {
        return { success: false, code: 'INVENTORY_INSUFFICIENT', message: 'Some items in your cart are out of stock.' };
      }
    }

    // 3. Atomically update inventory lockedStock values
    for (const item of items) {
      const inv = state.inventory.find(i => i.skuId === item.skuId)!;
      inv.lockedStock += item.qty;
    }

    // 4. Calculate prices
    const calc = calculateShippingAndDiscount(items);

    // 5. Create Order records
    const orderId = generateId('ord');
    const orderNo = generateOrderNo();

    const newOrder: Order = {
      id: orderId,
      orderNo,
      userId,
      status: 'pending_payment',
      paymentStatus: 'pending',
      addressSnapshot: address,
      shippingMethod: 'sf_express',
      remark,
      subtotalCents: calc.subtotalCents,
      discountCents: calc.discountCents,
      shippingFeeCents: calc.shippingFeeCents,
      totalCents: calc.totalCents,
      createdAt: new Date().toISOString()
    };

    state.orders.push(newOrder);

    // Create Order item logs
    for (const detail of calc.itemDetails) {
      state.orderItems.push({
        id: generateId('ori'),
        orderId,
        productSnapshot: {
          nameZh: detail.product.nameZh,
          nameEn: detail.product.nameEn,
          imageUrl: detail.product.images[0],
          specNameZh: detail.spec.specNameZh,
          specNameEn: detail.spec.specNameEn
        },
        skuId: detail.spec.id,
        qty: detail.qty,
        priceAfterCents: detail.unitPriceCents
      });
    }

    // Create initial payment tracking shell
    const paymentId = generateId('pay');
    state.payments.push({
      id: paymentId,
      orderId,
      method: paymentMethod,
      status: 'pending',
      amountCents: calc.totalCents,
      createdAt: new Date().toISOString()
    });

    // Clear checked cart items upon ordering
    const cartId = `cart_${userId}`;
    state.cartItems = state.cartItems.filter(i => !(i.cartId === cartId && i.checked));

    return { success: true, order: newOrder };
  });

  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// C-End Order query lists
app.get('/api/orders/mine/:userId', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const list = dbInstance.getOrders().filter(o => o.userId === userId);
  const mapped = list.map(o => {
    const items = dbInstance.getOrderItems().filter(oi => oi.orderId === o.id);
    return { ...o, items };
  });
  res.json(mapped);
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = dbInstance.getOrders().find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ code: 'ORDER_NOT_FOUND', message: 'Order not found.' });
  }
  const items = dbInstance.getOrderItems().filter(oi => oi.orderId === id);
  const payment = dbInstance.getPayments().find(p => p.orderId === id);
  res.json({ ...order, items, payment });
});

// Confirm Receipt
app.post('/api/orders/:id/confirm-receipt', (req, res) => {
  const { id } = req.params;
  const result = dbInstance.transaction((state) => {
    const order = state.orders.find(o => o.id === id);
    if (!order || order.status !== 'shipped') return false;

    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    return true;
  });

  if (!result) {
    return res.status(400).json({ code: 'INVALID_OPERATION', message: 'Cannot confirm receipt at this stage.' });
  }
  res.json({ success: true });
});

// Cancel Order (User voluntary cancel, only allowed when pending_payment)
app.post('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const result = dbInstance.transaction((state) => {
    const order = state.orders.find(o => o.id === id);
    if (!order || order.status !== 'pending_payment') return false;

    order.status = 'cancelled';
    order.cancelledAt = new Date().toISOString();

    // Release locked inventory stock atomically (SDRS §7.1 & §7.3)
    const items = state.orderItems.filter(oi => oi.orderId === id);
    for (const item of items) {
      const inv = state.inventory.find(inv => inv.skuId === item.skuId);
      if (inv) {
        inv.lockedStock = Math.max(0, inv.lockedStock - item.qty);
      }
    }

    return true;
  });

  if (!result) {
    return res.status(400).json({ code: 'INVALID_OPERATION', message: 'Order can only be cancelled while pending payment.' });
  }
  res.json({ success: true });
});

/**
 * ============================================================================
 * PAYMENT PROCESSING MODULES (SDRS §5.7, §7.2, §8.4)
 * ============================================================================
 */

// Offline bank transfer: uploading payment receipts
app.post('/api/payments/:orderId/voucher', (req, res) => {
  const { orderId } = req.params;
  const { voucherUrl } = req.body;
  if (!voucherUrl) {
    return res.status(400).json({ message: 'Voucher receipt file URL is required.' });
  }

  const result = dbInstance.transaction((state) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order || order.status !== 'pending_payment') return false;

    const payment = state.payments.find(p => p.orderId === orderId);
    if (!payment) return false;

    payment.voucherUrl = voucherUrl;
    payment.status = 'pending_review';
    order.paymentStatus = 'pending_review';

    return true;
  });

  if (!result) {
    return res.status(400).json({ code: 'FAILED', message: 'Unable to process receipt uploads for this order.' });
  }
  res.json({ success: true });
});

// Mocking online payments (FPS, PayMe, AlipayHK - PSP triggers)
app.post('/api/payments/:orderId/charge', (req, res) => {
  const { orderId } = req.params;
  const result = dbInstance.transaction((state) => {
    const order = state.orders.find(o => o.id === orderId);
    if (!order || order.status !== 'pending_payment') return false;

    const payment = state.payments.find(p => p.orderId === orderId);
    if (!payment) return false;

    // Simulate instant success for mock gateway
    payment.status = 'paid';
    payment.paidAt = new Date().toISOString();
    payment.gatewayTxnId = `txn_${Math.random().toString(36).substr(2, 9)}`;

    order.status = 'paid';
    order.paymentStatus = 'paid';
    order.paidAt = new Date().toISOString();

    // Deduct stock total and clean up locked inventory atomically (SDRS §7.3)
    const items = state.orderItems.filter(oi => oi.orderId === orderId);
    for (const item of items) {
      const inv = state.inventory.find(i => i.skuId === item.skuId);
      if (inv) {
        inv.stock = Math.max(0, inv.stock - item.qty);
        inv.lockedStock = Math.max(0, inv.lockedStock - item.qty);
      }
    }

    return true;
  });

  if (!result) {
    return res.status(400).json({ message: 'Payment gateway trigger failed.' });
  }
  res.json({ success: true });
});

app.get('/api/payments/:orderId/poll', (req, res) => {
  const { orderId } = req.params;
  const payment = dbInstance.getPayments().find(p => p.orderId === orderId);
  if (!payment) {
    return res.status(404).json({ message: 'Payment logs not found.' });
  }
  res.json({ status: payment.status });
});

/**
 * ============================================================================
 * CUSTOMER HELP & SUPPORT FAQ TICKETS (SDRS §5.11, §5.14)
 * ============================================================================
 */

app.get('/api/faqs', (req, res) => {
  const activeFaqs = dbInstance.getFAQs().filter(f => f.enabled).sort((a, b) => a.sort - b.sort);
  res.json(activeFaqs);
});

app.post('/api/feedbacks', authenticateToken, (req, res) => {
  const { contact, type, orderId, content } = req.body;
  const userId = (req as any).user.id;
  if (!content) {
    return res.status(400).json({ message: 'Feedback contents cannot be empty.' });
  }

  const result = dbInstance.transaction((state) => {
    const feedback: Feedback = {
      id: generateId('fdb'),
      userId,
      contact,
      type,
      orderId,
      content,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    state.feedbacks.push(feedback);
    return feedback;
  });

  res.json({ success: true, feedback: result });
});

app.get('/api/feedbacks/mine/:userId', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const list = dbInstance.getFeedbacks().filter(f => f.userId === userId);
  res.json(list);
});

/**
 * ============================================================================
 * B-END ENTERPRISE ADMIN CODES (SDRS §6.1-§6.9)
 * ============================================================================
 */

// Admin Dashboard stats aggregators (SDRS §6.8)
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  const orders = dbInstance.getOrders();
  const items = dbInstance.getOrderItems();
  const products = dbInstance.getProducts();

  const totalSalesCents = orders.filter(o => o.status !== 'cancelled' && o.status !== 'pending_payment')
                                .reduce((sum, o) => sum + o.totalCents, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending_payment').length;
  const paidOrders = orders.filter(o => o.status === 'paid').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;

  // Stock alerts counter
  const stockAlerts = dbInstance.getInventory().filter(i => {
    const threshold = i.warnThreshold || 15;
    return i.stock <= threshold;
  }).length;

  res.json({
    totalSalesCents,
    totalOrdersCount: orders.length,
    pendingOrders,
    paidOrders,
    shippedOrders,
    productsCount: products.length,
    stockAlerts
  });
});

// Admin product catalog fetching (SDRS §6.1)
app.get('/api/admin/products', authenticateToken, (req, res) => {
  const products = dbInstance.getProducts();
  const specs = dbInstance.getProductSpecs();
  const inventories = dbInstance.getInventory();

  const list = products.map(p => {
    const productSpecs = specs.filter(s => s.productId === p.id);
    const specStock = productSpecs.map(s => {
      const inv = inventories.find(i => i.skuId === s.id) || { stock: 0, lockedStock: 0, warnThreshold: 15 };
      return {
        ...s,
        stock: inv.stock,
        lockedStock: inv.lockedStock,
        warnThreshold: inv.warnThreshold
      };
    });

    return {
      ...p,
      specs: specStock
    };
  });

  res.json(list);
});

// Add / edit product APIs
app.post('/api/admin/products', authenticateToken, (req, res) => {
  const { nameZh, nameEn, descriptionZh, descriptionEn, priceOriginalCents, priceAfterCents, categoryId, images, specs } = req.body;

  const result = dbInstance.transaction((state) => {
    const productId = generateId('prod');
    const newProduct: Product = {
      id: productId,
      nameZh,
      nameEn,
      descriptionZh,
      descriptionEn,
      priceOriginalCents: Number(priceOriginalCents),
      priceAfterCents: Number(priceAfterCents),
      categoryId,
      status: 'draft',
      images: images || ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.products.push(newProduct);

    // Provisions child specifications
    if (specs && Array.isArray(specs)) {
      specs.forEach((s: any) => {
        const specId = generateId('spec');
        state.productSpecs.push({
          id: specId,
          productId,
          specNameZh: s.specNameZh,
          specNameEn: s.specNameEn,
          priceOriginalCents: Number(s.priceOriginalCents || priceOriginalCents),
          priceAfterCents: Number(s.priceAfterCents || priceAfterCents)
        });

        // Seed initial inventory
        state.inventory.push({
          skuId: specId,
          stock: Number(s.stock || 100),
          lockedStock: 0,
          warnThreshold: Number(s.warnThreshold || 15)
        });
      });
    }

    return newProduct;
  });

  res.json({ success: true, product: result });
});

app.patch('/api/admin/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nameZh, nameEn, status, priceOriginalCents, priceAfterCents } = req.body;

  const result = dbInstance.transaction((state) => {
    const p = state.products.find(prod => prod.id === id);
    if (!p) return false;

    if (nameZh !== undefined) p.nameZh = nameZh;
    if (nameEn !== undefined) p.nameEn = nameEn;
    if (status !== undefined) p.status = status;
    if (priceOriginalCents !== undefined) p.priceOriginalCents = Number(priceOriginalCents);
    if (priceAfterCents !== undefined) p.priceAfterCents = Number(priceAfterCents);

    p.updatedAt = new Date().toISOString();
    return true;
  });

  if (!result) return res.status(404).json({ message: 'Product not found.' });
  res.json({ success: true });
});

// Inventory stock adjustment (SDRS §6.1)
app.patch('/api/admin/inventory/:skuId', authenticateToken, (req, res) => {
  const { skuId } = req.params;
  const { stock, warnThreshold } = req.body;

  const result = dbInstance.transaction((state) => {
    const inv = state.inventory.find(i => i.skuId === skuId);
    if (!inv) return false;

    if (stock !== undefined) inv.stock = Number(stock);
    if (warnThreshold !== undefined) inv.warnThreshold = Number(warnThreshold);

    return true;
  });

  if (!result) return res.status(404).json({ message: 'SKU Inventory records not found.' });
  res.json({ success: true });
});

// Admin order lists
app.get('/api/admin/orders', authenticateToken, (req, res) => {
  const list = dbInstance.getOrders();
  const mapped = list.map(o => {
    const items = dbInstance.getOrderItems().filter(oi => oi.orderId === o.id);
    const user = dbInstance.getUsers().find(u => u.id === o.userId);
    return {
      ...o,
      items,
      userEmail: user?.email || 'Guest'
    };
  });
  res.json(mapped);
});

// Update Shipping / Tracking SF Express logs (SDRS §6.2)
app.post('/api/admin/orders/:id/ship', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { trackingNo } = req.body;
  if (!trackingNo) {
    return res.status(400).json({ message: 'Tracking number is required.' });
  }

  const result = dbInstance.transaction((state) => {
    const order = state.orders.find(o => o.id === id);
    if (!order || order.status !== 'paid') return false;

    order.status = 'shipped';
    order.trackingNo = trackingNo;
    order.shippedAt = new Date().toISOString();

    return true;
  });

  if (!result) return res.status(400).json({ message: 'Order is not in a shippable state.' });
  res.json({ success: true });
});

// Audit log改價 (SDRS §6.2 & §7.5)
app.patch('/api/admin/orders/:id/price', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { newTotalCents, adminUsername } = req.body;

  const result = dbInstance.transaction((state) => {
    const order = state.orders.find(o => o.id === id);
    if (!order || order.status !== 'pending_payment') return false;

    const oldTotal = order.totalCents;
    order.totalCents = Number(newTotalCents);

    // Audit logs entry
    state.auditLogs.push({
      id: generateId('aud'),
      adminId: 'adm_1',
      action: `改價: Order ${order.orderNo} updated from HK$${(oldTotal/100).toFixed(2)} to HK$${(newTotalCents/100).toFixed(2)}`,
      targetType: 'order',
      targetId: id,
      detail: { oldTotal, newTotal: newTotalCents, modifiedBy: adminUsername || 'admin' },
      createdAt: new Date().toISOString()
    });

    return true;
  });

  if (!result) return res.status(400).json({ message: 'Cannot adjust order price at this stage.' });
  res.json({ success: true });
});

// Close / cancel order from admin console (SDRS §6.2)
app.post('/api/admin/orders/:id/close', authenticateToken, (req, res) => {
  const { id } = req.params;
  const result = dbInstance.transaction((state) => {
    const order = state.orders.find(o => o.id === id);
    if (!order || (order.status !== 'pending_payment' && order.status !== 'paid')) return false;

    order.status = 'cancelled';
    order.cancelledAt = new Date().toISOString();

    // Release locked stock atomically
    const items = state.orderItems.filter(oi => oi.orderId === id);
    for (const item of items) {
      const inv = state.inventory.find(i => i.skuId === item.skuId);
      if (inv) {
        inv.lockedStock = Math.max(0, inv.lockedStock - item.qty);
      }
    }

    return true;
  });

  if (!result) return res.status(400).json({ message: 'Unable to cancel this order.' });
  res.json({ success: true });
});

// Approve voucher uploads (SDRS §7.2)
app.post('/api/admin/payments/:id/approve', authenticateToken, (req, res) => {
  const { id } = req.params; // order id
  const result = dbInstance.transaction((state) => {
    const order = state.orders.find(o => o.id === id);
    if (!order || order.paymentStatus !== 'pending_review') return false;

    const payment = state.payments.find(p => p.orderId === id);
    if (!payment) return false;

    payment.status = 'paid';
    payment.paidAt = new Date().toISOString();

    order.status = 'paid';
    order.paymentStatus = 'paid';
    order.paidAt = new Date().toISOString();

    // Atomically fulfill stock changes
    const items = state.orderItems.filter(oi => oi.orderId === id);
    for (const item of items) {
      const inv = state.inventory.find(i => i.skuId === item.skuId);
      if (inv) {
        inv.stock = Math.max(0, inv.stock - item.qty);
        inv.lockedStock = Math.max(0, inv.lockedStock - item.qty);
      }
    }

    return true;
  });

  if (!result) return res.status(400).json({ message: 'No pending receipt review found.' });
  res.json({ success: true });
});

// Reject voucher (SDRS §7.2)
app.post('/api/admin/payments/:id/reject', authenticateToken, (req, res) => {
  const { id } = req.params; // order id
  const result = dbInstance.transaction((state) => {
    const order = state.orders.find(o => o.id === id);
    if (!order || order.paymentStatus !== 'pending_review') return false;

    const payment = state.payments.find(p => p.orderId === id);
    if (!payment) return false;

    payment.status = 'failed';
    order.paymentStatus = 'pending'; // Let customer re-upload

    return true;
  });

  if (!result) return res.status(400).json({ message: 'No pending receipt review found.' });
  res.json({ success: true });
});

// Customer Feedbacks Desk (SDRS §6.7)
app.get('/api/admin/feedbacks', authenticateToken, (req, res) => {
  res.json(dbInstance.getFeedbacks());
});

app.post('/api/admin/feedbacks/:id/reply', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  const result = dbInstance.transaction((state) => {
    const fb = state.feedbacks.find(f => f.id === id);
    if (!fb) return false;

    fb.reply = reply;
    fb.status = 'replied';
    fb.repliedAt = new Date().toISOString();

    return true;
  });

  if (!result) return res.status(404).json({ message: 'Feedback ticket not found.' });
  res.json({ success: true });
});

// Audit logging outputs
app.get('/api/admin/audit-logs', authenticateToken, (req, res) => {
  res.json(dbInstance.getAuditLogs());
});

// Backup trigger simulator (SDRS §6.9)
app.post('/api/admin/backups/trigger', authenticateToken, (req, res) => {
  const stateData = dbInstance.getProducts(); // simplistic backup representation
  res.json({
    success: true,
    fileUrl: `https://api.apcube.com/backups/manual_backup_${Date.now()}.json`,
    timestamp: new Date().toISOString(),
    sizeBytes: JSON.stringify(stateData).length
  });
});

// Admin System preferences management
app.get('/api/admin/settings', authenticateToken, (req, res) => {
  res.json(dbInstance.getPlatformSettings());
});

app.patch('/api/admin/settings', authenticateToken, (req, res) => {
  const { settings } = req.body; // Array of { key, value }
  if (!settings || !Array.isArray(settings)) {
    return res.status(400).json({ message: 'Invalid settings body.' });
  }

  dbInstance.transaction((state) => {
    settings.forEach((s: any) => {
      const match = state.platformSettings.find(p => p.key === s.key);
      if (match) {
        match.value = s.value;
        match.updatedAt = new Date().toISOString();
      }
    });
  });

  res.json({ success: true });
});

/**
 * ============================================================================
 * VITE INTEGRATION RUNTIME & EXPORT FOR BROWSER (PORT 3000 SPECIFIC)
 * ============================================================================
 */

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hong Kong Department Store Server running on http://localhost:${PORT}`);
  });
}

startServer();
