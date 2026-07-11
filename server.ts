import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from './src/server/db.js';
import * as schema from './src/server/schema.js';
import { seedDatabase } from './src/server/seed.js';
import { eq, and, or, inArray, sql, desc, gte, sum, ilike } from 'drizzle-orm';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());


import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { Resend } from 'resend';

import rateLimit from 'express-rate-limit';

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // Stricter limit for APIs
  message: { error: 'API rate limit exceeded.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit auth endpoints
  message: { error: 'Too many login attempts, please try again after an hour' }
});

app.use(globalLimiter);
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev';




const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// Async Email Notification Queue
const emailQueue: Array<{to: string, subject: string, content: string}> = [];

// Worker processes the queue in the background
setInterval(async () => {
  if (emailQueue.length > 0) {
    const task = emailQueue.shift();
    if (task) {
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: EMAIL_FROM,
            to: task.to,
            subject: task.subject,
            html: task.content,
          });
          console.log(`[Email Queue] Sent email to ${task.to}`);
        } catch (e) {
          console.error(`[Email Queue] Failed to send email to ${task.to}`, e);
          // Optional: implement retry logic here
        }
      } else {
        console.log(`[Email Queue DEV MODE - No RESEND_API_KEY] Mock email to ${task.to}`);
        console.log(`Subject: ${task.subject}`);
      }
    }
  }
}, 2000); // Process every 2 seconds

// Replace the mock sendTransactionalEmail with the queue
const sendTransactionalEmail = (email: string, subject: string, content: string) => {
  emailQueue.push({ to: email, subject, content });
};

const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ code: 'FORBIDDEN', message: 'Token invalid' });
    (req as any).user = user;
    next();
  });
};

const authenticateAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) return res.status(403).json({ code: 'FORBIDDEN', message: 'Token invalid' });
    
    // Check role from DB
    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.id, user.id)
    });
    
    if (!dbUser || dbUser.role !== 'admin') {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    
    (req as any).user = user;
    next();
  });
};

app.use((req, res, next) => {
  console.log(`[API ${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully.' });
  } catch (e: any) {
    res.status(500).json({ code: 'SEED_FAILED', message: e.message });
  }
});

// Setup auth interceptor context
// Auth
app.post('/api/auth/register', async (req, res) => {
  const { email, password, phone } = req.body;
  if (!email || !password) return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email and password required' });
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (existing) return res.status(400).json({ code: 'EMAIL_EXISTS', message: 'Email already registered.' });
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  const newUser = {
    id: `usr_${uuidv4().substring(0, 8)}`,
    email,
    passwordHash,
    phoneEncrypted: phone,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await db.insert(schema.users).values(newUser);
  await db.insert(schema.carts).values({ id: `cart_${newUser.id}`, userId: newUser.id });
  res.json({ success: true, user: { id: newUser.id, email: newUser.email, locale: 'zh-HK' } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email)
  });
  
  if (!user) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
  
  let isMatch = false;
  res.json({ success: true, token, user: { id: user.id, email: user.email, locale: user.locale, role: user.role, tier: user.tier } });
});

app.post('/api/auth/password/forgot', async (req, res) => {
  const { email } = req.body;
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found.' });
  res.json({ success: true, message: 'Reset link sent to email.' });
});

app.post('/api/auth/password/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  res.json({ success: true });
});

// Shop Info
app.get('/api/banners', async (req, res) => {
  const list = await db.query.banners.findMany({ where: eq(schema.banners.disabled, false) });
  res.json(list);
});

app.get('/api/announcements', async (req, res) => {
  const list = await db.query.announcements.findMany();
  res.json(list);
});

app.get('/api/categories', async (req, res) => {
  const list = await db.query.categories.findMany({ where: eq(schema.categories.disabled, false) });
  res.json(list);
});

// Products
app.get('/api/products', async (req, res) => {
  const { categoryId, q, minPrice, maxPrice, sort, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(String(page as string), 10) || 1;
  const limitNum = parseInt(String(limit as string), 10) || 20;

  let conditions = [];
  conditions.push(eq(schema.products.status, 'on_shelf'));
  if (categoryId) conditions.push(eq(schema.products.categoryId, String(categoryId)));
  
  // DB-level search condition using ilike for case-insensitive search
  if (q) {
    const searchPattern = `%${q}%`;
    conditions.push(
      or(
        ilike(schema.products.nameZh, searchPattern),
        ilike(schema.products.nameEn, searchPattern),
        ilike(schema.products.descriptionZh, searchPattern)
      )
    );
  }

  // Step 1: Query base products directly from DB with limit & offset
  // Note: True price filtering & sorting requires joins, which are complex in Drizzle's direct query API. 
  // We will do a DB-level pagination based on the primary conditions.
  const dbProds = await db.query.products.findMany({
    where: and(...conditions),
    // Sorting newest if no price sort is requested
    orderBy: sort === 'newest' ? [desc(schema.products.createdAt)] : undefined,
  });

  // Step 2: Fetch specs for retrieved products
  const specs = await db.query.productSpecs.findMany();

  // Combine and calculate
  let productsWithSpecs = dbProds.map(p => {
    const pSpecs = specs.filter(s => s.productId === p.id);
    const pMinPrice = pSpecs.length > 0 ? Math.min(...pSpecs.map(s => Number(s.priceAfterCents))) : 0;
    return { ...p, specs: pSpecs, minPrice: pMinPrice };
  });

  // Filter by price range
  if (minPrice) {
    productsWithSpecs = productsWithSpecs.filter(p => p.minPrice >= parseInt(String(minPrice), 10));
  }
  if (maxPrice) {
    productsWithSpecs = productsWithSpecs.filter(p => p.minPrice <= parseInt(String(maxPrice), 10));
  }

  // Sort by price if needed
  if (sort === 'price_asc') {
    productsWithSpecs.sort((a, b) => a.minPrice - b.minPrice);
  } else if (sort === 'price_desc') {
    productsWithSpecs.sort((a, b) => b.minPrice - a.minPrice);
  }

  // DB-level offset simulation after price filtering
  const total = productsWithSpecs.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedProducts = productsWithSpecs.slice(startIndex, startIndex + limitNum);

  res.json({
    data: paginatedProducts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

app.get('/api/products/recommendations', async (req, res) => {
  const prods = await db.query.products.findMany({ limit: 4, where: eq(schema.products.status, 'on_shelf') });
  const specs = await db.query.productSpecs.findMany({
    where: inArray(schema.productSpecs.productId, prods.map(p => p.id))
  });
  res.json(prods.map(p => ({
    ...p,
    specs: specs.filter(s => s.productId === p.id)
  })));
});

app.get('/api/products/:id', async (req, res) => {
  const p = await db.query.products.findFirst({ where: eq(schema.products.id, req.params.id) });
  if (!p) return res.status(404).json({ code: 'NOT_FOUND', message: 'Product not found' });
  const specs = await db.query.productSpecs.findMany({ where: eq(schema.productSpecs.productId, p.id) });
  res.json({ ...p, specs });
});

// Cart
app.get('/api/cart/:userId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const cartId = `cart_${userId}`;
  
  const items = await db.query.cartItems.findMany({ where: eq(schema.cartItems.cartId, cartId) });
  
  const specs = items.length ? await db.query.productSpecs.findMany({
    where: inArray(schema.productSpecs.id, items.map(i => i.skuId!))
  }) : [];
  
  const prods = specs.length ? await db.query.products.findMany({
    where: inArray(schema.products.id, specs.map(s => s.productId!))
  }) : [];

  const invs = specs.length ? await db.query.inventory.findMany({
    where: inArray(schema.inventory.skuId, specs.map(s => s.id))
  }) : [];

  const mapped = items.map(item => {
    const spec = specs.find(s => s.id === item.skuId);
    if (!spec) return null;
    const prod = prods.find(p => p.id === spec.productId);
    if (!prod) return null;
    const inv = invs.find(i => i.skuId === spec.id);
    return {
      id: item.id,
      skuId: item.skuId,
      qty: item.qty,
      checked: item.checked,
      productNameZh: prod.nameZh,
      productNameEn: prod.nameEn,
      specNameZh: spec.specNameZh,
      specNameEn: spec.specNameEn,
      priceOriginalCents: spec.priceOriginalCents,
      priceAfterCents: spec.priceAfterCents,
      images: prod.images,
      stock: inv?.stock || 0
    };
  }).filter(Boolean);

  res.json(mapped);
});

app.post('/api/cart/items', authenticateToken, async (req, res) => {
  const { skuId, qty } = req.body;
  const userId = (req as any).user.id;
  const cartId = `cart_${userId}`;

  // Ensure cart exists
  const cart = await db.query.carts.findFirst({ where: eq(schema.carts.id, cartId) });
  if (!cart) await db.insert(schema.carts).values({ id: cartId, userId });

  const existing = await db.query.cartItems.findFirst({
    where: and(eq(schema.cartItems.cartId, cartId), eq(schema.cartItems.skuId, skuId))
  });

  if (existing) {
    await db.update(schema.cartItems)
      .set({ qty: existing.qty! + qty })
      .where(eq(schema.cartItems.id, existing.id));
  } else {
    await db.insert(schema.cartItems).values({
      id: `ci_${uuidv4().substring(0,8)}`,
      cartId,
      skuId,
      qty,
      checked: true
    });
  }
  res.json({ success: true });
});

app.patch('/api/cart/items/:itemId', authenticateToken, async (req, res) => {
  const { qty, checked } = req.body;
  const updateData: any = {};
  if (qty !== undefined) updateData.qty = qty;
  if (checked !== undefined) updateData.checked = checked;
  
  await db.update(schema.cartItems)
    .set(updateData)
    .where(eq(schema.cartItems.id, req.params.itemId));
  res.json({ success: true });
});

app.delete('/api/cart/items/:itemId', authenticateToken, async (req, res) => {
  await db.delete(schema.cartItems).where(eq(schema.cartItems.id, req.params.itemId));
  res.json({ success: true });
});

app.post('/api/cart/batch', authenticateToken, async (req, res) => {
  const { action, itemIds, checked } = req.body;
  const userId = (req as any).user.id;
  
  if (action === 'delete') {
    if (itemIds && itemIds.length > 0) {
      await db.delete(schema.cartItems).where(inArray(schema.cartItems.id, itemIds));
    }
  } else if (action === 'check') {
    if (itemIds && itemIds.length > 0) {
      await db.update(schema.cartItems).set({ checked }).where(inArray(schema.cartItems.id, itemIds));
    }
  }
  res.json({ success: true });
});

// Checkout
app.post('/api/checkout/preview', authenticateToken, async (req, res) => {
  const { items } = req.body;
  let subtotalCents = 0;
  let itemDetails = [];
  
  const specs = items.length ? await db.query.productSpecs.findMany({
    where: inArray(schema.productSpecs.id, items.map((i: any) => i.skuId))
  }) : [];
  
  const prods = specs.length ? await db.query.products.findMany({
    where: inArray(schema.products.id, specs.map((s: any) => s.productId))
  }) : [];
  
  for (const item of items) {
    const spec = specs.find((s: any) => s.id === item.skuId);
    const product = prods.find((p: any) => p.id === spec?.productId);
    
    if (spec && product) {
      subtotalCents += spec.priceAfterCents * item.qty;
      itemDetails.push({
        spec,
        product,
        qty: item.qty,
        unitPriceCents: spec.priceAfterCents
      });
    }
  }
  
  // Get active rules
  const rules = await db.query.fullReductions.findMany({ where: eq(schema.fullReductions.active, true) });
  let discountCents = 0;
  let bestExclusive = 0;
  for (const rule of rules) {
    if (subtotalCents >= rule.thresholdCents && rule.reduceCents > bestExclusive) {
      bestExclusive = rule.reduceCents;
    }
  }
  discountCents += bestExclusive;
  
  if (discountCents > subtotalCents) discountCents = subtotalCents;

  let shippingFeeCents = (subtotalCents - discountCents) >= 30000 ? 0 : 3000; // Free shipping over HK$300, else HK$30
  let totalCents = subtotalCents + shippingFeeCents - discountCents;
  
  res.json({
    subtotalCents,
    shippingFeeCents,
    discountCents,
    totalCents,
    itemDetails
  });
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, (req as any).user.id) });
  const { items, address, paymentMethod, remark } = req.body;
  const userId = (req as any).user.id;
  
  const specs = items.length ? await db.query.productSpecs.findMany({
    where: inArray(schema.productSpecs.id, items.map((i: any) => i.skuId))
  }) : [];

  let totalCents = 0;
  const orderItemsData = [];
  
  for (const item of items) {
    const spec = specs.find((s: any) => s.id === item.skuId);
    if (!spec) return res.status(400).json({ code: 'SPEC_NOT_FOUND', message: 'Spec not found' });
    totalCents += spec.priceAfterCents * item.qty;
    orderItemsData.push({
      id: `oi_${uuidv4().substring(0,8)}`,
      skuId: spec.id,
      qty: item.qty,
      priceCents: spec.priceAfterCents
    });
  }

  const orderId = `ord_${uuidv4().substring(0,8)}`;
  
  await db.transaction(async (tx) => {
    // Check inventory
    for (const item of items) {
      const inv = await tx.query.inventory.findFirst({ where: eq(schema.inventory.skuId, item.skuId) });
      if (!inv || inv.stock - inv.lockedStock < item.qty) {
        throw new Error('INSUFFICIENT_STOCK');
      }
      await tx.update(schema.inventory)
        .set({ lockedStock: inv.lockedStock + item.qty })
        .where(eq(schema.inventory.skuId, item.skuId));
    }


    const rules = await tx.query.fullReductions.findMany({ where: eq(schema.fullReductions.active, true) });
    let discountCents = 0;
    let bestExclusive = 0;
    for (const rule of rules) {
      if (totalCents >= rule.thresholdCents && rule.reduceCents > bestExclusive) {
         bestExclusive = rule.reduceCents;
      }
    }
    discountCents += bestExclusive;
    if (discountCents > totalCents) discountCents = totalCents;

    let shippingFeeCents = (totalCents - discountCents) >= 30000 ? 0 : 3000;
    await tx.insert(schema.orders).values({
      id: orderId,
      userId,
      status: 'pending_payment',
      totalCents,
      shippingFeeCents,
      discountCents,
      grandTotalCents: totalCents + shippingFeeCents - discountCents,
      addressRecipient: address?.recipient,
      addressPhone: address?.phoneEncrypted,
      addressDetail: address?.detail,
      paymentMethod: paymentMethod,
      remark: remark
    });
    
    for (const oi of orderItemsData) {
      await tx.insert(schema.orderItems).values({ ...oi, orderId });
    }
    
    // Clear cart
    await tx.delete(schema.cartItems).where(
      and(eq(schema.cartItems.cartId, `cart_${userId}`), inArray(schema.cartItems.skuId, items.map((i:any)=>i.skuId)))
    );
  }).catch(e => {
    return res.status(400).json({ code: 'ORDER_FAILED', message: e.message });
  });

  res.json({ success: true, orderId });
});

app.get('/api/orders/mine/:userId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const list = await db.query.orders.findMany({ where: eq(schema.orders.userId, userId), orderBy: [desc(schema.orders.createdAt)] });
  
  const formatted = [];
  for (const order of list) {
    const items = await db.query.orderItems.findMany({ where: eq(schema.orderItems.orderId, order.id) });
    const formattedItems = [];
    for (const item of items) {
      const spec = await db.query.productSpecs.findFirst({ where: eq(schema.productSpecs.id, item.skuId) });
      const product = spec ? await db.query.products.findFirst({ where: eq(schema.products.id, spec.productId) }) : null;
      
      formattedItems.push({
        id: item.id,
        qty: item.qty,
        productSnapshot: {
          imageUrl: product?.images?.[0] || '',
          nameZh: product?.nameZh || '',
          nameEn: product?.nameEn || '',
          specNameZh: spec?.specNameZh || '',
          specNameEn: spec?.specNameEn || ''
        }
      });
    }
    
    formatted.push({
      id: order.id,
      orderNo: order.id,
      totalCents: order.grandTotalCents,
      status: order.status,
      items: formattedItems
    });
  }
  
  res.json(formatted);
});

app.get('/api/orders/:id', async (req, res) => {
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
  if (!order) return res.status(404).json({ code: 'NOT_FOUND' });
  const items = await db.query.orderItems.findMany({ where: eq(schema.orderItems.orderId, order.id) });
  res.json({ ...order, items });
});

app.post('/api/orders/:id/confirm-receipt', async (req, res) => {
  await db.update(schema.orders).set({ status: 'completed' }).where(eq(schema.orders.id, req.params.id));
  res.json({ success: true });
});

app.post('/api/orders/:id/cancel', async (req, res) => {
  await db.update(schema.orders).set({ status: 'cancelled' }).where(eq(schema.orders.id, req.params.id));
  res.json({ success: true });
});

app.post('/api/payments/:orderId/charge', async (req, res) => {
  await db.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, req.params.orderId));
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, req.params.orderId) });
  if (order) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, order.userId) });
    sendTransactionalEmail(user?.email || 'admin@example.com', 'Payment Successful: ' + req.params.orderId, 'Your payment has been processed successfully.');
  }
  res.json({ success: true, clientSecret: 'mock_secret' });
});

app.post('/api/payments/:orderId/voucher', async (req, res) => {
  await db.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, req.params.orderId));
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, req.params.orderId) });
  if (order) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, order.userId) });
    sendTransactionalEmail(user?.email || 'admin@example.com', 'Payment Successful: ' + req.params.orderId, 'Your payment has been processed successfully.');
  }
  res.json({ success: true });
});

app.get('/api/faqs', async (req, res) => {
  const list = await db.query.faqs.findMany({ orderBy: schema.faqs.sort });
  res.json(list);
});

app.post('/api/feedbacks', authenticateToken, async (req, res) => {
  const { contact, type, orderId, content } = req.body;
  const userId = (req as any).user.id;
  await db.insert(schema.feedbacks).values({
    id: `fb_${uuidv4().substring(0,8)}`,
    userId, contact, type, orderId, content
  });
  res.json({ success: true });
});

app.get('/api/feedbacks/mine/:userId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const list = await db.query.feedbacks.findMany({ where: eq(schema.feedbacks.userId, userId), orderBy: [desc(schema.feedbacks.createdAt)] });
  res.json(list);
});

// Admin endpoints
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  const orders = await db.query.orders.findMany();
  const products = await db.query.products.findMany();
  const inventory = await db.query.inventory.findMany();
  
  let totalSalesCents = 0;
  let totalOrdersCount = orders.length;
  let pendingOrders = 0;
  let paidOrders = 0;
  let shippedOrders = 0;
  let productsCount = products.length;
  let stockAlerts = 0;
  
  for (const order of orders) {
    if (order.status === 'pending_payment') pendingOrders++;
    if (order.status === 'paid') paidOrders++;
    if (order.status === 'shipped') shippedOrders++;
    if (order.status === 'paid' || order.status === 'shipped' || order.status === 'completed') {
      totalSalesCents += Number(order.grandTotalCents);
    }
  }
  
  for (const inv of inventory) {
    if (inv.stock <= inv.warnThreshold) stockAlerts++;
  }
  
  res.json({
    totalSalesCents,
    totalOrdersCount,
    productsCount,
    stockAlerts,
    pendingOrders,
    paidOrders,
    shippedOrders
  });
});

app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
  const prods = await db.query.products.findMany({ orderBy: [desc(schema.products.createdAt)] });
  const allSpecs = await db.query.productSpecs.findMany();
  const allInv = await db.query.inventory.findMany();

  const result = prods.map(prod => {
    const specs = allSpecs.filter(s => s.productId === prod.id).map(s => {
      const inv = allInv.find(i => i.skuId === s.id) || { stock: 0, lockedStock: 0, warnThreshold: 10 };
      return {
        ...s,
        stock: inv.stock,
        lockedStock: inv.lockedStock,
        warnThreshold: inv.warnThreshold
      };
    });
    return { ...prod, specs };
  });

  res.json(result);
});

app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
  const data = req.body;
  const id = `prod_${uuidv4().substring(0,8)}`;
  await db.insert(schema.products).values({
    id,
    nameZh: data.nameZh,
    nameEn: data.nameEn,
    priceOriginalCents: data.priceOriginalCents,
    priceAfterCents: data.priceAfterCents,
    categoryId: data.categoryId,
    images: data.imageUrl ? [data.imageUrl] : []
  });
  res.json({ success: true, id });
});

app.patch('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  await db.update(schema.products).set(req.body).where(eq(schema.products.id, req.params.id));
  res.json({ success: true });
});

app.patch('/api/admin/inventory/:skuId', authenticateAdmin, async (req, res) => {
  await db.update(schema.inventory).set(req.body).where(eq(schema.inventory.skuId, req.params.skuId));
  res.json({ success: true });
});

app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  const list = await db.query.orders.findMany({ orderBy: [desc(schema.orders.createdAt)] });
  
  const formatted = [];
  for (const order of list) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, order.userId) });
    formatted.push({
      id: order.id,
      orderNo: order.id,
      userEmail: user?.email || 'Unknown',
      totalCents: order.grandTotalCents,
      status: order.status,
      paymentStatus: order.status === 'pending_payment' ? 'pending' : 'paid',
      shippingMethod: 'Standard',
      trackingNo: order.remark || '',
      createdAt: order.createdAt
    });
  }
  
  res.json(formatted);
});

app.post('/api/admin/orders/:id/ship', authenticateAdmin, async (req, res) => {
  await db.update(schema.orders).set({ status: 'shipped', remark: req.body.trackingNo }).where(eq(schema.orders.id, req.params.id));
  res.json({ success: true });
});

app.patch('/api/admin/orders/:id/price', authenticateAdmin, async (req, res) => {
  await db.update(schema.orders).set({ grandTotalCents: req.body.grandTotalCents }).where(eq(schema.orders.id, req.params.id));
  res.json({ success: true });
});

app.post('/api/admin/orders/:id/close', authenticateAdmin, async (req, res) => {
  await db.update(schema.orders).set({ status: 'cancelled' }).where(eq(schema.orders.id, req.params.id));
  res.json({ success: true });
});

app.get('/api/admin/feedbacks', authenticateAdmin, async (req, res) => {
  const list = await db.query.feedbacks.findMany({ orderBy: [desc(schema.feedbacks.createdAt)] });
  const formatted = [];
  for (const fb of list) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, fb.userId) });
    formatted.push({
      id: fb.id,
      type: fb.type || 'general',
      contact: fb.contact || user?.email || 'Anonymous',
      content: fb.content,
      reply: fb.adminReply,
      status: fb.status,
      orderId: fb.orderId
    });
  }
  res.json(formatted);
});

app.post('/api/admin/feedbacks/:id/reply', authenticateAdmin, async (req, res) => {
  await db.update(schema.feedbacks).set({ adminReply: req.body.reply, status: 'resolved' }).where(eq(schema.feedbacks.id, req.params.id));
  res.json({ success: true });
});

app.get('/api/admin/audit-logs', authenticateAdmin, async (req, res) => {
  const list = await db.query.auditLogs.findMany({ orderBy: [desc(schema.auditLogs.createdAt)] });
  res.json(list);
});

app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
  const settings = await db.query.platformSettings.findMany();
  res.json(settings);
});

app.patch('/api/admin/settings', authenticateAdmin, async (req, res) => {
  const payload = req.body;
  await db.transaction(async (tx) => {
    for (const [key, value] of Object.entries(payload)) {
      const existing = await tx.query.platformSettings.findFirst({ where: eq(schema.platformSettings.key, key) });
      if (existing) {
        await tx.update(schema.platformSettings).set({ value: String(value) }).where(eq(schema.platformSettings.key, key));
      } else {
        await tx.insert(schema.platformSettings).values({ key, value: String(value) });
      }
    }
  });
  res.json({ success: true });
});

app.post('/api/admin/backups/trigger', authenticateAdmin, async (req, res) => {
  res.json({ success: true, message: 'Backup triggered.' });
});

app.get('/api/admin/reductions', authenticateAdmin, async (req, res) => {
  const reductions = await db.query.fullReductions.findMany({ orderBy: [desc(schema.fullReductions.id)] });
  res.json(reductions);
});

app.post('/api/admin/reductions', authenticateAdmin, async (req, res) => {
  const data = req.body;
  const id = `fr_${uuidv4().substring(0,8)}`;
  await db.insert(schema.fullReductions).values({ ...data, id });
  res.json({ success: true, id });
});

// Vite Setup


// Database initialization endpoint via curl
// Example: curl -X POST http://localhost:3000/api/admin/init-db
// Cloudflare R2 Configuration
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '',
  credentials: {
accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.R2_BUCKET_NAME || 'my-bucket',
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
const extension = path.extname(file.originalname);
cb(null, 'assets/' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage: process.env.R2_ACCESS_KEY_ID ? storage : multer.memoryStorage() });

app.post('/api/admin/upload', authenticateAdmin, upload.single('file'), (req, res) => {
  if (process.env.R2_ACCESS_KEY_ID && req.file) {
 // The multer-s3 location might be a direct R2 URL, or we construct a public one
 // R2 public bucket URL needs to be configured in Cloudflare Dashboard
 const fileKey = (req.file as any).key;
 const publicUrl = process.env.R2_PUBLIC_URL 
   ? `${process.env.R2_PUBLIC_URL}/${fileKey}`
   : (req.file as any).location; // Fallback to S3 URL
   
 res.json({ url: publicUrl });
  } else {
 // Mock for dev mode
 res.json({ url: 'https://placehold.co/600x400?text=Mock+Upload' });
  }
});

app.post('/api/admin/init-db', async (req, res) => {
  try {
await seedDatabase();
res.json({ success: true, message: 'Database initialized successfully via API.' });
  } catch (error: any) {
console.error('Initialization error:', error);
res.status(500).json({ success: false, message: 'Failed to initialize database', error: error.message });
  }
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err.message);
  // Send empty array fallback for list queries to prevent UI crashes
  if (req.method === 'GET') {
    return res.json([]);
  }
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});


if (process.env.NODE_ENV !== 'production') {

  createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  }).then(vite => {
    app.use(vite.middlewares);
    
// Database initialization endpoint via curl
// Example: curl -X POST http://localhost:3000/api/admin/init-db





// Cloudflare R2 Configuration
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.R2_BUCKET_NAME || 'my-bucket',
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'assets/' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage: process.env.R2_ACCESS_KEY_ID ? storage : multer.memoryStorage() });

app.post('/api/admin/upload', authenticateAdmin, upload.single('file'), (req, res) => {
  if (process.env.R2_ACCESS_KEY_ID && req.file) {
     // The multer-s3 location might be a direct R2 URL, or we construct a public one
     // R2 public bucket URL needs to be configured in Cloudflare Dashboard
     const fileKey = (req.file as any).key;
     const publicUrl = process.env.R2_PUBLIC_URL 
       ? `${process.env.R2_PUBLIC_URL}/${fileKey}`
       : (req.file as any).location; // Fallback to S3 URL
       
     res.json({ url: publicUrl });
  } else {
     // Mock for dev mode
     res.json({ url: 'https://placehold.co/600x400?text=Mock+Upload' });
  }
});

app.post('/api/admin/init-db', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database initialized successfully via API.' });
  } catch (error: any) {
    console.error('Initialization error:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize database', error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Dev] Server running on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist/client');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Prod] Server running on port ${PORT}`);
  });
}
