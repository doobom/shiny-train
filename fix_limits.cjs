const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  const maxPerItem = parseInt(settings.find((s: any) => s.key === 'max_per_item')?.value || '999');
  const maxTotal = parseInt(settings.find((s: any) => s.key === 'max_total')?.value || '9999');`;

const replace = `  const maxPerItem = parseInt(settings.find((s: any) => s.key === 'max_per_item')?.value || '5');
  const maxTotal = parseInt(settings.find((s: any) => s.key === 'max_total')?.value || '20');`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
