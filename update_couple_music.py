from pathlib import Path


root = Path(r"D:\workspace\wedding\frieren-wedding")

path = root / "components" / "invitation-interactions.tsx"
text = path.read_text(encoding="utf-8")
text = text.replace(
    "setOpened(true);document.getElementById('letter')",
    "setOpened(true);window.dispatchEvent(new Event('wedding-music-start'));document.getElementById('letter')",
)
text = text.replace(
    "useEffect(()=>{if(audio.current)audio.current.volume=Math.min(1,Math.max(0,wedding.music.volume));},[]);if(!wedding.music.enabled",
    "useEffect(()=>{if(audio.current)audio.current.volume=Math.min(1,Math.max(0,wedding.music.volume));const start=()=>{audio.current?.play().catch(()=>setError('点击音乐按钮即可播放'));};window.addEventListener('wedding-music-start',start);if(wedding.music.startOnFirstInteraction)document.addEventListener('pointerdown',start,{once:true,capture:true});return()=>{window.removeEventListener('wedding-music-start',start);document.removeEventListener('pointerdown',start,{capture:true});};},[]);if(!wedding.music.enabled",
)
path.write_text(text, encoding="utf-8")

path = root / "components" / "welcome-letter.tsx"
text = path.read_text(encoding="utf-8").replace(
    "花草与旅行手记旁，一封带绿色星光封蜡的邀请信",
    "蓝白花草与旅行手记旁，一封带蓝色星光封蜡的邀请信",
)
path.write_text(text, encoding="utf-8")

path = root / "app" / "page.tsx"
text = path.read_text(encoding="utf-8")
text = text.replace("芙莉莲、菲伦和修塔尔克同行于花海与远方城镇之间", "芙莉莲与辛美尔并肩走在蓝白花海与远方城镇之间")
text = text.replace("原创幻想庭园庆典插画，灯串与花草围绕着户外长桌", "芙莉莲与辛美尔站在蓝白花园庆典的花拱门旁")
text = text.replace("芙莉莲与旅伴在灯火旁仰望星空的原创插画", "芙莉莲与辛美尔坐在灯火旁仰望星空的原创插画")
path.write_text(text, encoding="utf-8")
