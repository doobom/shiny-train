const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newApis = `
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
  const id = \`dsc_\${require('uuid').v4().substring(0,8)}\`;
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

// ================= NEW APIS =================`;

if (!code.includes("batch-discount")) {
  code = code.replace("// ================= NEW APIS =================", newApis);
  fs.writeFileSync('server.ts', code);
}

