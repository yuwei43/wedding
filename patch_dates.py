from pathlib import Path
root=Path(__file__).parent/'frieren-wedding'
p=root/'components/rsvp-fields.tsx';s=p.read_text(encoding='utf-8')
s=s.replace('<Input type="date" min={wedding.rsvp.stayMin', '<Input type="date" name="checkIn" onInput={e=>change(\'checkIn\',e.currentTarget.value)} min={wedding.rsvp.stayMin')
s=s.replace('<Input type="date" min={value.checkIn', '<Input type="date" name="checkOut" onInput={e=>change(\'checkOut\',e.currentTarget.value)} min={value.checkIn')
p.write_text(s,encoding='utf-8')
for file in ['components/rsvp-form.tsx','components/admin-dashboard.tsx']:
 p=root/file;s=p.read_text(encoding='utf-8');s=s.replace('draftPayload,','formPayload,');s=s.replace('draftPayload(draft)','formPayload(draft,e.currentTarget as HTMLFormElement)');p.write_text(s,encoding='utf-8')
