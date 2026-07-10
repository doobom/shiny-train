import { pgTable, varchar, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 50 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  phoneEncrypted: varchar('phone_encrypted', { length: 255 }),
  locale: varchar('locale', { length: 20 }).default('zh-HK'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: varchar('id', { length: 50 }).primaryKey(),
  nameZh: varchar('name_zh', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  sort: integer('sort').default(0),
  disabled: boolean('disabled').default(false),
});

export const products = pgTable('products', {
  id: varchar('id', { length: 50 }).primaryKey(),
  nameZh: varchar('name_zh', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  descriptionZh: text('description_zh'),
  descriptionEn: text('description_en'),
  priceOriginalCents: integer('price_original_cents').notNull(),
  priceAfterCents: integer('price_after_cents').notNull(),
  categoryId: varchar('category_id', { length: 50 }).references(() => categories.id),
  status: varchar('status', { length: 50 }).default('on_shelf'),
  images: jsonb('images').default('[]'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productSpecs = pgTable('product_specs', {
  id: varchar('id', { length: 50 }).primaryKey(),
  productId: varchar('product_id', { length: 50 }).references(() => products.id),
  specNameZh: varchar('spec_name_zh', { length: 255 }).notNull(),
  specNameEn: varchar('spec_name_en', { length: 255 }).notNull(),
  priceOriginalCents: integer('price_original_cents').notNull(),
  priceAfterCents: integer('price_after_cents').notNull(),
});

export const inventory = pgTable('inventory', {
  skuId: varchar('sku_id', { length: 50 }).primaryKey().references(() => productSpecs.id),
  stock: integer('stock').notNull().default(0),
  lockedStock: integer('locked_stock').notNull().default(0),
  warnThreshold: integer('warn_threshold').notNull().default(10),
});

export const carts = pgTable('carts', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: varchar('id', { length: 50 }).primaryKey(),
  cartId: varchar('cart_id', { length: 50 }).references(() => carts.id),
  skuId: varchar('sku_id', { length: 50 }).references(() => productSpecs.id),
  qty: integer('qty').notNull(),
  checked: boolean('checked').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  status: varchar('status', { length: 50 }).notNull(),
  totalCents: integer('total_cents').notNull(),
  shippingFeeCents: integer('shipping_fee_cents').notNull(),
  discountCents: integer('discount_cents').notNull(),
  grandTotalCents: integer('grand_total_cents').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: varchar('id', { length: 50 }).primaryKey(),
  orderId: varchar('order_id', { length: 50 }).references(() => orders.id),
  skuId: varchar('sku_id', { length: 50 }).references(() => productSpecs.id),
  qty: integer('qty').notNull(),
  priceCents: integer('price_cents').notNull(),
});

export const feedbacks = pgTable('feedbacks', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  orderId: varchar('order_id', { length: 50 }),
  type: varchar('type', { length: 50 }),
  contact: varchar('contact', { length: 255 }),
  content: text('content').notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  adminReply: text('admin_reply'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 50 }).primaryKey(),
  adminId: varchar('admin_id', { length: 50 }),
  action: varchar('action', { length: 255 }).notNull(),
  resource: varchar('resource', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const banners = pgTable('banners', {
  id: varchar('id', { length: 50 }).primaryKey(),
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
  linkUrl: varchar('link_url', { length: 255 }),
  sort: integer('sort').default(0),
  disabled: boolean('disabled').default(false),
});

export const announcements = pgTable('announcements', {
  id: varchar('id', { length: 50 }).primaryKey(),
  titleZh: varchar('title_zh', { length: 255 }).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  contentZh: text('content_zh'),
  contentEn: text('content_en'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const faqs = pgTable('faqs', {
  id: varchar('id', { length: 50 }).primaryKey(),
  questionZh: varchar('question_zh', { length: 255 }).notNull(),
  questionEn: varchar('question_en', { length: 255 }).notNull(),
  answerZh: text('answer_zh'),
  answerEn: text('answer_en'),
  sort: integer('sort').default(0),
});

export const platformSettings = pgTable('platform_settings', {
  key: varchar('key', { length: 50 }).primaryKey(),
  value: varchar('value', { length: 255 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const discounts = pgTable('discounts', {
  id: varchar('id', { length: 50 }).primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  value: integer('value').notNull(),
  minOrderValueCents: integer('min_order_value_cents'),
  active: boolean('active').default(true),
  validUntil: timestamp('valid_until'),
});

export const fullReductions = pgTable('full_reductions', {
  id: varchar('id', { length: 50 }).primaryKey(),
  thresholdCents: integer('threshold_cents').notNull(),
  reduceCents: integer('reduce_cents').notNull(),
  active: boolean('active').default(true),
});

export const payments = pgTable('payments', {
  id: varchar('id', { length: 50 }).primaryKey(),
  orderId: varchar('order_id', { length: 50 }).references(() => orders.id),
  method: varchar('method', { length: 50 }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
