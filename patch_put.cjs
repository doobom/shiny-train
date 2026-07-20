const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const putRoute = `
app.put('/api/admin/products/:id', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const data = req.body;
  await db.update(schema.products).set({
    nameZh: data.nameZh,
    nameEn: data.nameEn,
    descriptionZh: data.descriptionZh,
    descriptionEn: data.descriptionEn,
    priceOriginalCents: data.priceOriginalCents,
    priceAfterCents: data.priceAfterCents,
    categoryId: data.categoryId,
    images: data.images || data.imageUrls || (data.imageUrl ? [data.imageUrl] : [])
  }).where(eq(schema.products.id, req.params.id));
  
  await db.update(schema.productSpecs).set({
    priceOriginalCents: data.priceOriginalCents,
    priceAfterCents: data.priceAfterCents
  }).where(eq(schema.productSpecs.productId, req.params.id));

  res.json({ success: true });
});
`;

code = code.replace(/app\.put\('\/api\/admin\/products\/:id'[\s\S]*?\}\);\n/, putRoute + "\n");
fs.writeFileSync('server.ts', code);
