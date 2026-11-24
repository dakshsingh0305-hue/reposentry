'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Download, FileJson, FileText, Loader2 } from 'lucide-react';
import type { ScanResult } from '@/types';

interface ExportControlsProps {
  scanResult: ScanResult;
}

export function ExportControls({ scanResult }: ExportControlsProps) {
  const [exporting, setExporting] = useState<'json' | 'csv' | null>(null);
  
  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(format);
    
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResult, format }),
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const filename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] 
        || `reposentry-report.${format}`;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(null);
    }
  };
  
  return (
    <Card variant="outlined" padding="md">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-reposentry-text">Export Report</h4>
          <p className="text-sm text-reposentry-textMuted">
            Download the security scan results for offline analysis or sharing
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            disabled={exporting !== null}
            leftIcon={<FileJson className="w-4 h-4" />}
          >
            {exporting === 'json' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'JSON'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            {exporting === 'csv' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CSV'}
          </Button>
        </div>
      </div>
    </Card>
  );
}