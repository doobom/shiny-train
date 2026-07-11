const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('const authenticateAdmin')) {
  code = code.replace(
    /const authenticateToken = \(req: express\.Request, res: express\.Response, next: express\.NextFunction\) => \{[\s\S]*?\}\);[\s\S]*?\};\n/,
    `const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ code: 'FORBIDDEN', message: 'Token invalid' });
    (req as any).user = user;
    next();
  });
};

const authenticateAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Token missing' });

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) return res.status(403).json({ code: 'FORBIDDEN', message: 'Token invalid' });
    
    // Check role from DB
    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.id, user.id)
    });
    
    if (!dbUser || dbUser.role !== 'admin') {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    
    (req as any).user = user;
    next();
  });
};\n`
  );

  // Replace all admin endpoints to use authenticateAdmin
  code = code.replace(/app\.(get|post|patch|delete)\('\/api\/admin\//g, "app.$1('/api/admin/");
  code = code.replace(/app\.(get|post|patch|delete)\('\/api\/admin\/(.*?)',\s*authenticateToken/g, "app.$1('/api/admin/$2', authenticateAdmin");

  fs.writeFileSync('server.ts', code);
}
