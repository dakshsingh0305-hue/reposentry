// Main parser entry point

import type { DependencyFile, ParsedDependency, SkippedDependency } from '@/types';
import { parseNpmLockfile } from './npm';
import { parsePythonLockfile } from './python';

export function parseDependencyFiles(files: DependencyFile[]): {
  dependencies: ParsedDependency[];
  skipped: SkippedDependency[];
} {
  const allDependencies: ParsedDependency[] = [];
  const skipped: SkippedDependency[] = [];
  
  for (const file of files) {
    let fileDependencies: ParsedDependency[] = [];
    
    try {
      switch (file.type) {
        case 'package-lock.json':
        case 'yarn.lock':
        case 'pnpm-lock.yaml':
          fileDependencies = parseNpmLockfile(file);
          break;
        case 'requirements.txt':
        case 'poetry.lock':
          fileDependencies = parsePythonLockfile(file);
          break;
        default:
          skipped.push({
            name: file.path,
            version: '',
            ecosystem: 'unknown',
            reason: `Unsupported file type: ${file.type}`,
          });
          continue;
      }
      
      // Track successfully parsed dependencies
      for (const dep of fileDependencies) {
        allDependencies.push(dep);
      }
    } catch (error) {
      skipped.push({
        name: file.path,
        version: '',
        ecosystem: 'unknown',
        reason: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
  
  // Deduplicate by name+version+ecosystem, keeping the first occurrence
  const seen = new Set<string>();
  const deduplicated: ParsedDependency[] = [];
  
  for (const dep of allDependencies) {
    const key = `${dep.ecosystem}:${dep.name}@${dep.version}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(dep);
    }
  }
  
  return {
    dependencies: deduplicated,
    skipped,
  };
}

export function getSupportedFileTypes(): string[] {
  return [
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'requirements.txt',
    'poetry.lock',
  ];
}