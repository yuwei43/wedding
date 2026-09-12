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
