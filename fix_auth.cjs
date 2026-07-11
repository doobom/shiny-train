const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add bcryptjs import
if (!code.includes("import bcrypt from 'bcryptjs'")) {
    code = code.replace("import jwt from 'jsonwebtoken';", "import jwt from 'jsonwebtoken';\nimport bcrypt from 'bcryptjs';");
}

code = code.replace(/app\.post\('\/api\/auth\/register', async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, user: \{ id: newUser\.id, email: newUser\.email, locale: 'zh-HK' \} \}\);\n\}\);/g, `app.post('/api/auth/register', async (req, res) => {
  const { email, password, phone } = req.body;
  if (!email || !password) return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email and password required' });
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (existing) return res.status(400).json({ code: 'EMAIL_EXISTS', message: 'Email already registered.' });
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  
  const newUser = {
    id: \`usr_\${uuidv4().substring(0, 8)}\`,
    email,
    passwordHash,
    phoneEncrypted: phone,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await db.insert(schema.users).values(newUser);
  await db.insert(schema.carts).values({ id: \`cart_\${newUser.id}\`, userId: newUser.id });
  res.json({ success: true, user: { id: newUser.id, email: newUser.email, locale: 'zh-HK' } });
});`);

code = code.replace(/app\.post\('\/api\/auth\/login', async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, token, user: \{ id: user\.id, email: user\.email, locale: user\.locale \} \}\);\n\}\);/g, `app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email)
  });
  
  if (!user) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
  
  // Backward compatibility with raw passwords temporarily (if requested)
  let isMatch = false;
  if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
    isMatch = await bcrypt.compare(password, user.passwordHash);
  } else {
    isMatch = user.passwordHash === password;
  }
  
  if (!isMatch) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
  
  if (user.status === 'disabled') return res.status(403).json({ code: 'USER_DISABLED', message: 'Account disabled.' });
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, email: user.email, locale: user.locale, role: user.role, tier: user.tier } });
});`);

fs.writeFileSync('server.ts', code);
