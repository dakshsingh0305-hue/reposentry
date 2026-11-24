'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LinearProgress } from '@/components/ui/Progress';
import { getRiskLevelColor, getRiskLevelDescription } from '@/lib/scoring/engine';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle2, TrendingUp, Shield } from 'lucide-react';
import type { RiskLevel } from '@/types';

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
  breakdown: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  totalVulns: number;
  scannedAt: string;
}

export function RiskScore({ score, level, breakdown, totalVulns, scannedAt }: RiskScoreProps) {
  const colorClass = getRiskLevelColor(level);
  const description = getRiskLevelDescription(level);
  
  const getLevelIcon = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertCircle className="w-8 h-8" />;
      case 'moderate':
      case 'low':
        return <TrendingUp className="w-8 h-8" />;
      case 'minimal':
        return <CheckCircle2 className="w-8 h-8" />;
    }
  };
  
  const variantMap: Record<RiskLevel, 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
    minimal: 'success',
    low: 'default',
    moderate: 'warning',
    high: 'danger',
    critical: 'danger',
  };
  
  return (
    <Card variant="elevated" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-reposentry-primary/5 via-transparent to-transparent" />
      
      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-reposentry-text">Security Risk Score</h3>
            <p className="text-sm text-reposentry-textMuted mt-1">
              Based on {totalVulns} unique vulnerabilit{totalVulns !== 1 ? 'ies' : 'y'} found
            </p>
          </div>
          <div className={cn('p-3 rounded-xl', colorClass)}>
            {getLevelIcon(level)}
          </div>
        </div>
        
        {/* Score Display */}
        <div className="flex items-end gap-6">
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-5xl font-bold text-reposentry-text">{score}</span>
              <span className="text-reposentry-textDim">/ 100</span>
              <Badge variant={level as any} size="lg" dot className="ml-2">
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Badge>
            </div>
            
            <LinearProgress value={score} max={100} size="lg" variant={variantMap[level]} className="h-3" />
            
            <p className="mt-3 text-sm text-reposentry-textMuted">{description}</p>
          </div>
          
          <div className="w-48 h-48 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                className="opacity-20"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 283} 283`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#00b4d8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        {/* Breakdown */}
        <div className="grid grid-cols-4 gap-3 pt-4 border-t border-reposentry-border">
          <SeverityBreakdownItem 
            label="Critical" 
            value={breakdown.critical} 
            color="red-400" 
            weight={25}
          />
          <SeverityBreakdownItem 
            label="High" 
            value={breakdown.high} 
            color="orange-400" 
            weight={12}
          />
          <SeverityBreakdownItem 
            label="Moderate" 
            value={breakdown.moderate} 
            color="yellow-400" 
            weight={5}
          />
          <SeverityBreakdownItem 
            label="Low" 
            value={breakdown.low} 
            color="blue-400" 
            weight={2}
          />
        </div>
        
        <p className="text-xs text-reposentry-textDim text-center">
          Last scanned: {new Date(scannedAt).toLocaleString()}
        </p>
      </div>
    </Card>
  );
}

function SeverityBreakdownItem({ label, value, color, weight }: { label: string; value: number; color: string; weight: number }) {
  const totalPoints = value * weight;
  
  return (
    <div className="text-center p-3 rounded-lg bg-reposentry-surface/50 border border-reposentry-border/50">
      <div className={cn('text-2xl font-bold', `text-${color}`)}>{value}</div>
      <div className="text-xs text-reposentry-textMuted uppercase tracking-wide">{label}</div>
      <div className="text-xs text-reposentry-textDim mt-1">{totalPoints} pts</div>
    </div>
  );
}