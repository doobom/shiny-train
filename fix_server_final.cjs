const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find all the bad duplicates at the end of the file
const badStr = `) && !user.passwordHash.startsWith('$2b
  res.json({ success: true, token, user: { id: user.id, email: user.email, locale: user.locale, role: user.role, tier: user.tier } });
});`;

// Remove all instances of the bad string
while (code.includes(badStr)) {
  code = code.replace(badStr, '');
}

// Remove the `if (user.passwordHash.startsWith('$2a` without closing quote
code = code.replace(/if \(user\.passwordHash\.startsWith\('\$2a\n[\s\S]*?(res\.json\(\{ success: true, token)/g, '$1');

code = code.replace(/let isMatch = false;\n  if \(user\.passwordHash\.startsWith\('\$2a[\s\S]*?if \(!isMatch\) return res\.status\(401\)\.json\(\{ code: 'AUTH_FAILED', message: 'Invalid email or password\.' \}\);/g, 
`let isMatch = false;
  if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
    isMatch = await bcrypt.compare(password, user.passwordHash);
  } else {
    isMatch = user.passwordHash === password;
  }
  
  if (!isMatch) return res.status(401).json({ code: 'AUTH_FAILED', message: 'Invalid email or password.' });`);

fs.writeFileSync('server.ts', code);
