import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { AppError } from './rsvp-domain';
type Runtime = { DB: D1Database; ADMIN_USER_IDS?: string; ADMIN_EMAILS?:string; RATE_LIMIT_SALT?: string; SITE_ORIGIN?: string };
export const runtime = env as unknown as Runtime;
export function database() { if(!runtime.DB) throw new AppError('登记服务暂不可用，请稍后再试。',503); return runtime.DB; }
export function json(value:unknown,status=200) { return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}}); }
export async function handle(action:()=>Promise<Response>) { try{return await action();}catch(error){ if(error instanceof AppError) return json({error:error.message},error.status); console.error('Wedding request failed',error instanceof Error?error.name:'UnknownError');return json({error:'服务暂时繁忙，信息尚未确认保存，请稍后重试。'},503); } }
export function checkOrigin(request:Request) { const origin=request.headers.get('origin'); const expected=runtime.SITE_ORIGIN || new URL(request.url).origin; if(origin!==expected) throw new AppError('请求来源无效，请重新打开邀请函。',403); }
export async function readBody(request:Request):Promise<Record<string,unknown>> {
  checkOrigin(request);
  if(!request.headers.get('content-type')?.startsWith('application/json')) throw new AppError('请求格式不正确。',415);
  if(Number(request.headers.get('content-length'))>8192) throw new AppError('提交内容过长。',413);
  if(!request.body) throw new AppError('提交内容为空。');
  const reader=request.body.getReader();const chunks:Uint8Array[]=[];let length=0;
  for(;;){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>8192){await reader.cancel();throw new AppError('提交内容过长。',413);}chunks.push(value);}
  const data=new Uint8Array(length);let at=0;for(const chunk of chunks){data.set(chunk,at);at+=chunk.length;}
  try{const body=JSON.parse(new TextDecoder().decode(data));if(!body||typeof body!=='object'||Array.isArray(body))throw 0;return body;}catch{throw new AppError('提交内容格式不正确。');}
}
export async function sha256(text:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function credential(request:Request){const value=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';if(!/^[a-f0-9]{64}$/.test(value))throw new AppError('回执凭证无效，请联系新人协助修改。',401);return sha256(value);}
export async function isAdmin(){const user=await getChatGPTUser();if(!user)return false;const allowed=(runtime.ADMIN_USER_IDS||'').split(',').map(v=>v.trim()).filter(Boolean);const emails=(runtime.ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);return allowed.includes(user.userId)||emails.includes(user.email.toLowerCase());}
export async function requireAdmin(){if(!await isAdmin())throw new AppError('仅限新人管理账号访问。',403);}
export async function limit(request:Request,kind:string,max=20){
  const db=database(),now=Math.floor(Date.now()/1000),window=Math.floor(now/600);
  const ip=request.headers.get('cf-connecting-ip')||'shared';
  const key=await sha256(`${runtime.RATE_LIMIT_SALT||'local-development'}:${kind}:${ip}:${window}`);
  const result=await db.prepare('INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,(window+2)*600).first<{count:number}>();
  await db.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now).run();
  if(!result||result.count>max)throw new AppError('操作较频繁，请10分钟后再试。',429);
}
