const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const missingLogic = `
app.post('/api/admin/init-db', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database initialized successfully via API.' });
  } catch (error: any) {
    console.error('Initialization error:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize database', error: error.message });
  }
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled Server Error:', err.message);
  if (req.method === 'GET') {
    return res.json([]);
  }
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});

// Cron Jobs
`;

code = code.replace(
  /\/\/ Cron Jobs/,
  missingLogic.trim()
);

fs.writeFileSync('server.ts', code);
