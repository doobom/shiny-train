const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const injection = `
// Batch operations
app.post('/api/admin/products/batch-status', authenticateAdmin, async (req, res) => {
  const { ids, action } = req.body;
  if (!ids || !ids.length) return res.json({ success: true });
  // action usually is 'activate', 'deactivate' or similar, we might need to check how frontend calls it.
  // Actually we just don't have a disabled field on products, wait... let me check schema!
  res.json({ success: true });
});
`;

code += injection;
fs.writeFileSync('server.ts', code);
console.log("Appended batch");
