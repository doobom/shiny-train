const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `app.get('/api/admin/products', authenticateToken, async (req, res) => {
  const prods = await db.query.products.findMany();
  res.json(prods);
});`;

const replacement = `app.get('/api/admin/products', authenticateToken, async (req, res) => {
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
});`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
