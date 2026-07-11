const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `if (process.env.NODE_ENV !== 'production') {`;
const idx = code.indexOf(target);
if (idx > -1) {
  code = code.substring(0, idx);
}

const endBlock = `
if (process.env.NODE_ENV !== 'production') {
  import('vite').then(async ({ createServer }) => {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    migrate().then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(\`[Dev] Server running on http://localhost:\${PORT}\`);
      });
    }).catch(console.error);
  });
} else {
  const distPath = require('path').join(process.cwd(), 'dist/client');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(require('path').join(distPath, 'index.html'));
  });
  migrate().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(\`[Prod] Server running on port \${PORT}\`);
    });
  }).catch(console.error);
}

// Batch operations
app.post('/api/admin/products/batch-status', authenticateAdmin, async (req, res) => {
  const { productIds, status } = req.body;
  if (!productIds || !productIds.length) return res.json({ success: true });
  await db.update(schema.products).set({ status }).where(inArray(schema.products.id, productIds));
  res.json({ success: true });
});
`;

fs.writeFileSync('server.ts', code + endBlock);
