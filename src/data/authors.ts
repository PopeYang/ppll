export interface Author {
  name: string;
  title: string;
  url: string;
  image_url: string;
}

/**
 * 作者信息（迁移自 Docusaurus 的 blog/authors.yml）。
 * blog frontmatter 的 authors: [ppy] 通过此表解析。
 */
export const authors: Record<string, Author> = {
  ppy: {
    name: 'ppy',
    title: '不鸽一行🕊️，不懒一梦💤',
    url: 'https://github.com/popeyang',
    image_url: 'https://avatars.githubusercontent.com/u/101554426',
  },
};

export function getAuthor(id: string): Author | undefined {
  return authors[id];
}
