from pathlib import Path

path = Path(r"D:\workspace\wedding\frieren-wedding\app\page.tsx")
text = path.read_text(encoding="utf-8")
text = text.replace("03 / A DAY TO REMEMBER", "04 / A DAY TO REMEMBER")
text = text.replace("04 / FIND YOUR WAY", "05 / FIND YOUR WAY")
text = text.replace("05 / RSVP, WITH LOVE", "07 / RSVP, WITH LOVE")
needle = '    <section className="rsvp-section section" id="rsvp">'
guide = '''    <section className="guest-guide section" id="guide"><div className="guide-heading reveal"><p className="eyebrow">06 / BEFORE YOU SET OUT</p><h2>{w.copy.sections.guide}</h2><p className="muted">把赴约前可能想知道的事，先写在这里。</p></div><div className="guide-grid">{w.guestGuide.map((item,i)=>{const Icon=[Clock3,Users,BedDouble][i%3];return <article className="guide-card reveal" key={item.question}><Icon size={21}/><span>0{i+1}</span><h3>{item.question}</h3><p>{item.answer}</p></article>})}</div></section>\n'''
if needle not in text:
    raise SystemExit("RSVP insertion point not found")
text = text.replace(needle, guide + needle)
path.write_text(text, encoding="utf-8")
