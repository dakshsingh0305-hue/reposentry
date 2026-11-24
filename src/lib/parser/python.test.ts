import { parseRequirementsTxt, parsePoetryLock } from './python';

describe('Python lockfile parsers', () => {
  describe('parseRequirementsTxt', () => {
    test('parses pinned requirements', () => {
      const content = `
django==4.2.7
requests==2.31.0
numpy==1.24.3
`;

      const deps = parseRequirementsTxt(content, 'requirements.txt');
      
      expect(deps).toHaveLength(3);
      expect(deps.find(d => d.name === 'django')).toEqual(
        expect.objectContaining({ name: 'django', version: '4.2.7', ecosystem: 'pypi' })
      );
      expect(deps.find(d => d.name === 'requests')).toEqual(
        expect.objectContaining({ name: 'requests', version: '2.31.0', ecosystem: 'pypi' })
      );
    });

    test('skips unpinned requirements', () => {
      const content = `
django>=4.2.0
requests~=2.31.0
numpy
flask>2.0.0,<3.0.0
`;

      const deps = parseRequirementsTxt(content, 'requirements.txt');
      expect(deps).toHaveLength(0);
    });

    test('skips comments and empty lines', () => {
      const content = `
# This is a comment
django==4.2.7

# Another comment
requests==2.31.0
`;

      const deps = parseRequirementsTxt(content, 'requirements.txt');
      expect(deps).toHaveLength(2);
    });

    test('skips URL dependencies', () => {
      const content = `
django @ https://example.com/django-4.2.7.tar.gz
requests==2.31.0
`;

      const deps = parseRequirementsTxt(content, 'requirements.txt');
      expect(deps).toHaveLength(1);
      expect(deps[0].name).toBe('requests');
    });

    test('skips editable installs', () => {
      const content = `
-e git+https://github.com/django/django.git#egg=django
requests==2.31.0
`;

      const deps = parseRequirementsTxt(content, 'requirements.txt');
      expect(deps).toHaveLength(1);
    });

    test('handles extras syntax', () => {
      const content = `
requests[security]==2.31.0
django[argon2]==4.2.7
`;

      const deps = parseRequirementsTxt(content, 'requirements.txt');
      expect(deps).toHaveLength(2);
      expect(deps[0].name).toBe('requests');
      expect(deps[1].name).toBe('django');
    });
  });

  describe('parsePoetryLock', () => {
    test('parses poetry.lock with main and dev dependencies', () => {
      const content = `
[[package]]
name = "django"
version = "4.2.7"
category = "main"

[[package]]
name = "pytest"
version = "7.4.0"
category = "dev"

[[package]]
name = "requests"
version = "2.31.0"
category = "main"
`;

      const deps = parsePoetryLock(content, 'poetry.lock');
      
      expect(deps).toHaveLength(3);
      expect(deps.find(d => d.name === 'django')).toEqual(
        expect.objectContaining({ name: 'django', version: '4.2.7', ecosystem: 'pypi', isDevDependency: false })
      );
      expect(deps.find(d => d.name === 'pytest')).toEqual(
        expect.objectContaining({ name: 'pytest', version: '7.4.0', ecosystem: 'pypi', isDevDependency: true })
      );
      expect(deps.find(d => d.name === 'requests')).toEqual(
        expect.objectContaining({ name: 'requests', version: '2.31.0', ecosystem: 'pypi', isDevDependency: false })
      );
    });
  });
});