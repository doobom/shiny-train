const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetProfileGet = `app.get('/api/user/profile', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const address = await db.query.addresses.findFirst({
    where: and(eq(schema.addresses.userId, userId), eq(schema.addresses.isDefault, true))
  });
  res.json({ address });
});`;

const replaceProfileGet = `app.get('/api/user/addresses', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const addresses = await db.query.addresses.findMany({
    where: eq(schema.addresses.userId, userId),
    orderBy: (addresses, { desc }) => [desc(addresses.isDefault), desc(addresses.createdAt)]
  });
  res.json({ addresses });
});

app.post('/api/user/addresses', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const { recipient, phone, detail, remark, isDefault } = req.body;
  
  if (isDefault) {
    await db.update(schema.addresses).set({ isDefault: false }).where(eq(schema.addresses.userId, userId));
  }
  
  const id = \`addr_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.addresses).values({
    id, userId, recipient, phone, detail, remark, isDefault: isDefault || false
  });
  res.json({ success: true });
});

app.put('/api/user/addresses/:id', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const addressId = req.params.id;
  const { recipient, phone, detail, remark, isDefault } = req.body;
  
  if (isDefault) {
    await db.update(schema.addresses).set({ isDefault: false }).where(eq(schema.addresses.userId, userId));
  }
  
  await db.update(schema.addresses).set({
    recipient, phone, detail, remark, isDefault: isDefault || false, updatedAt: new Date()
  }).where(and(eq(schema.addresses.id, addressId), eq(schema.addresses.userId, userId)));
  
  res.json({ success: true });
});

app.delete('/api/user/addresses/:id', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const addressId = req.params.id;
  await db.delete(schema.addresses).where(and(eq(schema.addresses.id, addressId), eq(schema.addresses.userId, userId)));
  res.json({ success: true });
});
`;

code = code.replace(targetProfileGet, replaceProfileGet);
fs.writeFileSync('server.ts', code);
