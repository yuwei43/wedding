import { database,handle,requireAdmin } from '@/lib/server';
import { csvCell } from '@/lib/rsvp-domain';
import type { Row } from '@/lib/rsvp-store';
export const dynamic='force-dynamic';
export async function GET(){return handle(async()=>{await requireAdmin();const [results]=await database().execute<Row[]>('SELECT * FROM rsvps ORDER BY created_at DESC');const status={pending:'待联系',confirmed:'已确认',none:'无需安排'};const rows:unknown[][]=[['姓名','联系电话','出席人数','需要住宿','住宿人数','入住日期','离店日期','备注','安排状态','登记时间'],...results.map(r=>[r.name,r.phone,r.guests,r.needs_stay?'是':'否',r.stay_guests,r.check_in,r.check_out,r.notes,status[r.status],r.created_at])];return new Response('\uFEFF'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="wedding-guests.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});});}
