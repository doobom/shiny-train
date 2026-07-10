# 部署操作手册 (Deployment Guide)

本项目分为三个主要部分进行部署，以实现最高效和安全的分离架构：
1. **用户前端 (C端)**：部署于 Vercel。
2. **管理员前端 (B端)**：部署于 Vercel（独立项目，独立域名）。
3. **服务端 (Backend API)**：部署于独立的 Debian 13 VPS。
4. **数据库 (Database)**：部署于独立的 Debian 13 VPS，使用 PostgreSQL。

---

## 1. 架构与环境变量规划

我们将所有的配置信息提取到了环境变量中。

### Vercel 前端环境变量

**用户前端项目 (User Frontend)**
- `VITE_APP_MODE=user` (强制应用只渲染 C端 界面)
- `VITE_API_BASE_URL=https://api.yourdomain.com` (指向你的 VPS 服务端域名)

**管理员前端项目 (Admin Frontend)**
- `VITE_APP_MODE=admin` (强制应用只渲染 B端 管理界面)
- `VITE_API_BASE_URL=https://api.yourdomain.com` (指向你的 VPS 服务端域名)

### Debian 13 VPS 服务端环境变量 (`.env` 文件)

- `PORT=3000` (服务运行端口)
- `JWT_SECRET=your_super_secret_jwt_key` (用于签发和验证登录态的密钥)
- `ALLOWED_ORIGINS=https://user.yourdomain.com,https://admin.yourdomain.com` (跨域白名单)
- `DATABASE_URL=postgresql://user:password@localhost:5432/shop_db` (PostgreSQL 数据库连接字符串)

---

## 2. 数据库部署 (Debian 13 VPS)

1. **安装 PostgreSQL**:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **启动并设置开机自启**:
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **创建数据库及用户**:
   ```bash
   sudo -u postgres psql
   ```
   在 psql 命令行中执行：
   ```sql
   CREATE DATABASE shop_db;
   CREATE USER shop_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE shop_db TO shop_user;
   \c shop_db
   GRANT ALL ON SCHEMA public TO shop_user;
   \q
   ```

---

## 3. 服务端部署 (Debian 13 VPS)

1. **安装 Node.js (推荐 v20+)**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **拉取代码并安装依赖**:
   ```bash
   git clone <你的项目仓库地址> /var/www/shop-backend
   cd /var/www/shop-backend
   npm install
   ```

3. **配置环境变量**:
   创建 `/var/www/shop-backend/.env` 文件：
   ```env
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key
   ALLOWED_ORIGINS=https://user.yourdomain.com,https://admin.yourdomain.com
   DATABASE_URL=postgresql://shop_user:your_secure_password@localhost:5432/shop_db
   ```

4. **安装 PM2 进程守护**:
   ```bash
   sudo npm install -g pm2
   npm run build
   pm2 start dist/server.cjs --name "shop-backend"
   pm2 startup
   pm2 save
   ```

5. **配置 Nginx 反向代理 (可选，但推荐)**:
   ```bash
   sudo apt install nginx
   ```
   配置 `/etc/nginx/sites-available/api`：
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   然后启用并申请 SSL 证书：
   ```bash
   sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## 4. 前端部署 (Vercel)

在 Vercel 仪表板中，我们将基于同一个 GitHub 仓库创建两个独立的项目：

### 项目 A：用户前端 (C端)
1. 在 Vercel 中点击 **Add New -> Project**，选择你的代码仓库。
2. **Project Name**: `shop-frontend-user`
3. **Framework Preset**: `Vite`
4. **Environment Variables**:
   - Name: `VITE_APP_MODE`, Value: `user`
   - Name: `VITE_API_BASE_URL`, Value: `https://api.yourdomain.com`
5. 点击 **Deploy**。

### 项目 B：管理员前端 (B端)
1. 在 Vercel 中点击 **Add New -> Project**，选择同一个代码仓库。
2. **Project Name**: `shop-frontend-admin`
3. **Framework Preset**: `Vite`
4. **Environment Variables**:
   - Name: `VITE_APP_MODE`, Value: `admin`
   - Name: `VITE_API_BASE_URL`, Value: `https://api.yourdomain.com`
5. 点击 **Deploy**。

---

