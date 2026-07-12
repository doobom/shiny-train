const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetRegex = /app\.post\('\/api\/admin\/init-db', async \(req, res\) => \{[\s\S]*?await seedDatabase\(\);/;

const replace = `app.post('/api/admin/init-db', async (req, res) => {
  try {
    console.log("Forcing migration before seeding...");
    
    // Explicitly create tables if they do not exist
    const ddl = \`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL UNIQUE,
        "password_hash" text NOT NULL,
        "phone_encrypted" text,
        "locale" text DEFAULT 'zh-HK',
        "status" text DEFAULT 'active',
        "role" text DEFAULT 'customer',
        "permissions" jsonb,
        "tier" text DEFAULT 'standard',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "categories" (
        "id" text PRIMARY KEY NOT NULL,
        "name_zh" text NOT NULL,
        "name_en" text NOT NULL,
        "sort" integer DEFAULT 0,
        "disabled" boolean DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS "products" (
        "id" text PRIMARY KEY NOT NULL,
        "name_zh" text NOT NULL,
        "name_en" text NOT NULL,
        "description_zh" text,
        "description_en" text,
        "price_original_cents" integer NOT NULL,
        "price_after_cents" integer NOT NULL,
        "category_id" text REFERENCES "categories"("id"),
        "status" text DEFAULT 'on_shelf',
        "image_urls" jsonb DEFAULT '[]',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "product_specs" (
        "id" text PRIMARY KEY NOT NULL,
        "product_id" text REFERENCES "products"("id"),
        "spec_name_zh" text NOT NULL,
        "spec_name_en" text NOT NULL,
        "price_original_cents" integer NOT NULL,
        "price_after_cents" integer NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "inventory" (
        "sku_id" text PRIMARY KEY REFERENCES "product_specs"("id"),
        "stock" integer DEFAULT 0 NOT NULL,
        "locked_stock" integer DEFAULT 0 NOT NULL,
        "warn_threshold" integer DEFAULT 10 NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "carts" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "cart_items" (
        "id" text PRIMARY KEY NOT NULL,
        "cart_id" text REFERENCES "carts"("id"),
        "sku_id" text REFERENCES "product_specs"("id"),
        "qty" integer NOT NULL,
        "checked" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "orders" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "status" text DEFAULT 'pending_payment',
        "total_cents" integer NOT NULL,
        "shipping_fee_cents" integer DEFAULT 0 NOT NULL,
        "discount_cents" integer DEFAULT 0 NOT NULL,
        "grand_total_cents" integer NOT NULL,
        "address_recipient" text,
        "address_phone" text,
        "address_detail" text,
        "payment_method" text,
        "remark" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" text PRIMARY KEY NOT NULL,
        "order_id" text REFERENCES "orders"("id"),
        "sku_id" text REFERENCES "product_specs"("id"),
        "qty" integer NOT NULL,
        "price_cents" integer NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "feedbacks" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "type" text,
        "contact" text,
        "order_id" text,
        "content" text NOT NULL,
        "admin_reply" text,
        "status" text DEFAULT 'pending',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" text PRIMARY KEY NOT NULL,
        "admin_id" text,
        "action" text NOT NULL,
        "resource" text,
        "details" text,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "banners" (
        "id" text PRIMARY KEY NOT NULL,
        "image_url" text NOT NULL,
        "link_url" text,
        "sort" integer DEFAULT 0,
        "status" text DEFAULT 'active',
        "disabled" boolean DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS "announcements" (
        "id" text PRIMARY KEY NOT NULL,
        "title_zh" text NOT NULL,
        "title_en" text NOT NULL,
        "content_zh" text,
        "content_en" text,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "faqs" (
        "id" text PRIMARY KEY NOT NULL,
        "question_zh" text NOT NULL,
        "question_en" text NOT NULL,
        "answer_zh" text,
        "answer_en" text,
        "sort" integer DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS "platform_settings" (
        "key" text PRIMARY KEY NOT NULL,
        "value" jsonb,
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "discounts" (
        "id" text PRIMARY KEY NOT NULL,
        "code" text NOT NULL UNIQUE,
        "type" text NOT NULL,
        "value" integer NOT NULL,
        "min_order_value_cents" integer,
        "active" boolean DEFAULT true,
        "valid_until" timestamp
      );

      CREATE TABLE IF NOT EXISTS "full_reductions" (
        "id" text PRIMARY KEY NOT NULL,
        "threshold_cents" integer NOT NULL,
        "reduce_cents" integer NOT NULL,
        "active" boolean DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS "payments" (
        "id" text PRIMARY KEY NOT NULL,
        "order_id" text REFERENCES "orders"("id"),
        "method" text NOT NULL,
        "amount_cents" integer NOT NULL,
        "status" text DEFAULT 'pending',
        "transaction_id" text,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "email_reset_tokens" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "token" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "used" boolean DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS "favorites" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "product_id" text REFERENCES "products"("id"),
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "addresses" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "recipient" text NOT NULL,
        "phone" text NOT NULL,
        "detail" text NOT NULL,
        "is_default" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "payment_methods" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "provider" text NOT NULL,
        "provider_id" text,
        "details" jsonb,
        "created_at" timestamp DEFAULT now()
      );
      
      -- Member Levels / Tiers
      CREATE TABLE IF NOT EXISTS "member_levels" (
        "id" text PRIMARY KEY NOT NULL,
        "tier" text NOT NULL,
        "name_zh" text NOT NULL,
        "name_en" text NOT NULL,
        "min_spend_cents" integer NOT NULL,
        "discount_percent" integer NOT NULL
      );
      
      -- Roles
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" text PRIMARY KEY NOT NULL,
        "code" text NOT NULL UNIQUE,
        "name_zh" text NOT NULL,
        "name_en" text NOT NULL,
        "description" text
      );

      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "id" text PRIMARY KEY NOT NULL,
        "role_code" text REFERENCES "roles"("code"),
        "permission" text NOT NULL
      );
      
      -- Shipping
      CREATE TABLE IF NOT EXISTS "shipping_templates" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "type" text NOT NULL,
        "fee_cents" integer NOT NULL,
        "free_threshold_cents" integer,
        "enabled" boolean DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS "shipping_logs" (
        "id" text PRIMARY KEY NOT NULL,
        "order_id" text REFERENCES "orders"("id"),
        "status" text NOT NULL,
        "operator" text,
        "created_at" timestamp DEFAULT now()
      );
    \`;

    try {
      await db.execute(sql.raw(ddl));
      console.log('Tables created or verified via DDL.');
    } catch(e) {
      console.log('Failed to create tables:', e.message);
    }
    
    // Auto-patch missing columns for existing databases before migrate/seed
    try {
      await db.execute(sql.raw(\`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer'\`));
      await db.execute(sql.raw(\`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB\`));
      await db.execute(sql.raw(\`ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'standard'\`));
      await db.execute(sql.raw(\`ALTER TABLE users ADD COLUMN IF NOT EXISTS locale VARCHAR(20) DEFAULT 'zh-HK'\`));
      await db.execute(sql.raw(\`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'\`));
      await db.execute(sql.raw(\`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_encrypted VARCHAR(255)\`));
      await db.execute(sql.raw(\`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'\`));
      await db.execute(sql.raw(\`ALTER TABLE banners ADD COLUMN IF NOT EXISTS link_url VARCHAR(255)\`));
      await db.execute(sql.raw(\`ALTER TABLE banners ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT FALSE\`));
    } catch(e) {
      console.log('Patching DB columns failed:', e.message);
    }

    try {
      await migrate();
    } catch (e) {
      console.log('Migrate failed, continuing anyway:', e.message);
    }
    
    await seedDatabase();`;

code = code.replace(targetRegex, replace);
fs.writeFileSync('server.ts', code);
