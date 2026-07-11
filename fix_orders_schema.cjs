const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

code = code.replace(
  /  grandTotalCents: integer\('grand_total_cents'\).notNull\(\),\n/g,
  "  grandTotalCents: integer('grand_total_cents').notNull(),\n  addressRecipient: varchar('address_recipient', { length: 100 }),\n  addressPhone: varchar('address_phone', { length: 50 }),\n  addressDetail: text('address_detail'),\n"
);

fs.writeFileSync('src/server/schema.ts', code);
