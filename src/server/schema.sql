-- 数据库初始化脚本 (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_encrypted VARCHAR(255),
    locale VARCHAR(20) DEFAULT 'zh-HK',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name_zh VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    sort INT DEFAULT 0,
    disabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name_zh VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_zh TEXT,
    description_en TEXT,
    price_original_cents INT NOT NULL,
    price_after_cents INT NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id),
    status VARCHAR(50) DEFAULT 'on_shelf',
    images JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_specs (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id),
    spec_name_zh VARCHAR(255) NOT NULL,
    spec_name_en VARCHAR(255) NOT NULL,
    price_original_cents INT NOT NULL,
    price_after_cents INT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
    sku_id VARCHAR(50) PRIMARY KEY REFERENCES product_specs(id),
    stock INT NOT NULL DEFAULT 0,
    locked_stock INT NOT NULL DEFAULT 0,
    warn_threshold INT NOT NULL DEFAULT 10
);

-- (后续可扩展订单、购物车等表)

CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(50) PRIMARY KEY,
    cart_id VARCHAR(50) REFERENCES carts(id),
    sku_id VARCHAR(50) REFERENCES product_specs(id),
    qty INT NOT NULL DEFAULT 1,
    checked BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending_payment',
    total_cents INT NOT NULL,
    shipping_fee_cents INT NOT NULL DEFAULT 0,
    discount_cents INT NOT NULL DEFAULT 0,
    grand_total_cents INT NOT NULL,
    address_recipient VARCHAR(100),
    address_phone VARCHAR(50),
    address_detail TEXT,
    payment_method VARCHAR(50),
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id),
    sku_id VARCHAR(50) REFERENCES product_specs(id),
    qty INT NOT NULL,
    price_cents INT NOT NULL
);

CREATE TABLE IF NOT EXISTS feedbacks (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
    type VARCHAR(50),
    contact VARCHAR(100),
    order_id VARCHAR(50),
    content TEXT NOT NULL,
    admin_reply TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    admin_id VARCHAR(50) REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
    id VARCHAR(50) PRIMARY KEY,
    image_url TEXT NOT NULL,
    link TEXT,
    sort INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
    id VARCHAR(50) PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS platform_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB
);

CREATE TABLE IF NOT EXISTS discounts (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id),
    type VARCHAR(50) NOT NULL,
    percent_value DECIMAL(3, 2),
    special_price_cents INT,
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS full_reductions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    threshold_cents INT NOT NULL,
    reduction_cents INT NOT NULL,
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    stackable BOOLEAN DEFAULT FALSE,
    scope VARCHAR(50) DEFAULT 'all',
    category_id VARCHAR(50) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id),
    method VARCHAR(50) NOT NULL,
    amount_cents INT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- AUTO-GENERATED MIGRATIONS (to patch existing DBs)
-- ==========================================
DO $$
BEGIN
    BEGIN
        ALTER TABLE users ADD COLUMN phone_encrypted VARCHAR(255);
    EXCEPTION WHEN duplicate_column THEN END;
    
    BEGIN
        ALTER TABLE carts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE cart_items ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE audit_logs ADD COLUMN resource VARCHAR(255);
    EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- For discounts, since the structure changed completely:
DROP TABLE IF EXISTS discounts CASCADE;
CREATE TABLE discounts (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    value INT NOT NULL,
    min_order_value_cents INT,
    active BOOLEAN DEFAULT TRUE,
    valid_until TIMESTAMP
);

DO $$
BEGIN
    BEGIN
        ALTER TABLE banners ADD COLUMN link_url VARCHAR(255);
    EXCEPTION WHEN duplicate_column THEN END;

    BEGIN
        ALTER TABLE banners ADD COLUMN disabled BOOLEAN DEFAULT FALSE;
    EXCEPTION WHEN duplicate_column THEN END;
END $$;
DROP TABLE IF EXISTS announcements CASCADE;
CREATE TABLE announcements (
    id VARCHAR(50) PRIMARY KEY,
    title_zh VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_zh TEXT,
    content_en TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS faqs CASCADE;
CREATE TABLE faqs (
    id VARCHAR(50) PRIMARY KEY,
    question_zh VARCHAR(255) NOT NULL,
    question_en VARCHAR(255) NOT NULL,
    answer_zh TEXT,
    answer_en TEXT,
    sort INT DEFAULT 0
);
DROP TABLE IF EXISTS full_reductions CASCADE;
CREATE TABLE full_reductions (
    id VARCHAR(50) PRIMARY KEY,
    threshold_cents INT NOT NULL,
    reduce_cents INT NOT NULL,
    active BOOLEAN DEFAULT TRUE
);
