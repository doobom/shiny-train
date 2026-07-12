const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const emptyResetBlock = `app.post('/api/auth/password/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  res.json({ success: true });
});`;

const properResetBlock = `app.post('/api/auth/password/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  const resetToken = await db.query.emailResetTokens.findFirst({
    where: and(eq(schema.emailResetTokens.token, token), gte(schema.emailResetTokens.expiresAt, new Date()))
  });
  if (!resetToken) return res.status(400).json({ code: 'INVALID_TOKEN', message: 'Token invalid or expired.' });
  
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, resetToken.userId) });
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found.' });
  
  const pepper = process.env.PASSWORD_SALT || '';
  const hashedPassword = await bcrypt.hash(newPassword + pepper, await bcrypt.genSalt(10));
  
  await db.update(schema.users).set({ passwordHash: hashedPassword }).where(eq(schema.users.id, user.id));
  await db.delete(schema.emailResetTokens).where(eq(schema.emailResetTokens.id, resetToken.id));
  
  res.json({ success: true, message: 'Password reset successful.' });
});`;

code = code.replace(emptyResetBlock, properResetBlock);
fs.writeFileSync('server.ts', code);
