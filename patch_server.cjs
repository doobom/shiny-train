const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const postRoute = `
app.post('/api/admin/products', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const data = req.body;
  const id = \`prod_\${uuidv4().substring(0,8)}\`;
  
  await db.insert(schema.products).values({
    id,
    nameZh: data.nameZh,
    nameEn: data.nameEn,
    descriptionZh: data.descriptionZh,
    descriptionEn: data.descriptionEn,
    priceOriginalCents: data.priceOriginalCents,
    priceAfterCents: data.priceAfterCents,
    categoryId: data.categoryId,
    images: data.images || data.imageUrls || (data.imageUrl ? [data.imageUrl] : [])
  });

  if (data.specs && data.specs.length > 0) {
    for (const spec of data.specs) {
      const specId = \`spec_\${uuidv4().substring(0,8)}\`;
      await db.insert(schema.productSpecs).values({
        id: specId,
        productId: id,
        specNameZh: spec.specNameZh || '標準規格',
        specNameEn: spec.specNameEn || 'Standard Option',
        priceOriginalCents: data.priceOriginalCents,
        priceAfterCents: data.priceAfterCents
      });
      await db.insert(schema.inventory).values({
        skuId: specId,
        stock: spec.stock || 0,
        lockedStock: 0,
        warnThreshold: spec.warnThreshold || 10
      });
    }
  } else {
    const specId = \`spec_\${uuidv4().substring(0,8)}\`;
    await db.insert(schema.productSpecs).values({
      id: specId,
      productId: id,
      specNameZh: '標準規格',
      specNameEn: 'Standard Option',
      priceOriginalCents: data.priceOriginalCents,
      priceAfterCents: data.priceAfterCents
    });
    await db.insert(schema.inventory).values({
      skuId: specId,
      stock: 100,
      lockedStock: 0,
      warnThreshold: 10
    });
  }

  res.json({ success: true, id });
});

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
  res.json({ success: true });
});
`;

code = code.replace(/app\.post\('\/api\/admin\/products'[\s\S]*?\}\);/, postRoute);
code = code.replace(/app\.patch\('\/api\/admin\/products\/:id'[\s\S]*?\}\);/, "");
fs.writeFileSync('server.ts', code);
