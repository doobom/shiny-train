const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const profileEmailEndpoint = `
app.put('/api/auth/profile/email', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { newEmail } = req.body;
    
    if (!newEmail || !newEmail.includes('@')) {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid email address.' });
    }
    
    // Check if new email is taken
    const existing = await db.query.users.findFirst({ where: eq(schema.users.email, newEmail) });
    if (existing) {
      return res.status(400).json({ code: 'EMAIL_EXISTS', message: 'Email is already in use.' });
    }
    
    await db.update(schema.users)
      .set({ email: newEmail, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
      
    res.json({ success: true, email: newEmail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Internal server error.' });
  }
});
`;

if (!code.includes('/api/auth/profile/email')) {
  code = code.replace(
    /app\.post\('\/api\/auth\/password\/reset',/,
    profileEmailEndpoint + "\napp.post('/api/auth/password/reset',"
  );
  fs.writeFileSync('server.ts', code);
}
