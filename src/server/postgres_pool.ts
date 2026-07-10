import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://shop_user:your_secure_password@localhost:5432/shop_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database.');
});
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});
export default pool;
