const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const additionalAdminEndpoints = `
// Categories CRUD
app.post('/api/admin/categories', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const newId = \`cat_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.categories).values({
    id: newId,
    nameZh: req.body.nameZh,
    nameEn: req.body.nameEn,
    sort: req.body.sort || 0,
    disabled: false
  });
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

// Inventory warnings
app.get('/api/admin/inventory/warnings', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const warnings = await db.execute(sql\`
    SELECT p.name_zh, p.name_en, s.spec_name_zh, s.spec_name_en, i.stock, i.warn_threshold, i.sku_id
    FROM inventory i
    JOIN product_specs s ON i.sku_id = s.id
    JOIN products p ON s.product_id = p.id
    WHERE i.stock <= i.warn_threshold
  \`);
  res.json({ success: true, warnings: warnings.rows || warnings }); // handle pg/neon output format difference
});

// Batch operations for products
app.post('/api/admin/products/batch-status', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const { productIds, status } = req.body;
  if (!Array.isArray(productIds) || !productIds.length) return res.status(400).json({ error: 'invalid request' });
  await db.update(schema.products).set({ status }).where(inArray(schema.products.id, productIds));
  res.json({ success: true });
});

// Product level discount (single product) - /admin/discounts 
app.post('/api/admin/discounts', authenticateAdmin, requirePermission('marketing'), async (req, res) => {
  const newId = \`dsc_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.discounts).values({
    id: newId,
    code: req.body.code,
    type: req.body.type,
    value: req.body.value,
    minOrderValueCents: req.body.minOrderValueCents,
    validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null
  });
  res.json({ success: true, id: newId });
});
`;

code = code.replace(
  /app\.post\('\/api\/admin\/init-db', async \(req, res\) => \{/,
  additionalAdminEndpoints + "\napp.post('/api/admin/init-db', async (req, res) => {"
);

fs.writeFileSync('server.ts', code);
