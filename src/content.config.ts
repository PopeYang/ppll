import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 文档 collection —— 站点唯一的原创内容。
// 拍平，无目录分类；用 tags 区分类型（教程/随笔/旅行 等）。
// 排序按 date（首次创作日期）。
const docs = defineCollection({
  loader: glob({
    pattern: ['**/*.md', '**/*.mdx'],
    base: './src/content/docs',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      // 可选封面图（旅游/摄影类文档）
      cover: image().optional(),
      // 无封面图时卡片上显示的锚点 emoji
      emoji: z.string().optional(),
    }),
});

export const collections = { docs };
