import { database,handle,json,readBody,requireAdmin,checkOrigin } from '@/lib/server';
import { updateRecord,type Row } from '@/lib/rsvp-store';
import { AppError,validateRsvp } from '@/lib/rsvp-domain';
import { wedding } from '@/lib/wedding-config';
export const dynamic='force-dynamic';
type Context={params:Promise<{id:string}>};
export async function PATCH(request:Request,context:Context){return handle(async()=>{await requireAdmin();const body=await readBody(request),{id}=await context.params;const row=await database().prepare('SELECT * FROM rsvps WHERE id=?').bind(id).first<Row>();if(!row)throw new AppError('回执不存在。',404);return json({record:await updateRecord(row,validateRsvp(body,wedding.rsvp),body.status)});});}
export async function DELETE(request:Request,context:Context){return handle(async()=>{await requireAdmin();checkOrigin(request);const {id}=await context.params;await database().prepare('DELETE FROM rsvps WHERE id=?').bind(id).run();return json({ok:true});});}
