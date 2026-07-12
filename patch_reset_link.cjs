const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `const resetLink = \`https://shop.apcube.com/password/reset?token=\${rawToken}\`;`;
const replaceStr = `const appUrl = process.env.APP_URL || 'https://shop.apcube.com';
  const resetLink = \`\${appUrl}/password/reset?token=\${rawToken}\`;`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('server.ts', code);
