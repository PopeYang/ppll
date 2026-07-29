import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 博客 collection —— 纯时间线，无标签/作者/归档聚合页
const blog = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.coerce.date(), // 接受 "2025-11-06" 或完整 ISO
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      // 兼容 Docusaurus 旧字段
      authors: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      // 旧 slug（/intro）仅作参考；Astro 路由由 lib/routes.ts 统一管理
      slug: z.string().optional(),
    }),
});

// 文档 collection —— 按目录分类，侧边栏展示
const docs = defineCollection({
  loader: glob({
    pattern: ['**/*.md', '**/*.mdx'],
    base: './src/content/docs',
    // _category_.json 已合并进 _index.md，忽略之
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    position: z.number().optional(),
  }),
});

export const collections = { blog, docs };
