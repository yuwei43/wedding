"""Verify only synthetic records on the owner-only deployment. Secrets stay in memory."""
import urllib.request,urllib.error,json,getpass,secrets,re
settings=json.loads(getpass.getpass('Private verification access (hidden): '))
base=settings['url'].rstrip('/');access=settings['access']
opener=urllib.request.build_opener()
def request(path,method='GET',body=None,token=None):
 headers={'OAI-Sites-Authorization':'Bearer '+access,'Origin':base}
 if token:headers['Authorization']='Bearer '+token
 if body is not None:headers['Content-Type']='application/json'
 req=urllib.request.Request(base+path,data=json.dumps(body).encode() if body is not None else None,headers=headers,method=method)
 try:r=opener.open(req,timeout=45)
 except urllib.error.HTTPError as e:r=e
 raw=r.read().decode('utf-8-sig')
 try:data=json.loads(raw)
 except:data=raw
 return r.status,data,r.headers
def check(ok,label):
 print(('PASS ' if ok else 'FAIL ')+label,flush=True)
 if not ok:raise RuntimeError(label)
status,html,_=request('/')
check(status==200 and '2026' in html,'private invitation responds')
check('property="og:image"' in html or 'property="og:image:url"' in html,'share metadata configured')
status,data,_=request('/api/admin/rsvps')
if status==403:
 print('PASS bypass access does not grant administrator identity',flush=True)
 status,invalid,_=request('/api/rsvp','POST',{'name':'TEST-NOT-SAVED','phone':'00000000000','guests':1,'needsStay':False,'consent':False},secrets.token_hex(32))
 check(status==400 and '确认' in invalid.get('error',''),'hosted database is ready and invalid RSVP rejected')
 status,unknown,_=request('/api/rsvp',token=secrets.token_hex(32))
 check(status==404,'hosted unknown receipt is not disclosed')
 print('Owner sign-in required for positive administrator/round-trip verification. No guest records created.',flush=True)
 raise SystemExit(0)
check(status==200,'owner authorized for administration')
before=len(data['records'])
token=secrets.token_hex(32);rid=None
payload={'name':'TEST-PRIVATE-验收','phone':'00000000000','guests':2,'needsStay':True,'stayGuests':2,'checkIn':'2026-10-23','checkOut':'2026-10-25','notes':'Disposable deployment acceptance fixture','consent':True}
try:
 status,data,_=request('/api/rsvp','POST',payload,token);check(status in (200,201),'hosted database accepts RSVP');rid=data['record']['id']
 status,retry,_=request('/api/rsvp','POST',payload,token);check(status in (200,201) and retry['record']['id']==rid,'hosted retry does not duplicate')
 status,own,headers=request('/api/rsvp',token=token);check(status==200 and own['record']['stayGuests']==2 and headers.get('Cache-Control')=='no-store','private receipt persists without cache')
 status,_,_=request('/api/rsvp',token=secrets.token_hex(32));check(status==404,'wrong guest credential rejected')
 status,data,_=request('/api/admin/rsvps');check(status==200 and len(data['records'])==before+1,'hosted admin sees saved record')
 status,csv,_=request('/api/admin/export');check(status==200 and 'TEST-PRIVATE-' in csv,'hosted CSV export works')
finally:
 if rid:
  status,_,_=request('/api/admin/rsvps/'+rid,'DELETE');check(status==200,'hosted synthetic fixture removed')
print('Private acceptance passed; no test guest retained.',flush=True)
