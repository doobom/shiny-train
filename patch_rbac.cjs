const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const rbacMiddleware = `
const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token missing' });
  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) return res.status(403).json({ code: 'FORBIDDEN', message: 'Token invalid' });
    const dbUser = await db.query.users.findFirst({ where: eq(schema.users.id, user.id) });
    if (!dbUser || dbUser.role !== 'admin') {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    req.user = dbUser;
    next();
  });
};

const requirePermission = (module: string) => {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user) return res.status(401).json({ code: 'UNAUTHORIZED' });
    if (!user.permissions || !Array.isArray(user.permissions)) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'No permissions assigned' });
    }
    if (!user.permissions.includes(module) && !user.permissions.includes('all')) {
      return res.status(403).json({ code: 'FORBIDDEN', message: \`Missing permission: \${module}\` });
    }
    next();
  };
};
`;

code = code.replace(
  /const authenticateAdmin = [\s\S]*?next\(\);\n  \}\);\n\};/,
  rbacMiddleware
);

fs.writeFileSync('server.ts', code);
