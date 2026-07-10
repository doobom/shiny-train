const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Remove imports from where they were placed
code = code.replace("import multer from 'multer';", "");
code = code.replace("import { v2 as cloudinary } from 'cloudinary';", "");
code = code.replace("import { CloudinaryStorage } from 'multer-storage-cloudinary';", "");
code = code.replace("import { Resend } from 'resend';", "");

// Place them at the top
const importsToAdd = `
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Resend } from 'resend';
`;

code = code.replace("import rateLimit from 'express-rate-limit';", importsToAdd + "\nimport rateLimit from 'express-rate-limit';");

fs.writeFileSync('server.ts', code);
