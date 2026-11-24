// OSV.dev API Client

import type { 
  ParsedDependency, 
  OSVVulnerability, 
  OSVBatchQuery, 
  OSVBatchResponse,
  OSVQuery,
  VulnerabilityFinding,
  SeverityLevel,
  Ecosystem
} from '@/types';

const OSV_API_BASE = 'https://api.osv.dev/v1';

// Map our ecosystem names to OSV ecosystem names
function mapEcosystem(ecosystem: Ecosystem): string {
  const mapping: Record<Ecosystem, string> = {
    npm: 'npm',
    pypi: 'PyPI',
    maven: 'Maven',
    go: 'Go',
    cargo: 'crates.io',
    nuget: 'NuGet',
    rubygems: 'RubyGems',
    composer: 'Packagist',
    hex: 'Hex',
    pub: 'Pub',
    unknown: 'Unknown',
  };
  return mapping[ecosystem] || ecosystem;
}

function extractSeverity(vuln: OSVVulnerability): { level: SeverityLevel; score: number | null } {
  if (!vuln.severity || vuln.severity.length === 0) {
    return { level: 'unknown', score: null };
  }
  
  // Prefer CVSS v3/v4 scores
  for (const sev of vuln.severity) {
    if (sev.type === 'CVSS_V3' || sev.type === 'CVSS_V4') {
      const score = parseFloat(sev.score);
      if (!isNaN(score)) {
        if (score >= 9.0) return { level: 'critical', score };
        if (score >= 7.0) return { level: 'high', score };
        if (score >= 4.0) return { level: 'moderate', score };
        if (score > 0) return { level: 'low', score };
      }
    }
  }
  
  // Fallback to CVSS v2
  for (const sev of vuln.severity) {
    if (sev.type === 'CVSS_V2') {
      const score = parseFloat(sev.score);
      if (!isNaN(score)) {
        if (score >= 9.0) return { level: 'critical', score };
        if (score >= 7.0) return { level: 'high', score };
        if (score >= 4.0) return { level: 'moderate', score };
        if (score > 0) return { level: 'low', score };
      }
    }
  }
  
  return { level: 'unknown', score: null };
}

function extractFixedVersions(vuln: OSVVulnerability): string[] {
  const fixed: string[] = [];
  
  for (const affected of vuln.affected) {
    for (const range of affected.ranges) {
      for (const event of range.events) {
        if (event.fixed) {
          fixed.push(event.fixed);
        }
      }
    }
  }
  
  return [...new Set(fixed)];
}

function extractAffectedVersions(vuln: OSVVulnerability): string[] {
  const affected: string[] = [];
  
  for (const a of vuln.affected) {
    if (a.versions && a.versions.length > 0) {
      affected.push(...a.versions);
    }
  }
  
  return [...new Set(affected)];
}

function extractReferences(vuln: OSVVulnerability): string[] {
  return vuln.references
    .filter(r => r.url)
    .map(r => r.url);
}

function getAdvisoryUrl(vuln: OSVVulnerability): string | null {
  // Try to find a primary advisory URL
  const advisoryRef = vuln.references.find(r => r.type === 'ADVISORY');
  if (advisoryRef) return advisoryRef.url;
  
  const webRef = vuln.references.find(r => r.type === 'WEB');
  if (webRef) return webRef.url;
  
  return vuln.references[0]?.url || null;
}

function isVersionAffected(installedVersion: string, vuln: OSVVulnerability): boolean {
  // Check if the installed version is in the affected versions list
  const affectedVersions = extractAffectedVersions(vuln);
  if (affectedVersions.length > 0) {
    return affectedVersions.includes(installedVersion);
  }
  
  // Check ranges
  for (const affected of vuln.affected) {
    for (const range of affected.ranges) {
      let introduced = '0';
      let fixed: string | null = null;
      
      for (const event of range.events) {
        if (event.introduced) introduced = event.introduced;
        if (event.fixed) fixed = event.fixed;
        if (event.lastAffected) fixed = event.lastAffected;
      }
      
      // Simple semver comparison (this is a basic implementation)
      if (compareVersions(installedVersion, introduced) >= 0) {
        if (!fixed || compareVersions(installedVersion, fixed) <= 0) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Simple version comparison for semver-like versions
function compareVersions(a: string, b: string): number {
  // Handle non-numeric versions
  const parseVersion = (v: string) => v.split(/[.-]/).map(part => {
    const num = parseInt(part, 10);
    return isNaN(num) ? part : num;
  });
  
  const aParts = parseVersion(a);
  const bParts = parseVersion(b);
  
  const maxLen = Math.max(aParts.length, bParts.length);
  
  for (let i = 0; i < maxLen; i++) {
    const aPart = aParts[i] ?? 0;
    const bPart = bParts[i] ?? 0;
    
    if (aPart < bPart) return -1;
    if (aPart > bPart) return 1;
  }
  
  return 0;
}

export async function queryVulnerabilities(dependencies: ParsedDependency[]): Promise<VulnerabilityFinding[]> {
  if (dependencies.length === 0) return [];
  
  // Batch queries in groups of 100 (OSV limit)
  const batchSize = 100;
  const allFindings: VulnerabilityFinding[] = [];
  
  for (let i = 0; i < dependencies.length; i += batchSize) {
    const batch = dependencies.slice(i, i + batchSize);
    const findings = await queryBatch(batch);
    allFindings.push(...findings);
  }
  
  return allFindings;
}

async function queryBatch(dependencies: ParsedDependency[]): Promise<VulnerabilityFinding[]> {
  const queries: OSVQuery[] = dependencies.map(dep => ({
    package: {
      name: dep.name,
      ecosystem: mapEcosystem(dep.ecosystem),
    },
    version: dep.version,
  }));
  
  const batchQuery: OSVBatchQuery = { queries };
  
  const response = await fetch(`${OSV_API_BASE}/querybatch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'RepoSentry/1.0',
    },
    body: JSON.stringify(batchQuery),
    signal: AbortSignal.timeout(30000),
  });
  
  if (!response.ok) {
    throw new Error(`OSV API error: ${response.status}`);
  }
  
  const data: OSVBatchResponse = await response.json();
  const findings: VulnerabilityFinding[] = [];
  
  for (let i = 0; i < data.results.length; i++) {
    const result = data.results[i];
    const dep = dependencies[i];
    
    for (const vuln of result.vulns || []) {
      // Verify this vulnerability affects our version
      if (!isVersionAffected(dep.version, vuln)) continue;
      
      const { level, score } = extractSeverity(vuln);
      const fixedVersions = extractFixedVersions(vuln);
      const affectedVersions = extractAffectedVersions(vuln);
      const references = extractReferences(vuln);
      const advisoryUrl = getAdvisoryUrl(vuln);
      
      findings.push({
        id: vuln.id,
        packageName: dep.name,
        installedVersion: dep.version,
        ecosystem: dep.ecosystem,
        vulnerability: vuln,
        severity: level,
        cvssScore: score,
        affectedVersions,
        fixedVersions,
        references,
        advisoryUrl,
      });
    }
  }
  
  return findings;
}

export async function fetchVulnerabilityDetails(vulnId: string): Promise<OSVVulnerability | null> {
  const response = await fetch(`${OSV_API_BASE}/vulns/${vulnId}`, {
    headers: {
      'User-Agent': 'RepoSentry/1.0',
    },
    signal: AbortSignal.timeout(10000),
  });
  
  if (!response.ok) {
    return null;
  }
  
  return response.json();
}