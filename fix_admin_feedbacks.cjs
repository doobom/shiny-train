const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetGet = `app.get('/api/admin/feedbacks', authenticateToken, async (req, res) => {
  const list = await db.query.feedbacks.findMany({ orderBy: [desc(schema.feedbacks.createdAt)] });
  res.json(list);
});`;

const replacementGet = `app.get('/api/admin/feedbacks', authenticateToken, async (req, res) => {
  const list = await db.query.feedbacks.findMany({ orderBy: [desc(schema.feedbacks.createdAt)] });
  const formatted = [];
  for (const fb of list) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, fb.userId) });
    formatted.push({
      id: fb.id,
      type: 'general',
      contact: user?.email || 'Anonymous',
      content: fb.content,
      reply: fb.adminReply,
      status: fb.status
    });
  }
  res.json(formatted);
});`;

code = code.replace(targetGet, replacementGet);
fs.writeFileSync('server.ts', code);
