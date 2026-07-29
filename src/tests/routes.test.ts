import { describe, it, expect } from 'vitest';
import { getDocPath, slugFromPath } from '../lib/routes';

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
