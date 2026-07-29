/**
 * 统一的 slug / 路由工具。
 *
 * 设计目标：
 * - 接受 collection entry，返回站点绝对路径（如 "/docs/dotnet/win7net48/"）。
 * - 路径统一以尾斜杠结尾，与 Astro directory 构建格式、GitHub Pages 实际响应、
 *   RSS / sitemap 集成的默认输出保持一致，避免规范化冲突与循环重定向。
 * - 规则：
 *   1. 去掉扩展名（.md / .mdx）。
 *   2. `_index` / `index` 映射到所在目录本身。
 *   3. 去掉与父目录同名的末段（`dotnet/win7net48/win7net48` → `dotnet/win7net48`）。
 *   4. 去掉开头的日期前缀（`2025-11-06-intro` → `intro`），仅对 blog 生效。
 *   5. 禁止出现 `//`；保证以单个尾斜杠结尾。
 *
 * canonical / RSS / sidebar / getStaticPaths 全部复用本工具。
 */

/** 归一化 segments：去空、去重复斜杠 */
function normalize(parts: string[]): string[] {
  return parts.filter((p) => p !== '' && p !== '.');
}

/**
 * 从 entry id（相对路径，如 "dotnet/win7net48/win7net48.md"）计算去重后的 segments。
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
  //    例如 ["dotnet", "win7net48", "win7net48"] → ["dotnet", "win7net48"]
  const len = parts.length;
  if (len >= 2 && parts[len - 1] === parts[len - 2]) {
    parts = parts.slice(0, -1);
  }

  return parts;
}

/**
 * 去掉 blog 文件名开头的日期前缀。
 * 例如 "2025-11-06-intro" → "intro"，"2025-12-22" → "2025-12-22"（整体是日期则保留）。
 */
function stripDatePrefix(segment: string): string {
  // 形如 "2025-11-06-intro"：日期 + 至少一个非日期后缀 → 去掉日期段
  const m = segment.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (m) return m[2];
  return segment;
}

export interface RouteEntry {
  id: string;
}

/**
 * 返回 blog 文章的站点绝对路径（带尾斜杠）。
 * 输入示例与输出：
 *   "intro.md"               → "/blog/intro/"
 *   "2025-12-22.md"          → "/blog/2025-12-22/"
 *   "2025-11-06-intro.md"    → "/blog/intro/"
 */
export function getBlogPath(entry: RouteEntry): string {
  const parts = segmentsFromId(entry.id);
  // 对末段去日期前缀（blog 文件平铺在 blog/ 下，只有一段）
  const cleaned = parts.map(stripDatePrefix);
  return '/blog/' + normalize(cleaned).join('/') + '/';
}

/**
 * 返回 docs 文档的站点绝对路径（带尾斜杠）。
 * 输入示例与输出：
 *   "intro.md"                              → "/docs/intro/"
 *   "dotnet/_index.md"                      → "/docs/dotnet/"
 *   "dotnet/win7net48/win7net48.md"         → "/docs/dotnet/win7net48/"
 *   "linux/gitlab_deploy/gitlab_deploy.md"  → "/docs/linux/gitlab_deploy/"
 */
export function getDocPath(entry: RouteEntry): string {
  const parts = segmentsFromId(entry.id);
  return '/docs/' + normalize(parts).join('/') + '/';
}

/**
 * 从绝对路径中剥离前缀，得到 getStaticPaths() 需要的 params.slug。
 * 例如 "/docs/dotnet/win7net48/" → "dotnet/win7net48"。
 * 会去掉首部前缀与末尾斜杠。
 */
export function slugFromPath(absolutePath: string, prefix: '/blog/' | '/docs/'): string {
  if (!absolutePath.startsWith(prefix)) {
    throw new Error(`path "${absolutePath}" does not start with "${prefix}"`);
  }
  return absolutePath.replace(/\/+$/, '').slice(prefix.length);
}
