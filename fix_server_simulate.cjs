const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// I will just use string replacement for the simulate block
const target = `    if (!user && mappedId === 'usr_2') {
    user = {
      id: 'usr_2',
      email: 'david@gmail.com',
      passwordHash: 'dummy',
      locale: 'zh-HK',
      status: 'active',
    } as any;
    await db.insert(schema.users).values(user);
    await db.insert(schema.carts).values({ id: \`cart_\${user.id}\`, userId: user.id });
  }

  if (!user) return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User not found.' });
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, email: user.email, locale: user.locale } });
});
`;

code = code.replace(target, '');

fs.writeFileSync('server.ts', code);
