import { database } from './server';
import { AppError, type RsvpInput, type RsvpRecord } from './rsvp-domain';
export type Row = { id:string; credential_hash:string; name:string;phone:string;guests:number;needs_stay:number;stay_guests:number;check_in:string|null;check_out:string|null;notes:string;status:RsvpRecord['status'];created_at:string;updated_at:string };
export function publicRecord(row:Row):RsvpRecord{return {id:row.id,name:row.name,phone:row.phone,guests:row.guests,needsStay:!!row.needs_stay,stayGuests:row.stay_guests,checkIn:row.check_in,checkOut:row.check_out,notes:row.notes,status:row.status,createdAt:row.created_at,updatedAt:row.updated_at,consent:true};}
export async function ownRecord(hash:string){return database().prepare('SELECT * FROM rsvps WHERE credential_hash = ?').bind(hash).first<Row>();}
export async function createRecord(hash:string,x:RsvpInput){const db=database(),now=new Date().toISOString();await db.prepare('INSERT INTO rsvps (id,credential_hash,name,phone,guests,needs_stay,stay_guests,check_in,check_out,notes,status,consent_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(credential_hash) DO NOTHING').bind(crypto.randomUUID(),hash,x.name,x.phone,x.guests,Number(x.needsStay),x.stayGuests,x.checkIn,x.checkOut,x.notes,x.needsStay?'pending':'none',now,now,now).run();const row=await ownRecord(hash);if(!row)throw new AppError('回执未保存，请重试。',503);return publicRecord(row);}
export async function updateRecord(row:Row,x:RsvpInput,adminStatus?:unknown){
  let status:RsvpRecord['status']=x.needsStay?'pending':'none';
  const unchanged=!!row.needs_stay===x.needsStay&&row.stay_guests===x.stayGuests&&row.check_in===x.checkIn&&row.check_out===x.checkOut;
  if(x.needsStay&&unchanged)status=row.status==='confirmed'?'confirmed':'pending';
  if(adminStatus!==undefined){if(!['pending','confirmed','none'].includes(String(adminStatus)))throw new AppError('住宿状态无效。');if(x.needsStay&&adminStatus==='none')throw new AppError('需要住宿的宾客请选择待联系或已确认。');if(!x.needsStay&&adminStatus!=='none')throw new AppError('无需住宿的宾客应选择无需安排。');status=adminStatus as RsvpRecord['status'];}
  const result=await database().prepare('UPDATE rsvps SET name=?,phone=?,guests=?,needs_stay=?,stay_guests=?,check_in=?,check_out=?,notes=?,status=?,updated_at=? WHERE id=? RETURNING *').bind(x.name,x.phone,x.guests,Number(x.needsStay),x.stayGuests,x.checkIn,x.checkOut,x.notes,status,new Date().toISOString(),row.id).first<Row>();
  if(!result)throw new AppError('这份回执已不存在。',404);return publicRecord(result);
}
