import { calculateRiskScore, getSeverityCounts, getRiskLevelDescription } from './engine';
import type { VulnerabilityFinding, SeverityLevel } from '@/types';

const createMockFinding = (overrides: Partial<VulnerabilityFinding> = {}): VulnerabilityFinding => ({
  id: 'CVE-2024-1234',
  packageName: 'test-package',
  installedVersion: '1.0.0',
  ecosystem: 'npm',
  vulnerability: {
    id: 'CVE-2024-1234',
    summary: 'Test vulnerability',
    details: 'Test details',
    aliases: [],
    affected: [],
    references: [],
    severity: [],
    schemaVersion: '1.0',
    modified: '2024-01-01T00:00:00Z',
    published: '2024-01-01T00:00:00Z',
  },
  severity: 'moderate' as SeverityLevel,
  cvssScore: 5.0,
  affectedVersions: ['1.0.0'],
  fixedVersions: ['1.0.1'],
  references: [],
  advisoryUrl: null,
  ...overrides,
});

describe('Risk Scoring Engine', () => {
  describe('calculateRiskScore', () => {
    test('returns minimal for no findings', () => {
      const result = calculateRiskScore([]);
      expect(result.score).toBe(0);
      expect(result.level).toBe('minimal');
      expect(result.breakdown).toEqual({ critical: 0, high: 0, moderate: 0, low: 0, unknown: 0 });
    });

    test('calculates critical vulnerabilities correctly', () => {
      const findings = [
        createMockFinding({ id: 'CVE-1', severity: 'critical', cvssScore: 9.5 }),
        createMockFinding({ id: 'CVE-2', severity: 'critical', cvssScore: 9.8 }),
      ];
      const result = calculateRiskScore(findings);
      expect(result.breakdown.critical).toBe(50); // 2 * 25
      expect(result.score).toBe(50);
      expect(result.level).toBe('high');
    });

    test('calculates high vulnerabilities correctly', () => {
      const findings = [
        createMockFinding({ id: 'CVE-1', severity: 'high', cvssScore: 7.5 }),
        createMockFinding({ id: 'CVE-2', severity: 'high', cvssScore: 8.0 }),
        createMockFinding({ id: 'CVE-3', severity: 'high', cvssScore: 7.2 }),
      ];
      const result = calculateRiskScore(findings);
      expect(result.breakdown.high).toBe(36); // 3 * 12
      expect(result.score).toBe(36);
      expect(result.level).toBe('moderate');
    });

    test('calculates moderate vulnerabilities correctly', () => {
      const findings = [
        createMockFinding({ id: 'CVE-1', severity: 'moderate', cvssScore: 5.5 }),
        createMockFinding({ id: 'CVE-2', severity: 'moderate', cvssScore: 6.0 }),
      ];
      const result = calculateRiskScore(findings);
      expect(result.breakdown.moderate).toBe(10); // 2 * 5
      expect(result.score).toBe(10);
      expect(result.level).toBe('low');
    });

    test('calculates low vulnerabilities correctly', () => {
      const findings = [
        createMockFinding({ id: 'CVE-1', severity: 'low', cvssScore: 2.5 }),
        createMockFinding({ id: 'CVE-2', severity: 'low', cvssScore: 3.0 }),
        createMockFinding({ id: 'CVE-3', severity: 'low', cvssScore: 3.5 }),
        createMockFinding({ id: 'CVE-4', severity: 'low', cvssScore: 2.0 }),
        createMockFinding({ id: 'CVE-5', severity: 'low', cvssScore: 2.5 }),
      ];
      const result = calculateRiskScore(findings);
      expect(result.breakdown.low).toBe(10); // 5 * 2
      expect(result.score).toBe(10);
      expect(result.level).toBe('low');
    });

    test('deduplicates by vulnerability ID', () => {
      const findings = [
        createMockFinding({ id: 'CVE-1', severity: 'critical', cvssScore: 9.5, packageName: 'pkg-a' }),
        createMockFinding({ id: 'CVE-1', severity: 'critical', cvssScore: 9.5, packageName: 'pkg-b' }),
        createMockFinding({ id: 'CVE-2', severity: 'high', cvssScore: 7.5 }),
      ];
      const result = calculateRiskScore(findings);
      // Should only count CVE-1 once
      expect(result.breakdown.critical).toBe(25);
      expect(result.breakdown.high).toBe(12);
      expect(result.score).toBe(37);
    });

    test('caps score at 100', () => {
      const findings = Array(5).fill(null).map((_, i) => 
        createMockFinding({ id: `CVE-${i}`, severity: 'critical', cvssScore: 9.5 })
      );
      const result = calculateRiskScore(findings);
      expect(result.score).toBe(100);
      expect(result.level).toBe('critical');
    });

    test('handles mixed severities', () => {
      const findings = [
        createMockFinding({ id: 'CVE-1', severity: 'critical', cvssScore: 9.5 }),
        createMockFinding({ id: 'CVE-2', severity: 'high', cvssScore: 7.5 }),
        createMockFinding({ id: 'CVE-3', severity: 'moderate', cvssScore: 5.5 }),
        createMockFinding({ id: 'CVE-4', severity: 'low', cvssScore: 2.5 }),
      ];
      const result = calculateRiskScore(findings);
      expect(result.breakdown.critical).toBe(25);
      expect(result.breakdown.high).toBe(12);
      expect(result.breakdown.moderate).toBe(5);
      expect(result.breakdown.low).toBe(2);
      expect(result.score).toBe(44);
      expect(result.level).toBe('moderate');
    });

    test('handles unknown severity', () => {
      const findings = [
        createMockFinding({ id: 'CVE-1', severity: 'unknown', cvssScore: null }),
      ];
      const result = calculateRiskScore(findings);
      expect(result.breakdown.unknown).toBe(1); // unknown = 1 point
      expect(result.score).toBe(1);
    });
  });

  describe('getSeverityCounts', () => {
    test('counts unique vulnerabilities by severity', () => {
      const findings = [
        createMockFinding({ id: 'CVE-1', severity: 'critical' }),
        createMockFinding({ id: 'CVE-2', severity: 'high' }),
        createMockFinding({ id: 'CVE-3', severity: 'high' }),
        createMockFinding({ id: 'CVE-4', severity: 'moderate' }),
        createMockFinding({ id: 'CVE-5', severity: 'low' }),
        createMockFinding({ id: 'CVE-1', severity: 'critical' }), // duplicate
      ];
      const counts = getSeverityCounts(findings);
      expect(counts).toEqual({
        critical: 1,
        high: 2,
        moderate: 1,
        low: 1,
        unknown: 0,
      });
    });
  });

  describe('getRiskLevelDescription', () => {
    test('returns correct descriptions', () => {
      expect(getRiskLevelDescription('critical')).toContain('Critical risk');
      expect(getRiskLevelDescription('high')).toContain('High risk');
      expect(getRiskLevelDescription('moderate')).toContain('Moderate risk');
      expect(getRiskLevelDescription('low')).toContain('Low risk');
      expect(getRiskLevelDescription('minimal')).toContain('Minimal risk');
    });
  });
});