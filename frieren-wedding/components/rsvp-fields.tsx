'use client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { wedding } from '@/lib/wedding-config';
export type Draft={name:string;phone:string;guests:string;needsStay:boolean|null;stayGuests:string;checkIn:string;checkOut:string;notes:string};
export const emptyDraft:Draft={name:'',phone:'',guests:'1',needsStay:null,stayGuests:'1',checkIn:'',checkOut:'',notes:''};
export function draftPayload(d:Draft){return {...d,guests:Number(d.guests),stayGuests:d.needsStay?Number(d.stayGuests):0,checkIn:d.needsStay?d.checkIn:null,checkOut:d.needsStay?d.checkOut:null};}
export function formPayload(d:Draft,form:HTMLFormElement){const data=new FormData(form);return {...draftPayload(d),checkIn:d.needsStay?String(data.get('checkIn')||d.checkIn):null,checkOut:d.needsStay?String(data.get('checkOut')||d.checkOut):null};}
export function RsvpFields({value,onChange,disabled=false}:{value:Draft;onChange:(value:Draft)=>void;disabled?:boolean}){
  const change=(key:keyof Draft,v:string|boolean)=>onChange({...value,[key]:v});
  return <fieldset disabled={disabled} className="rsvp-fields"><div className="form-grid">
    <label>联系人姓名 <span>*</span><Input autoComplete="name" value={value.name} onChange={e=>change('name',e.target.value)} maxLength={40} required placeholder="怎么称呼你"/></label>
    <label>联系电话 <span>*</span><Input type="tel" autoComplete="tel" value={value.phone} onChange={e=>change('phone',e.target.value)} maxLength={24} required placeholder="方便我们与你联系"/></label>
    <label className="full-field">出席总人数 <span>*</span><Input type="number" inputMode="numeric" value={value.guests} onChange={e=>change('guests',e.target.value)} min={1} max={50} required/><small>包含填写人及同行儿童，每个家庭或同行小组填写一份。</small></label>
  </div><div className="stay-choice"><p id="stay-question">是否需要住宿 <span>*</span></p><div role="group" aria-labelledby="stay-question"><Button type="button" variant={value.needsStay===false?'default':'outline'} aria-pressed={value.needsStay===false} onClick={()=>change('needsStay',false)}>无需住宿</Button><Button type="button" variant={value.needsStay===true?'default':'outline'} aria-pressed={value.needsStay===true} onClick={()=>change('needsStay',true)}>需要安排住宿</Button></div></div>
    {value.needsStay&&<div className="stay-details"><p className="muted">先登记你的需求，具体住宿安排由新人后续联系确认。</p><div className="form-grid"><label className="full-field">住宿人数 <span>*</span><Input type="number" inputMode="numeric" min={1} max={Number(value.guests)||1} value={value.stayGuests} onChange={e=>change('stayGuests',e.target.value)} required/></label><label>入住日期 <span>*</span><Input type="date" name="checkIn" onInput={e=>change('checkIn',e.currentTarget.value)} min={wedding.rsvp.stayMin||undefined} max={wedding.rsvp.stayMax||undefined} value={value.checkIn} onChange={e=>change('checkIn',e.target.value)} required/></label><label>离店日期 <span>*</span><Input type="date" name="checkOut" onInput={e=>change('checkOut',e.currentTarget.value)} min={value.checkIn||wedding.rsvp.stayMin||undefined} max={wedding.rsvp.stayMax||undefined} value={value.checkOut} onChange={e=>change('checkOut',e.target.value)} required/></label></div></div>}
    <label className="notes-label">想补充的话 <span className="optional">选填</span><Textarea value={value.notes} onChange={e=>change('notes',e.target.value)} maxLength={500} placeholder="住宿需求或其他需要我们留意的事情…"/><small>{value.notes.length}/500</small></label>
  </fieldset>;
}
