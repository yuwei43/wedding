# 肖禹 & 陈雨晴 · 旅伴来信

《葬送的芙莉莲》旅伴群像主题婚礼邀请函。项目使用 Next.js 16、React 19 和 MySQL，可在普通 Linux 云服务器上通过 PM2 与 Nginx 运行，不需要 Docker。

## 本地启动

要求 Node.js 22+、pnpm 以及 MySQL 8+。

1. 执行 `pnpm install`。
2. 将 `.env.example` 复制为 `.env.local`，填写数据库和管理后台配置。
3. 执行 `pnpm admin:hash -- 你的后台密码`，将结果填入 `ADMIN_PASSWORD_HASH`。
4. 执行 `pnpm db:migrate` 初始化数据库。
5. 执行 `pnpm dev`，访问 `http://localhost:3000`。

管理后台地址为 `/admin`。后台通过 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD_HASH` 登录，登录状态保存在签名的 HttpOnly Cookie 中。

## 修改婚礼信息

主要配置入口为 `lib/wedding-config.ts`：

- `date` 使用 `YYYY-MM-DD`，时区为 `Asia/Shanghai`。
- `events` 数组决定日程顺序，`enabled` 控制显示，`time: null` 显示时间待定。
- `venue` 配置地址、导航、交通、停车及雨天安排。
- `copy` 配置邀请正文、章节标题与结尾。
- `rsvp` 配置回执开关、截止时间和住宿日期范围。
- `music` 配置本地音乐；浏览器要求由宾客主动点击播放。
- `images` 配置页面插画和分享封面。

## 环境变量

| 名称 | 作用 |
| --- | --- |
| `DATABASE_URL` | MySQL 连接地址 |
| `SITE_ORIGIN` | 当前公开访问地址；暂用 IP 时设为 `http://124.220.19.31:3000`（含端口），会用于分享图地址和请求来源校验 |
| `ADMIN_USERNAME` | 管理后台用户名 |
| `ADMIN_PASSWORD_HASH` | 使用 `pnpm admin:hash` 生成的密码哈希 |
| `SESSION_SECRET` | 后台登录 Cookie 签名密钥，至少 32 个随机字符 |
| `RATE_LIMIT_SALT` | 回执限流使用的随机盐值 |

真实密码和密钥只能放在服务器的 `.env.production`，不要提交到 Git。

## 数据与隐私

回执保存在 MySQL 的 `rsvps` 表中。宾客的私密修改凭证只在数据库保存哈希。后台支持搜索、修改、安排状态、删除和 CSV 导出。

页面设置了禁止搜索引擎索引，但 `noindex` 不是访问控制；公开链接仍可能被转发。宾客名单、数据库备份和导出的 CSV 不得放入公开仓库。

## 检查与构建

```bash
pnpm typecheck
pnpm test
pnpm build
```

完整的 Ubuntu、MySQL、PM2、Nginx、域名和 HTTPS 部署步骤见 `DEPLOY-MYSQL.md`。
