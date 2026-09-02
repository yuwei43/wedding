from pathlib import Path

from PIL import Image


generated = Path(r"C:\Users\Administrator\.codex\generated_images\01a05806-d860-7bc0-a13a-d3b445503a10")
assets = Path(r"D:\workspace\wedding\frieren-wedding\public\images")

sources = {
    "companions-blue.webp": generated / "exec-9419aa2f-9002-4011-b93f-e70105562bef.png",
    "celebration-blue.webp": generated / "exec-a1108959-97a8-4da0-a51f-e7ea0adfcc6e.png",
    "envelope-blue.webp": generated / "exec-5eb8cff9-c2ef-412e-94d7-095522b5c244.png",
    "frieren-himmel-hero.webp": generated / "exec-2a60ecf2-1f4d-4665-8425-b43cb6a36ccd.png",
    "frieren-himmel-celebration.webp": generated / "exec-970ab629-b828-473d-ad96-eceaae3174cf.png",
    "frieren-himmel-night.webp": generated / "exec-a0406ab7-a7b3-4e8e-96e3-c3b83e873d9f.png",
    "companions-ensemble.webp": generated / "exec-06b6313e-676e-4086-ac04-5859b2366124.png",
}

for name, source in sources.items():
    image = Image.open(source).convert("RGB")
    image.save(assets / name, "WEBP", quality=88, method=6)
    print(name, (assets / name).stat().st_size)

share = Image.open(generated / "exec-94926d54-28af-4c1c-af00-03f22f4a57fc.png").convert("RGB")
share.save(assets.parent / "og-frieren-himmel.webp", "WEBP", quality=90, method=6)
print("og-frieren-himmel.webp", (assets.parent / "og-frieren-himmel.webp").stat().st_size)
