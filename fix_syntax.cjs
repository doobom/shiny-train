const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace("  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });\n});\n});", "  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });\n});");
fs.writeFileSync('server.ts', code);
