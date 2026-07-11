const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const initDbCode = `
app.post('/api/admin/init-db', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database initialized successfully via API.' });
  } catch (error: any) {
    console.error('Initialization error:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize database', error: error.message });
  }
});
`;

if (!code.includes('/api/admin/init-db')) {
  code = code.replace(
    /app\.use\(\(err: any, req: express\.Request, res: express\.Response, next: express\.NextFunction\) => \{/,
    initDbCode + '\napp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {'
  );
  fs.writeFileSync('server.ts', code);
}
