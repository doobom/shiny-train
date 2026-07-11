const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// The problematic block at the end
const endBlock = `if (process.env.NODE_ENV !== 'production') {
  createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  }).then(vite => {
    app.use(vite.middlewares);
    // Database initialization endpoint via curl
// Example: curl -X POST http://localhost:3000/api/admin/init-db
// Cloudflare R2 Configuration
const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ACCOUNT_ID ? \`https://\${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com\` : '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.R2_BUCKET_NAME || 'my-bucket',
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'assets/' + uniqueSuffix + extension);
  }
});

const upload = multer({ storage: process.env.R2_ACCESS_KEY_ID ? storage : multer.memoryStorage() });

app.post('/api/admin/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (process.env.R2_ACCESS_KEY_ID && req.file) {
     // The multer-s3 location might be a direct R2 URL, or we construct a public one
     // R2 public bucket URL needs to be configured in Cloudflare Dashboard
     const fileKey = (req.file as any).key;
     const publicUrl = process.env.R2_PUBLIC_URL 
       ? \`\${process.env.R2_PUBLIC_URL}/\${fileKey}\`
       : (req.file as any).location; // Fallback to S3 URL
       
     res.json({ url: publicUrl });
  } else {
     // Mock for dev mode
     res.json({ url: 'https://placehold.co/600x400?text=Mock+Upload' });
  }
});

app.post('/api/admin/init-db', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database initialized successfully via API.' });
  } catch (error: any) {
    console.error('Initialization error:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize database', error: error.message });
  }
});app.listen(PORT, '0.0.0.0', () => {
      console.log(\`[Dev] Server running on http://localhost:\${PORT}\`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist/client');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`[Prod] Server running on port \${PORT}\`);
  });
}`;

const correctEndBlock = `if (process.env.NODE_ENV !== 'production') {
  createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  }).then(vite => {
    app.use(vite.middlewares);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(\`[Dev] Server running on http://localhost:\${PORT}\`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`[Prod] Server running on port \${PORT}\`);
  });
}`;

code = code.replace(endBlock, correctEndBlock);

fs.writeFileSync('server.ts', code);
