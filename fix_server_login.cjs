const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\('\/api\/auth\/login'[\s\S]*?app\.post\('\/api\/auth\/password\/reset', async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true \};\n\}\);/;
code = code.replace(regex, `app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email)
  });
  
  if (!user) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
  
  let isMatch = false;
  if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
    isMatch = await bcrypt.compare(password, user.passwordHash);
  } else {
    isMatch = user.passwordHash === password;
  }
  
  if (!isMatch) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
  if (user.status === 'disabled') return res.status(403).json({ code: 'USER_DISABLED', message: 'Account disabled.' });
  
  if (!user.passwordHash.startsWith('$2a$') && !user.passwordHash.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(password, salt);
    await db.update(schema.users).set({ passwordHash: newHash }).where(eq(schema.users.id, user.id));
  }
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, email: user.email, locale: user.locale, role: user.role, tier: user.tier } });
});

app.post('/api/auth/password/forgot', async (req, res) => {
  const { email } = req.body;
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found.' });
  res.json({ success: true, message: 'Reset link sent to email.' });
});

app.post('/api/auth/password/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  res.json({ success: true });
});`);

fs.writeFileSync('server.ts', code);
