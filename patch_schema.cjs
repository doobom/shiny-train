const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

const missingTables = `
export const addresses = pgTable('addresses', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  recipient: varchar('recipient', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  detail: text('detail').notNull(),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const favorites = pgTable('favorites', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  productId: varchar('product_id', { length: 50 }).references(() => products.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emailResetTokens = pgTable('email_reset_tokens', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  token: varchar('token', { length: 255 }).notNull().unique(),
  used: boolean('used').default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const paymentMethods = pgTable('payment_methods', {
  id: varchar('id', { length: 50 }).primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(), // stripe, alipay, wechat, bank
  nameZh: varchar('name_zh', { length: 100 }),
  nameEn: varchar('name_en', { length: 100 }),
  config: jsonb('config'),
  active: boolean('active').default(true),
  sort: integer('sort').default(0),
});

export const shippingTemplates = pgTable('shipping_templates', {
  id: varchar('id', { length: 50 }).primaryKey(),
  nameZh: varchar('name_zh', { length: 100 }),
  nameEn: varchar('name_en', { length: 100 }),
  baseFeeCents: integer('base_fee_cents').notNull().default(3000),
  freeShippingThresholdCents: integer('free_shipping_threshold_cents').default(30000),
  active: boolean('active').default(true),
});

export const shippingLogs = pgTable('shipping_logs', {
  id: varchar('id', { length: 50 }).primaryKey(),
  orderId: varchar('order_id', { length: 50 }).references(() => orders.id),
  status: varchar('status', { length: 50 }).notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const memberLevels = pgTable('member_levels', {
  id: varchar('id', { length: 50 }).primaryKey(),
  tier: varchar('tier', { length: 50 }).unique().notNull(),
  nameZh: varchar('name_zh', { length: 100 }),
  nameEn: varchar('name_en', { length: 100 }),
  minSpendCents: integer('min_spend_cents').default(0),
  discountPercent: integer('discount_percent').default(0),
});

export const roles = pgTable('roles', {
  id: varchar('id', { length: 50 }).primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  nameZh: varchar('name_zh', { length: 100 }),
  nameEn: varchar('name_en', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: varchar('id', { length: 50 }).primaryKey(),
  roleId: varchar('role_id', { length: 50 }).references(() => roles.id),
  module: varchar('module', { length: 100 }).notNull(),
});
`;

if (!code.includes('export const addresses = pgTable')) {
  fs.writeFileSync('src/server/schema.ts', code + '\n' + missingTables);
}
