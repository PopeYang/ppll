import { describe, it, expect } from 'vitest';
import { getBlogPath, getDocPath, slugFromPath } from '../lib/routes';

describe('getBlogPath', () => {
  it('intro.md → /blog/intro/', () => {
    expect(getBlogPath({ id: 'intro.md' })).toBe('/blog/intro/');
  });

  it('2025-12-22.md → /blog/2025-12-22/', () => {
    expect(getBlogPath({ id: '2025-12-22.md' })).toBe('/blog/2025-12-22/');
  });

  it('带日期前缀的文章名 → 去日期前缀', () => {
    expect(getBlogPath({ id: '2025-11-06-intro.md' })).toBe('/blog/intro/');
  });

  it('以单个尾斜杠结尾，无双斜杠', () => {
    const p = getBlogPath({ id: 'intro.md' });
    expect(p.endsWith('//')).toBe(false);
    expect(p.endsWith('/')).toBe(true);
  });
});

describe('getDocPath', () => {
  it('intro.md → /docs/intro/', () => {
    expect(getDocPath({ id: 'intro.md' })).toBe('/docs/intro/');
  });

  it('dotnet/_index.md → /docs/dotnet/', () => {
    expect(getDocPath({ id: 'dotnet/_index.md' })).toBe('/docs/dotnet/');
  });

  it('去掉与父目录同名的末段', () => {
    expect(getDocPath({ id: 'dotnet/win7net48/win7net48.md' })).toBe(
      '/docs/dotnet/win7net48/'
    );
  });

  it('index 也映射到目录', () => {
    expect(getDocPath({ id: 'linux/gitlab_deploy/index.md' })).toBe(
      '/docs/linux/gitlab_deploy/'
    );
  });

  it('以单个尾斜杠结尾，无双斜杠', () => {
    const p = getDocPath({ id: 'dotnet/_index.md' });
    expect(p.endsWith('//')).toBe(false);
    expect(p.endsWith('/')).toBe(true);
  });
});

describe('slugFromPath', () => {
  it('剥离 /docs/ 前缀与尾斜杠', () => {
    expect(slugFromPath('/docs/dotnet/win7net48/', '/docs/')).toBe(
      'dotnet/win7net48'
    );
  });

  it('剥离 /blog/ 前缀与尾斜杠', () => {
    expect(slugFromPath('/blog/intro/', '/blog/')).toBe('intro');
  });
});
