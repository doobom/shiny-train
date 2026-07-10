const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf-8');

const target = `export const orders = pgTable('orders', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  status: varchar('status', { length: 50 }).notNull(),
  totalCents: integer('total_cents').notNull(),
  shippingFeeCents: integer('shipping_fee_cents').notNull(),
  discountCents: integer('discount_cents').notNull(),
  grandTotalCents: integer('grand_total_cents').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});`;

const replacement = `export const orders = pgTable('orders', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  status: varchar('status', { length: 50 }).notNull(),
  totalCents: integer('total_cents').notNull(),
  shippingFeeCents: integer('shipping_fee_cents').notNull(),
  discountCents: integer('discount_cents').notNull(),
  grandTotalCents: integer('grand_total_cents').notNull(),
  addressRecipient: varchar('address_recipient', { length: 100 }),
  addressPhone: varchar('address_phone', { length: 50 }),
  addressDetail: text('address_detail'),
  paymentMethod: varchar('payment_method', { length: 50 }),
  remark: text('remark'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});`;

code = code.replace(target, replacement);
fs.writeFileSync('src/server/schema.ts', code);
