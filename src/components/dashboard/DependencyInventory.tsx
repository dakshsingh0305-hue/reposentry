'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import { Search, Package, AlertCircle, CheckCircle2, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import type { ParsedDependency, VulnerabilityFinding } from '@/types';

interface DependencyInventoryProps {
  dependencies: ParsedDependency[];
  findings: VulnerabilityFinding[];
}

export function DependencyInventory({ dependencies, findings }: DependencyInventoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ecosystemFilter, setEcosystemFilter] = useState<string>('all');
  const [vulnFilter, setVulnFilter] = useState<'all' | 'vulnerable' | 'clean'>('all');
  const [sortField, setSortField] = useState<'name' | 'version' | 'ecosystem' | 'vulns'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Build vulnerability map for quick lookup
  const vulnMap = useMemo(() => {
    const map = new Map<string, VulnerabilityFinding[]>();
    for (const finding of findings) {
      const key = `${finding.ecosystem}:${finding.packageName}@${finding.installedVersion}`;
      const existing = map.get(key) || [];
      existing.push(finding);
      map.set(key, existing);
    }
    return map;
  }, [findings]);
  
  const ecosystems = useMemo(() => {
    const set = new Set<string>();
    for (const dep of dependencies) {
      set.add(dep.ecosystem);
    }
    return Array.from(set).sort();
  }, [dependencies]);
  
  const enrichedDependencies = useMemo(() => {
    return dependencies.map(dep => {
      const key = `${dep.ecosystem}:${dep.name}@${dep.version}`;
      const vulns = vulnMap.get(key) || [];
      const uniqueVulns = new Map<string, VulnerabilityFinding>();
      for (const v of vulns) {
        if (!uniqueVulns.has(v.id)) uniqueVulns.set(v.id, v);
      }
      const vulnList = Array.from(uniqueVulns.values());
      
      let maxSeverity: 'critical' | 'high' | 'moderate' | 'low' | 'unknown' | 'none' = 'none';
      const severityOrder = { critical: 4, high: 3, moderate: 2, low: 1, unknown: 0, none: -1 };
      for (const v of vulnList) {
        if (severityOrder[v.severity] > severityOrder[maxSeverity]) {
          maxSeverity = v.severity;
        }
      }
      
      return { ...dep, vulns: vulnList, maxSeverity, vulnCount: vulnList.length };
    });
  }, [dependencies, vulnMap]);
  
  const filteredDeps = useMemo(() => {
    let result = [...enrichedDependencies];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.version.toLowerCase().includes(query)
      );
    }
    
    if (ecosystemFilter !== 'all') {
      result = result.filter(d => d.ecosystem === ecosystemFilter);
    }
    
    if (vulnFilter === 'vulnerable') {
      result = result.filter(d => d.vulnCount > 0);
    } else if (vulnFilter === 'clean') {
      result = result.filter(d => d.vulnCount === 0);
    }
    
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'version':
          comparison = a.version.localeCompare(b.version, undefined, { numeric: true });
          break;
        case 'ecosystem':
          comparison = a.ecosystem.localeCompare(b.ecosystem);
          break;
        case 'vulns':
          comparison = a.vulnCount - b.vulnCount;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [enrichedDependencies, searchQuery, ecosystemFilter, vulnFilter, sortField, sortDirection]);
  
  const stats = useMemo(() => {
    const total = dependencies.length;
    const vulnerable = enrichedDependencies.filter(d => d.vulnCount > 0).length;
    const clean = total - vulnerable;
    const totalVulns = findings.length;
    return { total, vulnerable, clean, totalVulns };
  }, [dependencies, enrichedDependencies, findings.length]);
  
  const handleSort = (field: 'name' | 'version' | 'ecosystem' | 'vulns') => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="critical" size="sm" dot>Critical</Badge>;
      case 'high': return <Badge variant="high" size="sm" dot>High</Badge>;
      case 'moderate': return <Badge variant="moderate" size="sm" dot>Moderate</Badge>;
      case 'low': return <Badge variant="low" size="sm" dot>Low</Badge>;
      case 'unknown': return <Badge variant="default" size="sm" dot>Unknown</Badge>;
      default: return <Badge variant="success" size="sm" dot><CheckCircle2 className="w-3 h-3" /> Clean</Badge>;
    }
  };
  
  return (
    <Card variant="elevated">
      <div className="space-y-6">
        {/* Header & Stats */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-reposentry-text">Dependency Inventory</h3>
              <p className="text-sm text-reposentry-textMuted">
                {stats.total} dependencies scanned across {ecosystems.length} ecosystem{ecosystems.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">{stats.total} Total</Badge>
              <Badge variant="danger" size="sm" dot>{stats.vulnerable} Vulnerable</Badge>
              <Badge variant="success" size="sm" dot>{stats.clean} Clean</Badge>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-reposentry-textDim" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-reposentry-surface border border-reposentry-border rounded-lg text-reposentry-text placeholder-reposentry-textDim focus:outline-none focus:ring-2 focus:ring-reposentry-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={ecosystemFilter}
                onChange={(e) => setEcosystemFilter(e.target.value)}
                className="px-4 py-2.5 bg-reposentry-surface border border-reposentry-border rounded-lg text-reposentry-text focus:outline-none focus:ring-2 focus:ring-reposentry-primary focus:border-transparent appearance-none pr-8 min-w-[150px]"
              >
                <option value="all">All Ecosystems</option>
                {ecosystems.map(eco => (
                  <option key={eco} value={eco}>{eco}</option>
                ))}
              </select>
              
              <select
                value={vulnFilter}
                onChange={(e) => setVulnFilter(e.target.value as 'all' | 'vulnerable' | 'clean')}
                className="px-4 py-2.5 bg-reposentry-surface border border-reposentry-border rounded-lg text-reposentry-text focus:outline-none focus:ring-2 focus:ring-reposentry-primary focus:border-transparent appearance-none pr-8 min-w-[150px]"
              >
                <option value="all">All Dependencies</option>
                <option value="vulnerable">Only Vulnerable</option>
                <option value="clean">Only Clean</option>
              </select>
              
              <Button variant="ghost" size="sm" onClick={() => handleSort('name')}>
                <Filter className="w-4 h-4 mr-1" />
                Sort: {sortField}
                {sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-reposentry-border text-reposentry-textDim text-sm font-medium">
                <th className="pb-3 cursor-pointer hover:text-reposentry-text" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    Package
                    {sortField === 'name' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />)}
                  </div>
                </th>
                <th className="pb-3 cursor-pointer hover:text-reposentry-text" onClick={() => handleSort('version')}>
                  Version {sortField === 'version' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />)}
                </th>
                <th className="pb-3 cursor-pointer hover:text-reposentry-text" onClick={() => handleSort('ecosystem')}>
                  Ecosystem {sortField === 'ecosystem' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />)}
                </th>
                <th className="pb-3 cursor-pointer hover:text-reposentry-text" onClick={() => handleSort('vulns')}>
                  Vulnerabilities {sortField === 'vulns' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />)}
                </th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Source File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-reposentry-border/50">
              {filteredDeps.map((dep) => (
                <tr key={`${dep.ecosystem}:${dep.name}@${dep.version}`} className="hover:bg-reposentry-surface/50 transition-colors">
                  <td className="py-3">
                    <div>
                      <span className="font-mono text-sm text-reposentry-text">{dep.name}</span>
                      {dep.isDevDependency && (
                        <Badge variant="info" size="sm" className="ml-2">dev</Badge>
                      )}
                      {dep.isOptional && (
                        <Badge variant="default" size="sm" className="ml-2">optional</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 font-mono text-sm text-reposentry-textMuted">{dep.version}</td>
                  <td className="py-3">
                    <Badge variant="info" size="sm">{dep.ecosystem}</Badge>
                  </td>
                  <td className="py-3">
                    {dep.vulnCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-reposentry-text">{dep.vulnCount}</span>
                        <div className="flex gap-1">
                          {dep.vulns.slice(0, 3).map(v => (
                            <Badge key={v.id} variant={v.severity as any} size="sm" dot />
                          ))}
                          {dep.vulns.length > 3 && (
                            <Badge variant="default" size="sm">+{dep.vulns.length - 3}</Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-reposentry-textDim">0</span>
                    )}
                  </td>
                  <td className="py-3">{getSeverityBadge(dep.maxSeverity)}</td>
                  <td className="py-3 text-sm text-reposentry-textDim font-mono truncate max-w-[200px]">
                    {dep.sourceFile}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDeps.length === 0 && dependencies.length > 0 && (
          <div className="text-center py-8 text-reposentry-textMuted">
            <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No dependencies match your filters</p>
          </div>
        )}
        
        {dependencies.length === 0 && (
          <div className="text-center py-8 text-reposentry-textMuted">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No dependencies found</p>
          </div>
        )}
      </div>
    </Card>
  );
}