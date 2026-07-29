/**
 * 统一的 slug / 路由工具。
 *
 * 设计目标：
 * - 接受 collection entry，返回站点绝对路径（如 "/docs/win7net48/"）。
 * - 路径统一以尾斜杠结尾，与 Astro directory 构建格式、GitHub Pages 实际响应、
 *   RSS / sitemap 集成的默认输出保持一致，避免规范化冲突与循环重定向。
 * - 规则：
 *   1. 去掉扩展名（.md / .mdx）。
 *   2. `_index` / `index` 映射到所在目录本身。
 *   3. 去掉与父目录同名的末段（`win7net48/win7net48` → `win7net48`）。
 *   4. 禁止出现 `//`；保证以单个尾斜杠结尾。
 *
 * canonical / RSS / getStaticPaths 全部复用本工具。
 */

/** 归一化 segments：去空、去重复斜杠 */
function normalize(parts: string[]): string[] {
  return parts.filter((p) => p !== '' && p !== '.');
}

/**
 * 从 entry id（相对路径，如 "win7net48/win7net48.md"）计算去重后的 segments。
 */
function segmentsFromId(id: string): string[] {
  // 1. 去扩展名
  const noExt = id.replace(/\.(md|mdx)$/i, '');
  let parts = normalize(noExt.split('/'));

  // 2. _index / index 映射到所在目录
  const last = parts[parts.length - 1];
  if (last === '_index' || last === 'index') {
    parts = parts.slice(0, -1);
  }

  // 3. 去掉与父目录同名的末段
  //    例如 ["win7net48", "win7net48"] → ["win7net48"]
  const len = parts.length;
  if (len >= 2 && parts[len - 1] === parts[len - 2]) {
    parts = parts.slice(0, -1);
  }

  return parts;
}

export interface RouteEntry {
  id: string;
}

/**
 * 返回 docs 文档的站点绝对路径（带尾斜杠）。
 * docs 已拍平，规则简化为：
 *   "intro.md"                → "/docs/intro/"
 *   "win7net48/win7net48.md"  → "/docs/win7net48/"
 */
export function getDocPath(entry: RouteEntry): string {
  const parts = segmentsFromId(entry.id);
  return '/docs/' + normalize(parts).join('/') + '/';
}

/**
 * 从绝对路径中剥离前缀，得到 getStaticPaths() 需要的 params.slug。
 * 例如 "/docs/win7net48/" → "win7net48"。
 */
export function slugFromPath(absolutePath: string, prefix: '/docs/'): string {
  if (!absolutePath.startsWith(prefix)) {
    throw new Error(`path "${absolutePath}" does not start with "${prefix}"`);
  }
  return absolutePath.replace(/\/+$/, '').slice(prefix.length);
}
