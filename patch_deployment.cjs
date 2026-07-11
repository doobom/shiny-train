const fs = require('fs');
let code = fs.readFileSync('DEPLOYMENT.md', 'utf8');

const updatedEnv = `
### Debian 13 VPS 服务端环境变量 (\`.env\` 文件)
- \`PORT=3000\` (服务运行端口)
- \`JWT_SECRET=your_super_secret_jwt_key\` (用于签发和验证登录态的密钥)
- \`ALLOWED_ORIGINS=https://user.yourdomain.com,https://admin.yourdomain.com\` (跨域白名单)
- \`DATABASE_URL=postgresql://user:password@localhost:5432/shop_db\` (PostgreSQL 数据库连接字符串)
- \`ENCRYPTION_KEY=your_32_character_encryption_key\` (PII 主密钥，必须为 32 字符，切勿泄露或修改)
- \`ADMIN_EMAIL=admin@example.com\` (初始化超级管理员邮箱)
- \`ADMIN_PASSWORD=super_secure_password\` (初始化超级管理员密码)
- \`PASSWORD_SALT=my_secret_salt_here\` (用户密码加盐随机字符串)
`;

code = code.replace(
  /### Debian 13 VPS 服务端环境变量 \(\`\.env\` 文件\)[\s\S]*?- \`DATABASE_URL=.*?\` \(PostgreSQL 数据库连接字符串\)/,
  updatedEnv.trim()
);

const updatedEnvSection = `
   创建 \`/var/www/shop-backend/.env\` 文件：
   \`\`\`env
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key
   ALLOWED_ORIGINS=https://user.yourdomain.com,https://admin.yourdomain.com
   DATABASE_URL=postgresql://shop_user:your_secure_password@localhost:5432/shop_db
   ENCRYPTION_KEY=your_32_character_encryption_key
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=super_secure_password
   PASSWORD_SALT=my_secret_salt_here
   \`\`\`
`;

code = code.replace(
  /创建 \`\/var\/www\/shop-backend\/\.env\` 文件：[\s\S]*?DATABASE_URL=postgresql:\/\/shop_user:your_secure_password@localhost:5432\/shop_db\n   \`\`\`/m,
  updatedEnvSection.trim()
);

const seedSection = `
6. **初始化数据库 (Seeding)**:
   在服务器启动后，使用以下命令初始化数据库结构及超级管理员账户：
   \`\`\`bash
   curl -X POST http://localhost:3000/api/admin/init-db
   \`\`\`
   此操作将根据环境变量中的 \`ADMIN_EMAIL\` 与 \`ADMIN_PASSWORD\` 建立初始超级管理账号。
`;

code = code.replace(
  /---[\s\n]*## 4\. 前端部署 \(Vercel\)/,
  seedSection + '\n\n---\n\n## 4. 前端部署 (Vercel)'
);

fs.writeFileSync('DEPLOYMENT.md', code);
