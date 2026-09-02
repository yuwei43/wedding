import winreg,os,urllib.parse,socket
try:
 with winreg.OpenKey(winreg.HKEY_CURRENT_USER,r'Software\Microsoft\Windows\CurrentVersion\Internet Settings') as k:
  for name in ['ProxyEnable','ProxyServer']:
   try:print(name,winreg.QueryValueEx(k,name)[0])
   except FileNotFoundError:pass
except OSError as e:print(type(e).__name__)
for k in ['HTTPS_PROXY','HTTP_PROXY','ALL_PROXY']:
 if os.environ.get(k):
  u=urllib.parse.urlparse(os.environ[k]);print(k,u.hostname,u.port)
print('DNS',sorted(set(x[4][0] for x in socket.getaddrinfo('git.chatgpt-team.site',443))))
