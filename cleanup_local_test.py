import urllib.request,http.cookiejar,json
base='http://localhost:3000';opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
opener.open(base+'/signin-with-chatgpt?return_to=/admin').read()
rows=json.load(opener.open(base+'/api/admin/rsvps'))['records']
for r in rows:
 if r['name'] in ('TEST-LOCAL-旅伴','TEST-UI-旅伴') and r['phone']=='00000000000':
  opener.open(urllib.request.Request(base+'/api/admin/rsvps/'+r['id'],method='DELETE',headers={'Origin':base})).read()
  print('Removed disposable local test fixture')
