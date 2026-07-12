const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `app.post('/api/admin/products', authenticateAdmin, requirePermission('products'), async (req, res) => {
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
  });
  
  if (data.specs) {
    for (const spec of data.specs) {
      await db.insert(schema.productSpecs).values({
        id: \`sku_\${uuidv4().substring(0,8)}\`,
        productId: id,
        specNameZh: spec.specNameZh,
        specNameEn: spec.specNameEn,
        priceDeltaCents: spec.priceDeltaCents || 0
      });
      await db.insert(schema.inventory).values({
        skuId: \`sku_\${uuidv4().substring(0,8)}\`, // Wait, this doesn't match above... oh it's not my code to fix this part right now...
      });
    }
  }
  res.json({ success: true, id });
});`;

// We'll just search for the post block
const addPutProduct = `
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
    images: data.images || (data.imageUrl ? [data.imageUrl] : [])
  }).where(eq(schema.products.id, req.params.id));
  res.json({ success: true });
});
`;

code = code.replace("app.post('/api/admin/products',", addPutProduct + "\\napp.post('/api/admin/products',");

const userProfileTarget = `app.put('/api/auth/profile/email', authenticateToken, async (req, res) => {`;

const addUserProfile = `
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const address = await db.query.addresses.findFirst({
    where: and(eq(schema.addresses.userId, userId), eq(schema.addresses.isDefault, true))
  });
  res.json({ address });
});

app.patch('/api/user/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { addressRecipient, addressPhone, addressDetail } = req.body;
  
  let address = await db.query.addresses.findFirst({
    where: and(eq(schema.addresses.userId, userId), eq(schema.addresses.isDefault, true))
  });
  
  if (address) {
    await db.update(schema.addresses).set({
      recipient: addressRecipient,
      phone: addressPhone,
      detail: addressDetail,
      updatedAt: new Date()
    }).where(eq(schema.addresses.id, address.id));
  } else {
    await db.insert(schema.addresses).values({
      id: \`addr_\${uuidv4().substring(0,8)}\`,
      userId,
      recipient: addressRecipient,
      phone: addressPhone,
      detail: addressDetail,
      isDefault: true
    });
  }
  res.json({ success: true });
});
`;

code = code.replace(userProfileTarget, addUserProfile + "\\n" + userProfileTarget);

fs.writeFileSync('server.ts', code);
