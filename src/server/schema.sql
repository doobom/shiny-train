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

