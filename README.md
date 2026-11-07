# webpage-archiver（ETM）

> 把网页完整留在本地：Markdown、PDF、离线 HTML，需要时再收进 Zotero。

这是 `webpage-archiver` skill 的介绍与分发仓库，仓库名 **ETM**。里面包含 agent 使用的 skill 说明、归档脚本、工作流检查清单和测试。

## 它解决什么问题

网页文章看起来随时能打开，其实很脆弱。链接会失效，图片会被撤下，公式依赖 CDN，站点改版之后排版也面目全非。这个 skill 把正文、图片、图注、表格、公式和参考文献一起保存下来，生成可以离线阅读的 Markdown、PDF 和 HTML。

它不做摘要、翻译，也不做论文精读。原文是什么样，归档就尽量保留成什么样。如果你想要的是"读懂一篇论文"，那是另一个 skill 该做的事。

## 工作方式

归档和入库是分开的。

Python 脚本 `scripts/archive_web.py` 只负责抓取网页、下载资源、生成文件，全程不碰 Zotero。导入则由 agent 按照 [SKILL.md](SKILL.md) 的步骤，通过 Zotero MCP 完成：先确认分类和查重，再检查写权限，然后创建条目、附加 PDF，最后回读核验结果。

这样分开有两个好处：没有 Zotero 也能正常归档；项目规则只读时，仍然可以把文章存到本地，只是不写入文献库。

## 安装

把 `SKILL.md`、`requirements.txt`、`references/`、`scripts/` 和 `tests/` 一起复制到项目的 skill 目录，保持相对路径不变：

```text
<你的项目>/.opencode/skills/webpage-archiver/
```

在仓库根目录执行下面的命令也可以。目标位置已有同名 skill 时，先比较内容，不要直接覆盖：

```bash
# 把 /path/to/your-project 换成真实项目路径
DEST=/path/to/your-project/.opencode/skills/webpage-archiver
if [ -e "$DEST" ]; then
  echo "目标已存在，请先检查：$DEST"
else
  mkdir -p "$DEST"
  cp -R SKILL.md requirements.txt references scripts tests "$DEST/"
fi
```

如果希望多个项目共用，可以装到 `~/.config/opencode/skills/webpage-archiver/`。要注意，克隆这个仓库本身并不会让 OpenCode 自动发现根目录的 `SKILL.md`，必须放到上面这些位置之一。OpenCode 的 skill 机制见[官方文档](https://opencode.ai/v2/docs/skills)。

运行环境需要 Python 3、[requirements.txt](requirements.txt) 里的依赖，以及能被 Playwright 启动的 Chromium：

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

系统里已经装了 Chromium 时，脚本会自动查找 `chromium`、`chromium-browser` 或 `google-chrome`，也可以用 `--chromium` 手动指定。没有的话，装一个 Playwright 版本：

```bash
.venv/bin/python -m playwright install chromium
```

少数 Linux 环境还需要管理员补装浏览器依赖，这部分 skill 不会替你静默处理。Zotero 导入另需可用的 MCP、目标分类的访问权限和写入授权，密钥不要写进仓库。

## 使用

### 交给 agent

安装好 skill、连上 Zotero MCP 之后，可以直接说：

> 使用 webpage-archiver，把 https://example.org/article/ 的完整原文保存为 Markdown、PDF 和离线 HTML，输出到我指定的新目录；核实 Zotero 中“研究资料/示例分类”的分类路径，查重后在规则和权限允许时导入。不要摘要或翻译，完成后分别报告本地转换和 Zotero 导入的状态。

记得把示例 URL 和分类换成真实值。agent 会先读项目规则、确认文章范围和分类映射，生成后再人工检查正文首尾、图表、公式和 PDF，确认没问题才执行导入。只是安装 skill 不会触发任何归档或导入。

### 直接跑脚本

只想把网页存到本地时，在仓库根目录执行：

```bash
.venv/bin/python scripts/archive_web.py \
  'https://example.org/article/' \
  --output './archives/my-article'
```

输出目录必须是尚不存在的新目录。其他参数都是可选的：

| 参数 | 用途 |
| --- | --- |
| `--selector 'main .article-body'` | 指定唯一且覆盖完整正文的 CSS 容器；默认选文本最长的 `article` |
| `--title '文章标题'` | 补充已经核实过的标题 |
| `--author '作者姓名'` | 补充已经核实过的作者 |
| `--date '2026-01-01'` | 补充已经核实过的发布日期，不要拿归档日期顶替 |
| `--chromium '/path/to/chromium'` | 指定浏览器可执行文件 |

脚本跑通只说明本地文件生成了，不代表已经导入 Zotero，也不代表人工检查已经过关。失败时可能留下部分文件，重试请换一个新目录，不要直接删掉或覆盖原有内容。

## 输出内容

```text
<output>/
├── article.md             # 原文 Markdown
├── article.pdf            # 分页 PDF
├── index.html             # 离线阅读入口
├── assets/                # 本地图片及样式/字体依赖
├── preview.png            # 页面预览截图
├── source.html            # 原始 HTML，仅作溯源
├── metadata.csl.json      # Zotero 导入元数据
├── citation.bib           # BibTeX
├── manifest.json          # 来源、资源哈希及归档时间
├── verification.json      # 结构、离线资源和 PDF 检查结果
└── import-status.json     # agent 执行或阻塞导入后记录；脚本不生成
```

离线 HTML 不是单文件，需要和同目录的 `assets/` 一起保留。日常阅读用 `index.html` 或 PDF 就够了；`source.html` 是保留下来的原始页面，可能还带着原站脚本，不要拿它当安全的阅读入口。

## 一些限制

这个 skill 主要面向能直接拿到完整 HTML 的静态文章。登录页、付费墙、动态渲染的正文、复杂交互和 canvas 内容可能需要人工介入，而且它不会绕过任何访问限制。

“保留格式”指的是尽量保住正文结构、图文关系、样式和数学，不承诺所有网页都能无损转换，PDF 也会重新分页。`verification.json` 里的状态是 `generated-needs-manual-review`，自动检查代替不了人工逐项核对。

写入 Zotero 时，先查重再导入，写完回读确认。不要直接改 Zotero 的 SQLite，也不要绕过项目的只读约束；删除或整理已有条目需要另外确认。API 密钥、个人文献库和没有公开传播权的全文都不应该提交到仓库。默认的归档目录已经写进 `.gitignore`，自定义输出路径仍要自己留意。

## 测试

装好依赖后，在仓库根目录运行：

```bash
.venv/bin/python -m unittest discover -s tests -v
```

测试覆盖 TeX 保留、资源 URL scheme 限制，以及用临时本地网页做的离线归档和 PDF 集成测试，全程不读写 Zotero。集成测试目前通过系统命令 `chromium` 查找浏览器；如果只装了 Playwright 下载的版本，这项测试会被跳过。“跳过”和“通过”不是一回事，看结果时请区分。

## 来源

这个 skill 来自原项目 `paper-web` 的 `.opencode/skills/transform-zotero/`，在本仓库更名为 **webpage-archiver**，仓库简称 **ETM**。归档脚本、依赖清单和测试是原样复制过来的；skill 说明和检查清单去掉了原项目的固定路径、分类规则和真实分类 key，保留权限检查、查重和核验要求。原项目的论文、归档产物、Python 缓存和凭据都没有带进来。

仓库目前还没有指定开源许可证。正式发布前需要确认版权归属并选一个许可证，这件事我没有代你决定。
