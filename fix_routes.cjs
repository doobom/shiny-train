const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const errorBlock = `app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {`;

const uploadDbBlock = `    // Database initialization endpoint via curl
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
});`;

code = code.replace(uploadDbBlock, "");

const insertPos = code.indexOf(errorBlock);
code = code.slice(0, insertPos) + uploadDbBlock.replace(/^    /gm, "") + "\n\n" + code.slice(insertPos);

fs.writeFileSync('server.ts', code);
