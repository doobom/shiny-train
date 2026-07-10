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
