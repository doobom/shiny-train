const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Extract the batch route
const batchRoute = `// Batch operations
app.post('/api/admin/products/batch-status', authenticateAdmin, async (req, res) => {
  const { productIds, status } = req.body;
  if (!productIds || !productIds.length) return res.json({ success: true });
  await db.update(schema.products).set({ status }).where(inArray(schema.products.id, productIds));
  res.json({ success: true });
});`;

code = code.replace(batchRoute, '');

const target = `const isProduction = process.env.NODE_ENV === 'production' || (!process.env.NODE_ENV && !!process.env.DATABASE_URL);`;
const idx = code.indexOf(target);
if (idx > -1) {
  code = code.substring(0, idx);
}

const endBlock = batchRoute + '\n\n' + target + `

// Apply migrations
migrate().then(() => {
  console.log("Database migrated successfully.");
}).catch((err) => {
  console.error("Database migration failed:", err);
  // Do not crash the server so the user can see the API still responds (e.g. for debugging)
});

if (!isProduction) {
  import('vite').then(async ({ createServer }) => {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(\`[Dev] Server running on http://localhost:\${PORT}\`);
    });
  }).catch(console.error);
} else {
  const distPath = require('path').join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(require('path').join(distPath, 'index.html'));
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`[Prod] Server running on port \${PORT}\`);
  });
}
`;

fs.writeFileSync('server.ts', code + endBlock);
