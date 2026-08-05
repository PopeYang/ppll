import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { getDocPath } from './routes';

export interface DocListItem {
  title: string;
  description?: string;
  url: string;
  date: Date;
  tags: string[];
  cover?: ImageMetadata;
  emoji?: string;
}

/**
 * 把 docs collection 转为按日期倒序的列表项。
 */
export function toDocList(entries: CollectionEntry<'docs'>[]): DocListItem[] {
  return entries
    .map((e) => ({
      title: e.data.title,
      description: e.data.description,
      url: getDocPath(e),
      date: e.data.date,
      tags: e.data.tags,
      cover: e.data.cover,
      emoji: e.data.emoji,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * 统计所有 tag 及其文档数，按文档数倒序、再按名称排序。
 */
export function collectTags(entries: CollectionEntry<'docs'>[]): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const e of entries) {
    for (const t of e.data.tags) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * 把 tag 折成可安全放进 URL 路径段的 slug。
 *
 * 为什么不能直接 encodeURIComponent：
 *   Astro 的 dev 路由用 decodeURI 解析 pathname，它解码非 ASCII
 *   （%E5%B7%A5%E5%85%B7 → 工具）却不解码保留字符（%2B 原样保留）。
 *   于是含保留字符的 slug 无论预编码与否，dev 与构建产物总有一边匹配不上
 *   （典型症状：C++ 与中文标签一个通一个 404）。
 *
 * 策略：只处理会破坏 URL 的 ASCII 字符，CJK 原样保留
 *      （CJK 经 encodeURI/decodeURI 可无损往返）。
 *   C++      → c-plus-plus
 *   C#       → c-sharp
 *   .NET     → dotnet      （另：点号开头的目录在静态托管上也不可靠）
 *   工具     → 工具
 */
export function tagToSlug(tag: string): string {
  let s = tag.trim();

  // 有语义的符号先转写，避免退化成无意义的连字符
  s = s
    .replace(/\+/g, '-plus')
    .replace(/#/g, '-sharp')
    .replace(/&/g, '-and-');

  // 点号开头（.NET）：去掉点，避免生成隐藏目录
  s = s.replace(/^\.+/, 'dot');

  // 其余 URL 保留字符 / 空白 → 连字符；CJK 与字母数字保留
  s = s.replace(/[^\p{L}\p{N}_-]+/gu, '-');

  // 收敛连字符
  s = s.replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');

  return s.toLowerCase();
}

/** tag 对应的站点绝对路径（带尾斜杠）。href 用 encodeURI 保证 CJK 合法。 */
export function tagUrl(tag: string): string {
  return '/docs/tag/' + encodeURIComponent(tagToSlug(tag)) + '/';
}
