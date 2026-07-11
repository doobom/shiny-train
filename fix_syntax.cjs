const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const updated = `
if (process.env.NODE_ENV !== 'production') {
  import('vite').then(async ({ createServer }) => {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(\`[Dev] Server running on http://localhost:\${PORT}\`);
    });
  });
} else {
`;

code = code.replace(
  /  app\.listen\(PORT, '0\.0\.0\.0', \(\) => \{\n      console\.log\(`\[Dev\] Server running on http:\/\/localhost:\$\{PORT\}`\);\n    \}\);\n  \}\);\n\} else \{/m,
  updated.trim() + ' {'
);

fs.writeFileSync('server.ts', code);
