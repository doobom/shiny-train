const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

code = code.replace(/status: varchar\('status', \{ length: 20 \}\)\.default\('active'\),/g, 
  "status: varchar('status', { length: 20 }).default('active'),\n  role: varchar('role', { length: 20 }).default('customer'),\n  tier: varchar('tier', { length: 20 }).default('standard'),");

fs.writeFileSync('src/server/schema.ts', code);
