CREATE TABLE IF NOT EXISTS "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"recipient" text NOT NULL,
	"phone" text NOT NULL,
	"detail" text NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"title_zh" text NOT NULL,
	"title_en" text NOT NULL,
	"content_zh" text,
	"content_en" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" text,
	"action" text NOT NULL,
	"resource" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "banners" (
	"id" text PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"link_url" text,
	"sort" integer DEFAULT 0,
	"disabled" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart_items" (
	"id" text PRIMARY KEY NOT NULL,
	"cart_id" text,
	"sku_id" text,
	"qty" integer NOT NULL,
	"checked" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name_zh" text NOT NULL,
	"name_en" text NOT NULL,
	"sort" integer DEFAULT 0,
	"disabled" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discounts" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"value" integer NOT NULL,
	"min_order_value_cents" integer,
	"active" boolean DEFAULT true,
	"valid_until" timestamp,
	CONSTRAINT "discounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"token" text NOT NULL,
	"used" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "email_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "faqs" (
	"id" text PRIMARY KEY NOT NULL,
	"question_zh" text NOT NULL,
	"question_en" text NOT NULL,
	"answer_zh" text,
	"answer_en" text,
	"sort" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"product_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedbacks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"order_id" text,
	"type" text,
	"contact" text,
	"content" text NOT NULL,
	"status" text DEFAULT 'pending',
	"admin_reply" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "full_reductions" (
	"id" text PRIMARY KEY NOT NULL,
	"threshold_cents" integer NOT NULL,
	"reduce_cents" integer NOT NULL,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory" (
	"sku_id" text PRIMARY KEY NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"locked_stock" integer DEFAULT 0 NOT NULL,
	"warn_threshold" integer DEFAULT 10 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "member_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"tier" text NOT NULL,
	"name_zh" text,
	"name_en" text,
	"min_spend_cents" integer DEFAULT 0,
	"discount_percent" integer DEFAULT 0,
	CONSTRAINT "member_levels_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text,
	"sku_id" text,
	"qty" integer NOT NULL,
	"price_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"status" text NOT NULL,
	"total_cents" integer NOT NULL,
	"shipping_fee_cents" integer NOT NULL,
	"discount_cents" integer NOT NULL,
	"grand_total_cents" integer NOT NULL,
	"address_recipient" text,
	"address_phone" text,
	"address_detail" text,
	"payment_method" text,
	"remark" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name_zh" text,
	"name_en" text,
	"config" jsonb,
	"active" boolean DEFAULT true,
	"sort" integer DEFAULT 0,
	CONSTRAINT "payment_methods_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text,
	"method" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_specs" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text,
	"spec_name_zh" text NOT NULL,
	"spec_name_en" text NOT NULL,
	"price_original_cents" integer NOT NULL,
	"price_after_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" text PRIMARY KEY NOT NULL,
	"name_zh" text NOT NULL,
	"name_en" text NOT NULL,
	"description_zh" text,
	"description_en" text,
	"price_original_cents" integer NOT NULL,
	"price_after_cents" integer NOT NULL,
	"category_id" text,
	"status" text DEFAULT 'on_shelf',
	"images" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text,
	"module" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name_zh" text,
	"name_en" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipping_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text,
	"status" text NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipping_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name_zh" text,
	"name_en" text,
	"base_fee_cents" integer DEFAULT 3000 NOT NULL,
	"free_shipping_threshold_cents" integer DEFAULT 30000,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"phone_encrypted" text,
	"locale" text DEFAULT 'zh-HK',
	"status" text DEFAULT 'active',
	"role" text DEFAULT 'customer',
	"permissions" jsonb,
	"tier" text DEFAULT 'standard',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_sku_id_product_specs_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_reset_tokens" ADD CONSTRAINT "email_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_sku_id_product_specs_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_sku_id_product_specs_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_logs" ADD CONSTRAINT "shipping_logs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;