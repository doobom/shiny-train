const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("app.patch('/api/user/password'")) {
  code = code.replace(
    /\/\/ User endpoints/,
    `// User endpoints\napp.patch('/api/user/password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, (req as any).user.id) });
  
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  let isMatch = false;
  if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
    isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  } else {
    isMatch = user.passwordHash === oldPassword;
  }
  
  if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect old password' });
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);
  
  await db.update(schema.users).set({ passwordHash: hash }).where(eq(schema.users.id, user.id));
  res.json({ success: true, message: 'Password updated' });
});\n`
  );
  fs.writeFileSync('server.ts', code);
}
