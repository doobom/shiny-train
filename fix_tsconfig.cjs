const fs = require('fs');
let tsconfig = JSON.parse(fs.readFileSync('tsconfig.app.json', 'utf-8'));
if (!tsconfig.include.includes('src/vite-env.d.ts')) {
    tsconfig.include.push('src/vite-env.d.ts');
    fs.writeFileSync('tsconfig.app.json', JSON.stringify(tsconfig, null, 2));
}
