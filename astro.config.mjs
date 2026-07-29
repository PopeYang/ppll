import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// 不显式设置 trailingSlash：采用 Astro 默认（directory 构建格式 + 尾斜杠），
// 与 GitHub Pages 实际响应、RSS / sitemap 集成的默认输出保持一致，
// 避免规范化冲突与循环重定向。canonical / 内部链接由 lib/routes.ts 统一生成。
export default defineConfig({
  site: 'https://ppll.top',
  integrations: [sitemap()],
});
