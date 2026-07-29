import type { CollectionEntry } from 'astro:content';
import { getDocPath } from './routes';

/**
 * docs 侧边栏数据结构。
 * - 顶层分类（来自各目录的 _index.md）。
 * - 每个分类下的文档（按 position 升序，position 相同按 title，_index 不出现在子项）。
 */

export interface SidebarItem {
  title: string;
  url: string;
  description?: string;
}

export interface SidebarCategory {
  title: string;
  position?: number;
  description?: string;
  /** 分类入口页 URL（来自 _index），如 "/docs/dotnet" */
  url: string;
  items: SidebarItem[];
}

/**
 * 排序比较：有 position 的在前 → position 升序 → 无 position 的按 title。
 */
function byPosition<T extends { position?: number; title: string }>(a: T, b: T): number {
  const ap = a.position;
  const bp = b.position;
  if (ap != null && bp != null) return ap - bp;
  if (ap != null) return -1;
  if (bp != null) return 1;
  return a.title.localeCompare(b.title);
}

/**
 * 判断一个 entry 是否是分类入口（_index.md / index.md）。
 */
function isIndexEntry(id: string): boolean {
  return /(^|\/)(_index|index)\.(md|mdx)$/i.test(id);
}

/**
 * 取 entry 的顶层分类目录名（id 的第一段）。
 * 例如 "dotnet/win7net48/win7net48.md" → "dotnet"。
 * 根目录文件（如 "intro.md"）返回 null。
 */
function topCategory(id: string): string | null {
  const parts = id.split('/').filter(Boolean);
  return parts.length > 1 ? parts[0]! : null;
}

/**
 * 构建侧边栏：返回顶层 intro + 各分类。
 * intro.md 等根目录文件单独返回，作为 SidebarItem 放在最前。
 */
export function buildSidebar(entries: CollectionEntry<'docs'>[]): {
  rootItems: SidebarItem[];
  categories: SidebarCategory[];
} {
  const rootItems: SidebarItem[] = [];
  const categoryMap = new Map<string, SidebarCategory>();
  const categoryIndexEntries = new Map<string, CollectionEntry<'docs'>>();

  // 第一遍：找出各分类的 _index 入口
  for (const entry of entries) {
    if (isIndexEntry(entry.id)) {
      const cat = topCategory(entry.id);
      if (cat) categoryIndexEntries.set(cat, entry);
    }
  }

  // 第二遍：分发到 root 或各分类
  for (const entry of entries) {
    const data = entry.data as {
      title: string;
      description?: string;
      position?: number;
    };
    const cat = topCategory(entry.id);

    if (cat === null) {
      // 根目录文件 → rootItems（如 intro.md）
      rootItems.push({
        title: data.title,
        url: getDocPath(entry),
        description: data.description,
      });
      continue;
    }

    if (isIndexEntry(entry.id)) {
      // 分类入口，单独记录
      continue;
    }

    // 分类子项
    let category = categoryMap.get(cat);
    if (!category) {
      // 尝试用 _index 入口初始化分类
      const idx = categoryIndexEntries.get(cat);
      const idxData = idx?.data as
        | { title: string; description?: string; position?: number }
        | undefined;
      category = {
        title: idxData?.title ?? cat,
        position: idxData?.position,
        description: idxData?.description,
        url: idx ? getDocPath(idx) : '/docs/' + cat,
        items: [],
      };
      categoryMap.set(cat, category);
    }
    category.items.push({
      title: data.title,
      url: getDocPath(entry),
      description: data.description,
    });
  }

  // 排序：root 按 localeCompare（intro 在前），分类按 position
  rootItems.sort((a, b) => a.title.localeCompare(b.title));
  const categories = Array.from(categoryMap.values()).sort(byPosition);
  for (const c of categories) {
    c.items.sort((a, b) => a.title.localeCompare(b.title));
  }

  return { rootItems, categories };
}
