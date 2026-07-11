const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `  if (!isMatch) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });
  if (user.status === 'disabled') return res.status(403).json({ code: 'USER_DISABLED', message: 'Account disabled.' });
  
  if (!user.passwordHash.startsWith('$2a$') && !user.passwordHash.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(password, salt);
    await db.update(schema.users).set({ passwordHash: newHash }).where(eq(schema.users.id, user.id));
  }
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });`;

code = code.replace(/if \(!isMatch\) return res\.status\(401\)\.json\(\{ code: 'AUTH_FAILED', message: 'Invalid email or password\.' \}\);\s*if \(user\.status === 'disabled'\) return res\.status\(403\)\.json\(\{ code: 'USER_DISABLED', message: 'Account disabled\.' \}\);\s*const token = jwt\.sign\(\{ id: user\.id, email: user\.email \}, JWT_SECRET, \{ expiresIn: '7d' \}\);/g, replacement);

fs.writeFileSync('server.ts', code);
