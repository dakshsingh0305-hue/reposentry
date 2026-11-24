// Python dependency parsers

import type { ParsedDependency, DependencyFile } from '@/types';

export function parseRequirementsTxt(content: string, sourceFile: string): ParsedDependency[] {
  const dependencies: ParsedDependency[] = [];
  
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) {
      continue;
    }
    
    // Handle various requirement formats:
    // package==1.0.0
    // package>=1.0.0
    // package~=1.0.0
    // package @ url
    // package[extra]==1.0.0
    // package @ git+https://...
    
    // First, try to parse as package==version
    const exactMatch = trimmed.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(\[[^\]]+\])?\s*==\s*([^\s#]+)/);
    if (exactMatch) {
      dependencies.push({
        name: exactMatch[1].toLowerCase(),
        version: exactMatch[3],
        ecosystem: 'pypi',
        sourceFile,
      });
      continue;
    }
    
    // Try package===version (legacy)
    const legacyMatch = trimmed.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(\[[^\]]+\])?\s*===\s*([^\s#]+)/);
    if (legacyMatch) {
      dependencies.push({
        name: legacyMatch[1].toLowerCase(),
        version: legacyMatch[3],
        ecosystem: 'pypi',
        sourceFile,
      });
      continue;
    }
    
    // Try package @ url (direct URL reference) - we can't determine version
    const urlMatch = trimmed.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(\[[^\]]+\])?\s*@\s/);
    if (urlMatch) {
      // Skip unpinned URL dependencies
      continue;
    }
    
    // Try package>=version, package<=version, etc. - unpinned
    const rangeMatch = trimmed.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(\[[^\]]+\])?\s*(>=|<=|>|<|~=|!=)\s*([^\s#]+)/);
    if (rangeMatch) {
      // Skip unpinned range dependencies
      continue;
    }
    
    // Try bare package name (no version)
    const bareMatch = trimmed.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(\[[^\]]+\])?$/);
    if (bareMatch) {
      // Skip unpinned dependencies
      continue;
    }
  }
  
  return dependencies;
}

export function parsePoetryLock(content: string, sourceFile: string): ParsedDependency[] {
  const dependencies: ParsedDependency[] = [];
  
  try {
    // Poetry lock is TOML format
    // We'll do a basic parse without a full TOML parser
    const lines = content.split('\n');
    let inPackage = false;
    let currentName = '';
    let currentVersion = '';
    let currentCategory = 'main'; // main or dev
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for [[package]] section
      if (line === '[[package]]') {
        // Save previous package
        if (currentName && currentVersion) {
          dependencies.push({
            name: currentName.toLowerCase(),
            version: currentVersion,
            ecosystem: 'pypi',
            sourceFile,
            isDevDependency: currentCategory === 'dev',
          });
        }
        
        inPackage = true;
        currentName = '';
        currentVersion = '';
        currentCategory = 'main';
        continue;
      }
      
      // Check for [package.dev] or similar category
      const categoryMatch = line.match(/^\[package\.(\w+)\]$/);
      if (categoryMatch) {
        currentCategory = categoryMatch[1];
        continue;
      }
      
      if (inPackage) {
        // name = "package-name"
        const nameMatch = line.match(/^name\s*=\s*"([^"]+)"$/);
        if (nameMatch) {
          currentName = nameMatch[1];
          continue;
        }
        
        // version = "1.0.0"
        const versionMatch = line.match(/^version\s*=\s*"([^"]+)"$/);
        if (versionMatch) {
          currentVersion = versionMatch[1];
          continue;
        }
        
        // category = "main" or "dev"
        const catMatch = line.match(/^category\s*=\s*"([^"]+)"$/);
        if (catMatch) {
          currentCategory = catMatch[1];
          continue;
        }
      }
    }
    
    // Don't forget the last package
    if (currentName && currentVersion) {
      dependencies.push({
        name: currentName.toLowerCase(),
        version: currentVersion,
        ecosystem: 'pypi',
        sourceFile,
        isDevDependency: currentCategory === 'dev',
      });
    }
  } catch (error) {
    console.error('Failed to parse poetry.lock:', error);
  }
  
  return dependencies;
}

export function parsePythonLockfile(file: DependencyFile): ParsedDependency[] {
  switch (file.type) {
    case 'requirements.txt':
      return parseRequirementsTxt(file.content, file.path);
    case 'poetry.lock':
      return parsePoetryLock(file.content, file.path);
    default:
      return [];
  }
}