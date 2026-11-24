'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScanForm } from '@/components/scan/ScanForm';
import { RiskScore } from '@/components/dashboard/RiskScore';
import { VulnerabilityExplorer } from '@/components/dashboard/VulnerabilityExplorer';
import { DependencyInventory } from '@/components/dashboard/DependencyInventory';
import { ExportControls } from '@/components/dashboard/ExportControls';
import { AIExplanationPanel } from '@/components/dashboard/AIExplanationPanel';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Shield, 
  ArrowLeft, 
  GitBranch, 
  ExternalLink,
  RefreshCw,
  Info
} from 'lucide-react';
import Link from 'next/link';
import type { ScanResult } from '@/types';

interface ScanPageClientProps {
  onScanComplete?: (result: ScanResult) => void;
}

export function ScanPageClient({ onScanComplete }: ScanPageClientProps) {
  const searchParams = useSearchParams();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(false);
  
  // Check if AI is enabled
  useEffect(() => {
    fetch('/api/ai')
      .then(res => res.json())
      .then(data => setAiEnabled(data.enabled))
      .catch(() => setAiEnabled(false));
  }, []);
  
  // Handle pre-filled repo from query param
  useEffect(() => {
    const repoUrl = searchParams?.get('repo');
    if (repoUrl && !scanResult) {
      // The ScanForm will handle this via URL
    }
  }, [scanResult, searchParams]);
  
  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    if (onScanComplete) {
      onScanComplete(result);
    }
  };
  
  const handleNewScan = () => {
    setScanResult(null);
    window.history.replaceState({}, '', '/scan');
  };
  
  if (scanResult) {
    return (
      <div className="min-h-screen bg-reposentry-bg">
        {/* Header */}
        <header className="border-b border-reposentry-border bg-reposentry-surface/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-reposentry-primary to-reposentry-secondary flex items-center justify-center">
                  <Shield className="w-5 h-5 text-reposentry-bg" />
                </div>
                <span className="font-bold text-xl text-reposentry-text">RepoSentry</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link 
                  href={scanResult.repository.htmlUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-reposentry-textMuted hover:text-reposentry-text transition-colors"
                >
                  <GitBranch className="w-4 h-4" />
                  View on GitHub
                </Link>
                <Button variant="ghost" onClick={handleNewScan} leftIcon={<ArrowLeft className="w-4 h-4" />} >
                  New Scan
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Repository Info */}
          <Card variant="elevated" className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-reposentry-primary/10 flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-reposentry-primary" />
                </div>
                <div>
                  <Link 
                    href={scanResult.repository.htmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-reposentry-primary transition-colors"
                  >
                    <h2 className="text-xl font-bold text-reposentry-text">
                      {scanResult.repository.owner} / {scanResult.repository.name}
                    </h2>
                    <ExternalLink className="w-4 h-4 text-reposentry-textDim" />
                  </Link>
                  <p className="text-reposentry-textMuted text-sm mt-1">
                    {scanResult.repository.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-reposentry-textDim">
                    <span className="flex items-center gap-1">
                      <Badge variant="info" size="sm">Branch: {scanResult.repository.defaultBranch}</Badge>
                    </span>
                    <span className="flex items-center gap-1">
                      Scanned: {new Date(scanResult.scannedAt).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      Duration: {scanResult.scanDurationMs}ms
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant={scanResult.riskLevel as any} size="lg" dot>
                  {scanResult.riskLevel.charAt(0).toUpperCase() + scanResult.riskLevel.slice(1)} Risk
                </Badge>
                <Badge variant="info" size="sm">{scanResult.dependenciesScanned} Dependencies</Badge>
                <Badge variant="danger" size="sm" dot>{scanResult.totalVulnerabilities} Vulnerabilities</Badge>
              </div>
            </div>
          </Card>
          
          {/* Main Dashboard Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Risk Score */}
            <div className="lg:col-span-1">
              <RiskScore
                score={scanResult.riskScore}
                level={scanResult.riskLevel}
                breakdown={{
                  critical: scanResult.severityCounts.critical,
                  high: scanResult.severityCounts.high,
                  moderate: scanResult.severityCounts.moderate,
                  low: scanResult.severityCounts.low,
                }}
                totalVulns={scanResult.totalVulnerabilities}
                scannedAt={scanResult.scannedAt}
              />
              
              {/* Export Controls */}
              <ExportControls scanResult={scanResult} />
            </div>
            
            {/* Right Column - Vulnerabilities & Dependencies */}
            <div className="lg:col-span-2 space-y-6">
              {/* Vulnerability Explorer */}
              <VulnerabilityExplorer findings={scanResult.findings} />
              
              {/* Dependency Inventory */}
              <DependencyInventory 
                dependencies={scanResult.allDependencies} 
                findings={scanResult.findings} 
              />
              
              {/* Skipped Dependencies */}
              {scanResult.skippedDependencies.length > 0 && (
                <Card variant="outlined">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-reposentry-warning" />
                    <h3 className="font-semibold text-reposentry-text">Skipped Dependencies</h3>
                  </div>
                  <div className="space-y-2">
                    {scanResult.skippedDependencies.map((skipped, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-reposentry-surface/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-reposentry-text">{skipped.name}</span>
                          <Badge variant="default" size="sm">{skipped.ecosystem}</Badge>
                        </div>
                        <span className="text-sm text-reposentry-textDim">{skipped.reason}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
          
          {/* AI Explanation Panel */}
          {aiEnabled && (
            <div className="mt-8">
              <AIExplanationPanel findings={scanResult.findings} enabled={true} />
            </div>
          )}
        </main>
      </div>
    );
  }
  
  // Show scan form
  return (
    <div className="min-h-screen bg-reposentry-bg flex flex-col">
      <header className="border-b border-reposentry-border bg-reposentry-surface/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-reposentry-primary to-reposentry-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-reposentry-bg" />
              </div>
              <span className="font-bold text-xl text-reposentry-text">RepoSentry</span>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-3xl">
          <ScanForm onScanComplete={handleScanComplete} />
        </div>
      </main>
    </div>
  );
}
