const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

if (!code.includes('permissions: jsonb')) {
  code = code.replace(
    /role: varchar\('role', \{ length: 20 \}\)\.default\('customer'\),/,
    `role: varchar('role', { length: 20 }).default('customer'),
  permissions: jsonb('permissions'),`
  );
  if (!code.includes('jsonb')) {
    code = code.replace(/import \{ pgTable, varchar, timestamp, text, integer, decimal, boolean \} from 'drizzle-orm\/pg-core';/, "import { pgTable, varchar, timestamp, text, integer, decimal, boolean, jsonb } from 'drizzle-orm/pg-core';");
  }
  fs.writeFileSync('src/server/schema.ts', code);
}
