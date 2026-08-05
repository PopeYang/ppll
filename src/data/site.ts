/** 「凭岚」主题
 *  凭岚 —— 山野长风任几许
 *  任、几、山、风 —— 一实一虚，意境全开
 */
export const site = {
  title: '凭岚',
  tagline: '山野长风任几许',
  description: 'ppy 的个人博客与技术文档',
  author: 'ppy',
  url: 'https://ppll.top',
  githubUrl: 'https://github.com/popeyang',
} as const;

/** 两个栏目的命名。
 *  ui   —— 页面内的小标题（短，作版式用）
 *  nav  —— 浏览器标签页与顶部胶囊（长，作意境用）
 *  文章取山（可居可循），动态取风（转瞬即逝）。
 */
export const sections = {
  docs: { ui: '人生何处不青山', nav: '山间结庐' },
  now: { ui: '且将心绪付长风', nav: '风过留痕' },
} as const;
