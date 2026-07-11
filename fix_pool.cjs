const fs = require('fs');
let content = fs.readFileSync('src/server/postgres_pool.ts', 'utf8');

const replacement = `import 'dotenv/config';
import { Pool } from 'pg';

function getValidConnectionString() {
  const url = process.env.DATABASE_URL || 'postgresql://shop_user:your_secure_password@localhost:5432/shop_db';
  const match = url.match(/^(postgres(?:ql)?:\\/\\/[^:]+:)(.*)(@[^@]+)$/);
  if (match) {
    const prefix = match[1];
    let password = match[2];
    const suffix = match[3];
    if (password.includes('/') || password.includes('+') || password.includes('#') || password.includes(' ')) {
      try { password = decodeURIComponent(password); } catch (e) {}
      password = encodeURIComponent(password);
      return prefix + password + suffix;
    }
  }
  return url;
}

const pool = new Pool({
  connectionString: getValidConnectionString(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});`;

content = content.replace(/import 'dotenv\/config';[\s\S]*?connectionTimeoutMillis: 2000,\n\}\);/, replacement);

fs.writeFileSync('src/server/postgres_pool.ts', content);
console.log("Done.");
