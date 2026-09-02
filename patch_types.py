from pathlib import Path
root=Path(__file__).parent/'frieren-wedding'
for file in ['components/rsvp-form.tsx','components/admin-dashboard.tsx']:
 p=root/file
 s=p.read_text(encoding='utf-8')
 s=s.replace('await r.json()',"await r.json() as {error:string;record:RsvpRecord;records:RsvpRecord[]}")
 s=s.replace('await response.json()',"await response.json() as {error:string;record:RsvpRecord}")
 p.write_text(s,encoding='utf-8')
