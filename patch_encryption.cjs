const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const updatedEncryption = `
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.warn('WARNING: ENCRYPTION_KEY environment variable is missing or not 32 characters. PII encryption may fail or data may be lost across restarts. Please set ENCRYPTION_KEY in your environment.');
}
const ACTIVE_ENCRYPTION_KEY = ENCRYPTION_KEY || 'fallback_secret_key_32_chars_xxx'; // Use a static fallback for dev if missing, to prevent data loss across restarts
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ACTIVE_ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return text;
  let textParts = text.split(':');
  if (textParts.length !== 2) return text;
  let iv = Buffer.from(textParts[0], 'hex');
  let encryptedText = Buffer.from(textParts[1], 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ACTIVE_ENCRYPTION_KEY), iv);
`;

code = code.replace(
  /const crypto = require\('crypto'\);\nconst ENCRYPTION_KEY = process\.env\.ENCRYPTION_KEY[\s\S]*?let decipher = crypto\.createDecipheriv\('aes-256-cbc', Buffer\.from\(ENCRYPTION_KEY\), iv\);/m,
  updatedEncryption
);

fs.writeFileSync('server.ts', code);
