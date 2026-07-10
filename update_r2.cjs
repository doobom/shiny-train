const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace imports
code = code.replace(
  "import { v2 as cloudinary } from 'cloudinary';",
  "import { S3Client } from '@aws-sdk/client-s3';"
);
code = code.replace(
  "import { CloudinaryStorage } from 'multer-storage-cloudinary';",
  "import multerS3 from 'multer-s3';"
);

// Replace cloudinary configuration and multer setup
const oldUploadSetup = `cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hk_mall_assets',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  } as any,
});

const upload = multer({ storage: process.env.CLOUDINARY_API_KEY ? storage : multer.memoryStorage() });

app.post('/api/admin/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (process.env.CLOUDINARY_API_KEY && req.file) {
     res.json({ url: req.file.path });
  } else {
     // Mock for dev mode
     res.json({ url: 'https://placehold.co/600x400?text=Mock+Upload' });
  }
});`;

const newUploadSetup = `// Cloudflare R2 Configuration
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
});`;

code = code.replace(oldUploadSetup, newUploadSetup);

fs.writeFileSync('server.ts', code);
