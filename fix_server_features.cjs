const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// 1. Add express-rate-limit and rate limiting middleware
const rateLimitImport = `import rateLimit from 'express-rate-limit';\n\nconst globalLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 1000, // Limit each IP to 1000 requests per \`window\` (here, per 15 minutes)\n  standardHeaders: true,\n  legacyHeaders: false,\n  message: { error: 'Too many requests, please try again later.' }\n});\n\nconst apiLimiter = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 300, // Stricter limit for APIs\n  message: { error: 'API rate limit exceeded.' }\n});\n\nconst authLimiter = rateLimit({\n  windowMs: 60 * 60 * 1000, // 1 hour\n  max: 20, // Limit auth endpoints\n  message: { error: 'Too many login attempts, please try again after an hour' }\n});`;

code = code.replace("const JWT_SECRET", rateLimitImport + "\n\napp.use(globalLimiter);\napp.use('/api', apiLimiter);\napp.use('/api/auth', authLimiter);\n\nconst JWT_SECRET");

// 2. Add email notification mock
const emailMock = `\n// Mock email/SMS notification system\nconst sendTransactionalEmail = (email: string, subject: string, content: string) => {\n  console.log('--------------------------------------------------');\n  console.log(\`📧 [EMAIL TO \${email}]\`);\n  console.log(\`Subject: \${subject}\`);\n  console.log(\`\${content}\`);\n  console.log('--------------------------------------------------');\n};\n`;
code = code.replace("const authenticateToken =", emailMock + "\nconst authenticateToken =");

// 3. Inject email notification on order create
const checkoutBlock = `app.post('/api/orders', authenticateToken, async (req, res) => {`;
const checkoutReplacement = `app.post('/api/orders', authenticateToken, async (req, res) => {\n  const user = await db.query.users.findFirst({ where: eq(schema.users.id, (req as any).user.id) });`;
code = code.replace(checkoutBlock, checkoutReplacement);

code = code.replace(/res\.json\(\{ orderId: orderId \}\);/g, `sendTransactionalEmail(user?.email || 'admin@example.com', 'Order Received: ' + orderId, 'Dear Customer, your order ' + orderId + ' has been received and is pending payment.');\n  res.json({ orderId: orderId });`);

// 4. Inject email notification on order payment
code = code.replace(/app\.post\('\/api\/payments\/:orderId\/charge', async \(req, res\) => \{\n  await db\.update\(schema\.orders\)\.set\(\{ status: 'paid' \}\)\.where\(eq\(schema\.orders\.id, req\.params\.orderId\)\);\n  res\.json\(\{ success: true, clientSecret: 'mock_secret' \}\);\n\}\);/g, `app.post('/api/payments/:orderId/charge', async (req, res) => {
  await db.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, req.params.orderId));
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, req.params.orderId) });
  if (order) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, order.userId) });
    sendTransactionalEmail(user?.email || 'admin@example.com', 'Payment Successful: ' + req.params.orderId, 'Your payment has been processed successfully.');
  }
  res.json({ success: true, clientSecret: 'mock_secret' });
});`);

code = code.replace(/app\.post\('\/api\/payments\/:orderId\/voucher', async \(req, res\) => \{\n  await db\.update\(schema\.orders\)\.set\(\{ status: 'paid' \}\)\.where\(eq\(schema\.orders\.id, req\.params\.orderId\)\);\n  res\.json\(\{ success: true \}\);\n\}\);/g, `app.post('/api/payments/:orderId/voucher', async (req, res) => {
  await db.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, req.params.orderId));
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, req.params.orderId) });
  if (order) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, order.userId) });
    sendTransactionalEmail(user?.email || 'admin@example.com', 'Payment Successful: ' + req.params.orderId, 'Your payment has been processed successfully.');
  }
  res.json({ success: true });
});`);

// 5. Advanced Search & Pagination on /api/products
const productsApiTarget = `app.get('/api/products', async (req, res) => {
  const { categoryId, q } = req.query;
  let conditions = [];
  conditions.push(eq(schema.products.status, 'on_shelf'));
  if (categoryId) conditions.push(eq(schema.products.categoryId, String(categoryId)));
  
  let prods = await db.query.products.findMany({
    where: and(...conditions),
  });

  if (q) {
    const query = String(q).toLowerCase();
    prods = prods.filter(p => p.nameZh.toLowerCase().includes(query) || p.nameEn.toLowerCase().includes(query));
  }
  
  // Attach specs
  const specs = await db.query.productSpecs.findMany({
    where: inArray(schema.productSpecs.productId, prods.map(p => p.id))
  });
  
  res.json(prods.map(p => ({
    ...p,
    specs: specs.filter(s => s.productId === p.id)
  })));
});`;

const productsApiReplacement = `app.get('/api/products', async (req, res) => {
  const { categoryId, q, minPrice, maxPrice, sort, page = '1', limit = '20' } = req.query;
  
  const pageNum = parseInt(String(page), 10) || 1;
  const limitNum = parseInt(String(limit), 10) || 20;
  
  let conditions = [];
  conditions.push(eq(schema.products.status, 'on_shelf'));
  if (categoryId) conditions.push(eq(schema.products.categoryId, String(categoryId)));
  
  let prods = await db.query.products.findMany({
    where: and(...conditions),
  });

  // Filter by query
  if (q) {
    const query = String(q).toLowerCase();
    prods = prods.filter(p => p.nameZh.toLowerCase().includes(query) || p.nameEn.toLowerCase().includes(query) || (p.descZh && p.descZh.toLowerCase().includes(query)));
  }
  
  // Fetch all specs first to do price filtering and attach specs
  let specs = await db.query.productSpecs.findMany();
  
  // Attach specs and derive min price for each product
  let productsWithSpecs = prods.map(p => {
    const pSpecs = specs.filter(s => s.productId === p.id);
    const pMinPrice = pSpecs.length > 0 ? Math.min(...pSpecs.map(s => s.afterCents)) : 0;
    return { ...p, specs: pSpecs, minPrice: pMinPrice };
  });

  // Filter by price range
  if (minPrice) {
    productsWithSpecs = productsWithSpecs.filter(p => p.minPrice >= parseInt(String(minPrice), 10));
  }
  if (maxPrice) {
    productsWithSpecs = productsWithSpecs.filter(p => p.minPrice <= parseInt(String(maxPrice), 10));
  }

  // Sorting
  if (sort === 'price_asc') {
    productsWithSpecs.sort((a, b) => a.minPrice - b.minPrice);
  } else if (sort === 'price_desc') {
    productsWithSpecs.sort((a, b) => b.minPrice - a.minPrice);
  } else if (sort === 'newest') {
    productsWithSpecs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Pagination
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
});`;

code = code.replace(productsApiTarget, productsApiReplacement);

// 6. DB Init endpoint (curl accessible)
const initDbEndpoint = `
// Database initialization endpoint via curl
// Example: curl -X POST http://localhost:3000/api/admin/init-db
app.post('/api/admin/init-db', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database initialized successfully via API.' });
  } catch (error: any) {
    console.error('Initialization error:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize database', error: error.message });
  }
});
`;

code = code.replace("app.listen(PORT", initDbEndpoint + "\napp.listen(PORT");

fs.writeFileSync('server.ts', code);
