import { parsePackageLock, parseYarnLock, parsePnpmLock } from './npm';

describe('npm lockfile parsers', () => {
  describe('parsePackageLock', () => {
    test('parses v2/v3 package-lock.json', () => {
      const lockfile = JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        lockfileVersion: 2,
        packages: {
          '': { name: 'test-project', version: '1.0.0' },
          'node_modules/express': {
            version: '4.18.2',
            dev: false,
            optional: false,
          },
          'node_modules/lodash': {
            version: '4.17.21',
            dev: false,
            optional: false,
          },
          'node_modules/jest': {
            version: '29.7.0',
            dev: true,
            optional: false,
          },
        },
      });

      const deps = parsePackageLock(lockfile, 'package-lock.json');
      
      expect(deps).toHaveLength(3);
      expect(deps.find(d => d.name === 'express')).toEqual(
        expect.objectContaining({ name: 'express', version: '4.18.2', ecosystem: 'npm', isDevDependency: false })
      );
      expect(deps.find(d => d.name === 'lodash')).toEqual(
        expect.objectContaining({ name: 'lodash', version: '4.17.21', ecosystem: 'npm', isDevDependency: false })
      );
      expect(deps.find(d => d.name === 'jest')).toEqual(
        expect.objectContaining({ name: 'jest', version: '29.7.0', ecosystem: 'npm', isDevDependency: true })
      );
    });

    test('handles empty lockfile', () => {
      const lockfile = JSON.stringify({ packages: {} });
      const deps = parsePackageLock(lockfile, 'package-lock.json');
      expect(deps).toHaveLength(0);
    });

    test('handles invalid JSON gracefully', () => {
      const deps = parsePackageLock('invalid json', 'package-lock.json');
      expect(deps).toHaveLength(0);
    });

    test('skips root package', () => {
      const lockfile = JSON.stringify({
        packages: {
          '': { name: 'root', version: '1.0.0' },
          'node_modules/pkg': { version: '1.0.0' },
        },
      });
      const deps = parsePackageLock(lockfile, 'package-lock.json');
      expect(deps).toHaveLength(1);
      expect(deps[0].name).toBe('pkg');
    });
  });

  describe('parsePnpmLock', () => {
    test('parses basic pnpm-lock.yaml', () => {
      const lockfile = `
packages:
  /express@4.18.2:
    version: 4.18.2
  /lodash@4.17.21:
    version: 4.17.21
    dev: true
  /optional-pkg@1.0.0:
    version: 1.0.0
    optional: true
`;

      const deps = parsePnpmLock(lockfile, 'pnpm-lock.yaml');
      
      expect(deps).toHaveLength(3);
      expect(deps.find(d => d.name === 'express')).toEqual(
        expect.objectContaining({ name: 'express', version: '4.18.2', isDevDependency: false, isOptional: false })
      );
      expect(deps.find(d => d.name === 'lodash')).toEqual(
        expect.objectContaining({ name: 'lodash', version: '4.17.21', isDevDependency: true })
      );
      expect(deps.find(d => d.name === 'optional-pkg')).toEqual(
        expect.objectContaining({ name: 'optional-pkg', version: '1.0.0', isOptional: true })
      );
    });
  });

  describe('parseYarnLock', () => {
    test('parses basic yarn.lock', () => {
      const lockfile = `
express@^4.18.0:
  version "4.18.2"
  dependencies:
    body-parser "^1.20.0"

lodash@^4.17.0:
  version "4.17.21"
`;

      const deps = parseYarnLock(lockfile, 'yarn.lock');
      
      expect(deps.length).toBeGreaterThanOrEqual(2);
      const express = deps.find(d => d.name === 'express');
      expect(express).toBeDefined();
      expect(express?.version).toBe('4.18.2');
    });
  });
});