const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("app.patch('/api/user/profile'")) {
  code = code.replace(
    /\/\/ User endpoints/,
    `// User endpoints
app.patch('/api/user/profile', authenticateToken, async (req, res) => {
  const { addressRecipient, addressPhone, addressDetail } = req.body;
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, (req as any).user.id) });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  await db.update(schema.users).set({ 
    addressRecipient, 
    addressPhone, 
    addressDetail 
  }).where(eq(schema.users.id, user.id));
  
  res.json({ success: true, message: 'Profile updated' });
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, (req as any).user.id) });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  res.json({ success: true, user: {
    addressRecipient: user.addressRecipient,
    addressPhone: user.addressPhone,
    addressDetail: user.addressDetail
  } });
});
`
  );
  fs.writeFileSync('server.ts', code);
}
