const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 requests per windowMs for auth
  message: 'Too many authentication attempts, please try again later'
});
app.use('/api/auth/', authLimiter);`;

code = code.replace(targetStr, '');
fs.writeFileSync('server.ts', code);
