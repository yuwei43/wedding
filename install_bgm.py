from pathlib import Path
from shutil import copy2


source = Path(r"D:\CloudMusic\Evan Call - Journey of a Lifetime ~ Frieren Main Theme.mp3")
target = Path(r"D:\workspace\wedding\frieren-wedding\public\audio\frieren-main-theme.mp3")
target.parent.mkdir(parents=True, exist_ok=True)
copy2(source, target)
try:
    from mutagen.mp3 import MP3
    info = MP3(target).info
    print(f"{target.name}: {target.stat().st_size / 1024 / 1024:.2f} MiB, {info.length:.0f}s, {info.bitrate // 1000}kbps")
except ImportError:
    print(f"{target.name}: {target.stat().st_size / 1024 / 1024:.2f} MiB")
