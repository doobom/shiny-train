const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const globalHandler = `
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err.message);
  // Send empty array fallback for list queries to prevent UI crashes
  if (req.method === 'GET') {
    return res.json([]);
  }
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});
`;

code = code.replace(/app\.use\(\(err: any, req: express\.Request, res: express\.Response, next: express\.NextFunction\) => \{[\s\S]*?\}\);\n/, globalHandler + '\n');

fs.writeFileSync('server.ts', code);
