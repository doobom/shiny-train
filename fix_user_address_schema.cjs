const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

code = code.replace(
  /tier: varchar\('tier', \{ length: 20 \}\)\.default\('standard'\),/,
  `tier: varchar('tier', { length: 20 }).default('standard'),
  addressRecipient: varchar('address_recipient', { length: 100 }),
  addressPhone: varchar('address_phone', { length: 50 }),
  addressDetail: text('address_detail'),`
);
fs.writeFileSync('src/server/schema.ts', code);
