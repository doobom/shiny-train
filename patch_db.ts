import pool from './src/server/postgres_pool.js';

async function patch() {
  const client = await pool.connect();
  try {
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer'");
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB");
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'standard'");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_reset_tokens (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id),
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id),
        product_id VARCHAR(50) REFERENCES products(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id),
        recipient VARCHAR(100),
        phone VARCHAR(50),
        detail TEXT,
        is_default BOOLEAN DEFAULT FALSE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id),
        provider VARCHAR(50),
        provider_id VARCHAR(255),
        details JSONB
      );
    `);
    console.log("Database patched successfully");
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}
patch();
