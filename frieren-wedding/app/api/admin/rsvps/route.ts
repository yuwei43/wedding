import { database,handle,json,requireAdmin } from '@/lib/server';
import { publicRecord,type Row } from '@/lib/rsvp-store';
import { statistics } from '@/lib/rsvp-domain';
export const dynamic='force-dynamic';
export async function GET(){return handle(async()=>{await requireAdmin();const [rows]=await database().execute<Row[]>('SELECT * FROM rsvps ORDER BY created_at DESC');const records=rows.map(publicRecord);return json({records,statistics:statistics(records)});});}
