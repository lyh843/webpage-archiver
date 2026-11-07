"""webpage-archiver 宣传片 cue sheet：白板手绘 + 真实截图，无旁白。

python3 scripts/mix.py            生成混音
python3 scripts/mix.py --env      生成后打印响度曲线
"""
import os
import sys

from audiolib import ROOT, Mix, build_in, flick, load, room_tone, seg, sub_boom, timing

TM = timing()
DUR = TM["duration"]
mix = Mix(DUR)

# ---------- 音乐：从开场就有轻底，10.33 秒打开到全频作为爆发 ----------
music = load("music.mp3")
body = seg(music, 0, DUR)
body = build_in(body, TM["drop"], hp_hz=350, g0=0.8, g1=1.0)
mix.place(body, 0.0, fade_in=0.6, fade_out=2.2, tag="music")

# 极轻的环境底噪，填补开场贴纸段
mix.place(room_tone(DUR), 0.0, fade_in=1.0, fade_out=1.0)

# ---------- 开场：三张成品贴到白板上 ----------
for at, gain in [(0.62, 0.36), (1.42, 0.34), (2.22, 0.38)]:
    mix.place(flick(0.09, 0.55), at, gain=gain, tag="sfx")

# ---------- 转折：原页面被划掉、纸张撕开 ----------
for at in [6.25, 7.55, 8.85]:
    mix.place(flick(0.17, 0.6), at, gain=0.42, tag="sfx")
mix.place(sub_boom(2.2, 70, 34, 4.8), 5.02, gain=0.22)

# ---------- 爆发：产品登场 ----------
mix.place(sub_boom(), TM["drop"], gain=0.82)
for at in [11.05, 11.24, 11.43, 11.62]:
    mix.place(flick(0.055, 0.5), at, gain=0.18, tag="sfx")

# ---------- 场景切换的轻冲击 ----------
for at in [15.05, 22.57, 27.59, 32.6, 37.62]:
    mix.place(sub_boom(0.9, 86, 46, 7), at, gain=0.26)

# ---------- PDF 翻页 ----------
for at in [23.65, 25.05, 26.25]:
    mix.place(flick(0.14, 0.55), at, gain=0.42, tag="sfx")

# ---------- Markdown / 校验面板 ----------
for at in [27.8, 28.65, 29.5, 30.35]:
    mix.place(flick(0.07, 0.5), at, gain=0.23, tag="sfx")

# ---------- 蒙太奇：每 0.62 秒切一刀 ----------
for i in range(1, 8):
    mix.place(flick(0.05, 0.45), 32.6 + i * 0.62, gain=0.2, tag="sfx")

# ---------- 片尾盖章 ----------
mix.place(sub_boom(2.4, 78, 36, 5.2), 43.1, gain=0.55)
mix.place(flick(0.12, 0.5), 43.1, gain=0.35, tag="sfx")

mix.vo_margin()
mix.master()

if "--env" in sys.argv:
    from audiolib import envelope

    envelope()
