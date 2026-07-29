/**
 * 构建期估算阅读时长。
 *
 * 规则：
 * - 中文按字数（每分钟 ~300 字）
 * - 英文/代码按词数（每分钟 ~200 词）
 * - 两者混合时分别计算后取和，最低 1 分钟
 */
export function readingTime(content: string | undefined | null): number {
  if (!content) return 1;

  // 移除代码块和行内代码，避免把代码当正文
  const stripped = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ');

  // 中文字符（CJK）
  const cjkMatches = stripped.match(/[\u4e00-\u9fa5]/g);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  // 英文单词
  const wordMatches = stripped
    .replace(/[\u4e00-\u9fa5]/g, ' ')
    .match(/[A-Za-z0-9]+/g);
  const wordCount = wordMatches ? wordMatches.length : 0;

  const minutes = cjkCount / 300 + wordCount / 200;
  return Math.max(1, Math.round(minutes));
}
