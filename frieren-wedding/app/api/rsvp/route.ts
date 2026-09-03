import { wedding } from '@/lib/wedding-config';
import { handle,json,readBody,credential,limit } from '@/lib/server';
import { AppError,validateRsvp,rsvpOpen } from '@/lib/rsvp-domain';
import { ownRecord,createRecord,updateRecord,publicRecord } from '@/lib/rsvp-store';
export const dynamic='force-dynamic';
export async function GET(request:Request){return handle(async()=>{await limit(request,'lookup',60);const row=await ownRecord(await credential(request));if(!row)throw new AppError('尚未找到已保存的回执。',404);return json({record:publicRecord(row)});});}
export async function POST(request:Request){return handle(async()=>{const body=await readBody(request);await limit(request,'write');const hash=await credential(request);const existing=await ownRecord(hash);if(existing)return json({record:publicRecord(existing)});if(!rsvpOpen(wedding.rsvp))throw new AppError('回执登记已结束，请联系新人。',403);if(body.website)throw new AppError('请重新填写回执。');const value=validateRsvp(body,wedding.rsvp);return json({record:await createRecord(hash,value)},201);});}
export async function PATCH(request:Request){return handle(async()=>{const body=await readBody(request);await limit(request,'write');if(!rsvpOpen(wedding.rsvp))throw new AppError('回执登记已结束，需要修改请联系新人。',403);const row=await ownRecord(await credential(request));if(!row)throw new AppError('回执不存在，请联系新人。',404);return json({record:await updateRecord(row,validateRsvp(body,wedding.rsvp))});});}
