const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetIdx = code.indexOf('// Apply migrations');
if (targetIdx === -1) {
  console.log("Could not find '// Apply migrations'");
  process.exit(1);
}

const apis = `
// ================= NEW APIS =================

// C端：合并本地购物车 (登录后触发)
app.post('/api/cart/merge', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { localItems } = req.body; // [{ skuId: '...', qty: 2 }]
  const cartId = \`cart_\${userId}\`;
  
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
            id: \`ci_\${uuidv4().substring(0,8)}\`, cartId, skuId: item.skuId, qty: item.qty, checked: true
          });
        }
      }
    }
  });
  res.json({ success: true });
});

// C端：获取我的收藏列表
app.get('/api/favorites', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const favs = await db.query.favorites.findMany({ where: eq(schema.favorites.userId, userId) });
  const productIds = favs.map(f => f.productId);
  const prods = productIds.length ? await db.query.products.findMany({ where: inArray(schema.products.id, productIds) }) : [];
  res.json({ success: true, favorites: prods });
});

// C端：添加/取消收藏
app.post('/api/favorites/:productId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;
  const existing = await db.query.favorites.findFirst({ 
    where: and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, productId)) 
  });
  if (!existing) {
    await db.insert(schema.favorites).values({ id: \`fav_\${uuidv4().substring(0,8)}\`, userId, productId });
  }
  res.json({ success: true });
});
app.delete('/api/favorites/:productId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  await db.delete(schema.favorites).where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, req.params.productId)));
  res.json({ success: true });
});

// B端：分类管理 CRUD
app.post('/api/admin/categories', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const newId = \`cat_\${uuidv4().substring(0,8)}\`;
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
    where: sql\`stock <= warn_threshold\`
  });
  res.json({ success: true, warnings });
});

`;

const newCode = code.substring(0, targetIdx) + apis + code.substring(targetIdx);
fs.writeFileSync('server.ts', newCode);
