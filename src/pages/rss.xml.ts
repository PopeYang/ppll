import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getBlogPath } from '../lib/routes';
import { site } from '../data/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  // 按日期倒序
  const sorted = posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  return rss({
    title: site.title,
    description: site.description,
    // context.site 来自 astro.config.mjs 的 site 字段
    site: context.site ?? site.url,
    items: sorted.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      // 复用统一的 routes 工具，确保 canonical / sitemap / rss 一致
      link: getBlogPath(entry),
      categories: entry.data.tags,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
