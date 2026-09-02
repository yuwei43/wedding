"""Push exact source with credential passed only through stdin, never saved."""
import sys,json,subprocess,os,pathlib,getpass,urllib.request
root=pathlib.Path(__file__).parent/'frieren-wedding'
git=r'C:\Users\Administrator\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe'
def run(args,env=None):
 r=subprocess.run([git,'-c','safe.directory='+str(root),'-c','http.version=HTTP/1.1','-c','http.sslBackend=openssl',*args],cwd=root,env=env,capture_output=True,text=True)
 if r.returncode:
  print('Git operation failed:',args[0]);print(r.stderr[:1500]);raise SystemExit(r.returncode)
 return r.stdout.strip()
if not (root/'.git').exists():run(['init','-b','main'])
run(['add','.'])
changes=run(['status','--porcelain'])
if changes:run(['-c','user.name=Codex','-c','user.email=codex@local.invalid','commit','-m','Build Frieren wedding invitation and private RSVP management'])
print('Source commit ready; waiting for short-lived push credential.',flush=True)
cred=json.loads(getpass.getpass('Push credential (hidden): '))
env=os.environ.copy();env['GIT_CONFIG_COUNT']='1';env['GIT_CONFIG_KEY_0']='http.extraHeader';env['GIT_CONFIG_VALUE_0']='Authorization: Bearer '+cred['token'];env['GIT_TERMINAL_PROMPT']='0'
for scheme,value in urllib.request.getproxies().items():
 if scheme in ('http','https'):env[scheme+'_proxy']=value
run(['push',cred['remote_url'],'HEAD:refs/heads/'+cred['branch']],env)
print('PUSHED_COMMIT='+run(['rev-parse','HEAD']),flush=True)
