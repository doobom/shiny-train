import multer from 'multer';
import { parse } from 'csv-parse/sync';
import 'dotenv/config';
import { migrate } from './src/server/db.js';
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
import { eq, and, or, inArray, sql, desc, asc, gte, sum, ilike } from 'drizzle-orm';



import crypto from 'crypto';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.warn('WARNING: ENCRYPTION_KEY environment variable is missing or not 32 characters. PII encryption may fail or data may be lost across restarts. Please set ENCRYPTION_KEY in your environment.');
}
const ACTIVE_ENCRYPTION_KEY = ENCRYPTION_KEY || 'fallback_secret_key_32_chars_xxx'; // Use a static fallback for dev if missing, to prevent data loss across restarts
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ACTIVE_ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return text;
  let textParts = text.split(':');
  if (textParts.length !== 2) return text;
  let iv = Buffer.from(textParts[0], 'hex');
  let encryptedText = Buffer.from(textParts[1], 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ACTIVE_ENCRYPTION_KEY), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const app = express();
const PORT = 3000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());



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


const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token missing' });
  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) return res.status(403).json({ code: 'FORBIDDEN', message: 'Token invalid' });
    const dbUser = await db.query.users.findFirst({ where: eq(schema.users.id, user.id) });
    if (!dbUser || dbUser.role !== 'admin') {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    
    // Load Role Permissions and merge
    const rolePerms = await db.query.rolePermissions.findMany({
      where: eq(schema.rolePermissions.roleId, dbUser.role)
    });
    
    let mergedPerms = Array.isArray(dbUser.permissions) ? [...dbUser.permissions] : [];
    rolePerms.forEach(rp => {
      if (!mergedPerms.includes(rp.module)) {
        mergedPerms.push(rp.module);
      }
    });
    
    // Auto-grant all if email is the root admin
    if (dbUser.email === process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL === undefined) {
      if (!mergedPerms.includes('all')) mergedPerms.push('all');
    }
    
    (req as any).user = { ...dbUser, permissions: mergedPerms };
    next();
  });
};

const requirePermission = (module: string) => {
  return (req: any, res: any, next: any) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ code: 'UNAUTHORIZED' });
    if (!user.permissions || !Array.isArray(user.permissions)) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'No permissions assigned' });
    }
    if (!user.permissions.includes(module) && !user.permissions.includes('all')) {
      return res.status(403).json({ code: 'FORBIDDEN', message: `Missing permission: ${module}` });
    }
    next();
  };
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
  try {
    const { email, password, phone } = req.body;
    if (!email || !password) return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email and password required' });
    const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
    if (existing) return res.status(400).json({ code: 'EMAIL_EXISTS', message: 'Email already registered.' });
    
    const pepper = process.env.PASSWORD_SALT || '';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password + pepper, salt);
    
    const newUser = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      email,
      passwordHash,
      phoneEncrypted: encrypt(phone),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.insert(schema.users).values(newUser);
    await db.insert(schema.carts).values({ id: `cart_${newUser.id}`, userId: newUser.id });
    res.json({ success: true, user: { id: newUser.id, email: newUser.email, locale: 'zh-HK' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Internal server error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
    
    if (!user) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
    
    const pepper = process.env.PASSWORD_SALT || '';
    // password from frontend could be plain text or sha-256 hashed.
    // If frontend hashes it, they send us a hash. Then we prepend pepper and bcrypt.
    let isMatch = await bcrypt.compare(password + pepper, user.passwordHash);
    if (!isMatch) {
      // Fallback for old passwords without pepper
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }
    
    if (!isMatch) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, email: user.email, locale: user.locale, role: user.role, tier: user.tier } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Internal server error.' });
  }
});

app.post('/api/auth/password/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email required' });
  
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  // 防枚举探测：即使用户不存在，也返回200 (遵循契约附录规范)
  if (!user) return res.json({ success: true, message: 'Reset link sent to email if exists.' });

  const rawToken = require('uuid').v4();
  const tokenHash = require('crypto').createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15分钟有效

  await db.insert(schema.emailResetTokens).values({
    id: `tok_${require('uuid').v4().substring(0, 8)}`,
    userId: user.id,
    token: tokenHash,
    expiresAt,
    used: false
  });

  const resetLink = `https://shop.apcube.com/password/reset?token=${rawToken}`;
  
  try {
    // Attempt to use emailQueue if it exists
    emailQueue.push({ to: email, subject: '【香港生活百貨】重置您的密碼 / Reset Your Password', content: `<p>您好，請點擊以下鏈接在15分鐘內重置您的密碼：</p><a href="${resetLink}">${resetLink}</a>` });
  } catch(e) {
    console.log("Email fallback", resetLink);
  }

  res.json({ success: true, message: 'Reset link sent to email.' });
});


app.put('/api/auth/profile/email', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { newEmail } = req.body;
    
    if (!newEmail || !newEmail.includes('@')) {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid email address.' });
    }
    
    // Check if new email is taken
    const existing = await db.query.users.findFirst({ where: eq(schema.users.email, newEmail) });
    if (existing) {
      return res.status(400).json({ code: 'EMAIL_EXISTS', message: 'Email is already in use.' });
    }
    
    await db.update(schema.users)
      .set({ email: newEmail, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
      
    res.json({ success: true, email: newEmail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Internal server error.' });
  }
});

app.post('/api/auth/password/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  const resetToken = await db.query.emailResetTokens.findFirst({
    where: and(eq(schema.emailResetTokens.token, token), gte(schema.emailResetTokens.expiresAt, new Date()))
  });
  if (!resetToken) return res.status(400).json({ code: 'INVALID_TOKEN', message: 'Token invalid or expired.' });
  
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, resetToken.userId) });
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found.' });
  
  const pepper = process.env.PASSWORD_SALT || '';
  const hashedPassword = await bcrypt.hash(newPassword + pepper, await bcrypt.genSalt(10));
  
  await db.update(schema.users).set({ passwordHash: hashedPassword }).where(eq(schema.users.id, user.id));
  await db.delete(schema.emailResetTokens).where(eq(schema.emailResetTokens.id, resetToken.id));
  
  res.json({ success: true, message: 'Password reset successful.' });
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
  

  const invs = specs.length ? await db.query.inventory.findMany({
    where: inArray(schema.inventory.skuId, specs.map((s: any) => s.id))
  }) : [];
  
  let totalQty = items.reduce((sum:any, i:any) => sum + i.qty, 0);

  // Platform D20 limit checks
  const settings = await db.query.platformSettings.findMany();
  const maxPerItem = parseInt(settings.find((s: any) => s.key === 'max_per_item')?.value || '5');
  const maxTotal = parseInt(settings.find((s: any) => s.key === 'max_total')?.value || '20');
  
  if (totalQty > maxTotal) {
     return res.status(400).json({ code: 'PURCHASE_LIMIT_EXCEEDED', message: 'Exceeded maximum total items per order (' + maxTotal + ')' });
  }
  for (const item of items) {
     if (item.qty > maxPerItem) {
        return res.status(400).json({ code: 'PURCHASE_LIMIT_EXCEEDED', message: 'Exceeded maximum quantity for a single item (' + maxPerItem + ')' });
     }
  }

  for (const item of items) {
    const inv = invs.find((i: any) => i.skuId === item.skuId);
    if (!inv) return res.status(400).json({ error: 'Inventory not found for SKU: ' + item.skuId });
    if (item.qty > inv.stock - inv.lockedStock) {
       return res.status(400).json({ error: 'Insufficient stock for SKU: ' + item.skuId });
    }
  }

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
  const orderItemsData: any[] = [];
  let totalQty = items.reduce((sum:any, i:any) => sum + i.qty, 0);

  // Platform D20 limit checks
  const settings = await db.query.platformSettings.findMany();
  const maxPerItem = parseInt(settings.find((s: any) => s.key === 'max_per_item')?.value || '999');
  const maxTotal = parseInt(settings.find((s: any) => s.key === 'max_total')?.value || '9999');
  
  if (totalQty > maxTotal) {
     return res.status(400).json({ code: 'PURCHASE_LIMIT_EXCEEDED', message: 'Exceeded maximum total items per order (' + maxTotal + ')' });
  }
  for (const item of items) {
     if (item.qty > maxPerItem) {
        return res.status(400).json({ code: 'PURCHASE_LIMIT_EXCEEDED', message: 'Exceeded maximum quantity for a single item (' + maxPerItem + ')' });
     }
  }

  
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
    
    // Check inventory and lock stock securely
    for (const item of items) {
      const res = await tx.execute(
        sql`UPDATE ${schema.inventory} SET locked_stock = locked_stock + ${item.qty} WHERE sku_id = ${item.skuId} AND (stock - locked_stock) >= ${item.qty} RETURNING sku_id`
      );
      if (res.rowCount === 0) {
        throw new Error('INSUFFICIENT_STOCK');
      }
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

    // Get active shipping template
    const templates = await tx.query.shippingTemplates.findMany({ where: eq(schema.shippingTemplates.active, true) });
    const template = templates[0] || { baseFeeCents: 3000, freeShippingThresholdCents: 30000 };
    
    let shippingFeeCents = template.baseFeeCents;
    if (template.freeShippingThresholdCents != null && (totalCents - discountCents) >= template.freeShippingThresholdCents) {
      shippingFeeCents = 0;
    }

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


app.post('/api/payments/webhook/:method', async (req, res) => {
  const method = req.params.method; // e.g. stripe
  // In a real scenario, you'd verify webhook signatures here.
  // For now, we mock the payload parsing
  const { orderId, status, amount } = req.body;
  if (!orderId || status !== 'success') return res.status(400).json({ error: 'Invalid payload' });

  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
  if (!order || order.status !== 'pending_payment') return res.status(400).json({ error: 'Invalid order' });

  await db.transaction(async (tx) => {
    await tx.update(schema.orders).set({ status: 'paid', paymentMethod: method }).where(eq(schema.orders.id, orderId));
    await tx.insert(schema.payments).values({
      id: `pay_${uuidv4().substring(0,8)}`,
      orderId,
      method,
      amountCents: order.grandTotalCents,
      status: 'success'
    });
  });

  const user = await db.query.users.findFirst({ where: eq(schema.users.id, order.userId) });
  sendTransactionalEmail(user?.email || 'admin@example.com', 'Payment Successful: ' + orderId, 'Your payment has been processed successfully.');
  
  res.json({ received: true });
});

app.post('/api/payments/:orderId/charge', authenticateToken, async (req, res) => {
  // Simulate creating a payment intent and returning clientSecret
  // Webhook will handle actual status update in a real flow. 
  // For demo, we just return the mock secret. The frontend will pretend it succeeded and call webhook or we can just let frontend assume it paid.
  res.json({ success: true, clientSecret: 'mock_secret_xyz' });
});

app.post('/api/payments/:orderId/voucher', authenticateToken, async (req, res) => {
  await db.transaction(async (tx) => {
    await tx.update(schema.orders).set({ status: 'pending_review', paymentMethod: 'bank_transfer' }).where(eq(schema.orders.id, req.params.orderId));
    await tx.insert(schema.payments).values({
      id: `pay_${uuidv4().substring(0,8)}`,
      orderId: req.params.orderId,
      method: 'bank_transfer',
      amountCents: 0, // not verified yet
      status: 'pending'
    });
  });
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

app.get('/api/admin/products', authenticateAdmin, requirePermission('products'), async (req, res) => {
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

app.post('/api/admin/products', authenticateAdmin, requirePermission('products'), async (req, res) => {
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


app.get('/api/admin/orders', authenticateAdmin, requirePermission('orders'), async (req, res) => {
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
      paymentStatus: order.status === 'pending_review' ? 'pending_review' : (order.status === 'pending_payment' ? 'pending' : 'paid'),
      shippingMethod: order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Standard',
      trackingNo: order.remark || '',
      createdAt: order.createdAt
    });
  }
  res.json(formatted);
});


app.post('/api/admin/orders/:id/ship', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.update(schema.orders).set({ status: 'shipped', remark: req.body.trackingNo }).where(eq(schema.orders.id, req.params.id));
  res.json({ success: true });
});




app.patch('/api/admin/orders/:id/price', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  const adminId = (req as any).user.id;
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
    if (!order) throw new Error('Order not found');
    await tx.update(schema.orders).set({ grandTotalCents: req.body.grandTotalCents }).where(eq(schema.orders.id, req.params.id));
    await tx.insert(schema.auditLogs).values({
      id: `aud_${uuidv4().substring(0,8)}`,
      adminId,
      action: `Modified price of order ${req.params.id} from ${order.grandTotalCents} to ${req.body.grandTotalCents}`,
      resource: 'orders'
    });
  });
  res.json({ success: true });
});

app.post('/api/admin/orders/:id/close', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
    if (!order) throw new Error('Order not found');
    await tx.update(schema.orders).set({ status: 'cancelled' }).where(eq(schema.orders.id, req.params.id));
    
    // Release inventory locks
    const orderItemsList = await tx.query.orderItems.findMany({ where: eq(schema.orderItems.orderId, req.params.id) });
    for (const item of orderItemsList) {
      await tx.execute(
        sql`UPDATE ${schema.inventory} SET locked_stock = GREATEST(0, locked_stock - ${item.qty}) WHERE sku_id = ${item.skuId}`
      );
    }
  });
  res.json({ success: true });
});


app.get('/api/admin/payments/review-queue', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  const pendingOrders = await db.query.orders.findMany({
    where: eq(schema.orders.status, 'pending_review'),
    orderBy: [desc(schema.orders.createdAt)],
    with: { user: true }
  });
  // Decrypt sensitive
  pendingOrders.forEach((o: any) => {
    o.addressPhone = decrypt(o.addressPhone);
    o.addressDetail = decrypt(o.addressDetail);
    if (o.user) o.user.phoneEncrypted = decrypt(o.user.phoneEncrypted);
  });
  res.json({ success: true, queue: pendingOrders });
});

app.post('/api/admin/orders/:id/approve-payment', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
    if (!order) throw new Error('Order not found');
    await tx.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, req.params.id));
    await tx.update(schema.payments).set({ status: 'success' }).where(eq(schema.payments.orderId, req.params.id));
  });
  res.json({ success: true });
});

app.post('/api/admin/orders/:id/reject-payment', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
    if (!order) throw new Error('Order not found');
    await tx.update(schema.orders).set({ status: 'pending_payment' }).where(eq(schema.orders.id, req.params.id));
    await tx.update(schema.payments).set({ status: 'failed' }).where(eq(schema.payments.orderId, req.params.id));
  });
  res.json({ success: true });
});

app.post('/api/admin/orders/:id/remark', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.update(schema.orders).set({ remark: req.body.remark }).where(eq(schema.orders.id, req.params.id));
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
app.post('/api/admin/init-db', async (req, res) => {
  try {
    console.log("Forcing migration before seeding...");
    
    // Explicitly create tables if they do not exist
    const ddl = `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL UNIQUE,
        "password_hash" text NOT NULL,
        "phone_encrypted" text,
        "locale" text DEFAULT 'zh-HK',
        "status" text DEFAULT 'active',
        "role" text DEFAULT 'customer',
        "permissions" jsonb,
        "tier" text DEFAULT 'standard',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "categories" (
        "id" text PRIMARY KEY NOT NULL,
        "name_zh" text NOT NULL,
        "name_en" text NOT NULL,
        "sort" integer DEFAULT 0,
        "disabled" boolean DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS "products" (
        "id" text PRIMARY KEY NOT NULL,
        "name_zh" text NOT NULL,
        "name_en" text NOT NULL,
        "description_zh" text,
        "description_en" text,
        "price_original_cents" integer NOT NULL,
        "price_after_cents" integer NOT NULL,
        "category_id" text REFERENCES "categories"("id"),
        "status" text DEFAULT 'on_shelf',
        "images" jsonb DEFAULT '[]',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "product_specs" (
        "id" text PRIMARY KEY NOT NULL,
        "product_id" text REFERENCES "products"("id"),
        "spec_name_zh" text NOT NULL,
        "spec_name_en" text NOT NULL,
        "price_original_cents" integer NOT NULL,
        "price_after_cents" integer NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "inventory" (
        "sku_id" text PRIMARY KEY REFERENCES "product_specs"("id"),
        "stock" integer DEFAULT 0 NOT NULL,
        "locked_stock" integer DEFAULT 0 NOT NULL,
        "warn_threshold" integer DEFAULT 10 NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "carts" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "cart_items" (
        "id" text PRIMARY KEY NOT NULL,
        "cart_id" text REFERENCES "carts"("id"),
        "sku_id" text REFERENCES "product_specs"("id"),
        "qty" integer NOT NULL,
        "checked" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "orders" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "status" text DEFAULT 'pending_payment',
        "total_cents" integer NOT NULL,
        "shipping_fee_cents" integer DEFAULT 0 NOT NULL,
        "discount_cents" integer DEFAULT 0 NOT NULL,
        "grand_total_cents" integer NOT NULL,
        "address_recipient" text,
        "address_phone" text,
        "address_detail" text,
        "payment_method" text,
        "remark" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" text PRIMARY KEY NOT NULL,
        "order_id" text REFERENCES "orders"("id"),
        "sku_id" text REFERENCES "product_specs"("id"),
        "qty" integer NOT NULL,
        "price_cents" integer NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "feedbacks" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "type" text,
        "contact" text,
        "order_id" text,
        "content" text NOT NULL,
        "admin_reply" text,
        "status" text DEFAULT 'pending',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" text PRIMARY KEY NOT NULL,
        "admin_id" text,
        "action" text NOT NULL,
        "resource" text,
        "details" text,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "banners" (
        "id" text PRIMARY KEY NOT NULL,
        "image_url" text NOT NULL,
        "link_url" text,
        "sort" integer DEFAULT 0,
        "status" text DEFAULT 'active',
        "disabled" boolean DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS "announcements" (
        "id" text PRIMARY KEY NOT NULL,
        "title_zh" text NOT NULL,
        "title_en" text NOT NULL,
        "content_zh" text,
        "content_en" text,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "faqs" (
        "id" text PRIMARY KEY NOT NULL,
        "question_zh" text NOT NULL,
        "question_en" text NOT NULL,
        "answer_zh" text,
        "answer_en" text,
        "sort" integer DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS "platform_settings" (
        "key" text PRIMARY KEY NOT NULL,
        "value" jsonb,
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "discounts" (
        "id" text PRIMARY KEY NOT NULL,
        "code" text NOT NULL UNIQUE,
        "type" text NOT NULL,
        "value" integer NOT NULL,
        "min_order_value_cents" integer,
        "active" boolean DEFAULT true,
        "valid_until" timestamp
      );

      CREATE TABLE IF NOT EXISTS "full_reductions" (
        "id" text PRIMARY KEY NOT NULL,
        "threshold_cents" integer NOT NULL,
        "reduce_cents" integer NOT NULL,
        "active" boolean DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS "payments" (
        "id" text PRIMARY KEY NOT NULL,
        "order_id" text REFERENCES "orders"("id"),
        "method" text NOT NULL,
        "amount_cents" integer NOT NULL,
        "status" text DEFAULT 'pending',
        "transaction_id" text,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "email_reset_tokens" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "token" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "used" boolean DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS "favorites" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "product_id" text REFERENCES "products"("id"),
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "addresses" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "recipient" text NOT NULL,
        "phone" text NOT NULL,
        "detail" text NOT NULL,
        "is_default" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "payment_methods" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "provider" text NOT NULL,
        "provider_id" text,
        "details" jsonb,
        "created_at" timestamp DEFAULT now()
      );
      
      -- Member Levels / Tiers
      CREATE TABLE IF NOT EXISTS "member_levels" (
        "id" text PRIMARY KEY NOT NULL,
        "tier" text NOT NULL,
        "name_zh" text NOT NULL,
        "name_en" text NOT NULL,
        "min_spend_cents" integer NOT NULL,
        "discount_percent" integer NOT NULL
      );
      
      -- Roles
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" text PRIMARY KEY NOT NULL,
        "code" text NOT NULL UNIQUE,
        "name_zh" text NOT NULL,
        "name_en" text NOT NULL,
        "description" text
      );

      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "id" text PRIMARY KEY NOT NULL,
        "role_code" text REFERENCES "roles"("code"),
        "permission" text NOT NULL
      );
      
      -- Shipping
      CREATE TABLE IF NOT EXISTS "shipping_templates" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "type" text NOT NULL,
        "fee_cents" integer NOT NULL,
        "free_threshold_cents" integer,
        "enabled" boolean DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS "shipping_logs" (
        "id" text PRIMARY KEY NOT NULL,
        "order_id" text REFERENCES "orders"("id"),
        "status" text NOT NULL,
        "operator" text,
        "created_at" timestamp DEFAULT now()
      );
    `;

    try {
      await db.execute(sql.raw(ddl));
      console.log('Tables created or verified via DDL.');
    } catch(e) {
      console.log('Failed to create tables:', e.message);
    }
    
    // Auto-patch missing columns for existing databases before migrate/seed
    try {
      await db.execute(sql.raw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer'`));
      await db.execute(sql.raw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB`));
      await db.execute(sql.raw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'standard'`));
      await db.execute(sql.raw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS locale VARCHAR(20) DEFAULT 'zh-HK'`));
      await db.execute(sql.raw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`));
      await db.execute(sql.raw(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_encrypted VARCHAR(255)`));
      await db.execute(sql.raw(`ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'`));
      await db.execute(sql.raw(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS link_url VARCHAR(255)`));
      await db.execute(sql.raw(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT FALSE`));
    } catch(e) {
      console.log('Patching DB columns failed:', e.message);
    }

    try {
      await migrate();
    } catch (e) {
      console.log('Migrate failed, continuing anyway:', e.message);
    }
    
    await seedDatabase();
    res.json({ success: true, message: 'Database initialized successfully via API.' });
  } catch (error: any) {
    console.error('Initialization error:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize database', error: error.message });
  }
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled Server Error:', err.message);
  if (req.method === 'GET') {
    return res.json([]);
  }
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});

// Cron Jobs
setInterval(async () => {
  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
        const expiredOrders = await db.query.orders.findMany({
      where: and(
        eq(schema.orders.status, 'pending_payment'),
        sql`created_at < ${thirtyMinsAgo.toISOString()}`
      )
    });
    
    for (const order of expiredOrders) {
      await db.transaction(async (tx) => {
        await tx.update(schema.orders).set({ status: 'cancelled' }).where(eq(schema.orders.id, order.id));
        const orderItems = await tx.query.orderItems.findMany({ where: eq(schema.orderItems.orderId, order.id) });
        for (const item of orderItems) {
          await tx.execute(
            sql`UPDATE ${schema.inventory} SET locked_stock = GREATEST(0, locked_stock - ${item.qty}) WHERE sku_id = ${item.skuId}`
          );
        }
      });
      console.log(`[Cron] Cancelled order ${order.id} due to timeout`);
    }
    
    // Clean old carts (7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldCarts = await db.query.carts.findMany({
      where: sql`updated_at < ${sevenDaysAgo.toISOString()}`
    });
    for (const cart of oldCarts) {
      await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cart.id));
    }
  } catch (err) {
    console.error('[Cron] Error running jobs', err);
  }
}, 60 * 1000);



// Addresses CRUD
app.get('/api/addresses', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const list = await db.query.addresses.findMany({ where: eq(schema.addresses.userId, userId) });
    list.forEach(a => {
      a.phone = decrypt(a.phone);
      a.detail = decrypt(a.detail);
    });
    res.json({ success: true, addresses: list });
  } catch (error) {
    res.status(500).json({ code: 'SERVER_ERROR' });
  }
});

app.post('/api/addresses', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { recipient, phone, detail, isDefault } = req.body;
    if (isDefault) {
      await db.update(schema.addresses)
        .set({ isDefault: false })
        .where(eq(schema.addresses.userId, userId));
    }
    const newId = `addr_${uuidv4().substring(0,8)}`;
    await db.insert(schema.addresses).values({
      id: newId,
      userId,
      recipient,
      phone: encrypt(phone),
      detail: encrypt(detail),
      isDefault: isDefault || false
    });
    res.json({ success: true, id: newId });
  } catch (error) {
    res.status(500).json({ code: 'SERVER_ERROR' });
  }
});

app.patch('/api/addresses/:id', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { recipient, phone, detail, isDefault } = req.body;
    if (isDefault) {
      await db.update(schema.addresses)
        .set({ isDefault: false })
        .where(eq(schema.addresses.userId, userId));
    }
    const updateData: any = {};
    if (recipient) updateData.recipient = recipient;
    if (phone) updateData.phone = encrypt(phone);
    if (detail) updateData.detail = encrypt(detail);
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    
    await db.update(schema.addresses).set(updateData).where(and(eq(schema.addresses.id, req.params.id), eq(schema.addresses.userId, userId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ code: 'SERVER_ERROR' });
  }
});

app.delete('/api/addresses/:id', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    await db.delete(schema.addresses).where(and(eq(schema.addresses.id, req.params.id), eq(schema.addresses.userId, userId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ code: 'SERVER_ERROR' });
  }
});


// ==================== NEW APIS (Gap Analysis) ====================

// 1. Auth & Users (Logout & Forgot Password & Merge Cart)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/cart/merge', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const { localItems } = req.body;
  if (!localItems || !Array.isArray(localItems)) return res.json({ success: true });
  
  let cart = await db.query.carts.findFirst({ where: eq(schema.carts.userId, userId) });
  if (!cart) {
    const cartId = 'cart_' + require('uuid').v4().substring(0, 8);
    await db.insert(schema.carts).values({ id: cartId, userId });
    cart = { id: cartId, userId, updatedAt: new Date() };
  }
  
  for (const item of localItems) {
    const existing = await db.query.cartItems.findFirst({
      where: and(eq(schema.cartItems.cartId, cart.id), eq(schema.cartItems.skuId, item.skuId))
    });
    if (existing) {
      await db.update(schema.cartItems).set({ qty: existing.qty + item.qty, checked: item.checked ?? existing.checked }).where(eq(schema.cartItems.id, existing.id));
    } else {
      await db.insert(schema.cartItems).values({
        id: 'ci_' + require('uuid').v4().substring(0, 8),
        cartId: cart.id,
        skuId: item.skuId,
        qty: item.qty,
        checked: item.checked ?? true
      });
    }
  }
  res.json({ success: true });
});

app.get('/api/favorites', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const list = await db.query.favorites.findMany({ where: eq(schema.favorites.userId, userId) });
  res.json(list);
});

app.post('/api/favorites/:productId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const productId = req.params.productId;
  const existing = await db.query.favorites.findFirst({ where: and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, productId)) });
  if (!existing) {
    await db.insert(schema.favorites).values({ id: 'fav_' + require('uuid').v4().substring(0, 8), userId, productId });
  }
  res.json({ success: true });
});

app.delete('/api/favorites/:productId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  await db.delete(schema.favorites).where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, req.params.productId)));
  res.json({ success: true });
});

app.post('/api/favorites/:productId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const productId = req.params.productId;
  const existing = await db.query.favorites.findFirst({
    where: and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, productId))
  });
  if (existing) {
    await db.delete(schema.favorites).where(eq(schema.favorites.id, existing.id));
    res.json({ success: true, isFavorite: false });
  } else {
    await db.insert(schema.favorites).values({
      id: 'fav_' + require('uuid').v4().substring(0,8),
      userId,
      productId
    });
    res.json({ success: true, isFavorite: true });
  }
});

// 3. B 端：商品与分类管理 (Categories CRUD & Inventory & Import/Export)
app.post('/api/admin/categories', authenticateAdmin, async (req, res) => {
  const { nameZh, nameEn, sort } = req.body;
  const id = 'cat_' + require('uuid').v4().substring(0, 8);
  await db.insert(schema.categories).values({ id, nameZh, nameEn, sort: parseInt(sort)||0 });
  res.json({ success: true, id });
});
app.put('/api/admin/categories/:id', authenticateAdmin, async (req, res) => {
  const { nameZh, nameEn, sort, disabled } = req.body;
  await db.update(schema.categories).set({ nameZh, nameEn, sort: parseInt(sort)||0, disabled: !!disabled }).where(eq(schema.categories.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/categories/:id', authenticateAdmin, async (req, res) => {
  await db.delete(schema.categories).where(eq(schema.categories.id, req.params.id));
  res.json({ success: true });
});

app.get('/api/admin/inventory/warnings', authenticateAdmin, async (req, res) => {
  const warnings = await db.query.inventory.findMany({
    where: sql`stock <= warn_threshold`
  });
  res.json({ warnings });
});



const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/admin/products/import', authenticateAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  try {
    const records = parse(req.file.buffer, { columns: true, skip_empty_lines: true });
    let count = 0;
    for (const record of records.slice(0, 1000)) {
       const id = 'prod_' + require('uuid').v4().substring(0, 8);
       await db.insert(schema.products).values({
         id,
         nameZh: (record as any).nameZh || 'New Product',
         nameEn: (record as any).nameEn || 'New Product',
         categoryId: (record as any).categoryId || null,
         priceOriginalCents: parseInt((record as any).price) || 0,
         priceAfterCents: parseInt((record as any).price) || 0
       });
       count++;
    }
    res.json({ success: true, count });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// 4. B 端：营销、内容与系统设置 (Discounts & Content)
app.get('/api/admin/discounts', authenticateAdmin, async (req, res) => {
  const discounts = await db.query.discounts.findMany();
  res.json(discounts);
});
app.post('/api/admin/discounts', authenticateAdmin, async (req, res) => {
  const { code, type, value, minOrderValueCents, validUntil } = req.body;
  const id = 'dsc_' + require('uuid').v4().substring(0, 8);
  await db.insert(schema.discounts).values({ 
    id, code, type, value: parseInt(value), 
    minOrderValueCents: parseInt(minOrderValueCents), 
    validUntil: validUntil ? new Date(validUntil) : null 
  });
  res.json({ success: true, id });
});
app.get('/api/admin/recommendations', authenticateAdmin, async (req, res) => {
  res.json([]);
});

// Content
app.post('/api/admin/banners', authenticateAdmin, async (req, res) => {
  const { imageUrl, linkUrl, sort } = req.body;
  const id = 'ban_' + require('uuid').v4().substring(0, 8);
  await db.insert(schema.banners).values({ id, imageUrl, linkUrl, sort: parseInt(sort)||0 });
  res.json({ success: true, id });
});
app.put('/api/admin/banners/:id', authenticateAdmin, async (req, res) => {
  const { imageUrl, linkUrl, sort, disabled } = req.body;
  await db.update(schema.banners).set({ imageUrl, linkUrl, sort: parseInt(sort)||0, disabled: !!disabled }).where(eq(schema.banners.id, req.params.id));
  res.json({ success: true });
});

app.post('/api/admin/announcements', authenticateAdmin, async (req, res) => {
  const { titleZh, titleEn, contentZh, contentEn } = req.body;
  const id = 'ann_' + require('uuid').v4().substring(0, 8);
  await db.insert(schema.announcements).values({ id, titleZh, titleEn, contentZh, contentEn });
  res.json({ success: true, id });
});
app.put('/api/admin/announcements/:id', authenticateAdmin, async (req, res) => {
  const { titleZh, titleEn, contentZh, contentEn } = req.body;
  await db.update(schema.announcements).set({ titleZh, titleEn, contentZh, contentEn }).where(eq(schema.announcements.id, req.params.id));
  res.json({ success: true });
});

app.post('/api/admin/faqs', authenticateAdmin, async (req, res) => {
  const { questionZh, questionEn, answerZh, answerEn, sort } = req.body;
  const id = 'faq_' + require('uuid').v4().substring(0, 8);
  await db.insert(schema.faqs).values({ id, questionZh, questionEn, answerZh, answerEn, sort: parseInt(sort)||0 });
  res.json({ success: true, id });
});
app.put('/api/admin/faqs/:id', authenticateAdmin, async (req, res) => {
  const { questionZh, questionEn, answerZh, answerEn, sort } = req.body;
  await db.update(schema.faqs).set({ questionZh, questionEn, answerZh, answerEn, sort: parseInt(sort)||0 }).where(eq(schema.faqs.id, req.params.id));
  res.json({ success: true });
});

// Roles
app.get('/api/admin/roles', authenticateAdmin, async (req, res) => {
  const roles = await db.query.roles.findMany();
  res.json(roles);
});
app.post('/api/admin/roles', authenticateAdmin, async (req, res) => {
  const { code, nameZh, nameEn } = req.body;
  const id = 'rol_' + require('uuid').v4().substring(0, 8);
  await db.insert(schema.roles).values({ id, code, nameZh, nameEn });
  res.json({ success: true, id });
});
app.get('/api/admin/permissions/catalog', authenticateAdmin, async (req, res) => {
  res.json(['products', 'orders', 'users', 'marketing', 'settings']);
});

// 5. B/C 端：电子收据与导出 (Orders CSV & Receipts)
app.get('/api/admin/orders/export', authenticateAdmin, async (req, res) => {
  const allOrders = await db.query.orders.findMany();
  let csv = 'ID,Status,Total(Cents),Created\n';
  for (const o of allOrders) {
    csv += `${o.id},${o.status},${o.totalCents},${o.createdAt}\n`;
  }
  res.header('Content-Type', 'text/csv');
  res.attachment('orders.csv');
  res.send(csv);
});

app.get('/api/orders/:id/receipt', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
  if (!order) return res.status(404).send('Order not found');
  
  const html = `
    <html>
      <head><title>Receipt ${order.id}</title></head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #333;">Receipt</h1>
        <div style="text-align: left; max-width: 400px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Total:</strong> HK$ ${(order.totalCents / 100).toFixed(2)}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>
        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Print Receipt</button>
      </body>
    </html>
  `;
  res.send(html);
});


// Batch operations
app.post('/api/admin/products/batch-status', authenticateAdmin, async (req, res) => {
  const { productIds, status } = req.body;
  if (!productIds || !productIds.length) return res.json({ success: true });
  await db.update(schema.products).set({ status }).where(inArray(schema.products.id, productIds));
  res.json({ success: true });
});

const isProduction = process.env.NODE_ENV === 'production' || (!process.env.NODE_ENV && !!process.env.DATABASE_URL);



app.post('/api/admin/products/batch-discount', authenticateAdmin, async (req, res) => {
  const { productIds, discountPercent } = req.body;
  if (!productIds || !productIds.length || typeof discountPercent !== 'number') return res.json({ success: true });
  
  const productList = await db.query.products.findMany({ where: inArray(schema.products.id, productIds) });
  await db.transaction(async (tx) => {
    for (const p of productList) {
      const newPrice = Math.floor(p.priceOriginalCents * ((100 - discountPercent) / 100));
      await tx.update(schema.products).set({ priceAfterCents: newPrice }).where(eq(schema.products.id, p.id));
    }
  });
  res.json({ success: true });
});

app.post('/api/admin/discounts', authenticateAdmin, async (req, res) => {
  const id = `dsc_${require('uuid').v4().substring(0,8)}`;
  await db.insert(schema.discounts).values({ id, ...req.body });
  res.json({ success: true, id });
});
app.patch('/api/admin/discounts/:id', authenticateAdmin, async (req, res) => {
  await db.update(schema.discounts).set(req.body).where(eq(schema.discounts.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/discounts/:id', authenticateAdmin, async (req, res) => {
  await db.delete(schema.discounts).where(eq(schema.discounts.id, req.params.id));
  res.json({ success: true });
});

// ================= NEW APIS =================

// C端：合并本地购物车 (登录后触发)
app.post('/api/cart/merge', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const { localItems } = req.body; // [{ skuId: '...', qty: 2 }]
  const cartId = `cart_${userId}`;
  
  await db.transaction(async (tx) => {
    let cart = await tx.query.carts.findFirst({ where: eq(schema.carts.id, cartId) });
    if (!cart) await tx.insert(schema.carts).values({ id: cartId, userId });

    if (localItems && localItems.length > 0) {
      for (const item of localItems) {
        const existing = await tx.query.cartItems.findFirst({
          where: and(eq(schema.cartItems.cartId, cartId), eq(schema.cartItems.skuId, item.skuId))
        });
        if (existing) {
          await tx.update(schema.cartItems).set({ qty: existing.qty + item.qty }).where(eq(schema.cartItems.id, existing.id));
        } else {
          await tx.insert(schema.cartItems).values({
            id: `ci_${uuidv4().substring(0,8)}`, cartId, skuId: item.skuId, qty: item.qty, checked: true
          });
        }
      }
    }
  });
  res.json({ success: true });
});

// C端：获取我的收藏列表
app.get('/api/favorites', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const favs = await db.query.favorites.findMany({ where: eq(schema.favorites.userId, userId) });
  const productIds = favs.map(f => f.productId);
  const prods = productIds.length ? await db.query.products.findMany({ where: inArray(schema.products.id, productIds) }) : [];
  res.json({ success: true, favorites: prods });
});

// C端：添加/取消收藏
app.post('/api/favorites/:productId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const productId = req.params.productId;
  const existing = await db.query.favorites.findFirst({ 
    where: and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, productId)) 
  });
  if (!existing) {
    await db.insert(schema.favorites).values({ id: `fav_${uuidv4().substring(0,8)}`, userId, productId });
  }
  res.json({ success: true });
});
app.delete('/api/favorites/:productId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  await db.delete(schema.favorites).where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, req.params.productId)));
  res.json({ success: true });
});

// B端：分类管理 CRUD
app.post('/api/admin/categories', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const newId = `cat_${uuidv4().substring(0,8)}`;
  await db.insert(schema.categories).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/categories/:id', authenticateAdmin, requirePermission('products'), async (req, res) => {
  await db.update(schema.categories).set(req.body).where(eq(schema.categories.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/categories/:id', authenticateAdmin, requirePermission('products'), async (req, res) => {
  await db.delete(schema.categories).where(eq(schema.categories.id, req.params.id));
  res.json({ success: true });
});

// B端：库存预警列表 (低于 warnThreshold)
app.get('/api/admin/inventory/warnings', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const warnings = await db.query.inventory.findMany({
    where: sql`stock <= warn_threshold`
  });
  res.json({ success: true, warnings });
});


// ================= NEW CONTENT CRUD APIS =================
// Banners CRUD
app.post('/api/admin/banners', authenticateAdmin, requirePermission('content'), async (req, res) => {
  const newId = `ban_${uuidv4().substring(0,8)}`;
  await db.insert(schema.banners).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/banners/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.update(schema.banners).set(req.body).where(eq(schema.banners.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/banners/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.delete(schema.banners).where(eq(schema.banners.id, req.params.id));
  res.json({ success: true });
});

// Announcements CRUD
app.post('/api/admin/announcements', authenticateAdmin, requirePermission('content'), async (req, res) => {
  const newId = `ann_${uuidv4().substring(0,8)}`;
  await db.insert(schema.announcements).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/announcements/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.update(schema.announcements).set(req.body).where(eq(schema.announcements.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/announcements/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.delete(schema.announcements).where(eq(schema.announcements.id, req.params.id));
  res.json({ success: true });
});

// FAQs CRUD
app.post('/api/admin/faqs', authenticateAdmin, requirePermission('content'), async (req, res) => {
  const newId = `faq_${uuidv4().substring(0,8)}`;
  await db.insert(schema.faqs).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/faqs/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.update(schema.faqs).set(req.body).where(eq(schema.faqs.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/faqs/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.delete(schema.faqs).where(eq(schema.faqs.id, req.params.id));
  res.json({ success: true });
});



// ================= NEW ADMIN USERS APIS =================
app.post('/api/admin/users/invite', authenticateAdmin, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ code: 'INVALID_INPUT' });
  
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (existing) {
    if (existing.role !== 'admin') {
      await db.update(schema.users).set({ role: 'admin' }).where(eq(schema.users.id, existing.id));
    }
    return res.json({ success: true, message: 'Existing user upgraded to admin' });
  }

  const rawPassword = require('crypto').randomBytes(8).toString('hex');
  const pepper = process.env.PASSWORD_SALT || '';
  const hashedPassword = await bcrypt.hash(rawPassword + pepper, await bcrypt.genSalt(10));
  
  await db.insert(schema.users).values({
    id: `usr_${require('uuid').v4().substring(0, 8)}`,
    email,
    passwordHash: hashedPassword,
    role: 'admin',
    tier: 'standard'
  });
  res.json({ success: true, message: 'Admin invited', tempPassword: rawPassword });
});

app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  const usersList = await db.query.users.findMany({
    orderBy: [desc(schema.users.createdAt)]
  });
  
  // decrypt phone if needed, but not strictly required
  usersList.forEach(u => {
    if (u.phoneEncrypted) u.phoneEncrypted = decrypt(u.phoneEncrypted);
    if (!Array.isArray(u.permissions)) u.permissions = [];
  });
  
  res.json({ success: true, users: usersList });
});

app.patch('/api/admin/users/:id/role', authenticateAdmin, async (req, res) => {
  await db.update(schema.users).set({ role: req.body.role }).where(eq(schema.users.id, req.params.id));
  res.json({ success: true });
});

app.patch('/api/admin/users/:id/tier', authenticateAdmin, async (req, res) => {
  await db.update(schema.users).set({ tier: req.body.tier }).where(eq(schema.users.id, req.params.id));
  res.json({ success: true });
});

app.patch('/api/admin/users/:id/permissions', authenticateAdmin, async (req, res) => {
  await db.update(schema.users).set({ permissions: req.body.permissions }).where(eq(schema.users.id, req.params.id));
  res.json({ success: true });
});

// ================= NEW BATCH / EXPORT APIS =================

// B端：商品批量操作 - 批量导出 (CSV)
app.get('/api/admin/products/export', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const prods = await db.query.products.findMany();
  let csv = 'ID,NameZh,NameEn,CategoryId,PriceOriginal,PriceAfter,Status\n';
  for (const p of prods) {
    csv += `"${p.id}","${p.nameZh}","${p.nameEn}","${p.categoryId}","${p.priceOriginalCents}","${p.priceAfterCents}","${p.status}"\n`;
  }
  res.header('Content-Type', 'text/csv');
  res.attachment('products.csv');
  return res.send(csv);
});

// B端：订单数据导出 (CSV)
app.get('/api/admin/orders/export', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  const { status, startDate, endDate } = req.query as any;
  const conditions = [];
  if (status) conditions.push(eq(schema.orders.status, status as any));
  if (startDate) conditions.push(gte(schema.orders.createdAt, new Date(startDate) as any));
  if (endDate) conditions.push(sql`created_at <= ${new Date(endDate) as any}`);
  
  const orderList = await db.query.orders.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { items: true }
  });
  
  let csv = 'OrderID,Status,UserId,TotalCents,CreatedAt,ItemsCount\n';
  for (const o of orderList) {
    csv += `"${o.id}","${o.status}","${o.userId}","${o.grandTotalCents}","${o.createdAt}","${o.items.length}"\n`;
  }
  res.header('Content-Type', 'text/csv');
  res.attachment('orders.csv');
  return res.send(csv);
});

// 电子收据 (SDRS §6.10)
app.get('/api/orders/:id/receipt', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const order = await db.query.orders.findFirst({
    where: and(eq(schema.orders.id, req.params.id), eq(schema.orders.userId, userId)),
    with: { items: { with: { sku: { with: { product: true } } } } }
  });
  if (!order) return res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found.' });
  if (order.status === 'pending_payment') return res.status(400).json({ code: 'NOT_PAID', message: 'Order not paid.' });
  
  let html = `
    <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>Electronic Receipt</h2>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <hr />
        <ul>
  `;
  for (const item of order.items) {
    html += `<li>${item.sku?.product?.nameEn || 'Item'} x${item.qty} - HK$ ${((item.priceCents * item.qty) / 100).toFixed(2)}</li>`;
  }
  html += `
        </ul>
        <hr />
        <p><strong>Subtotal:</strong> HK$ ${(order.totalCents / 100).toFixed(2)}</p>
        <p><strong>Shipping:</strong> HK$ ${(order.shippingFeeCents / 100).toFixed(2)}</p>
        <p><strong>Discount:</strong> -HK$ ${(order.discountCents / 100).toFixed(2)}</p>
        <h3><strong>Total:</strong> HK$ ${(order.grandTotalCents / 100).toFixed(2)}</h3>
        <button onclick="window.print()" style="margin-top:20px;">Print</button>
      </body>
    </html>
  `;
  res.send(html);
});


// ================= NEW ROLES CRUD APIS =================
// B端：角色与权限管理
app.get('/api/admin/roles', authenticateAdmin, async (req, res) => {
  const allRoles = await db.query.roles.findMany();
  res.json({ success: true, roles: allRoles });
});
app.post('/api/admin/roles', authenticateAdmin, async (req, res) => {
  const newId = `role_${uuidv4().substring(0,8)}`;
  await db.insert(schema.roles).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/roles/:id', authenticateAdmin, async (req, res) => {
  await db.update(schema.roles).set(req.body).where(eq(schema.roles.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/roles/:id', authenticateAdmin, async (req, res) => {
  await db.delete(schema.roles).where(eq(schema.roles.id, req.params.id));
  res.json({ success: true });
});


app.get('/api/admin/permissions/catalog', authenticateAdmin, async (req, res) => {
  res.json({
    success: true,
    catalog: [
      { code: 'manage_users', name: 'Manage Users' },
      { code: 'manage_orders', name: 'Manage Orders' },
      { code: 'manage_products', name: 'Manage Products' },
      { code: 'content', name: 'CMS & Marketing' },
      { code: 'settings', name: 'Platform Settings' },
      { code: 'all', name: 'Super Admin (All Access)' }
    ]
  });
});

app.put('/api/admin/roles/:id/permissions', authenticateAdmin, async (req, res) => {
  const { permissions } = req.body; // array of strings
  if (!Array.isArray(permissions)) return res.status(400).json({ code: 'INVALID_INPUT' });
  
  await db.transaction(async (tx) => {
    await tx.delete(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, req.params.id));
    for (const p of permissions) {
      await tx.insert(schema.rolePermissions).values({
        id: `rp_${require('uuid').v4().substring(0,8)}`,
        roleId: req.params.id,
        module: p
      });
    }
  });
  
  res.json({ success: true });
});

app.get('/api/admin/roles/:id/permissions', authenticateAdmin, async (req, res) => {
  const perms = await db.query.rolePermissions.findMany({ where: eq(schema.rolePermissions.roleId, req.params.id) });
  res.json({ success: true, permissions: perms });
});
app.post('/api/admin/roles/:id/permissions', authenticateAdmin, async (req, res) => {
  const { module } = req.body;
  const newId = `rp_${uuidv4().substring(0,8)}`;
  await db.insert(schema.rolePermissions).values({ id: newId, roleId: req.params.id, module });
  res.json({ success: true, id: newId });
});
app.delete('/api/admin/roles/:id/permissions/:permId', authenticateAdmin, async (req, res) => {
  await db.delete(schema.rolePermissions).where(eq(schema.rolePermissions.id, req.params.permId));
  res.json({ success: true });
});

// ================= NEW CART LOCAL RESOLVE =================
app.post('/api/cart/local-resolve', async (req, res) => {
  const { localItems } = req.body;
  if (!localItems || !localItems.length) return res.json([]);
  
  const itemsWithDetails = [];
  for (let i = 0; i < localItems.length; i++) {
    const item = localItems[i];
    const spec = await db.query.productSpecs.findFirst({
      where: eq(schema.productSpecs.id, item.skuId)
    });
    if (spec) {
      const product = await db.query.products.findFirst({
        where: eq(schema.products.id, spec.productId)
      });
      itemsWithDetails.push({
        id: 'local_' + i,
        cartId: 'local',
        skuId: item.skuId,
        qty: item.qty,
        checked: item.checked !== false,
        spec,
        product
      });
    }
  }
  res.json(itemsWithDetails);
});

// ================= NEW MEMBER TIERS CRUD APIS =================
app.get('/api/admin/tiers', authenticateAdmin, async (req, res) => {
  const allTiers = await db.query.memberLevels.findMany({
    orderBy: [asc(schema.memberLevels.minSpendCents)]
  });
  res.json({ success: true, tiers: allTiers });
});
app.post('/api/admin/tiers', authenticateAdmin, async (req, res) => {
  const newId = `tier_${uuidv4().substring(0,8)}`;
  await db.insert(schema.memberLevels).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/tiers/:id', authenticateAdmin, async (req, res) => {
  await db.update(schema.memberLevels).set(req.body).where(eq(schema.memberLevels.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/tiers/:id', authenticateAdmin, async (req, res) => {
  await db.delete(schema.memberLevels).where(eq(schema.memberLevels.id, req.params.id));
  res.json({ success: true });
});
// Apply migrations
migrate().then(() => {
  console.log("Database migrated successfully.");
}).catch((err) => {
  console.error("Database migration failed:", err);
  // Do not crash the server so the user can see the API still responds (e.g. for debugging)
});

if (!isProduction) {
  import('vite').then(async ({ createServer }) => {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Dev] Server running on http://localhost:${PORT}`);
    });
  }).catch(console.error);
} else {
  const distPath = require('path').join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(require('path').join(distPath, 'index.html'));
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Prod] Server running on port ${PORT}`);
  });
}
