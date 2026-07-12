const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    if (!dbUser || dbUser.role !== 'admin') {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    req.user = dbUser;
    next();`;

const replace = `    if (!dbUser || dbUser.role !== 'admin') {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    
    // Load Role Permissions and merge
    const rolePerms = await db.query.rolePermissions.findMany({
      where: eq(schema.rolePermissions.roleId, dbUser.role)
    });
    
    let mergedPerms = Array.isArray(dbUser.permissions) ? [...dbUser.permissions] : [];
    rolePerms.forEach(rp => {
      if (!mergedPerms.includes(rp.module)) {
        mergedPerms.push(rp.module);
      }
    });
    
    // Auto-grant all if email is the root admin
    if (dbUser.email === process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL === undefined) {
      if (!mergedPerms.includes('all')) mergedPerms.push('all');
    }
    
    req.user = { ...dbUser, permissions: mergedPerms };
    next();`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
