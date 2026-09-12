#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

archive=${1:?Missing archive}
expected_hash=${2:?Missing checksum}
release_id=${3:?Missing release id}
[[ "$release_id" =~ ^[0-9]{17}-[a-f0-9]{6}$ ]] || { echo 'Invalid release ID'; exit 1; }
[[ "$archive" == "/tmp/wedding-${release_id}.tar.gz" ]] || { echo 'Invalid archive path'; exit 1; }
app_dir=/www/wwwroot/xyu/frieren-wedding
release_root=/www/wwwroot/xyu/wedding-releases
process_name=wedding
release_dir="$release_root/$release_id"
legacy_dir="$release_root/previous-$release_id"
candidate_pid=''
switch_started=0
old_link=''

for tool in node pnpm pm2 tar curl flock sha256sum; do command -v "$tool" >/dev/null || { echo "Missing command: $tool"; exit 1; }; done
[[ -d "$app_dir" && -f "$app_dir/.env.production" ]] || { echo 'Existing application or .env.production not found. Nothing changed.'; exit 1; }
[[ ! -L "$release_root" ]] || { echo 'Release root must not be a symlink'; exit 1; }
mkdir -p "$release_root"
exec 9>"$release_root/.deploy.lock"
flock -n 9 || { echo 'Another deployment is in progress'; exit 1; }
[[ ! -e "$release_dir" && ! -e "$legacy_dir" ]] || { echo 'Release already exists'; exit 1; }
[[ "$(sha256sum "$archive" | cut -d ' ' -f 1)" == "$expected_hash" ]] || { echo 'Upload checksum mismatch'; exit 1; }

# Preserve the current PM2 entry point. Refuse unsupported layouts before changing production.
pm2 jlist | node -e '
let data="";process.stdin.on("data",x=>data+=x);process.stdin.on("end",()=>{
 const apps=JSON.parse(data).filter(x=>x.name==="wedding");
 const base="/www/wwwroot/xyu/frieren-wedding";
 const allowed=[base+"/node_modules/next/dist/bin/next",base+"/.next/standalone/server.js"];
 if(apps.length!==1 || apps[0].pm2_env.pm_cwd!==base || !allowed.includes(apps[0].pm2_env.pm_exec_path)) {
   console.error("PM2 entry point differs from the expected layout. Nothing changed; inspect pm2 describe wedding.");process.exit(1);
 }
});'
if [[ -L "$app_dir" ]]; then old_link=$(readlink "$app_dir"); fi

rollback() {
  local code=$?
  if [[ "$code" == 0 ]]; then code=1; fi
  trap - ERR HUP INT TERM
  set +e
  if [[ -n "$candidate_pid" ]]; then kill "$candidate_pid" 2>/dev/null; wait "$candidate_pid" 2>/dev/null; fi
  if [[ "$switch_started" == 1 ]]; then
    echo 'Deployment failed during switch. Restoring the previous version...'
    if [[ -n "$old_link" ]]; then
      ln -s "$old_link" "$release_root/rollback-$release_id"
      mv -Tf "$release_root/rollback-$release_id" "$app_dir"
    elif [[ -d "$legacy_dir" ]]; then
      if [[ -L "$app_dir" ]]; then mv -T "$app_dir" "$release_root/failed-link-$release_id"; fi
      mv -T "$legacy_dir" "$app_dir"
    fi
    pm2 restart "$process_name"
    pm2 save
    echo 'Rollback attempted. Verify pm2 status and the website before retrying.'
  else
    echo 'Build or preflight failed. The running site was not switched.'
  fi
  echo "Diagnostic files retained in $release_dir"
  exit "${code:-1}"
}
trap rollback ERR HUP INT TERM

mkdir "$release_dir"
tar -xzf "$archive" -C "$release_dir" --no-same-owner
for file in .env .env.local .env.production .env.production.local; do
  if [[ -f "$app_dir/$file" ]]; then cp -p "$app_dir/$file" "$release_dir/$file"; fi
done
if [[ -d "$app_dir/deploy" ]]; then cp -a "$app_dir/deploy" "$release_dir/"; fi
cd "$release_dir"
echo 'Building the new version while the existing site stays online...'
pnpm install --frozen-lockfile
pnpm build
cp -a public .next/standalone/
cp -a .next/static .next/standalone/.next/
for file in .env .env.local .env.production .env.production.local; do
  if [[ -f "$file" ]]; then cp -p "$file" ".next/standalone/$file"; fi
done

# A loopback-only candidate on an OS-selected port verifies the generated server.
candidate_port=$(node -e 'const s=require("net").createServer();s.listen(0,"127.0.0.1",()=>{console.log(s.address().port);s.close()})')
NODE_ENV=production HOSTNAME=127.0.0.1 PORT="$candidate_port" node .next/standalone/server.js >candidate.log 2>&1 &
candidate_pid=$!
healthy=0
for ((i=0;i<30;i++)); do
  kill -0 "$candidate_pid"
  if curl -fsS --max-time 2 "http://127.0.0.1:$candidate_port/" -o candidate.html 2>/dev/null && grep -q 'A NEW CHAPTER, TOGETHER' candidate.html; then healthy=1; break; fi
  sleep 1
done
[[ "$healthy" == 1 ]] || { echo 'New version failed its HTTP check'; false; }
kill "$candidate_pid"
wait "$candidate_pid" 2>/dev/null || true
candidate_pid=''

echo 'Build and HTTP check passed. Switching versions...'
switch_started=1
pm2 stop "$process_name"
if [[ -n "$old_link" ]]; then
  ln -s "$release_dir" "$release_root/next-$release_id"
  mv -Tf "$release_root/next-$release_id" "$app_dir"
else
  mv -T "$app_dir" "$legacy_dir"
  ln -s "$release_dir" "$app_dir"
fi
pm2 restart "$process_name"
healthy=0
for ((i=0;i<30;i++)); do
  if curl -fsS --max-time 2 http://127.0.0.1:3000/ -o live.html 2>/dev/null && grep -q 'A NEW CHAPTER, TOGETHER' live.html; then healthy=1; break; fi
  sleep 1
done
[[ "$healthy" == 1 ]] || { echo 'Live HTTP check failed'; false; }
pm2 save
switch_started=0
trap - ERR HUP INT TERM
echo "SUCCESS: $release_id is online. Previous versions are retained in $release_root."
