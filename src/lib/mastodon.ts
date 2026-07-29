/**
 * Mastodon 动态抓取 —— 构建期拉取 mas.to 的用户 RSS 并解析。
 *
 * 设计：
 * - 零客户端 JS：所有内容在构建时拉取并渲染成静态 HTML。
 * - 准实时更新由 GitHub Actions cron 定时重建站点实现。
 * - 拉取失败时优雅降级：返回空数组，页面显示提示，不阻断构建。
 */

const MASTODON_RSS_URL = 'https://mas.to/@ppy.rss';
const MASTODON_PROFILE = 'https://mas.to/@ppy';

export interface Toot {
  /** 嘟文正文（已从 RSS 的 HTML 转义还原为纯 HTML 片段） */
  contentHtml: string;
  /** 原嘟文链接 */
  url: string;
  /** 发布时间 */
  pubDate: Date;
  /** 附带图片（若有） */
  media?: string[];
}

export interface MastodonProfile {
  name: string;
  link: string;
  avatar: string;
  toots: Toot[];
}

/**
 * 抓取并解析 Mastodon RSS。
 * 网络失败或解析失败时返回空 toots，保证构建不中断。
 */
export async function fetchMastodon(): Promise<MastodonProfile> {
  const profile: MastodonProfile = {
    name: 'ppy',
    link: MASTODON_PROFILE,
    avatar: '',
    toots: [],
  };

  try {
    const res = await fetch(MASTODON_RSS_URL, {
      headers: { 'User-Agent': 'ppll-blog-build/1.0' },
      // Astro 构建环境无网络时快速失败
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn(`[mastodon] RSS returned ${res.status}, skipping`);
      return profile;
    }
    const xml = await res.text();
    return parseRss(xml, profile);
  } catch (e) {
    console.warn('[mastodon] fetch failed, skipping:', (e as Error).message);
    return profile;
  }
}

/** 解析 RSS XML（不依赖外部库，用正则提取，足够应对 Mastodon 的标准输出） */
function parseRss(xml: string, profile: MastodonProfile): MastodonProfile {
  // channel 级：头像
  const avatarMatch = xml.match(/<image>[\s\S]*?<url>([^<]+)<\/url>/);
  if (avatarMatch) profile.avatar = avatarMatch[1]!;

  // 每个 item
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1]!;
    const link = matchFirst(block, /<link>([^<]+)<\/link>/);
    const pubDateStr = matchFirst(block, /<pubDate>([^<]+)<\/pubDate>/);
    const descRaw = matchFirst(block, /<description>([\s\S]*?)<\/description>/);
    if (!link || !pubDateStr) continue;

    const media: string[] = [];
    const mediaRegex = /<media:content[^>]*url="([^"]+)"/g;
    let mm: RegExpExecArray | null;
    while ((mm = mediaRegex.exec(block)) !== null) {
      media.push(mm[1]!);
    }

    profile.toots.push({
      // RSS 的 description 是 HTML 实体编码的 HTML，需要反转义
      contentHtml: decodeEntities(descRaw ?? ''),
      url: link,
      pubDate: new Date(pubDateStr),
      media,
    });
  }

  return profile;
}

function matchFirst(s: string, re: RegExp): string | undefined {
  const m = s.match(re);
  return m ? m[1] : undefined;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
