const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const methods = ['get', 'post', 'put', 'patch', 'delete'];
methods.forEach(method => {
  const regex = new RegExp(`app\.${method}\\('\\/api\\/admin\\/([^']+)', \\(req, res\\) => {`, 'g');
  code = code.replace(regex, `app.${method}('/api/admin/$1', authenticateToken, (req, res) => {`);
});

fs.writeFileSync('server.ts', code);
