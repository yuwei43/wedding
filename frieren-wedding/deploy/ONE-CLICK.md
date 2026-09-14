# 一键发布

双击项目根目录的 `deploy.cmd`，按提示输入 **SSH 服务器密码**。
默认连接 `root@124.220.19.31:22`；宝塔网页面板密码不是 SSH 密码。
连接参数在 `deploy/publish-config.json`，这里不保存密码。

上传和服务器执行使用两次 SSH 连接，可能需要输入两次密码。
首次连接需要核对服务器主机指纹。输入密码时终端不显示字符是正常的。

脚本自动打包最新源码、上传、保留服务器环境变量，在新目录安装依赖和构建。
新版本通过本机 HTTP 检查后，短暂停止 `wedding` 并切换目录，沿用已有 PM2 启动配置。
构建失败不会切换网站；切换后的 HTTP 检查失败会尝试恢复旧目录并重启。
数据库不重新初始化，不执行迁移，不修改 Nginx。

旧目录及失败构建保留在 `/www/wwwroot/xyu/wedding-releases/`，不会自动删除，请定期检查服务器磁盘空间。
服务器需已有 Node、pnpm、PM2、tar、curl、flock。要求原 PM2 工作目录是
`/www/wwwroot/xyu/frieren-wedding`，入口是其中的 `node_modules/next/dist/bin/next`
或 `.next/standalone/server.js`；若不同，脚本会在切换前停止并提示检查。

仅本地验证打包、不连接服务器：

```bat
node scripts/publish.mjs --prepare
```

遇到断网或错误，保留窗口中的输出，先检查 `pm2 status` 再重试。

## 回执入口与来源校验

`SITE_ORIGIN` 是正式网址（协议、域名和端口必须正确）。公共回执 POST/PATCH 另允许当前服务器的
`http://124.220.19.31` 和 `http://124.220.19.31:3000`，配置位于 `lib/request-origin.ts`。
因此服务器保留原有 `.env.production` 时，IP 入口也可以填写回执。后台接口仍只接受正式来源；
不会信任任意 Host / X-Forwarded-Host，也没有禁用来源保护。更换服务器或停止使用 IP 入口时，应同步修改这份白名单。

## 后台登录诊断

更新代码后，在服务器项目目录运行 `pnpm admin:check`。仅显示用户名、哈希格式是否有效、
会话密钥是否设置和 Cookie 模式，不显示密码、哈希或密钥。它检查环境文件与当前 shell，不能代表已运行的 PM2 环境。

`admin:hash` 默认只生成原始哈希，并不修改服务器密码。写进 Next 的环境文件时，`$` 必须转义为 `\$`，
否则会发生变量展开，即使用单引号包裹也不能解决。可以用 `pnpm admin:hash -- --env '你自行选择的新密码'`
生成可直接粘贴的 `ADMIN_PASSWORD_HASH=...` 行，在宝塔文件编辑器替换原有那一行，不要通过 shell 的 echo 拼接。
密码命令参数可能进入 shell 历史，避免共享终端或截图。先备份环境文件，不要覆盖数据库配置或其他密钥。
PM2 若另外设置了同名变量，其优先级高于环境文件，需要同时核对 PM2 配置；更改后重新发布/重启进程。

生产后台默认仅用 HTTPS Cookie。优先使用已部署证书的 HTTPS 地址。
如果明确接受临时公网 HTTP 的风险，可在服务器 `.env.production` 设置 `ADMIN_COOKIE_SECURE=false` 并重启/重新发布。
此选项默认关闭；启用后密码和会话可能被网络窃听，启用 HTTPS 后应删除该行。
无论是否启用此选项，登录与退出都使用相对跳转，不再把 Nginx 的 localhost 内部地址发给浏览器。
