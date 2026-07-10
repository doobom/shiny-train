const fs = require('fs');
let code = fs.readFileSync('.env.example', 'utf-8');

const oldCloudinary = `# Cloud Storage (Cloudinary - Used for File Uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=`;

const newR2 = `# Cloud Storage (Cloudflare R2 - Used for File Uploads)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=`;

code = code.replace(oldCloudinary, newR2);
fs.writeFileSync('.env.example', code);
