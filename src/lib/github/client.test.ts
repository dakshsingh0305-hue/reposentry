import { parseGitHubUrl } from './client';

describe('parseGitHubUrl', () => {
  test('parses standard GitHub URL', async () => {
    const result = await parseGitHubUrl('https://github.com/owner/repo');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  test('parses GitHub URL with trailing slash', async () => {
    const result = await parseGitHubUrl('https://github.com/owner/repo/');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  test('parses GitHub URL with .git suffix', async () => {
    const result = await parseGitHubUrl('https://github.com/owner/repo.git');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  test('parses GitHub URL with subpath', async () => {
    const result = await parseGitURL('https://github.com/owner/repo/tree/main/src');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  test('returns null for non-GitHub URLs', async () => {
    const result = await parseGitHubUrl('https://gitlab.com/owner/repo');
    expect(result).toBeNull();
  });

  test('returns null for invalid URLs', async () => {
    const result = await parseGitHubUrl('not-a-url');
    expect(result).toBeNull();
  });

  test('returns null for incomplete GitHub URLs', async () => {
    const result = await parseGitHubUrl('https://github.com/owner');
    expect(result).toBeNull();
  });

  test('returns null for GitHub root', async () => {
    const result = await parseGitHubUrl('https://github.com');
    expect(result).toBeNull();
  });
});

// Fix the typo in test name
async function parseGitURL(url: string) {
  return parseGitHubUrl(url);
}