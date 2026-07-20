const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace("  res.json({ success: true });\napp.post('/api/cart/batch'", "  res.json({ success: true });\n});\n\napp.post('/api/cart/batch'");
fs.writeFileSync('server.ts', code);
