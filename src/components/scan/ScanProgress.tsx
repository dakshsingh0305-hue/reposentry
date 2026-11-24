'use client';

import { ScanProgress, ScanStage } from '@/types';
import { Card } from '@/components/ui/Card';
import { LinearProgress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Search, 
  GitBranch, 
  FileText, 
  Database, 
  Shield, 
  FileOutput 
} from 'lucide-react';

const STAGE_CONFIG: Record<ScanStage, { label: string; icon: React.ReactNode; description: string }> = {
  validating: {
    label: 'Validating URL',
    icon: <Search className="w-4 h-4" />,
    description: 'Checking GitHub repository URL format',
  },
  fetching_repo: {
    label: 'Fetching Repository',
    icon: <GitBranch className="w-4 h-4" />,
    description: 'Retrieving repository metadata and default branch',
  },
  discovering_files: {
    label: 'Discovering Files',
    icon: <FileText className="w-4 h-4" />,
    description: 'Scanning for supported dependency lockfiles',
  },
  parsing_dependencies: {
    label: 'Parsing Dependencies',
    icon: <Database className="w-4 h-4" />,
    description: 'Extracting package names and exact versions',
  },
  querying_vulnerabilities: {
    label: 'Querying Vulnerabilities',
    icon: <Shield className="w-4 h-4" />,
    description: 'Checking OSV.dev for known security issues',
  },
  fetching_advisories: {
    label: 'Fetching Advisories',
    icon: <FileText className="w-4 h-4" />,
    description: 'Retrieving detailed vulnerability information',
  },
  calculating_risk: {
    label: 'Calculating Risk',
    icon: <Shield className="w-4 h-4" />,
    description: 'Computing risk score based on severity',
  },
  generating_report: {
    label: 'Generating Report',
    icon: <FileOutput className="w-4 h-4" />,
    description: 'Compiling final security assessment',
  },
  complete: {
    label: 'Scan Complete',
    icon: <CheckCircle2 className="w-4 h-4 text-reposentry-success" />,
    description: 'Security analysis finished successfully',
  },
  error: {
    label: 'Error',
    icon: <AlertCircle className="w-4 h-4 text-reposentry-danger" />,
    description: 'An error occurred during scanning',
  },
};

const STAGE_ORDER: ScanStage[] = [
  'validating',
  'fetching_repo',
  'discovering_files',
  'parsing_dependencies',
  'querying_vulnerabilities',
  'fetching_advisories',
  'calculating_risk',
  'generating_report',
  'complete',
];

export function ScanProgressDisplay({ progress }: { progress: ScanProgress }) {
  const currentStageIndex = STAGE_ORDER.indexOf(progress.stage);
  const totalStages = STAGE_ORDER.length - 1; // Exclude 'complete' and 'error'
  
  return (
    <Card variant="elevated" className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-reposentry-primary/20 flex items-center justify-center">
                {STAGE_CONFIG[progress.stage].icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-reposentry-text">
                  {STAGE_CONFIG[progress.stage].label}
                </h3>
                <p className="text-sm text-reposentry-textMuted">
                  {STAGE_CONFIG[progress.stage].description}
                </p>
              </div>
            </div>
            {progress.stage !== 'complete' && progress.stage !== 'error' && (
              <Badge variant="info" size="sm">
                {currentStageIndex + 1} / {totalStages}
              </Badge>
            )}
          </div>
          
          <LinearProgress 
            value={progress.progress} 
            max={100} 
            size="md" 
            variant={progress.stage === 'error' ? 'danger' : 'primary'}
            className="h-3"
          />
          
          {progress.details && (
            <p className="mt-2 text-sm text-reposentry-textDim font-mono">
              {progress.details}
            </p>
          )}
        </div>
        
        {/* Stage Steps */}
        <div className="space-y-3 pt-4 border-t border-reposentry-border">
          {STAGE_ORDER.map((stage, index) => {
            const config = STAGE_CONFIG[stage];
            const isComplete = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isError = progress.stage === 'error' && index === currentStageIndex;
            
            return (
              <div
                key={stage}
                className={cn(
                  'flex items-center gap-3 transition-all duration-300',
                  isCurrent && 'animate-pulse'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
                  isComplete ? 'bg-reposentry-success text-reposentry-bg' :
                  isCurrent ? 'bg-reposentry-primary text-reposentry-bg animate-pulse' :
                  isError ? 'bg-reposentry-danger text-white' :
                  'bg-reposentry-border text-reposentry-textDim'
                )}>
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isError ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate transition-colors duration-200',
                    isComplete ? 'text-reposentry-success' :
                    isCurrent ? 'text-reposentry-primary' :
                    isError ? 'text-reposentry-danger' :
                    'text-reposentry-textMuted'
                  )}>
                    {config.label}
                  </p>
                  <p className="text-xs text-reposentry-textDim truncate">
                    {config.description}
                  </p>
                </div>
                
                {isCurrent && progress.stage !== 'complete' && progress.stage !== 'error' && (
                  <Badge variant="info" size="sm" className="whitespace-nowrap">
                    In Progress
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}