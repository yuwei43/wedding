from pathlib import Path
from shutil import copy2

from PIL import Image


source = Path(r"C:\Users\Administrator\Desktop\wedding_picture")
output = Path(r"D:\workspace\wedding\.reference-images")
output.mkdir(exist_ok=True)

files = [
    source / "7117904b6af906a3ff4be0f87dcaea03480795168.jpg@1192w.avif",
    source / "d48bd5615e039131454c62cf99204ac4480795168.jpg@1192w.avif",
]

for index, path in enumerate(files, start=1):
    Image.open(path).convert("RGB").save(output / f"user-{index}.jpg", quality=92)

assets = Path(r"D:\workspace\wedding\frieren-wedding\public\images")
copy2(output / "user-1.jpg", assets / "blue-crown.jpg")
copy2(output / "user-2.jpg", assets / "blue-flowers.jpg")
copy2(source / "db44cafcec1d220d3e6deec9456c53f4480795168.jpg", assets / "blue-road.jpg")
copy2(Path(r"C:\Users\Administrator\.codex\generated_images\01a05806-d860-7bc0-a13a-d3b445503a10\exec-6fd92665-f1bf-47d7-b180-a09acaf963df.png"), assets.parent / "og-blue.png")

print("converted")
