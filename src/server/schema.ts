import { pgTable, serial, varchar, text, integer, boolean, timestamp, jsonb, doublePrecision } from 'drizzle-orm/pg-core';


export const promoCodes = pgTable('promo_codes', {
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

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phoneEncrypted: text('phone_encrypted'),
  avatarUrl: text('avatar_url'),
  locale: text('locale').default('zh-HK'),
  status: text('status').default('active'),
  role: text('role').default('customer'),
  permissions: jsonb('permissions'),
  tier: text('tier').default('standard'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  nameZh: text('name_zh').notNull(),
  nameEn: text('name_en').notNull(),
  sort: integer('sort').default(0),
  disabled: boolean('disabled').default(false),
});

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  nameZh: text('name_zh').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionZh: text('description_zh'),
  descriptionEn: text('description_en'),
  priceOriginalCents: integer('price_original_cents').notNull(),
  priceAfterCents: integer('price_after_cents').notNull(),
  categoryId: text('category_id').references(() => categories.id),
  status: text('status').default('on_shelf'),
  images: jsonb('images').default('[]'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productSpecs = pgTable('product_specs', {
  id: text('id').primaryKey(),
  productId: text('product_id').references(() => products.id),
  specNameZh: text('spec_name_zh').notNull(),
  specNameEn: text('spec_name_en').notNull(),
  priceOriginalCents: integer('price_original_cents').notNull(),
  priceAfterCents: integer('price_after_cents').notNull(),
});

export const inventory = pgTable('inventory', {
  skuId: text('sku_id').primaryKey().references(() => productSpecs.id),
  stock: integer('stock').notNull().default(0),
  lockedStock: integer('locked_stock').notNull().default(0),
  warnThreshold: integer('warn_threshold').notNull().default(10),
});

export const carts = pgTable('carts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: text('id').primaryKey(),
  cartId: text('cart_id').references(() => carts.id),
  skuId: text('sku_id').references(() => productSpecs.id),
  qty: integer('qty').notNull(),
  checked: boolean('checked').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  status: text('status').notNull(),
  totalCents: integer('total_cents').notNull(),
  shippingFeeCents: integer('shipping_fee_cents').notNull(),
  discountCents: integer('discount_cents').notNull(),
  grandTotalCents: integer('grand_total_cents').notNull(),
  addressRecipient: text('address_recipient'),
  addressPhone: text('address_phone'),
  addressDetail: text('address_detail'),
  paymentMethod: text('payment_method'),
  remark: text('remark'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').references(() => orders.id),
  skuId: text('sku_id').references(() => productSpecs.id),
  qty: integer('qty').notNull(),
  priceCents: integer('price_cents').notNull(),
});

export const feedbacks = pgTable('feedbacks', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  orderId: text('order_id'),
  type: text('type'),
  contact: text('contact'),
  content: text('content').notNull(),
  status: text('status').default('pending'),
  adminReply: text('admin_reply'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  adminId: text('admin_id'),
  action: text('action').notNull(),
  resource: text('resource'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const banners = pgTable('banners', {
  id: text('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  linkUrl: text('link_url'),
  sort: integer('sort').default(0),
  disabled: boolean('disabled').default(false),
});

export const announcements = pgTable('announcements', {
  id: text('id').primaryKey(),
  titleZh: text('title_zh').notNull(),
  titleEn: text('title_en').notNull(),
  contentZh: text('content_zh'),
  contentEn: text('content_en'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const faqs = pgTable('faqs', {
  id: text('id').primaryKey(),
  questionZh: text('question_zh').notNull(),
  questionEn: text('question_en').notNull(),
  answerZh: text('answer_zh'),
  answerEn: text('answer_en'),
  sort: integer('sort').default(0),
});

export const platformSettings = pgTable('platform_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const discounts = pgTable('discounts', {
  id: text('id').primaryKey(),
  code: text('code').unique().notNull(),
  nameZh: text('name_zh'),
  nameEn: text('name_en'),
  type: text('type').notNull(),
  value: integer('value').notNull(),
  minOrderValueCents: integer('min_order_value_cents'),
  active: boolean('active').default(true),
  validUntil: timestamp('valid_until'),
});

export const fullReductions = pgTable('full_reductions', {
  id: text('id').primaryKey(),
  thresholdCents: integer('threshold_cents').notNull(),
  reduceCents: integer('reduce_cents').notNull(),
  active: boolean('active').default(true),
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').references(() => orders.id),
  method: text('method').notNull(),
  amountCents: integer('amount_cents').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});


export const addresses = pgTable('addresses', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  recipient: text('recipient').notNull(),
  phone: text('phone').notNull(),
  detail: text('detail').notNull(),
  isDefault: boolean('is_default').default(false),
  remark: text('remark'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const favorites = pgTable('favorites', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  productId: text('product_id').references(() => products.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emailResetTokens = pgTable('email_reset_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  token: text('token').notNull().unique(),
  used: boolean('used').default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const paymentMethods = pgTable('payment_methods', {
  id: text('id').primaryKey(),
  code: text('code').unique().notNull(), // stripe, alipay, wechat, bank
  nameZh: text('name_zh'),
  nameEn: text('name_en'),
  config: jsonb('config'),
  active: boolean('active').default(true),
  sort: integer('sort').default(0),
});

export const shippingTemplates = pgTable('shipping_templates', {
  id: text('id').primaryKey(),
  nameZh: text('name_zh'),
  nameEn: text('name_en'),
  baseFeeCents: integer('base_fee_cents').notNull().default(3000),
  freeShippingThresholdCents: integer('free_shipping_threshold_cents').default(30000),
  active: boolean('active').default(true),
});

export const shippingLogs = pgTable('shipping_logs', {
  id: text('id').primaryKey(),
  orderId: text('order_id').references(() => orders.id),
  status: text('status').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const memberLevels = pgTable('member_levels', {
  id: text('id').primaryKey(),
  tier: text('tier').unique().notNull(),
  nameZh: text('name_zh'),
  nameEn: text('name_en'),
  minSpendCents: integer('min_spend_cents').default(0),
  discountPercent: integer('discount_percent').default(0),
});

export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  code: text('code').unique().notNull(),
  nameZh: text('name_zh'),
  nameEn: text('name_en'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  roleId: text('role_id').references(() => roles.id),
  module: text('module').notNull(),
});
