// Scan API Route

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseGitHubUrl, fetchRepository, discoverDependencyFiles } from '@/lib/github/client';
import { parseDependencyFiles } from '@/lib/parser';
import { queryVulnerabilities } from '@/lib/osv/client';
import { calculateRiskScore, getSeverityCounts } from '@/lib/scoring/engine';
import type { ScanResult, ScanProgress, ScanError } from '@/types';

const scanRequestSchema = z.object({
  url: z.string().url(),
});

const SCAN_STAGES: ScanProgress['stage'][] = [
  'validating',
  'fetching_repo',
  'discovering_files',
  'parsing_dependencies',
  'querying_vulnerabilities',
  'calculating_risk',
  'generating_report',
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { url } = scanRequestSchema.parse(body);
    
    // Stage 1: Validate URL
    const repoInfo = await parseGitHubUrl(url);
    if (!repoInfo) {
      return NextResponse.json<ScanError>({
        stage: 'validating',
        message: 'Invalid GitHub repository URL',
        code: 'INVALID_URL',
        recoverable: true,
      }, { status: 400 });
    }
    
    // Stage 2: Fetch repository metadata
    const repository = await fetchRepository(repoInfo.owner, repoInfo.repo);
    if (!repository) {
      return NextResponse.json<ScanError>({
        stage: 'fetching_repo',
        message: 'Repository not found or inaccessible',
        code: 'REPO_NOT_FOUND',
        recoverable: true,
      }, { status: 404 });
    }
    
    if (repository.isPrivate) {
      return NextResponse.json<ScanError>({
        stage: 'fetching_repo',
        message: 'Private repositories are not supported',
        code: 'PRIVATE_REPO',
        recoverable: false,
      }, { status: 403 });
    }
    
    // Stage 3: Discover dependency files
    const dependencyFiles = await discoverDependencyFiles(
      repository.owner,
      repository.name,
      repository.defaultBranch
    );
    
    if (dependencyFiles.length === 0) {
      return NextResponse.json<ScanError>({
        stage: 'discovering_files',
        message: 'No supported dependency files found in repository',
        code: 'NO_DEP_FILES',
        recoverable: false,
      }, { status: 404 });
    }
    
    // Stage 4: Parse dependencies
    const { dependencies, skipped } = parseDependencyFiles(dependencyFiles);
    
    if (dependencies.length === 0) {
      return NextResponse.json<ScanError>({
        stage: 'parsing_dependencies',
        message: 'No valid dependencies could be parsed from the discovered files',
        code: 'NO_DEPENDENCIES',
        recoverable: false,
      }, { status: 404 });
    }
    
    // Stage 5: Query vulnerabilities
    const findings = await queryVulnerabilities(dependencies);
    
    // Stage 6: Calculate risk score
    const riskScore = calculateRiskScore(findings);
    const severityCounts = getSeverityCounts(findings);
    
    // Stage 7: Generate final report
    const scanResult: ScanResult = {
      repository,
      scannedAt: new Date().toISOString(),
      dependenciesScanned: dependencies.length,
      dependenciesWithVulns: new Set(findings.map(f => f.packageName)).size,
      totalVulnerabilities: findings.length,
      severityCounts,
      riskScore: riskScore.score,
      riskLevel: riskScore.level,
      findings,
      allDependencies: dependencies,
      skippedDependencies: skipped,
      scanDurationMs: Date.now() - startTime,
    };
    
    return NextResponse.json(scanResult);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ScanError>({
        stage: 'validating',
        message: 'Invalid request format',
        code: 'VALIDATION_ERROR',
        recoverable: true,
      }, { status: 400 });
    }
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    let code = 'UNKNOWN_ERROR';
    let stage: ScanProgress['stage'] = 'error';
    let recoverable = true;
    
    if (message.includes('rate limit')) {
      code = 'RATE_LIMIT';
      stage = 'fetching_repo';
    } else if (message.includes('not found') || message.includes('404')) {
      code = 'REPO_NOT_FOUND';
      stage = 'fetching_repo';
      recoverable = true;
    } else if (message.includes('private') || message.includes('403')) {
      code = 'PRIVATE_REPO';
      stage = 'fetching_repo';
      recoverable = false;
    } else if (message.includes('OSV')) {
      code = 'OSV_ERROR';
      stage = 'querying_vulnerabilities';
    }
    
    return NextResponse.json<ScanError>({
      stage,
      message,
      code,
      recoverable,
    }, { status: 500 });
  }
}