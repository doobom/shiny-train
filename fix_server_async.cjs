const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace("import express from 'express';", "import express from 'express';\nimport 'express-async-errors';");

// Add global error handler before the app.listen / Vite middleware section
const globalHandler = `
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

if (process.env.NODE_ENV !== 'production') {
`;

code = code.replace("if (process.env.NODE_ENV !== 'production') {", globalHandler);

fs.writeFileSync('server.ts', code);
