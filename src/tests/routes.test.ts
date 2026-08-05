import { describe, it, expect } from 'vitest';
import { getDocPath, slugFromPath } from '../lib/routes';
import { tagToSlug, tagUrl } from '../lib/tags';

describe('getDocPath（docs 已拍平）', () => {
  it('intro.md → /docs/intro/', () => {
    expect(getDocPath({ id: 'intro.md' })).toBe('/docs/intro/');
  });

  it('arch.md → /docs/arch/', () => {
    expect(getDocPath({ id: 'arch.md' })).toBe('/docs/arch/');
  });

  it('去掉与父目录同名的末段', () => {
    expect(getDocPath({ id: 'win7net48/win7net48.md' })).toBe('/docs/win7net48/');
  });

  it('gitlab_deploy/gitlab_deploy.md → /docs/gitlab_deploy/', () => {
    expect(getDocPath({ id: 'gitlab_deploy/gitlab_deploy.md' })).toBe(
      '/docs/gitlab_deploy/'
    );
  });

  it('以单个尾斜杠结尾，无双斜杠', () => {
    const p = getDocPath({ id: 'win7net48/win7net48.md' });
    expect(p.endsWith('//')).toBe(false);
    expect(p.endsWith('/')).toBe(true);
  });
});

describe('slugFromPath', () => {
  it('剥离 /docs/ 前缀与尾斜杠', () => {
    expect(slugFromPath('/docs/win7net48/', '/docs/')).toBe('win7net48');
  });
});

describe('tagToSlug', () => {
  it('有语义的符号转写而非丢弃', () => {
    expect(tagToSlug('C++')).toBe('c-plus-plus');
    expect(tagToSlug('C#')).toBe('c-sharp');
  });

  it('点号开头不生成隐藏目录', () => {
    expect(tagToSlug('.NET')).toBe('dotnet');
  });

  it('CJK 原样保留', () => {
    expect(tagToSlug('工具')).toBe('工具');
    expect(tagToSlug('其他')).toBe('其他');
  });

  it('普通标签只做小写化', () => {
    expect(tagToSlug('GitLab')).toBe('gitlab');
    expect(tagToSlug('FreeCAD')).toBe('freecad');
  });

  it('空白与保留字符折成单个连字符，不留首尾连字符', () => {
    expect(tagToSlug('  Hello   World  ')).toBe('hello-world');
    expect(tagToSlug('a/b?c')).toBe('a-b-c');
  });

  it('slug 内不含 URL 保留字符（这是 C++ / 中文标签 404 的根因）', () => {
    for (const t of ['C++', 'C#', '.NET', '工具', 'a/b?c', 'x&y']) {
      const s = tagToSlug(t);
      expect(s).not.toMatch(/[+#?&/%]/);
      expect(s).toBe(s.trim());
    }
  });
});

describe('tagUrl', () => {
  it('ASCII slug 无需编码', () => {
    expect(tagUrl('C++')).toBe('/docs/tag/c-plus-plus/');
    expect(tagUrl('GitLab')).toBe('/docs/tag/gitlab/');
  });

  it('CJK 编码后仍以单个尾斜杠结尾', () => {
    const u = tagUrl('工具');
    expect(u).toBe('/docs/tag/%E5%B7%A5%E5%85%B7/');
    expect(u.endsWith('//')).toBe(false);
  });

  it('decodeURIComponent 能还原回 slug（保证服务端可匹配）', () => {
    for (const t of ['C++', '.NET', '工具', '其他']) {
      const seg = tagUrl(t).replace('/docs/tag/', '').replace(/\/$/, '');
      expect(decodeURIComponent(seg)).toBe(tagToSlug(t));
    }
  });
});
