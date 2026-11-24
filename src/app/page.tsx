'use client';

import { useState, FormEvent } from 'react';
import { ScanForm } from '@/components/scan/ScanForm';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Shield, 
  Search, 
  GitBranch, 
  Database, 
  Zap, 
  FileText,
  CheckCircle2,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';
import Link from 'next/link';

const FEATURES = [
  {
    icon: Search,
    title: 'Multi-Ecosystem Scanning',
    description: 'Supports npm (package-lock.json, yarn.lock, pnpm-lock.yaml), Python (requirements.txt, poetry.lock), and more.',
  },
  {
    icon: Database,
    title: 'Real Vulnerability Intelligence',
    description: 'Queries OSV.dev - Google\'s open-source vulnerability database - for accurate, up-to-date CVE data.',
  },
  {
    icon: Zap,
    title: 'Risk Scoring Engine',
    description: 'Computes a comprehensive risk score based on severity weights, CVSS scores, and exploitability factors.',
  },
  {
    icon: FileText,
    title: 'Detailed Reports',
    description: 'Exportable reports with remediation guidance, affected versions, and fix recommendations.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-reposentry-bg">
      {/* Navigation */}
      <nav className="border-b border-reposentry-border bg-reposentry-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-reposentry-primary to-reposentry-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-reposentry-bg" />
              </div>
              <span className="font-bold text-xl text-reposentry-text">RepoSentry</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-reposentry-textMuted hover:text-reposentry-text transition-colors">
                <GitBranch className="w-4 h-4" />
                Open Source
              </Link>
              <Link href="/scan">
                <Button size="sm">Start Scan</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-reposentry-primary/10 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="info" className="mb-6 animate-fade-in">
                <span className="mr-1">🚀</span> Open Source Security Intelligence
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
                Know What&apos;s Hiding Inside
                <br />
                <span className="gradient-text">Your Dependencies</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-reposentry-textMuted mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                RepoSentry scans public GitHub repositories, analyzes dependency lockfiles, and reports known vulnerabilities 
                from OSV.dev with actionable remediation guidance.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <Link href="/scan">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-lg" leftIcon={<Search className="w-5 h-5" />}>
                    Start Security Scan
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3 text-lg" leftIcon={<GitBranch className="w-5 h-5" />}>
                  View on GitHub
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-reposentry-textDim animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-reposentry-success" />
                  <span>Real OSV.dev API</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-reposentry-success" />
                  <span>No Code Execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-reposentry-success" />
                  <span>Multipackage Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-reposentry-surface/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-reposentry-text mb-4">Powerful Security Analysis</h2>
              <p className="text-reposentry-textMuted max-w-2xl mx-auto">
                Get comprehensive vulnerability insights with our automated scanning pipeline.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, index) => (
                <Card key={index} variant="interactive" className="group">
                  <div className="w-12 h-12 rounded-xl bg-reposentry-primary/10 flex items-center justify-center mb-4 group-hover:bg-reposentry-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-reposentry-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-reposentry-text mb-2">{feature.title}</h3>
                  <p className="text-sm text-reposentry-textMuted">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-reposentry-text mb-4">How It Works</h2>
              <p className="text-reposentry-textMuted max-w-2xl mx-auto">
                Simple three-step process to understand your repository's security posture.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Enter Repository', desc: 'Paste a public GitHub repository URL and click scan.' },
                { step: '02', title: 'Analyze Lockfiles', desc: 'Our parser extracts dependencies from supported lockfiles.' },
                { step: '03', title: 'Review Findings', desc: 'Get detailed vulnerability reports with remediation guidance.' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-reposentry-primary/10 text-reposentry-primary font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-reposentry-text mb-2">{item.title}</h3>
                  <p className="text-reposentry-textMuted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer Section */}
        <section className="py-12 bg-reposentry-surface/50 border-y border-reposentry-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 text-reposentry-warning mb-4">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="font-medium">Important Notice</span>
            </div>
            <p className="text-sm text-reposentry-textDim">
              This tool provides security intelligence for educational purposes only. Always consult professional security audits 
              for production systems. Data is processed in real-time and not persisted beyond the session.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-reposentry-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-reposentry-primary to-reposentry-secondary flex items-center justify-center">
                <Shield className="w-5 h-5 text-reposentry-bg" />
              </div>
              <span className="font-bold text-xl text-reposentry-text">RepoSentry</span>
            </div>
            
            <p className="text-sm text-reposentry-textDim">
              Built for the open-source community. Not a substitute for professional security audits.
            </p>
            
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-reposentry-textDim hover:text-reposentry-primary transition-colors">
                <GitBranch className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
