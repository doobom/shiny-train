CREATE TABLE "announcements" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"title_zh" varchar(255) NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"content_zh" text,
	"content_en" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"admin_id" varchar(50),
	"action" varchar(255) NOT NULL,
	"resource" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"link_url" varchar(255),
	"sort" integer DEFAULT 0,
	"disabled" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"cart_id" varchar(50),
	"sku_id" varchar(50),
	"qty" integer NOT NULL,
	"checked" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name_zh" varchar(100) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"sort" integer DEFAULT 0,
	"disabled" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" varchar(50) NOT NULL,
	"value" integer NOT NULL,
	"min_order_value_cents" integer,
	"active" boolean DEFAULT true,
	"valid_until" timestamp,
	CONSTRAINT "discounts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"question_zh" varchar(255) NOT NULL,
	"question_en" varchar(255) NOT NULL,
	"answer_zh" text,
	"answer_en" text,
	"sort" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50),
	"order_id" varchar(50),
	"type" varchar(50),
	"contact" varchar(255),
	"content" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"admin_reply" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "full_reductions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"threshold_cents" integer NOT NULL,
	"reduce_cents" integer NOT NULL,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"sku_id" varchar(50) PRIMARY KEY NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"locked_stock" integer DEFAULT 0 NOT NULL,
	"warn_threshold" integer DEFAULT 10 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"order_id" varchar(50),
	"sku_id" varchar(50),
	"qty" integer NOT NULL,
	"price_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50),
	"status" varchar(50) NOT NULL,
	"total_cents" integer NOT NULL,
	"shipping_fee_cents" integer NOT NULL,
	"discount_cents" integer NOT NULL,
	"grand_total_cents" integer NOT NULL,
	"address_recipient" varchar(100),
	"address_phone" varchar(50),
	"address_detail" text,
	"payment_method" varchar(50),
	"remark" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"order_id" varchar(50),
	"method" varchar(50) NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"key" varchar(50) PRIMARY KEY NOT NULL,
	"value" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_specs" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"product_id" varchar(50),
	"spec_name_zh" varchar(255) NOT NULL,
	"spec_name_en" varchar(255) NOT NULL,
	"price_original_cents" integer NOT NULL,
	"price_after_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name_zh" varchar(255) NOT NULL,
	"name_en" varchar(255) NOT NULL,
	"description_zh" text,
	"description_en" text,
	"price_original_cents" integer NOT NULL,
	"price_after_cents" integer NOT NULL,
	"category_id" varchar(50),
	"status" varchar(50) DEFAULT 'on_shelf',
	"images" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"phone_encrypted" varchar(255),
	"locale" varchar(20) DEFAULT 'zh-HK',
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_sku_id_product_specs_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_sku_id_product_specs_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_sku_id_product_specs_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_specs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_specs" ADD CONSTRAINT "product_specs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;