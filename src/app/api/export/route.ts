// Export API Route

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { ScanResult, ExportData } from '@/types';

const exportRequestSchema = z.object({
  scanResult: z.any(), // We'll validate structure loosely
  format: z.enum(['json', 'csv']),
});

function generateCSV(scanResult: ScanResult): string {
  const headers = [
    'Vulnerability ID',
    'Package Name',
    'Installed Version',
    'Ecosystem',
    'Severity',
    'CVSS Score',
    'Summary',
    'Affected Versions',
    'Fixed Versions',
    'Advisory URL',
    'References',
  ];
  
  const rows = scanResult.findings.map(finding => [
    finding.id,
    finding.packageName,
    finding.installedVersion,
    finding.ecosystem,
    finding.severity,
    finding.cvssScore?.toString() || 'N/A',
    `"${(finding.vulnerability.summary || '').replace(/"/g, '""')}"`,
    `"${finding.affectedVersions.join('; ')}"`,
    `"${finding.fixedVersions.join('; ')}"`,
    finding.advisoryUrl || 'N/A',
    `"${finding.references.join('; ')}"`,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function generateJSON(scanResult: ScanResult): ExportData {
  return {
    scanResult,
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scanResult, format } = exportRequestSchema.parse(body);
    
    // Validate required fields
    if (!scanResult || !scanResult.repository || !scanResult.findings) {
      return NextResponse.json(
        { error: 'Invalid scan result data' },
        { status: 400 }
      );
    }
    
    if (format === 'csv') {
      const csv = generateCSV(scanResult);
      const filename = `reposentry-report-${scanResult.repository.owner}-${scanResult.repository.name}-${Date.now()}.csv`;
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
    
    const json = generateJSON(scanResult);
    const filename = `reposentry-report-${scanResult.repository.owner}-${scanResult.repository.name}-${Date.now()}.json`;
    
    return new NextResponse(JSON.stringify(json, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid export request' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}