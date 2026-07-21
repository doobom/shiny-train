const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!pkg.scripts.build.includes('max-old-space-size')) {
  pkg.scripts.build = pkg.scripts.build.replace('vite build', 'NODE_OPTIONS=--max-old-space-size=4096 vite build');
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
}
