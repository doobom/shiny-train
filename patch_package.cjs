const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.engines = { node: ">=22.0.0" };
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
