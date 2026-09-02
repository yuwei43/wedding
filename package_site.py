"""Run the official Sites packaging helper with bundled Git Bash on Windows."""
import subprocess,os,pathlib
deps=pathlib.Path(r'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git')
root=pathlib.Path(__file__).parent
env=os.environ.copy();env['PATH']=str(deps/'usr/bin')+';'+env.get('PATH','');env['TMPDIR']=str(root/'package-tmp').replace('\\','/')
pathlib.Path(env['TMPDIR']).mkdir(exist_ok=True)
script='C:/Users/Administrator/.codex/plugins/cache/openai-bundled/sites/0.1.46/skills/sites-hosting/scripts/package-site.sh'
raise SystemExit(subprocess.call([str(deps/'usr/bin/sh.exe'),script,str(root/'frieren-wedding').replace('\\','/'),str(root/'frieren-wedding.tar.gz').replace('\\','/')],env=env))
