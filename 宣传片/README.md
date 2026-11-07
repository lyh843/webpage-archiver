# 宣传片

webpage-archiver 的 45 秒介绍片，白板手绘风格，结果先行：先给你看 Markdown、PDF、离线 HTML 三份成品，再倒叙一条命令怎么把它们做出来。

## 文件

- [宣传片 1080p.mp4](<网页归档工具宣传片/宣传片 1080p.mp4>)：1920×1080、60fps、45.06 秒、24.3 MB
- [封面.jpg](<网页归档工具宣传片/封面.jpg>)
- [需求确认.md](<网页归档工具宣传片/需求确认.md>)：拍板的规格、风格、分镜和交付记录
- [调研笔记.md](<网页归档工具宣传片/调研笔记.md>)：产品事实、素材来源和制作记录
- `网页归档工具宣传片/工程/`：Remotion 工程与全部素材；`node_modules/`、`out/` 不提交

## 规格与检查

- 视频：H.264，1920×1080，60fps，45.06 秒，AAC 音轨
- 响度：-13.8 LUFS，真峰值 -0.8 dBFS
- 自动检查：渲染日志无报错，`check_video.py` 0 ERROR，8 个场景抽帧已人工查看
- 声音：Mixkit *Just Keep Walking*（ID 963），无旁白，大字幕叙事
- Zotero：片中只做一句能力提示，没有执行实际写入

## 画面里的真实素材

演示文章是 Lilian Weng 的 [LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)。所有页面、PDF、Markdown、文件清单和校验结果，都是用本仓库的 `scripts/archive_web.py` 现场归档后截的，不是重绘的假 UI。归档结果包含 13 张图片、16 处数学公式和 21 页 PDF，离线检查为 0 个外部请求、0 个 JS 报错、0 个公式报错。

## 重新渲染

```bash
cd 网页归档工具宣传片/工程
npm install

# Python 依赖建议放在独立虚拟环境里
python3 -m venv /tmp/opencode/promo-venv
/tmp/opencode/promo-venv/bin/pip install -r requirements.txt
export PATH=/tmp/opencode/promo-venv/bin:$PATH

npm run mix
npm run render:1080
```

`audio-src/music.mp3` 已保留，重新混音不需要再下载。改文案或时间点后，先跑 `npm run lint && npm run fonts && npm run mix && npm run check:assets`，再用 `node scripts/stills.mjs --scenes` 看静帧。

## 版权与署名

- 演示文章截图仅用于展示工具输出，画面保留了原文 URL。
- 配乐来自 Mixkit 免费曲库，曲目 *Just Keep Walking*（ID 963）。
- 标题字体为 ZCOOL QingKe HuangYou，SIL Open Font License 1.1，许可证见 `网页归档工具宣传片/工程/fonts-src/OFL.txt`。
- 成片可随本仓库一起分发；如果用于商业投放，请按 Mixkit 的许可条款自行复核。
