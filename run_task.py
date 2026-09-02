import os,sys,subprocess,pathlib
root=pathlib.Path(__file__).parent
deps=pathlib.Path(r'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies')
env=os.environ.copy()
env['PATH']=str(deps/'node/bin')+';'+str(deps/'bin/fallback')+';'+str(deps/'native/git/cmd')+';'+env.get('PATH','')
project=root/'frieren-wedding'
project.mkdir(exist_ok=True)
cmd=[str(deps/'bin/fallback/pnpm.cmd'),*sys.argv[1:]]
raise SystemExit(subprocess.call(cmd,cwd=project,env=env))
