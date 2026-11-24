'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Loader2, Brain, AlertTriangle, CheckCircle2, Clock, Zap, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { VulnerabilityFinding, AIExplanation } from '@/types';

interface AIExplanationPanelProps {
  findings: VulnerabilityFinding[];
  enabled: boolean;
}

const PRIORITY_CONFIG = {
  immediate: { label: 'Immediate', color: 'reposentry-danger', icon: Zap },
  high: { label: 'High', color: 'orange-400', icon: AlertTriangle },
  medium: { label: 'Medium', color: 'reposentry-warning', icon: Clock },
  low: { label: 'Low', color: 'blue-400', icon: Shield },
};

export function AIExplanationPanel({ findings, enabled }: AIExplanationPanelProps) {
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-generate on mount if enabled and findings exist
  useEffect(() => {
    if (enabled && findings.length > 0 && !explanation && !generating) {
      generateExplanation();
    }
  }, [enabled, findings.length, explanation, generating]);
  
  const generateExplanation = async () => {
    if (!enabled) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findings, type: 'summary' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate explanation');
      }
      
      setExplanation(data.explanation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI explanation');
    } finally {
      setGenerating(false);
    }
  };
  
  if (!enabled) {
    return (
      <Card variant="outlined" padding="md">
        <div className="flex items-center gap-3 p-4 bg-reposentry-surface/50 rounded-lg">
          <div className="w-10 h-10 rounded-lg bg-reposentry-border/50 flex items-center justify-center">
            <Brain className="w-5 h-5 text-reposentry-textDim" />
          </div>
          <div>
            <h4 className="font-medium text-reposentry-text">AI Explanations Not Configured</h4>
            <p className="text-sm text-reposentry-textMuted">
              Add a <code className="bg-reposentry-border px-1.5 py-0.5 rounded text-xs">GEMINI_API_KEY</code> to your environment variables to enable AI-powered vulnerability analysis.
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  if (findings.length === 0) {
    return (
      <Card variant="outlined" padding="md">
        <div className="flex items-center gap-3 p-4 bg-reposentry-success/10 rounded-lg border border-reposentry-success/20">
          <div className="w-10 h-10 rounded-lg bg-reposentry-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-reposentry-success" />
          </div>
          <div>
            <h4 className="font-medium text-reposentry-text">No Vulnerabilities to Analyze</h4>
            <p className="text-sm text-reposentry-textMuted">
              AI explanations are generated only when vulnerabilities are found.
            </p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card variant="elevated">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-reposentry-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-reposentry-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-reposentry-text">AI-Powered Analysis</h3>
              <p className="text-sm text-reposentry-textMuted">
                {generating ? 'Generating explanation...' : explanation ? 'Generated analysis' : 'Generate an AI summary of findings'}
              </p>
            </div>
          </div>
          
          <Button
            variant={explanation ? 'secondary' : 'primary'}
            onClick={generateExplanation}
            disabled={generating}
            leftIcon={generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {generating ? 'Analyzing...' : explanation ? 'Regenerate' : 'Generate Analysis'}
          </Button>
        </div>
        
        {error && (
          <div className="p-4 rounded-lg bg-reposentry-danger/10 border border-reposentry-danger/20">
            <div className="flex items-center gap-2 text-reposentry-danger">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        {explanation && (
          <div className="space-y-6 animate-fade-in">
            {/* Priority Badge */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-reposentry-textMuted">Priority:</span>
              <Badge variant={explanation.priority as any} size="md" dot>
                {PRIORITY_CONFIG[explanation.priority].label}
              </Badge>
              <Badge variant="info" size="sm">AI-Generated</Badge>
            </div>
            
            {/* Summary */}
            <div className="p-4 rounded-lg bg-reposentry-surface/50 border border-reposentry-border/50">
              <h4 className="font-medium text-reposentry-text mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-reposentry-primary" />
                Executive Summary
              </h4>
              <p className="text-reposentry-text">{explanation.summary}</p>
            </div>
            
            {/* Impact */}
            <div className="p-4 rounded-lg bg-reposentry-surface/50 border border-reposentry-border/50">
              <h4 className="font-medium text-reposentry-text mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-reposentry-warning" />
                Potential Impact
              </h4>
              <p className="text-reposentry-text">{explanation.impact}</p>
            </div>
            
            {/* Recommendations */}
            <div className="p-4 rounded-lg bg-reposentry-surface/50 border border-reposentry-border/50">
              <h4 className="font-medium text-reposentry-text mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-reposentry-primary" />
                Recommended Actions
              </h4>
              <ol className="space-y-2">
                {explanation.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-reposentry-text">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-reposentry-primary/20 text-reposentry-primary text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            </div>
            
            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs text-reposentry-textDim pt-4 border-t border-reposentry-border">
              <span className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Model: {explanation.model}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Generated: {new Date(explanation.generatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}
        
        {!explanation && !generating && !error && (
          <div className="text-center py-8 text-reposentry-textMuted">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-reposentry-text">Click "Generate Analysis" to get an AI-powered summary</p>
            <p className="text-sm mt-1">This will send vulnerability metadata to Gemini AI for analysis</p>
          </div>
        )}
      </div>
    </Card>
  );
}