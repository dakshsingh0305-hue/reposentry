// NPM lockfile parsers

import type { ParsedDependency, DependencyFile } from '@/types';

export function parsePackageLock(content: string, sourceFile: string): ParsedDependency[] {
  const dependencies: ParsedDependency[] = [];
  
  try {
    const lockfile = JSON.parse(content);
    
    // Handle both v1 and v2/v3 lockfile formats
    const packages = lockfile.packages || lockfile.dependencies || {};
    
    for (const [path, pkg] of Object.entries(packages)) {
      if (typeof pkg !== 'object' || pkg === null) continue;
      
      const pkgData = pkg as Record<string, unknown>;
      
      // Skip root package
      if (path === '' || path === 'node_modules') continue;
      
      // Extract name from path (remove node_modules/ prefix)
      const name = path.replace(/^node_modules\//, '');
      const version = pkgData.version as string;
      
      if (!name || !version) continue;
      
      // Determine if dev/optional
      const isDevDependency = pkgData.dev === true || pkgData.development === true;
      const isOptional = pkgData.optional === true;
      
      dependencies.push({
        name,
        version,
        ecosystem: 'npm',
        sourceFile,
        isDevDependency,
        isOptional,
      });
    }
  } catch (error) {
    console.error('Failed to parse package-lock.json:', error);
  }
  
  return dependencies;
}

export function parseYarnLock(content: string, sourceFile: string): ParsedDependency[] {
  const dependencies: ParsedDependency[] = [];

  try {
    // Yarn lockfile is a custom format, we'll do a basic parse
    const lines = content.split('\n');
    let currentPackage: { name: string; version: string } | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Package declaration line: "package-name@^1.0.0:"
      const pkgMatch = trimmed.match(/^(.+?)@[^:]+:$/);
      if (pkgMatch && !trimmed.startsWith(' ')) {
        // Save previous package if exists
        if (currentPackage) {
          dependencies.push({
            name: currentPackage.name,
            version: currentPackage.version,
            ecosystem: 'npm',
            sourceFile,
          });
        }

        const fullName = pkgMatch[1];
        const name = fullName.replace(/@.+$/, '');
        const versionMatch = fullName.match(/@(.+)$/);
        const version = versionMatch ? versionMatch[1] : '';

        if (name || version) {
          currentPackage = { name, version };
        }
        continue;
      }

      // Version line: "  version "1.0.0""
      const versionMatch = trimmed.match(/^version\s+"(.+?)"$/);
      if (versionMatch && currentPackage) {
        currentPackage.version = versionMatch[1];
      }
    }

    // Don't forget the last package
    if (currentPackage) {
      dependencies.push({
        name: currentPackage.name,
        version: currentPackage.version,
        ecosystem: 'npm',
        sourceFile,
      });
    }
  } catch (error) {
    console.error('Failed to parse yarn.lock:', error);
  }

  return dependencies;
}

export function parsePnpmLock(content: string, sourceFile: string): ParsedDependency[] {
  const dependencies: ParsedDependency[] = [];
  
  try {
    // Use a simple YAML-like parse for pnpm-lock.yaml
    // For now, we'll use a regex-based approach
    const lines = content.split('\n');
    let inPackages = false;
    let currentName = '';
    let currentVersion = '';
    let currentDev = false;
    let currentOptional = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === 'packages:') {
        inPackages = true;
        continue;
      }
      
      if (inPackages && trimmed.startsWith('/')) {
        // Save previous package
        if (currentName && currentVersion) {
          dependencies.push({
            name: currentName,
            version: currentVersion,
            ecosystem: 'npm',
            sourceFile,
            isDevDependency: currentDev,
            isOptional: currentOptional,
          });
        }
        
        // New package: "/package-name@1.0.0"
        const match = trimmed.match(/^\/(.+?)@(.+?):?$/);
        if (match) {
          currentName = match[1];
          currentVersion = match[2];
          currentDev = false;
          currentOptional = false;
        }
        continue;
      }
      
      if (inPackages && trimmed === 'dev: true') {
        currentDev = true;
        continue;
      }
      
      if (inPackages && trimmed === 'optional: true') {
        currentOptional = true;
        continue;
      }
    }
    
    // Don't forget the last package
    if (currentName && currentVersion) {
      dependencies.push({
        name: currentName,
        version: currentVersion,
        ecosystem: 'npm',
        sourceFile,
        isDevDependency: currentDev,
        isOptional: currentOptional,
      });
    }
  } catch (error) {
    console.error('Failed to parse pnpm-lock.yaml:', error);
  }
  
  return dependencies;
}

export function parseNpmLockfile(file: DependencyFile): ParsedDependency[] {
  switch (file.type) {
    case 'package-lock.json':
      return parsePackageLock(file.content, file.path);
    case 'yarn.lock':
      return parseYarnLock(file.content, file.path);
    case 'pnpm-lock.yaml':
      return parsePnpmLock(file.content, file.path);
    default:
      return [];
  }
}