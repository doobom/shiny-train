const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const loginRegex = /app\.post\('\/api\/auth\/login', async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, token, user:[^\}]+\} \}\);\n\}\);/g;

code = code.replace(loginRegex, `app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
    
    if (!user) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
    
    const pepper = process.env.PASSWORD_SALT || '';
    // password from frontend could be plain text or sha-256 hashed.
    // If frontend hashes it, they send us a hash. Then we prepend pepper and bcrypt.
    let isMatch = await bcrypt.compare(password + pepper, user.passwordHash);
    if (!isMatch) {
      // Fallback for old passwords without pepper
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }
    
    if (!isMatch) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, email: user.email, locale: user.locale, role: user.role, tier: user.tier } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Internal server error.' });
  }
});`);

const regRegex = /app\.post\('\/api\/auth\/register', async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, user: \{ id: newUser\.id, email: newUser\.email, locale: 'zh-HK' \} \}\);\n\}\);/g;

code = code.replace(regRegex, `app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    if (!email || !password) return res.status(400).json({ code: 'INVALID_INPUT', message: 'Email and password required' });
    const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
    if (existing) return res.status(400).json({ code: 'EMAIL_EXISTS', message: 'Email already registered.' });
    
    const pepper = process.env.PASSWORD_SALT || '';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password + pepper, salt);
    
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Internal server error.' });
  }
});`);

fs.writeFileSync('server.ts', code);
