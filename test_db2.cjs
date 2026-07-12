const { Pool } = require('pg');
const url = process.env.DATABASE_URL;
const regex = /^postgresql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)$/;
const match = url.match(regex);
let poolConfig = { connectionString: url };
if (match) {
  const [_, user, password, host, portStr, database] = match;
  poolConfig = { user, password, host, port: parseInt(portStr), database };
}
const pool = new Pool(poolConfig);
pool.query('SELECT * FROM __drizzle_migrations').then(res => {
  console.log("Migrations:", res.rows);
  pool.end();
}).catch(err => {
  console.error("Error:", err.message);
  pool.end();
});
