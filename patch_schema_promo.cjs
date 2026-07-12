const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

const insertPromoSchema = `export const promoCodes = pgTable('promo_codes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // 'fixed' or 'percent'
  value: integer('value').notNull(), // cents if fixed, percentage (e.g., 10 for 10%) if percent
  maxUsage: integer('max_usage'),
  currentUsage: integer('current_usage').default(0),
  expiresAt: timestamp('expires_at'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const `;

code = code.replace(`export const `, insertPromoSchema);
fs.writeFileSync('src/server/schema.ts', code);
