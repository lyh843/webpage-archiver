---
name: webpage-archiver
description: >-
  将网页链接的完整原文转换为本地 Markdown 和保留图文排版的 PDF，下载原图、保留图注/表格/公式/附录/参考文献，并在项目规则及用户权限允许时导入指定 Zotero 分类。用于“网页保存为 md/pdf”“把文章收进 Zotero”“链接转 PDF 并加入某分类”等请求；不是摘要、翻译或论文深读。
---

# webpage-archiver

仓库简称：**ETM**。安装目录与调用 ID：`webpage-archiver`。

默认交付 **原文 Markdown + PDF + 离线 HTML + 本地图片 + 导入记录**。保留原文语言和内容，不擅自改写、翻译或执行 `paper-reading`。只创建 skill 时不自动归档或导入。

## 1. 明确范围并检查规则

- 输入：网页 URL、目标 Zotero 分类。用户说“RSI”等短名时，通过 MCP 确认完整路径、key，存在重名时澄清。
- 先读适用的 `AGENTS.md`。**skill 不赋予额外权限，不覆盖更高优先级规则。** 仅在项目规则及用户授权范围内读写 Zotero，并遵循查重、核验和破坏性操作确认要求。若项目限定只读，仍可转换文件、读取和查重，但必须报告“未导入”；不能自行改规则、改数据库或借插件绕过。
- 区分项目规则与技术权限：用户请求导入表示任务意图，但不保证当前规则允许或 MCP 可写。规则允许后再检查写能力，必要时让用户在 Zotero 对话框授权；不要索要或打印 API 密钥。
- 输出到用户指定或项目规则映射的**新目录**。先确认分类与本地目录的映射，不假定所有项目都使用相同的顶层分类或路径。不要覆盖已有不明来源文件。

## 2. 确认原文与元数据

1. 获取最终 URL、完整 HTML，核对标题、作者、发布日期；未知值留空，不把归档日期冒充发布日期。
2. 确认所有正文、图注、附录和参考文献都在获取内容中。不要拿 Web Fetch 的截断预览冒充全文；不要绕过付费墙或访问限制。
3. 找正文容器（优先 `article`；必要时指定 CSS selector），剔除导航、跟踪脚本和相关推荐，不删正文中的章节、引用或重要边栏。
4. 动态网页、登录页、canvas 图、复杂交互或提取范围不确定时先检查浏览器。辅助脚本主要处理可直接取得完整 HTML 的文章；不满足时如实报告，不把 HTML 错误页当文章。

## 3. 生成归档

先阅读 [归档与导入检查表](references/workflow.md)。支持脚本位于本 skill 的 `scripts/`，不依赖本次会话的 `/tmp/opencode` 文件。

依赖见 `requirements.txt`。优先使用已有可用 Python 环境和 Chromium；缺失时建立独立虚拟环境，先说明需要安装的依赖，不改全局 Python：

```bash
python -m venv /tmp/opencode/webpage-archiver-venv
/tmp/opencode/webpage-archiver-venv/bin/pip install -r <skill-dir>/requirements.txt
/tmp/opencode/webpage-archiver-venv/bin/python <skill-dir>/scripts/archive_web.py \
  'https://example.org/article/' --output '<new-output-directory>'
```

自动范围选择不准时使用 `--selector 'main .article-body'`。用 `--title`、`--author`、`--date` 补充**已核实**的信息；使用 `--chromium` 指定实际发现的浏览器路径。脚本目录参数必须替换为实际 skill 安装路径，不把尖括号占位符原样运行。

- 图片与 CSS/字体依赖下载到 `assets/`；普通链接保留在线指向，正文显示资源必须离线可用。
- 保留原站样式，PDF 只做 A4 分页适配，不承诺网页与 PDF 像素级一致。
- MathJax 数学公式用 SVG 冻结；Markdown 保留 TeX。检查公式报错、上下标、矩阵和长公式，不能只看正文存在。
- 保存 `source.html`、来源与哈希清单、`verification.json`、`metadata.csl.json`、`citation.bib`。`source.html` 是溯源原件，可能仍含原站脚本；交付阅读入口使用安全化的 `index.html` 或 PDF。

## 4. 校验后再导入

必须检查：标题/作者/日期、正文首尾、章节与参考文献覆盖、图片数量与加载结果、公式、表格；抽查 PDF 首页、图表页、公式页、末页。断网打开离线 HTML，确认没有外部资源请求。结构检查通过不等于人工校验通过。

项目规则允许写入时：

1. 用 Zotero MCP 按规范 URL/标题查重，并检查候选条目的元数据及附件；独立 PDF 也可能标题仅为 `article`，不要只查主条目标题就认定不存在。必要时分页列举目标分类，比较原文 URL 和 PDF SHA-256。
2. 读取 `zotero_write_capabilities`。若仅缺本地授权，先提醒用户切到 Zotero，再调用授权工具；无可写后端时如实停在待导入。
3. 优先把 `metadata.csl.json` 作为 CSL JSON 导入目标分类（`source_type='csl_json'`、`attach_mode='none'`），避免裸 URL 产生无元数据条目。尽可能复用已匹配的主条目，不重复创建。
4. 对已确认的**主条目 key**，用 `zotero_attach_file` 附加 `article.pdf`。不要拿附件 key 当主条目 key；已有独立 PDF 时先取得用户对整理为主条目的明确同意，不擅自移动或重建。
5. 查询主条目元数据、分类成员关系和子附件，确认写入真的成功；记录主条目 key、附件 key、完整分类路径和导入/跳过/失败原因。部分成功时保留已创建 key，重试前重新查重。
6. Markdown 和 `assets/` 默认留本地，不强行作为不受支持的附件上传；只有用户另行要求且接口支持时再处理。

工具通过运行时发现，按实际 schema 调用，不把示例工具名当作永远可用的接口。具体 MCP 参数示例见检查表。

## 5. 交付

用 `browser.preview` 展示 PDF（若该工具可用），提供清晰文件链接。分别报告：**本地转换状态 / Zotero 导入状态 / 未通过的检查与限制**。只生成本地文件时，绝不能说“已放入 Zotero”。

## 维护与测试

在已安装 `requirements.txt` 的 Python 环境运行 `python -m unittest discover -s <skill-dir>/tests -v`。集成测试只启动临时本地网页并调用 Chromium，不读写 Zotero，不调用翻译 API；没有 Chromium 时会明确跳过 PDF 集成测试，不能把跳过说成通过。
