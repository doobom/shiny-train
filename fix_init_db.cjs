const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `app.post('/api/admin/init-db', async (req, res) => {
  try {
    await seedDatabase();`,
  `app.post('/api/admin/init-db', async (req, res) => {
  try {
    console.log("Forcing migration before seeding...");
    await migrate();
    await seedDatabase();`
);

fs.writeFileSync('server.ts', code);
