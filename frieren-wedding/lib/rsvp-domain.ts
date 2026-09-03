export type RsvpInput = { name: string; phone: string; guests: number; needsStay: boolean; stayGuests: number; checkIn: string | null; checkOut: string | null; notes: string; consent: boolean };
export type RsvpRecord = RsvpInput & { id: string; status: 'pending' | 'confirmed' | 'none'; createdAt: string; updatedAt: string };
export class AppError extends Error { status:number; constructor(message: string, status = 400) { super(message); this.status=status; } }
export function validDate(value: unknown): value is string { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10) === value; }
export function validateRsvp(raw: unknown, range: { stayMin: string | null; stayMax: string | null }): RsvpInput {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new AppError('请完整填写回执。');
  const x = raw as Record<string, unknown>;
  const name = typeof x.name === 'string' ? x.name.trim() : '';
  const phone = typeof x.phone === 'string' ? x.phone.replace(/[\s()-]/g,'') : '';
  const notes = typeof x.notes === 'string' ? x.notes.trim() : '';
  if (!name || name.length > 40 || /[\u0000-\u001f]/.test(name)) throw new AppError('姓名需为1至40个字符。');
  if (!/^\+?[0-9]{7,15}$/.test(phone)) throw new AppError('请填写有效的联系电话。');
  if (!Number.isInteger(x.guests) || (x.guests as number)<1 || (x.guests as number)>50) throw new AppError('出席人数需为1至50人；更大的同行团体请联系新人。');
  if (typeof x.needsStay !== 'boolean') throw new AppError('请选择是否需要住宿。');
  if (x.consent !== true) throw new AppError('请确认信息仅用于婚礼联络与住宿安排。');
  if (notes.length>500) throw new AppError('备注请控制在500字以内。');
  let stayGuests = 0; let checkIn: string | null = null; let checkOut: string | null = null;
  if(x.needsStay) {
    if(!Number.isInteger(x.stayGuests)||(x.stayGuests as number)<1||(x.stayGuests as number)>(x.guests as number)) throw new AppError('住宿人数需至少1人，且不能超过出席人数。');
    if(!validDate(x.checkIn)||!validDate(x.checkOut)||x.checkOut<=x.checkIn) throw new AppError('请填写有效日期，离店日期必须晚于入住日期。');
    if((range.stayMin&&x.checkIn<range.stayMin)||(range.stayMax&&x.checkOut>range.stayMax)) throw new AppError('入住与离店日期超出可登记范围。');
    stayGuests = x.stayGuests as number; checkIn=x.checkIn; checkOut=x.checkOut;
  }
  return { name, phone, guests:x.guests as number, needsStay:x.needsStay, stayGuests, checkIn, checkOut, notes, consent:true };
}
export function dayMessage(date: string, now = new Date()): string {
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const remaining=Math.round((Date.parse(date+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000);
  return remaining>0?`距离相聚，还有 ${remaining} 天`:remaining===0?'就是今天，期待与你相见':'感谢你，成为这段旅程的一部分';
}
export function rsvpOpen(config:{enabled:boolean;deadline:string|null},now=new Date()) { return config.enabled && (!config.deadline || now.getTime()<=Date.parse(config.deadline)); }
export function csvCell(value:unknown) { let s=String(value??''); if(/^[\s\uFEFF]*[=+@-]/.test(s)||/^[\t\r\n]/.test(s)) s="'"+s; return '"'+s.replaceAll('"','""')+'"'; }
export function statistics(records:RsvpRecord[]) { return { groups:records.length,guests:records.reduce((n,r)=>n+r.guests,0),stayGuests:records.reduce((n,r)=>n+r.stayGuests,0),nights:records.reduce((n,r)=>n+(r.checkIn&&r.checkOut?(Date.parse(r.checkOut)-Date.parse(r.checkIn))/86400000*r.stayGuests:0),0) }; }
