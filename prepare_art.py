from PIL import Image
from pathlib import Path
root=Path(__file__).parent/'frieren-wedding'/'public'/'images'
root.mkdir(parents=True,exist_ok=True)
im=Image.open(r'C:\Users\Administrator\.codex\generated_images\01a0581a-87ac-7951-a31f-f164643b0c22\exec-8c214bd7-f226-4e54-8392-7af3ea872177.png').convert('RGB')
im.save(root/'companions.webp',quality=84,method=6)
print((root/'companions.webp').stat().st_size)
for name,src in {
 'envelope':r'C:\Users\Administrator\.codex\generated_images\01a0581a-87ac-7951-a31f-f164643b0c22\exec-c251c0a8-fb0c-4650-8798-114522d31946.png',
 'celebration':r'C:\Users\Administrator\.codex\generated_images\01a0581a-87ac-7951-a31f-f164643b0c22\exec-0c9404fa-adb0-40b4-959e-94f26f8a322e.png',
 'night':r'C:\Users\Administrator\.codex\generated_images\01a05826-b535-7452-abdb-5aca9d37090f\exec-54871472-1714-4c76-94b2-5caf7cfab3b4.png',
}.items():
 Image.open(src).convert('RGB').save(root/(name+'.webp'),quality=84,method=6)
 print(name,(root/(name+'.webp')).stat().st_size)
Image.open(r'C:\Users\Administrator\.codex\generated_images\01a0582b-0ce8-7233-8744-feac62bdbc32\exec-f6ee54be-cb12-4e00-88ef-348d2a128f3c.png').convert('RGB').resize((1200,630)).save(root.parent/'og.png',optimize=True)
