const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(
  "'vendor-icons': ['lucide-react'], 'vendor-charts': ['recharts'], 'vendor-motion': ['motion']",
  "'vendor-icons': ['lucide-react'], 'vendor-charts': ['recharts'], 'vendor-motion': ['motion'], 'vendor-drizzle': ['drizzle-orm', '@electric-sql/pglite']"
);

fs.writeFileSync('vite.config.ts', code);
