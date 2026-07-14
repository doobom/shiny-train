CREATE TABLE IF NOT EXISTS "promo_codes" (
  "id" text PRIMARY KEY,
  "code" text,
  "type" text,
  "value" integer,
  "max_usage" integer,
  "current_usage" integer,
  "expires_at" timestamp,
  "active" boolean,
  "created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "users" (
  "id" text PRIMARY KEY,
  "email" text,
  "password_hash" text,
  "phone_encrypted" text,
  "avatar_url" text,
  "locale" text,
  "status" text,
  "role" text,
  "permissions" jsonb,
  "tier" text,
  "created_at" timestamp,
  "updated_at" timestamp
);
CREATE TABLE IF NOT EXISTS "categories" (
  "id" text PRIMARY KEY,
  "name_zh" text,
  "name_en" text,
  "sort" integer,
  "disabled" boolean
);
CREATE TABLE IF NOT EXISTS "products" (
  "id" text PRIMARY KEY,
  "name_zh" text,
  "name_en" text,
  "description_zh" text,
  "description_en" text,
  "price_original_cents" integer,
  "price_after_cents" integer,
  "category_id" text,
  "status" text,
  "images" jsonb,
  "created_at" timestamp,
  "updated_at" timestamp
);
CREATE TABLE IF NOT EXISTS "product_specs" (
  "id" text PRIMARY KEY,
  "product_id" text,
  "spec_name_zh" text,
  "spec_name_en" text,
  "price_original_cents" integer,
  "price_after_cents" integer
);
CREATE TABLE IF NOT EXISTS "inventory" (
  "id" text PRIMARY KEY,
  "sku_id" text,
  "stock" integer,
  "locked_stock" integer,
  "warn_threshold" integer
);
CREATE TABLE IF NOT EXISTS "carts" (
  "id" text PRIMARY KEY,
  "user_id" text,
  "updated_at" timestamp
);
CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" text PRIMARY KEY,
  "cart_id" text,
  "sku_id" text,
  "qty" integer,
  "checked" boolean,
  "created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "orders" (
  "id" text PRIMARY KEY,
  "user_id" text,
  "status" text,
  "total_cents" integer,
  "shipping_fee_cents" integer,
  "discount_cents" integer,
  "grand_total_cents" integer,
  "address_recipient" text,
  "address_phone" text,
  "address_detail" text,
  "payment_method" text,
  "remark" text,
  "created_at" timestamp,
  "updated_at" timestamp
);
CREATE TABLE IF NOT EXISTS "order_items" (
  "id" text PRIMARY KEY,
  "order_id" text,
  "sku_id" text,
  "qty" integer,
  "price_cents" integer
);
CREATE TABLE IF NOT EXISTS "feedbacks" (
  "id" text PRIMARY KEY,
  "user_id" text,
  "order_id" text,
  "type" text,
  "contact" text,
  "content" text,
  "status" text,
  "admin_reply" text,
  "created_at" timestamp,
  "updated_at" timestamp
);
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" text PRIMARY KEY,
  "admin_id" text,
  "action" text,
  "resource" text,
  "created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "banners" (
  "id" text PRIMARY KEY,
  "image_url" text,
  "link_url" text,
  "sort" integer,
  "disabled" boolean
);
CREATE TABLE IF NOT EXISTS "announcements" (
  "id" text PRIMARY KEY,
  "title_zh" text,
  "title_en" text,
  "content_zh" text,
  "content_en" text,
  "created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "faqs" (
  "id" text PRIMARY KEY,
  "question_zh" text,
  "question_en" text,
  "answer_zh" text,
  "answer_en" text,
  "sort" integer
);
CREATE TABLE IF NOT EXISTS "platform_settings" (
  "id" text PRIMARY KEY,
  "key" text,
  "value" text,
  "updated_at" timestamp
);
CREATE TABLE IF NOT EXISTS "discounts" (
  "id" text PRIMARY KEY,
  "code" text,
  "name_zh" text,
  "name_en" text,
  "type" text,
  "value" integer,
  "min_order_value_cents" integer,
  "active" boolean,
  "valid_until" timestamp
);
CREATE TABLE IF NOT EXISTS "full_reductions" (
  "id" text PRIMARY KEY,
  "threshold_cents" integer,
  "reduce_cents" integer,
  "active" boolean
);
CREATE TABLE IF NOT EXISTS "payments" (
  "id" text PRIMARY KEY,
  "order_id" text,
  "method" text,
  "amount_cents" integer,
  "status" text,
  "created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "addresses" (
  "id" text PRIMARY KEY,
  "user_id" text,
  "recipient" text,
  "phone" text,
  "detail" text,
  "is_default" boolean,
  "remark" text,
  "created_at" timestamp,
  "updated_at" timestamp
);
CREATE TABLE IF NOT EXISTS "favorites" (
  "id" text PRIMARY KEY,
  "user_id" text,
  "product_id" text,
  "created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "email_reset_tokens" (
  "id" text PRIMARY KEY,
  "user_id" text,
  "token" text,
  "used" boolean,
  "expires_at" timestamp,
  "created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "payment_methods" (
  "id" text PRIMARY KEY,
  "code" text,
  "name_zh" text,
  "name_en" text,
  "config" jsonb,
  "active" boolean,
  "sort" integer
);
CREATE TABLE IF NOT EXISTS "shipping_templates" (
  "id" text PRIMARY KEY,
  "name_zh" text,
  "name_en" text,
  "base_fee_cents" integer,
  "free_shipping_threshold_cents" integer,
  "active" boolean
);
CREATE TABLE IF NOT EXISTS "shipping_logs" (
  "id" text PRIMARY KEY,
  "order_id" text,
  "status" text,
  "details" text,
  "created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "member_levels" (
  "id" text PRIMARY KEY,
  "tier" text,
  "name_zh" text,
  "name_en" text,
  "min_spend_cents" integer,
  "discount_percent" integer
);
CREATE TABLE IF NOT EXISTS "roles" (
  "id" text PRIMARY KEY,
  "code" text,
  "name_zh" text,
  "name_en" text,
  "created_at" timestamp
);
CREATE TABLE IF NOT EXISTS "role_permissions" (
  "id" text PRIMARY KEY,
  "role_id" text,
  "module" text
);

