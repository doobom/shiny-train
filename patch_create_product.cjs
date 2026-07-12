const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `app.post('/api/admin/products', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const data = req.body;
  const id = \`prod_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.products).values({
    id,
    nameZh: data.nameZh,
    nameEn: data.nameEn,
    priceOriginalCents: data.priceOriginalCents,
    priceAfterCents: data.priceAfterCents,
    categoryId: data.categoryId,
    images: data.imageUrl ? [data.imageUrl] : []
  });`;

const replaceStr = `app.post('/api/admin/products', authenticateAdmin, requirePermission('products'), async (req, res) => {
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
    images: data.images || (data.imageUrl ? [data.imageUrl] : [])
  });`;

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('server.ts', code);
