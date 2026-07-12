const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetForgotRegex = /app\.post\('\/api\/auth\/password\/forgot', async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, message: 'Reset link sent to email\.' \}\);\n\}\);/;
const targetResetRegex = /app\.post\('\/api\/auth\/password\/reset', async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, message: 'Password reset successfully\.' \}\);\n\}\);/;

const replacementForgot = `app.post('/api/auth/password/forgot', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email required' });
  
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  // 防枚举探测：即使用户不存在，也返回200 (遵循契约附录规范)
  if (!user) return res.json({ success: true, message: 'Reset link sent to email if exists.' });

  const rawToken = require('uuid').v4();
  const tokenHash = require('crypto').createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15分钟有效

  await db.insert(schema.emailResetTokens).values({
    id: \`tok_\${require('uuid').v4().substring(0, 8)}\`,
    userId: user.id,
    token: tokenHash,
    expiresAt,
    used: false
  });

  const resetLink = \`https://shop.apcube.com/password/reset?token=\${rawToken}\`;
  
  try {
    // Attempt to use emailQueue if it exists
    emailQueue.push({ to: email, subject: '【香港生活百貨】重置您的密碼 / Reset Your Password', content: \`<p>您好，請點擊以下鏈接在15分鐘內重置您的密碼：</p><a href="\${resetLink}">\${resetLink}</a>\` });
  } catch(e) {
    console.log("Email fallback", resetLink);
  }

  res.json({ success: true, message: 'Reset link sent to email.' });
});`;

const replacementReset = `app.post('/api/auth/password/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ code: 'INVALID_INPUT' });

  const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
  const tokenRecord = await db.query.emailResetTokens.findFirst({
    where: and(eq(schema.emailResetTokens.token, tokenHash), eq(schema.emailResetTokens.used, false))
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    return res.status(400).json({ code: 'TOKEN_INVALID', message: 'Token expired or invalid.' });
  }

  const pepper = process.env.PASSWORD_SALT || '';
  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword + pepper, salt);

  await db.transaction(async (tx) => {
    await tx.update(schema.users).set({ passwordHash: newPasswordHash, updatedAt: new Date() }).where(eq(schema.users.id, tokenRecord.userId));
    await tx.update(schema.emailResetTokens).set({ used: true }).where(eq(schema.emailResetTokens.id, tokenRecord.id));
  });

  res.json({ success: true, message: 'Password reset successfully.' });
});`;

code = code.replace(targetForgotRegex, replacementForgot);
code = code.replace(targetResetRegex, replacementReset);

fs.writeFileSync('server.ts', code);
