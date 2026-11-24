// Core types for RepoSentry

export interface GitHubRepo {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  htmlUrl: string;
  updatedAt: string;
  isPrivate: boolean;
}

export interface DependencyFile {
  path: string;
  type: DependencyFileType;
  content: string;
}

export type DependencyFileType = 
  | 'package-lock.json'
  | 'pnpm-lock.yaml'
  | 'requirements.txt'
  | 'poetry.lock'
  | 'yarn.lock';

export interface ParsedDependency {
  name: string;
  version: string;
  ecosystem: Ecosystem;
  sourceFile: string;
  isDevDependency?: boolean;
  isOptional?: boolean;
}

export type Ecosystem = 
  | 'npm'
  | 'pypi'
  | 'maven'
  | 'go'
  | 'cargo'
  | 'nuget'
  | 'rubygems'
  | 'composer'
  | 'hex'
  | 'pub'
  | 'unknown';

export interface OSVVulnerability {
  id: string;
  summary: string;
  details: string;
  aliases: string[];
  affected: OSVAffected[];
  references: OSVReference[];
  severity: OSVSeverity[];
  schemaVersion: string;
  modified: string;
  published: string;
  ecosystemSpecific?: Record<string, unknown>;
}

export interface OSVAffected {
  package: {
    name: string;
    ecosystem: string;
    purl?: string;
  };
  ranges: OSVRange[];
  versions?: string[];
  databaseSpecific?: Record<string, unknown>;
}

export interface OSVRange {
  type: 'ECOSYSTEM' | 'GIT' | 'SEMVER';
  events: OSVRangeEvent[];
}

export interface OSVRangeEvent {
  introduced?: string;
  fixed?: string;
  lastAffected?: string;
}

export interface OSVReference {
  type: 'WEB' | 'ADVISORY' | 'PACKAGE' | 'REPORT' | 'FIX' | 'VCS';
  url: string;
}

export interface OSVSeverity {
  type: 'CVSS_V3' | 'CVSS_V2' | 'CVSS_V4';
  score: string;
  vector?: string;
}

export interface OSVBatchQuery {
  queries: OSVQuery[];
}

export interface OSVQuery {
  package: {
    name: string;
    ecosystem: string;
  };
  version: string;
}

export interface OSVBatchResponse {
  results: OSVQueryResult[];
}

export interface OSVQueryResult {
  vulns: OSVVulnerability[];
}

export interface VulnerabilityFinding {
  id: string;
  packageName: string;
  installedVersion: string;
  ecosystem: Ecosystem;
  vulnerability: OSVVulnerability;
  severity: SeverityLevel;
  cvssScore: number | null;
  affectedVersions: string[];
  fixedVersions: string[];
  references: string[];
  advisoryUrl: string | null;
}

export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low' | 'unknown';

export interface ScanResult {
  repository: GitHubRepo;
  scannedAt: string;
  dependenciesScanned: number;
  dependenciesWithVulns: number;
  totalVulnerabilities: number;
  severityCounts: Record<SeverityLevel, number>;
  riskScore: number;
  riskLevel: RiskLevel;
  findings: VulnerabilityFinding[];
  allDependencies: ParsedDependency[];
  skippedDependencies: SkippedDependency[];
  scanDurationMs: number;
}

export interface SkippedDependency {
  name: string;
  version: string;
  ecosystem: Ecosystem;
  reason: string;
}

export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low' | 'minimal';

export interface RiskScoreBreakdown {
  score: number;
  level: RiskLevel;
  maxScore: number;
  breakdown: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
    unknown: number;
  };
}

export interface AIExplanation {
  summary: string;
  impact: string;
  recommendations: string[];
  priority: 'immediate' | 'high' | 'medium' | 'low';
  generatedAt: string;
  model: string;
}

export interface ExportData {
  scanResult: ScanResult;
  generatedAt: string;
  version: string;
}

export interface ScanProgress {
  stage: ScanStage;
  message: string;
  progress: number;
  details?: string;
}

export type ScanStage = 
  | 'validating'
  | 'fetching_repo'
  | 'discovering_files'
  | 'parsing_dependencies'
  | 'querying_vulnerabilities'
  | 'fetching_advisories'
  | 'calculating_risk'
  | 'generating_report'
  | 'complete'
  | 'error';

export interface ScanError {
  stage: ScanStage;
  message: string;
  code: string;
  recoverable: boolean;
}