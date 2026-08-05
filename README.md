# 凭岚

ppy 的个人博客与技术文档，基于 [Astro](https://astro.build/) 构建。

栏目命名见 `src/data/site.ts` 的 `sections`：页面内用短名（山间结庐 / 风过留痕），
浏览器标签页与顶部导航用长名（人生何处不青山 / 且将心绪付长风）。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 启动本地开发服务器 |
| `npm run check` | TypeScript 类型检查（astro check） |
| `npm run test` | 运行 slug 工具单元测试（vitest） |
| `npm run build` | 构建到 `dist/` |
| `npm run preview` | 本地预览构建产物 |

## 目录约定

- `src/content/docs/` — 全部原创内容（Markdown），已拍平，用 frontmatter 的 `tags` 区分类型
- `src/lib/routes.ts` — 统一的 URL 生成工具（canonical / RSS / 列表页共用）
- `src/lib/tags.ts` — 标签统计与 URL 编码（`tagToSlug`）
- `public/` — 静态资源（CNAME、favicon、图片）

## 部署

通过 GitHub Actions 自动部署到 GitHub Pages，自定义域名 `ppll.top`。
PR 只会校验构建（check + test + build），合并到 `main` 才会部署。
