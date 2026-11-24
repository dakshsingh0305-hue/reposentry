// GitHub API Client

import type { GitHubRepo, DependencyFile, DependencyFileType } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

const SUPPORTED_FILES: DependencyFileType[] = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'requirements.txt',
  'poetry.lock',
  'yarn.lock',
];

interface GitHubFileResponse {
  name: string;
  path: string;
  type: string;
  download_url: string;
  size: number;
}

interface GitHubRepoResponse {
  owner: { login: string };
  name: string;
  full_name: string;
  description: string | null;
  default_branch: string;
  html_url: string;
  updated_at: string;
  private: boolean;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'RepoSentry/1.0',
  };
  
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export async function parseGitHubUrl(url: string): Promise<{ owner: string; repo: string } | null> {
  try {
    const parsed = new URL(url);
    
    if (parsed.hostname !== 'github.com') {
      return null;
    }
    
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      return null;
    }
    
    return {
      owner: pathParts[0],
      repo: pathParts[1].replace('.git', ''),
    };
  } catch {
    return null;
  }
}

export async function fetchRepository(owner: string, repo: string): Promise<GitHubRepo | null> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(10000),
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found or is private');
    }
    if (response.status === 403) {
      const remaining = response.headers.get('X-RateLimit-Remaining');
      if (remaining === '0') {
        throw new Error('GitHub API rate limit exceeded. Please add a GITHUB_TOKEN to increase limits.');
      }
      throw new Error('Access forbidden. Repository may be private.');
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  const data: GitHubRepoResponse = await response.json();
  
  return {
    owner: data.owner.login,
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    defaultBranch: data.default_branch,
    htmlUrl: data.html_url,
    updatedAt: data.updated_at,
    isPrivate: data.private,
  };
}

export async function discoverDependencyFiles(owner: string, repo: string, branch: string): Promise<DependencyFile[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: getHeaders(),
      signal: AbortSignal.timeout(15000),
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch repository tree');
  }
  
  const data = await response.json();
  const files: GitHubFileResponse[] = data.tree.filter(
    (item: GitHubFileResponse) => item.type === 'blob' && SUPPORTED_FILES.includes(item.name as DependencyFileType)
  );
  
  const dependencyFiles: DependencyFile[] = [];
  
  for (const file of files) {
    try {
      const contentResponse = await fetch(file.download_url, {
        headers: getHeaders(),
        signal: AbortSignal.timeout(10000),
      });
      
      if (contentResponse.ok) {
        const content = await contentResponse.text();
        dependencyFiles.push({
          path: file.path,
          type: file.name as DependencyFileType,
          content,
        });
      }
    } catch {
      // Skip files that can't be fetched
    }
  }
  
  return dependencyFiles;
}

export async function fetchFileContent(owner: string, repo: string, path: string, branch: string): Promise<string | null> {
  const url = `${GITHUB_RAW_BASE}/${owner}/${repo}/${branch}/${path}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(10000),
  });
  
  if (!response.ok) {
    return null;
  }
  
  return response.text();
}