'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScanProgressDisplay } from './ScanProgress';
import { GitBranch, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ScanProgress, ScanError, ScanResult } from '@/types';

interface ScanFormProps {
  onScanComplete?: (result: ScanResult) => void;
}

const EXAMPLE_REPOS = [
  { name: 'Express.js', url: 'https://github.com/expressjs/express', description: 'Fast, unopinionated web framework for Node.js' },
  { name: 'Django', url: 'https://github.com/django/django', description: 'High-level Python web framework' },
  { name: 'React', url: 'https://github.com/facebook/react', description: 'JavaScript library for building user interfaces' },
];

export function ScanForm({ onScanComplete }: ScanFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  const validateUrl = (input: string): string | null => {
    try {
      const parsed = new URL(input);
      if (parsed.hostname !== 'github.com') {
        return 'Please enter a valid GitHub repository URL';
      }
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) {
        return 'Please enter a complete repository URL (e.g., https://github.com/owner/repo)';
      }
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsScanning(true);
    const controller = new AbortController();
    setAbortController(controller);
    
    // Simulate progress updates
    const stages: ScanProgress['stage'][] = [
      'validating',
      'fetching_repo',
      'discovering_files',
      'parsing_dependencies',
      'querying_vulnerabilities',
      'calculating_risk',
      'generating_report',
      'complete',
    ];
    
    for (let i = 0; i < stages.length; i++) {
      if (controller.signal.aborted) return;
      
      setProgress({
        stage: stages[i],
        message: '',
        progress: Math.round(((i + 1) / stages.length) * 100),
      });
      
      // Wait a bit for visual effect
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const scanError = data as ScanError;
        setProgress({
          stage: 'error',
          message: scanError.message,
          progress: 0,
          details: scanError.code,
        });
        setError(scanError.message);
        return;
      }
      
      const result = data as ScanResult;
      setProgress({
        stage: 'complete',
        message: 'Scan completed successfully',
        progress: 100,
      });
      
      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      
      setProgress({
        stage: 'error',
        message: 'Scan failed. Please try again.',
        progress: 0,
      });
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsScanning(false);
      setAbortController(null);
    }
  };
  
  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
    }
    setIsScanning(false);
    setProgress(null);
    setAbortController(null);
  };
  
  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    setError(undefined);
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Input Card */}
      <Card variant="elevated">
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-reposentry-primary/10 text-reposentry-primary text-sm font-medium mb-4">
              <GitBranch className="w-4 h-4" />
              GitHub Repository Scanner
            </div>
            <h2 className="text-2xl font-bold text-reposentry-text mb-2">
              Analyze Your Dependencies
            </h2>
            <p className="text-reposentry-textMuted">
              Enter a public GitHub repository URL to scan for known vulnerabilities
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Repository URL"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              error={error}
              disabled={isScanning}
              helperText="Public repositories only. Supports npm, pip, and other ecosystems."
            />
            
            <div className="flex gap-3">
              <Button 
                type="submit" 
                size="lg" 
                isLoading={isScanning && !progress}
                className="flex-1"
                disabled={isScanning && progress?.stage === 'complete'}
              >
                {isScanning ? 'Scanning...' : 'Start Security Scan'}
              </Button>
              
              {isScanning && progress && progress.stage !== 'complete' && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="lg"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-reposentry-danger/10 border border-reposentry-danger/20">
                <AlertCircle className="w-5 h-5 text-reposentry-danger flex-shrink-0" />
                <p className="text-sm text-reposentry-danger">{error}</p>
              </div>
            )}
          </form>
          
          {/* Example Repos */}
          <div className="pt-4 border-t border-reposentry-border">
            <p className="text-sm text-reposentry-textDim mb-3 text-center">Try with an example:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {EXAMPLE_REPOS.map((repo) => (
                <button
                  key={repo.name}
                  type="button"
                  onClick={() => handleExampleClick(repo.url)}
                  disabled={isScanning}
                  className={cn(
                    'p-3 rounded-lg border border-reposentry-border hover:border-reposentry-primary/50',
                    'transition-all duration-200 text-left disabled:opacity-50',
                    'bg-reposentry-surface/50 hover:bg-reposentry-surfaceHover'
                  )}
                >
                  <p className="font-medium text-reposentry-text text-sm">{repo.name}</p>
                  <p className="text-xs text-reposentry-textMuted mt-0.5 truncate">{repo.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Progress Display */}
      {progress && (
        <ScanProgressDisplay progress={progress} />
      )}
    </div>
  );
}