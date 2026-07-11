const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldForgot = `app.post('/api/auth/password/forgot', async (req, res) => {
  const { email } = req.body;
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found.' });
  res.json({ success: true, message: 'Reset link sent to email.' });
});`;

const newForgot = `app.post('/api/auth/password/forgot', async (req, res) => {
  const { email } = req.body;
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found.' });
  const token = require('uuid').v4();
  await db.insert(schema.emailResetTokens).values({
    id: 'rst_' + require('uuid').v4().substring(0, 8),
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
  });
  emailQueue.push({ to: email, subject: 'Password Reset', body: \`Your password reset token is: \${token}\` });
  res.json({ success: true, message: 'Reset link sent to email.' });
});`;

code = code.replace(oldForgot, newForgot);
fs.writeFileSync('server.ts', code);
console.log("Forgot password updated.");
