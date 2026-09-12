import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, basename } from 'node:path';
import { createHash, randomBytes } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(readFileSync(resolve(root, 'deploy/publish-config.json'), 'utf8'));
const prepareOnly = process.argv.includes('--prepare');
const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} 未成功完成，退出码 ${result.status ?? result.signal}`);
}

async function publish() {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(config.host) || !/^[a-z_][a-z0-9_-]*$/i.test(config.user)) throw new Error('SSH 地址或用户名格式不正确。');
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error('SSH 端口不正确。');
  if (config.appDir !== '/www/wwwroot/xyu/frieren-wedding' || config.processName !== 'wedding') throw new Error('部署目录或进程名与当前项目不一致，请检查配置。');
  const id = new Date().toISOString().replace(/[-:.TZ]/g, '') + '-' + randomBytes(3).toString('hex');
  const directory = resolve(root, 'update-packages');
  mkdirSync(directory, { recursive: true });
  const archive = resolve(directory, `wedding-${id}.tar.gz`);
  console.log('正在打包最新源码，环境变量和本地构建目录不会上传…');
  run('tar', ['-czf', archive, 'app', 'components', 'hooks', 'lib', 'public', 'scripts', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'next.config.ts', 'tsconfig.json', 'postcss.config.mjs']);
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(archive)) hash.update(chunk);
  const digest = hash.digest('hex');
  console.log(`更新包：${archive}`);
  if (prepareOnly) { console.log('仅打包完成，没有连接或修改服务器。'); return; }

  console.log(`即将更新 ${config.user}@${config.host}:${config.port} 的 ${config.processName}。`);
  console.log('接下来上传与发布各需登录一次。请在 password: 提示后输入 SSH 密码，输入时不显示字符。');
  console.log('首次连接请核对服务器指纹；脚本不会保存密码或关闭主机身份检查。');
  const destination = `${config.user}@${config.host}`;
  const remoteArchive = `/tmp/${basename(archive)}`;
  const remoteScript = `/tmp/wedding-deploy-${id}.sh`;
  // One transfer connection for both files; use relative paths to avoid Windows drive-letter ambiguity.
  const stagedScript = resolve(directory, `wedding-deploy-${id}.sh`);
  const { copyFileSync } = await import('node:fs');
  copyFileSync(resolve(root, 'scripts/deploy-server.sh'), stagedScript);
  run('scp', ['-P', String(config.port), '-o', 'ConnectTimeout=15', `update-packages/${basename(archive)}`, `update-packages/${basename(stagedScript)}`, `${destination}:/tmp/`]);
  const command = `bash ${quote(remoteScript)} ${quote(remoteArchive)} ${quote(digest)} ${quote(id)}`;
  run('ssh', ['-p', String(config.port), '-o', 'ConnectTimeout=15', '-o', 'ServerAliveInterval=15', destination, command]);
  console.log('发布成功。请刷新线上网站检查效果。');
}

publish().catch(error => {
  console.error(`\n发布未完成：${error.message}`);
  console.error('若连接在切换期间中断，请先查看服务器 PM2 状态，不要连续重复发布。');
  process.exitCode = 1;
});
