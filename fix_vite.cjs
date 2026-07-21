const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (!code.includes('chunkSizeWarningLimit')) {
  code = code.replace(/build: \{/, 'build: {\n      chunkSizeWarningLimit: 2000,');
  fs.writeFileSync('vite.config.ts', code);
}
