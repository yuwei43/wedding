"""Disposable local integration fixtures only. Run with dev server and local migrations."""
import json,urllib.request,urllib.error,http.cookiejar,secrets,concurrent.futures
BASE='http://localhost:3000'
jar=http.cookiejar.CookieJar()
admin=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
guest=urllib.request.build_opener()
def req(path,method='GET',body=None,token=None,opener=guest,origin=BASE,extra=None):
 headers={'Origin':origin}
 if body is not None:headers['Content-Type']='application/json'
 if token:headers['Authorization']='Bearer '+token
 if extra:headers.update(extra)
 request=urllib.request.Request(BASE+path,data=json.dumps(body).encode() if body is not None else None,headers=headers,method=method)
 try:r=opener.open(request)
 except urllib.error.HTTPError as e:r=e
 raw=r.read()
 try:data=json.loads(raw)
 except:data=raw.decode('utf-8-sig')
 return r.status,data,r.headers
def check(condition,label):
 assert condition,label
 print('PASS',label)
payload={'name':'TEST-LOCAL-旅伴','phone':'00000000000','guests':3,'needsStay':True,'stayGuests':2,'checkIn':'2026-10-23','checkOut':'2026-10-25','notes':'=TEST, CSV','consent':True}
token=secrets.token_hex(32)
admin.open(BASE+'/signin-with-chatgpt?return_to=/admin').read()
cleanup_status,cleanup_data,_=req('/api/admin/rsvps',opener=admin)
if cleanup_status==200:
 for row in cleanup_data['records']:
  if row['name']=='TEST-LOCAL-旅伴' and row['phone']=='00000000000':
   req('/api/admin/rsvps/'+row['id'],'DELETE',opener=admin)
check(req('/api/admin/rsvps')[0]==403,'anonymous cannot read list')
check(req('/api/admin/export')[0]==403,'anonymous cannot export')
check(req('/api/rsvp','POST',payload,token,origin='https://foreign.example')[0]==403,'cross-origin write blocked')
check(req('/api/rsvp','POST',{**payload,'consent':False},token)[0]==400,'consent required')
check(req('/api/rsvp','POST',{**payload,'stayGuests':4},token)[0]==400,'invalid lodging rejected')
results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 results=list(pool.map(lambda _:req('/api/rsvp','POST',payload,token),range(2)))
check(all(r[0] in (200,201) for r in results),'concurrent submissions succeed')
rid=results[0][1]['record']['id']
check(results[1][1]['record']['id']==rid,'idempotent writes create one record')
check('credential_hash' not in json.dumps([r[1] for r in results]),'credential hash never returned')
check(req('/api/rsvp',token=secrets.token_hex(32))[0]==404,'wrong receipt cannot read')
check(req('/api/rsvp','PATCH',payload,secrets.token_hex(32))[0]==404,'wrong receipt cannot modify')
code,data,headers=req('/api/rsvp',token=token)
check(code==200 and data['record']['stayGuests']==2,'saved lodging survives fetch')
check(headers.get('Cache-Control')=='no-store','private response not cached')
changed={**payload,'guests':2,'needsStay':False}
check(req('/api/rsvp','PATCH',changed,token)[1]['record']['stayGuests']==0,'editing to no stay clears lodging')
admin.open(BASE+'/signin-with-chatgpt?return_to=/admin').read()
code,data,_=req('/api/admin/rsvps',opener=admin)
check(code==200,'local authorized administrator can list')
check(sum(r['id']==rid for r in data['records'])==1,'database contains one fixture')
check(req('/api/admin/rsvps/'+rid,'PATCH',{**payload,'status':'confirmed'},opener=admin)[0]==200,'administrator confirms accommodation')
code,csv,_=req('/api/admin/export',opener=admin)
check(code==200 and "'=TEST" in csv,'CSV formula content escaped')
check(req('/api/admin/rsvps/'+rid,'DELETE')[0]==403,'anonymous cannot delete')
check(req('/api/admin/rsvps/'+rid,'DELETE',opener=admin)[0]==200,'administrator deletes disposable fixture')
check(req('/api/rsvp',token=token)[0]==404,'deleted fixture is gone')
print('All local API integration checks passed; fixture removed.')
