import test from 'node:test';
import assert from 'node:assert/strict';
import { adminRedirect, adminCookieSecure } from '../lib/admin-settings.ts';
import { spawnSync } from 'node:child_process';
import { scryptSync } from 'node:crypto';
import { validRequestOrigin } from '../lib/request-origin.ts';
import { wedding, venueLabel, navigationUrl } from '../lib/wedding-config.ts';
import {validateRsvp,dayMessage,csvCell,statistics,rsvpOpen} from '../lib/rsvp-domain.ts';
const range={stayMin:null,stayMax:null};
test('admin redirects stay on the public browser origin and are not cached',()=>{
  for(const error of [true,false]) {
    const response=adminRedirect(error);
    assert.equal(response.status,303);
    assert.equal(response.headers.get('location'),error?'/admin?error=1':'/admin');
    assert.equal(response.headers.get('cache-control'),'no-store');
  }
});
test('production admin cookies remain secure unless explicitly opted into HTTP',()=>{
  assert.equal(adminCookieSecure({NODE_ENV:'production'}),true);
  assert.equal(adminCookieSecure({NODE_ENV:'production',ADMIN_COOKIE_SECURE:'false'}),false);
  assert.equal(adminCookieSecure({NODE_ENV:'production',ADMIN_COOKIE_SECURE:'0'}),true);
  assert.equal(adminCookieSecure({NODE_ENV:'development'}),false);
});
test('env-ready password hashes survive the real Next environment loader',()=>{
  const password='synthetic-test-password-only';
  const result=spawnSync(process.execPath,['scripts/hash-password.mjs','--env',password],{encoding:'utf8'});
  assert.equal(result.status,0);
  const line=result.stdout.trim();
  const raw=line.slice('ADMIN_PASSWORD_HASH='.length).replaceAll('\\$','$');
  const [algorithm,salt,hash]=raw.split('$');
  assert.equal(algorithm,'scrypt');
  assert.equal(hash,scryptSync(password,salt,32).toString('hex'));
  const script=`const {createRequire}=require('node:module');
    const nr=createRequire(require.resolve('next/package.json'));
    delete process.env.ADMIN_PASSWORD_HASH;delete process.env.__NEXT_PROCESSED_ENV;
    nr('@next/env').processEnv([{path:'.env.production',contents:process.argv[1],env:{}}],undefined,{info(){},error(){}});
    process.stdout.write(process.env.ADMIN_PASSWORD_HASH||'');`;
  const parsed=spawnSync(process.execPath,['-e',script,line],{encoding:'utf8'});
  assert.equal(parsed.status,0);
  assert.equal(parsed.stdout,raw);
  const unescaped=spawnSync(process.execPath,['-e',script,'ADMIN_PASSWORD_HASH='+raw],{encoding:'utf8'});
  assert.equal(unescaped.status,0);
  assert.notEqual(unescaped.stdout,raw);
});
test('venue map uses the complete address and requests native handoff',()=>{
  assert.equal(venueLabel, '初元 · 福州市鼓楼区华侨新村36号');
  const url = new URL(navigationUrl);
  assert.equal(url.origin, 'https://uri.amap.com');
  assert.equal(url.searchParams.get('keyword'), wedding.venue.address);
  assert.equal(url.searchParams.get('city'), wedding.venue.city);
  assert.equal(url.searchParams.get('callnative'), '1');
});
test('RSVP accepts explicit public IP entries despite canonical domain or proxy URL',()=>{
  for(const origin of ['http://124.220.19.31:3000','http://124.220.19.31']) {
    const request=new Request('http://localhost:3000/api/rsvp',{headers:{origin}});
    assert.equal(validRequestOrigin(request,'https://lemon58.online',true),true);
    assert.equal(validRequestOrigin(request,'https://lemon58.online',false),false);
  }
});
test('origin normalization supports canonical trailing slash and development',()=>{
  assert.equal(validRequestOrigin(new Request('http://localhost/api/rsvp',{headers:{origin:'https://lemon58.online'}}),'https://lemon58.online/'),true);
  assert.equal(validRequestOrigin(new Request('http://localhost:3000/api/rsvp',{headers:{origin:'http://localhost:3000'}}),undefined),true);
});
test('origin validation rejects foreign, missing, malformed and spoofed proxy origins',()=>{
  for(const origin of ['', 'null','https://evil.example','http://124.220.19.31:3001','http://124.220.19.31.evil.example:3000','http://124.220.19.31:3000/path','https://evil.example@124.220.19.31:3000']) {
    const request=new Request('http://localhost:3000/api/rsvp',{headers:{origin,host:'evil.example','x-forwarded-host':'evil.example','x-forwarded-proto':'https'}});
    assert.equal(validRequestOrigin(request,'https://lemon58.online',true),false);
  }
  assert.equal(validRequestOrigin(new Request('http://localhost/api/rsvp'),'https://lemon58.online',true),false);
});
const valid={name:'测试旅伴',phone:'00000000000',guests:3,needsStay:false,stayGuests:0,checkIn:null,checkOut:null,notes:'',consent:true};
test('no-stay record drops stale accommodation fields',()=>{const r=validateRsvp({...valid,stayGuests:3,checkIn:'2026-10-23',checkOut:'2026-10-25'},range);assert.equal(r.stayGuests,0);assert.equal(r.checkIn,null);});
test('requires consent, valid contact and bounded integer guests',()=>{for(const patch of [{consent:false},{phone:'bad'},{name:''},{guests:0},{guests:1.5},{guests:51},{needsStay:null},{notes:'a'.repeat(501)}])assert.throws(()=>validateRsvp({...valid,...patch},range));});
test('accommodation validates real calendar dates, order and headcount',()=>{const base={...valid,needsStay:true,stayGuests:2,checkIn:'2026-10-23',checkOut:'2026-10-25'};assert.equal(validateRsvp(base,range).stayGuests,2);for(const patch of [{stayGuests:4},{stayGuests:0},{checkIn:'2026-02-30'},{checkOut:'2026-10-23'},{checkOut:null}])assert.throws(()=>validateRsvp({...base,...patch},range));assert.throws(()=>validateRsvp(base,{stayMin:'2026-10-24',stayMax:null}));assert.throws(()=>validateRsvp(base,{stayMin:null,stayMax:'2026-10-24'}));});
test('fixed accommodation window only accepts Oct 24 to Oct 25',()=>{const fixed={stayMin:'2026-10-24',stayMax:'2026-10-25'};const stay={...valid,needsStay:true,stayGuests:2,checkIn:'2026-10-24',checkOut:'2026-10-25'};assert.deepEqual([validateRsvp(stay,fixed).checkIn,validateRsvp(stay,fixed).checkOut],['2026-10-24','2026-10-25']);assert.throws(()=>validateRsvp({...stay,checkIn:'2026-10-23'},fixed));assert.throws(()=>validateRsvp({...stay,checkOut:'2026-10-26'},fixed));});
test('countdown uses Shanghai calendar day across UTC midnight and never negative',()=>{assert.match(dayMessage('2026-10-24',new Date('2026-10-23T15:59:59Z')),/1 天/);assert.match(dayMessage('2026-10-24',new Date('2026-10-23T16:00:00Z')),/就是今天/);assert.match(dayMessage('2026-10-24',new Date('2026-10-24T16:00:00Z')),/感谢/);});
test('registration cutoff is enforced',()=>{assert.equal(rsvpOpen({enabled:false,deadline:null}),false);assert.equal(rsvpOpen({enabled:true,deadline:'2026-10-20T23:59:59+08:00'},new Date('2026-10-21T00:00:00+08:00')),false);});
test('CSV prevents formula injection and quotes commas/newlines',()=>{for(const text of ['=SUM(A1)',' +123','@evil','-1','\t=1'])assert.ok(csvCell(text).startsWith('"\''));assert.equal(csvCell('a,"b"'),'"a,""b"""');});
test('statistics count people nights and not rooms',()=>{assert.deepEqual(statistics([{...valid,stayGuests:2,checkIn:'2026-10-23',checkOut:'2026-10-25'},{...valid,guests:1,stayGuests:0}]),{groups:2,guests:4,stayGuests:2,nights:4});});
