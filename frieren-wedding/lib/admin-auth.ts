import { createHmac,scryptSync,timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
const COOKIE_NAME='wedding_admin';
function secret(){return process.env.SESSION_SECRET||'';}
function sign(value:string){return createHmac('sha256',secret()).update(value).digest('hex');}
export async function createAdminSession(username:string){const expires=Date.now()+8*60*60*1000,payload=Buffer.from(JSON.stringify({username,expires})).toString('base64url');(await cookies()).set(COOKIE_NAME,`${payload}.${sign(payload)}`,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:8*60*60});}
export async function clearAdminSession(){(await cookies()).delete(COOKIE_NAME);}
export async function isAdminSession(){if(!secret())return false;const value=(await cookies()).get(COOKIE_NAME)?.value;if(!value)return false;const [payload,signature]=value.split('.');if(!payload||!signature)return false;const expected=sign(payload);if(signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return false;try{const data=JSON.parse(Buffer.from(payload,'base64url').toString()) as {username:string;expires:number};return data.username===process.env.ADMIN_USERNAME&&data.expires>Date.now();}catch{return false;}}
export function verifyAdminPassword(username:string,password:string){if(username!==process.env.ADMIN_USERNAME)return false;const [algorithm,salt,expected]=String(process.env.ADMIN_PASSWORD_HASH||'').split('$');if(algorithm!=='scrypt'||!salt||!expected)return false;const actual=scryptSync(password,salt,32).toString('hex');return actual.length===expected.length&&timingSafeEqual(Buffer.from(actual),Buffer.from(expected));}
