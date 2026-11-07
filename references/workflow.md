# 归档与 Zotero 导入检查表

## 输出约定

```text
<collection-path>/<article-slug>/
  article.md
  article.pdf
  index.html
  assets/
  source.html
  metadata.csl.json
  citation.bib
  manifest.json
  verification.json
  import-status.json       # agent 完成或阻塞导入后写入；脚本不直接访问 Zotero
```

项目的“论文深读”目录要求不等于此归档 skill 的目录命名要求；不要覆盖已有 `reading.md` 或 `index.html`。指定输出目录已存在时脚本拒绝写入。失败重试用新的目录或先确认哪些失败产物由本次任务产生，不能无差别删除目录。

## 人工核验

- [ ] 页面是目标文章，不是机器人验证页、登录页或错误页。
- [ ] 所选容器覆盖全文，包括文章独有的边栏或补充说明。
- [ ] 标题、作者、日期、来源 URL 已核实。
- [ ] 所有章节、正文首尾、图注和参考文献存在。
- [ ] 图片没有漏掉懒加载、`srcset`、外链图或 SVG；图片内部文字保持原样。
- [ ] 公式可见且未报错；Markdown TeX 没有被转换器额外转义。
- [ ] PDF 图/图注尽可能同页，长表格和长公式没有被裁切。
- [ ] 离线 HTML 的阅读资源不依赖 skill 目录、CDN 或网络。
- [ ] 明确标注视频、canvas 或交互内容无法完整保留的部分；不声称通用网页交互均已归档。

## Zotero MCP 操作范式（仅当规则允许时）

1. `zotero_search_collections(query='RSI')` → 核实完整路径、key。
2. `zotero_search_items` 查重；需要时 `zotero_get_collection_items` 按 `offset/limit` 分页，检查独立附件。
3. `zotero_get_item_metadata` / `zotero_get_item_children` / `zotero_get_attachment_path` 验证候选。
4. `zotero_write_capabilities()`；按其结果处理本地授权或报告缺少后端。
5. 无匹配且允许写入时：

```text
zotero_add_item(
  source=<metadata.csl.json 的绝对路径或其 JSON 内容>,
  source_type='csl_json',
  collections=[<已核实 collection key>],
  attach_mode='none',
  if_exists='file'
)
```

`if_exists` 的支持范围取决于当前工具；不能假定它替代了前置查重。不要自动创建不存在的分类。

6. `zotero_attach_file(item_key=<主条目 key>, file_path=<article.pdf 绝对路径>)`。
7. 再读元数据、分类及子附件，记录实际返回的 key。需要索引时按工具说明更新搜索索引，不把索引结果当作附件上传成功的唯一证据。

不要通过 Zotero SQLite 直接写入；不要借本地 HTTP、插件或网页绕过项目只读约束。

## 状态记录

以下是遇到只读项目时的阻塞记录示例，分类名称和 key 均为占位示例。是否允许写入取决于适用的项目规则、用户授权及工具能力，应记录本次真实的导入状态和返回 key。

```json
{
  "localConversion": "verified",
  "zoteroImport": "blocked-by-project-policy",
  "collectionPath": "研究资料/示例分类",
  "collectionKey": "<实际分类 key>",
  "itemKey": null,
  "attachmentKey": null,
  "reason": "当前项目明确限定 Zotero 只读"
}
```

状态必须写实际结果；上面的分类和 key 不能直接用于导入，每次任务都应重新查询确认。

## 已验证案例与边界

原项目的本地验证记录（2026-10-30）：曾归档 Lilian Weng 的 *Harness Engineering for Self-Improvement*，记录为 18 张原图、1 张表格、42 处数学渲染、23 页 PDF。此处仅保留历史记录，不表示本仓库重新执行了该案例；这些数字不得硬编码为其他网页的验收标准。

“保留格式”指正文结构、图文关系、样式和数学的尽量忠实保存，PDF 会重新分页；Markdown 渲染器的公式和布局支持不同。脚本不保证任意动态网站都能自动无损转换。
