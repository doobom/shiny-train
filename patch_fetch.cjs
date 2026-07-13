const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf8');

code = code.replace(
  `const response = await fetch(url, { ...options, headers });`,
  `console.log('fetchWithAuth options:', options);\n  const response = await fetch(url, { ...options, headers });`
);

fs.writeFileSync('src/utils/api.ts', code);
