from pathlib import Path


path = Path(r"D:\workspace\wedding\frieren-wedding\app\page.tsx")
text = path.read_text(encoding="utf-8")
text = text.replace("05 / FIND YOUR WAY", "06 / FIND YOUR WAY")
text = text.replace("06 / BEFORE YOU SET OUT", "07 / BEFORE YOU SET OUT")
text = text.replace("07 / RSVP, WITH LOVE", "08 / RSVP, WITH LOVE")
marker = '    <section className="venue-section section" id="venue">'
section = '''    <section className="ensemble-section section" id="companions"><div className="ensemble-heading reveal"><p className="eyebrow">05 / OUR DEAREST COMPANIONS</p><h2>{w.copy.sections.companions}</h2><p>在想象的旅途中，熟悉的伙伴也为这一天停下脚步。</p></div><figure className="ensemble-figure reveal"><img src={w.images.companions} width={1536} height={1024} loading="lazy" alt="芙莉莲、辛美尔、海塔、艾泽、菲伦与修塔尔克的蓝白庆典群像"/><figcaption><span>芙莉莲</span><span>辛美尔</span><span>海塔</span><span>艾泽</span><span>菲伦</span><span>修塔尔克</span></figcaption></figure></section>\n'''
if marker not in text:
    raise SystemExit("venue marker not found")
text = text.replace(marker, section + marker)
path.write_text(text, encoding="utf-8")
