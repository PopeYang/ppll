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
 * URL 编码 tag（用于 /docs/tag/<tag>/ 路径）。
 */
export function tagToSlug(tag: string): string {
  return encodeURIComponent(tag);
}

/**
 * 从 URL slug 还原 tag（getStaticPaths 反查用）。
 */
export function findTagBySlug(entries: CollectionEntry<'docs'>[], slug: string): string | undefined {
  let decoded: string;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    return undefined;
  }
  const all = new Set<string>();
  for (const e of entries) {
    for (const t of e.data.tags) all.add(t);
  }
  return all.has(decoded) ? decoded : undefined;
}
