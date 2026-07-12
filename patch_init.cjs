const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.post('/api/admin/init-db', async (req, res) => {
  try {
    console.log("Forcing migration before seeding...");
    await migrate();
    await seedDatabase();`;

const replace = `app.post('/api/admin/init-db', async (req, res) => {
  try {
    console.log("Forcing migration before seeding...");
    
    // Auto-patch missing columns for existing databases before migrate/seed
    try {
      await db.execute(sql\`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'customer'\`);
      await db.execute(sql\`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB\`);
      await db.execute(sql\`ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'standard'\`);
      await db.execute(sql\`ALTER TABLE users ADD COLUMN IF NOT EXISTS locale VARCHAR(20) DEFAULT 'zh-HK'\`);
      await db.execute(sql\`ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'\`);
      await db.execute(sql\`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_encrypted VARCHAR(255)\`);
      
      await db.execute(sql\`CREATE TABLE IF NOT EXISTS email_reset_tokens (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) REFERENCES users(id), token VARCHAR(255) NOT NULL, expires_at TIMESTAMP NOT NULL, used BOOLEAN DEFAULT FALSE)\`);
      await db.execute(sql\`CREATE TABLE IF NOT EXISTS favorites (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) REFERENCES users(id), product_id VARCHAR(50) REFERENCES products(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)\`);
      await db.execute(sql\`CREATE TABLE IF NOT EXISTS addresses (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) REFERENCES users(id), recipient VARCHAR(100), phone VARCHAR(50), detail TEXT, is_default BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)\`);
      await db.execute(sql\`CREATE TABLE IF NOT EXISTS payment_methods (id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(50) REFERENCES users(id), provider VARCHAR(50), provider_id VARCHAR(255), details JSONB)\`);
    } catch(e) {
      console.log('Patching DB failed, might be PGLite or already patched:', e.message);
    }

    await migrate();
    await seedDatabase();`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
