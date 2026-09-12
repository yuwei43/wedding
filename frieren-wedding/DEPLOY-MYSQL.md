# lemon58.online 部署说明（无 Docker）

服务器建议使用 Ubuntu 22.04/24.04、Node.js 22、MySQL 8、PM2、Nginx。

## 1. 创建数据库

```sql
CREATE DATABASE wedding CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wedding_user'@'localhost' IDENTIFIED BY '替换为高强度密码';
GRANT ALL PRIVILEGES ON wedding.* TO 'wedding_user'@'localhost';
FLUSH PRIVILEGES;
```

## 2. 配置网站

在项目目录创建 `.env.production`，参照 `.env.example` 填写。不要提交该文件。

生成后台密码哈希：

```bash
pnpm admin:hash -- '你的后台密码'
```

把输出完整填入 `ADMIN_PASSWORD_HASH`。生成两个随机密钥：

```bash
openssl rand -hex 32
openssl rand -hex 32
```

分别填写到 `SESSION_SECRET` 与 `RATE_LIMIT_SALT`。

## 3. 安装并启动

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm build
sudo npm install -g pm2
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

执行 `pm2 startup` 后，继续执行它输出的 sudo 命令。

## 4. 配置域名与 HTTPS

先把 `lemon58.online` 和 `www.lemon58.online` 的 A 记录解析到服务器公网 IP，然后执行：

```bash
sudo cp deploy/nginx-lemon58.online.conf /etc/nginx/sites-available/lemon58.online
sudo ln -s /etc/nginx/sites-available/lemon58.online /etc/nginx/sites-enabled/lemon58.online
sudo nginx -t
sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lemon58.online -d www.lemon58.online
```

如果没有配置 `www` DNS，只申请主域名证书：

```bash
sudo certbot --nginx -d lemon58.online
```

## 5. 后续更新

```bash
git pull
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm build
pm2 restart wedding
```

后台地址为 `https://lemon58.online/admin`。
