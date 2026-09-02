import sys, subprocess, pathlib
sys.path.insert(0,r'D:\workspace\wedding\.video-tools')
import imageio_ffmpeg
src=r'C:\Users\Administrator\xwechat_files\wxid_e88eookc7w7521_ff3b\temp\RWTemp\2026-08\9e20f478899dc29eb19741386f9343c8\45547a50f2195d387a9b355920d307a1.mp4'
out=pathlib.Path(r'D:\workspace\wedding\.video-frames')
out.mkdir(exist_ok=True)
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-i',src,'-vf','fps=1/5,scale=320:-1,tile=5x3','-frames:v','1',str(out/'contact.jpg'),'-y'],check=True)
