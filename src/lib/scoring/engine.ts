// Risk Scoring Engine

import type { VulnerabilityFinding, SeverityLevel, RiskScoreBreakdown, RiskLevel } from '@/types';

const SEVERITY_WEIGHTS: Record<SeverityLevel, number> = {
  critical: 25,
  high: 12,
  moderate: 5,
  low: 2,
  unknown: 1,
};

const RISK_THRESHOLDS: { level: RiskLevel; min: number; max: number }[] = [
  { level: 'critical', min: 75, max: 100 },
  { level: 'high', min: 50, max: 74 },
  { level: 'moderate', min: 25, max: 49 },
  { level: 'low', min: 10, max: 24 },
  { level: 'minimal', min: 0, max: 9 },
];

export function calculateRiskScore(findings: VulnerabilityFinding[]): RiskScoreBreakdown {
  const breakdown: Record<SeverityLevel, number> = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    unknown: 0,
  };
  
  // Count unique vulnerabilities by severity (deduplicate by vulnerability ID)
  const uniqueVulns = new Map<string, VulnerabilityFinding>();
  
  for (const finding of findings) {
    if (!uniqueVulns.has(finding.id)) {
      uniqueVulns.set(finding.id, finding);
    }
  }
  
  for (const vuln of uniqueVulns.values()) {
    const weight = SEVERITY_WEIGHTS[vuln.severity] || 0;
    breakdown[vuln.severity] += weight;
  }
  
  // Calculate total score
  let totalScore = breakdown.critical + breakdown.high + breakdown.moderate + breakdown.low + breakdown.unknown;
  
  // Cap at 100
  totalScore = Math.min(totalScore, 100);
  
  // Determine risk level
  let level: RiskLevel = 'minimal';
  for (const threshold of RISK_THRESHOLDS) {
    if (totalScore >= threshold.min && totalScore <= threshold.max) {
      level = threshold.level;
      break;
    }
  }
  
  return {
    score: totalScore,
    level,
    maxScore: 100,
    breakdown,
  };
}

export function getSeverityCounts(findings: VulnerabilityFinding[]): Record<SeverityLevel, number> {
  const counts: Record<SeverityLevel, number> = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    unknown: 0,
  };
  
  // Count unique vulnerabilities by severity
  const uniqueVulns = new Map<string, VulnerabilityFinding>();
  
  for (const finding of findings) {
    if (!uniqueVulns.has(finding.id)) {
      uniqueVulns.set(finding.id, finding);
    }
  }
  
  for (const vuln of uniqueVulns.values()) {
    counts[vuln.severity]++;
  }
  
  return counts;
}

export function getRiskLevelDescription(level: RiskLevel): string {
  const descriptions: Record<RiskLevel, string> = {
    critical: 'Critical risk - Immediate action required. Multiple critical vulnerabilities detected.',
    high: 'High risk - Urgent attention needed. High-severity vulnerabilities present.',
    moderate: 'Moderate risk - Review and plan remediation. Several moderate vulnerabilities found.',
    low: 'Low risk - Monitor and address when convenient. Minor vulnerabilities detected.',
    minimal: 'Minimal risk - No significant known vulnerabilities found.',
  };
  
  return descriptions[level];
}

export function getRiskLevelColor(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    critical: 'text-red-400 bg-red-900/30 border-red-800',
    high: 'text-orange-400 bg-orange-900/30 border-orange-800',
    moderate: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
    low: 'text-blue-400 bg-blue-900/30 border-blue-800',
    minimal: 'text-green-400 bg-green-900/30 border-green-800',
  };
  
  return colors[level];
}