const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const insertionPoint = "if (process.env.NODE_ENV !== 'production') {";

const newRoutes = `
// ==================== NEW APIS (Gap Analysis) ====================

// 1. Auth & Users (Logout & Forgot Password & Merge Cart)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/cart/merge', authenticateToken, async (req, res) => {
  const userId = req.user.id;
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
      await db.update(schema.cartItems).set({ qty: existing.qty + item.qty }).where(eq(schema.cartItems.id, existing.id));
    } else {
      await db.insert(schema.cartItems).values({
        id: 'ci_' + require('uuid').v4().substring(0, 8),
        cartId: cart.id,
        skuId: item.skuId,
        qty: item.qty
      });
    }
  }
  res.json({ success: true });
});

app.get('/api/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const list = await db.query.favorites.findMany({ where: eq(schema.favorites.userId, userId) });
  res.json(list);
});

app.post('/api/favorites/:productId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
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
    where: sql\`stock <= warn_threshold\`
  });
  res.json({ warnings });
});

const multer = require('multer');
const { parse } = require('csv-parse/sync');
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
         nameZh: record.nameZh || 'New Product',
         nameEn: record.nameEn || 'New Product',
         categoryId: record.categoryId || null,
         priceOriginalCents: parseInt(record.price) || 0,
         priceAfterCents: parseInt(record.price) || 0
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
  let csv = 'ID,Status,Total(Cents),Created\\n';
  for (const o of allOrders) {
    csv += \`\${o.id},\${o.status},\${o.totalCents},\${o.createdAt}\\n\`;
  }
  res.header('Content-Type', 'text/csv');
  res.attachment('orders.csv');
  res.send(csv);
});

app.get('/api/orders/:id/receipt', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
  if (!order) return res.status(404).send('Order not found');
  
  const html = \`
    <html>
      <head><title>Receipt \${order.id}</title></head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #333;">Receipt</h1>
        <div style="text-align: left; max-width: 400px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <p><strong>Order ID:</strong> \${order.id}</p>
          <p><strong>Date:</strong> \${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Total:</strong> HK$ \${(order.totalCents / 100).toFixed(2)}</p>
          <p><strong>Status:</strong> \${order.status}</p>
        </div>
        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Print Receipt</button>
      </body>
    </html>
  \`;
  res.send(html);
});

`;

if (!code.includes("app.post('/api/auth/logout'")) {
  code = code.replace(insertionPoint, newRoutes + insertionPoint);
}

fs.writeFileSync('server.ts', code);
console.log("Routes injected.");
