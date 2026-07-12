const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `const app = express();
const PORT = 3000;

app.use(cors({`;

const replaceStr = `import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = 3000;

app.use(helmet({
  contentSecurityPolicy: false, // disabled for vite dev server and standard spa
  crossOriginEmbedderPolicy: false,
}));

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 requests per windowMs for auth
  message: 'Too many authentication attempts, please try again later'
});
app.use('/api/auth/', authLimiter);

app.use(cors({`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('server.ts', code);
