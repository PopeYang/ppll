# 破破烂烂小博客

ppy 的个人博客与技术文档，基于 [Astro](https://astro.build/) 构建。

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

- `src/content/blog/` — 博客文章（Markdown）
- `src/content/docs/` — 技术文档（按目录分类，每目录放一个 `_index.md` 作为分类入口）
- `src/lib/routes.ts` — 统一的 URL 生成工具（canonical / RSS / sidebar 共用）
- `public/` — 静态资源（CNAME、favicon、图片）

## 部署

通过 GitHub Actions 自动部署到 GitHub Pages，自定义域名 `ppll.top`。
PR 只会校验构建（check + test + build），合并到 `main` 才会部署。
