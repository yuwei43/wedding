import { createHash } from 'node:crypto';
import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise';
import { AppError } from './rsvp-domain';
import { isAdminSession } from './admin-auth';
import { validRequestOrigin } from './request-origin';

let pool: Pool | undefined;
export function database(){const uri=process.env.DATABASE_URL;if(!uri)throw new AppError('登记服务暂不可用，请稍后再试。',503);pool??=mysql.createPool({uri,connectionLimit:10,enableKeepAlive:true,charset:'utf8mb4'});return pool;}
export function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});}
export async function handle(action:()=>Promise<Response>){try{return await action();}catch(error){if(error instanceof AppError)return json({error:error.message},error.status);console.error('Wedding request failed',error);return json({error:'服务暂时繁忙，信息尚未确认保存，请稍后重试。'},503);}}
export function checkOrigin(request:Request,publicRsvp=false){if(!validRequestOrigin(request,process.env.SITE_ORIGIN,publicRsvp))throw new AppError('请求来源无效，请重新打开邀请函。',403);}
export async function readBody(request:Request,publicRsvp=false):Promise<Record<string,unknown>>{checkOrigin(request,publicRsvp);if(!request.headers.get('content-type')?.startsWith('application/json'))throw new AppError('请求格式不正确。',415);if(Number(request.headers.get('content-length'))>8192)throw new AppError('提交内容过长。',413);const text=await request.text();if(new TextEncoder().encode(text).length>8192)throw new AppError('提交内容过长。',413);try{const body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))throw 0;return body;}catch{throw new AppError('提交内容格式不正确。');}}
export async function sha256(text:string){return createHash('sha256').update(text).digest('hex');}
export async function credential(request:Request){const value=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';if(!/^[a-f0-9]{64}$/.test(value))throw new AppError('回执凭证无效，请联系新人协助修改。',401);return sha256(value);}
export async function requireAdmin(){if(!await isAdminSession())throw new AppError('请登录新人管理账号。',401);}
export async function limit(request:Request,kind:string,max=20){const db=database(),now=Math.floor(Date.now()/1000),window=Math.floor(now/600),forwarded=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),ip=forwarded||request.headers.get('x-real-ip')||'shared',key=await sha256(`${process.env.RATE_LIMIT_SALT||'local-development'}:${kind}:${ip}:${window}`);await db.execute('INSERT INTO rate_limits (`key`,`count`,expires_at) VALUES (?,1,?) ON DUPLICATE KEY UPDATE `count`=`count`+1,expires_at=VALUES(expires_at)',[key,(window+2)*600]);const [rows]=await db.execute<(RowDataPacket&{count:number})[]>('SELECT `count` FROM rate_limits WHERE `key`=?',[key]);await db.execute('DELETE FROM rate_limits WHERE expires_at < ?',[now]);if(!rows[0]||rows[0].count>max)throw new AppError('操作较频繁，请10分钟后再试。',429);}
