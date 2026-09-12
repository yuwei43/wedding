import { database,handle,json,readBody,requireAdmin,checkOrigin } from '@/lib/server';
import { updateRecord,type Row } from '@/lib/rsvp-store';
import { AppError,validateRsvp } from '@/lib/rsvp-domain';
import { wedding } from '@/lib/wedding-config';
export const dynamic='force-dynamic';
type Context={params:Promise<{id:string}>};
export async function PATCH(request:Request,context:Context){return handle(async()=>{await requireAdmin();const body=await readBody(request),{id}=await context.params;const [rows]=await database().execute<Row[]>('SELECT * FROM rsvps WHERE id=? LIMIT 1',[id]);const row=rows[0];if(!row)throw new AppError('回执不存在。',404);return json({record:await updateRecord(row,validateRsvp(body,wedding.rsvp),body.status)});});}
export async function DELETE(request:Request,context:Context){return handle(async()=>{await requireAdmin();checkOrigin(request);const {id}=await context.params;await database().execute('DELETE FROM rsvps WHERE id=?',[id]);return json({ok:true});});}
