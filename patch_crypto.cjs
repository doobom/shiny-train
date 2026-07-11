const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const cryptoFns = `
const crypto = require('crypto');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32); // Must be 256 bits (32 chars)
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
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
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
`;

if (!code.includes('function encrypt(text)')) {
  code = code.replace(
    /const app = express\(\);/,
    cryptoFns + '\nconst app = express();'
  );
  fs.writeFileSync('server.ts', code);
}
