const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const uploadRoute = `app.post('/api/admin/upload', authenticateAdmin, uploadR2.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const file = req.file; 
  let url;
  if (process.env.R2_PUBLIC_URL) {
      const publicUrl = process.env.R2_PUBLIC_URL.replace(/\\/\\$/, '');
      url = \`\${publicUrl}/\${(file as any).key}\`;
  } else {
      url = \`https://\${process.env.R2_BUCKET_NAME}.\${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/\${(file as any).key}\`;
  }
  res.json({ success: true, url });
});`;

// Remove the upload route from its current position
code = code.replace(/app\.post\('\/api\/admin\/upload'[\s\S]*?res\.json\(\{ success: true, url \}\);\n\}\);/, "");

// Put it back right after the app.use(express.json()); near line 75
code = code.replace("app.use(express.json());", "app.use(express.json());\n\n" + uploadRoute);

fs.writeFileSync('server.ts', code);
