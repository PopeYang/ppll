import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getDocPath } from '../lib/routes';
import { site } from '../data/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  // 站点 RSS 现在输出 docs（站点原创内容）。
  // blog 模块已移除；Mastodon 动态有独立的 RSS 源（mas.to/@ppy.rss）。
  const docs = await getCollection('docs');
  const sorted = docs.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    items: sorted.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: getDocPath(entry),
      categories: entry.data.tags,
    })),
    customData: `<language>zh-CN</language>`,
  });
}
