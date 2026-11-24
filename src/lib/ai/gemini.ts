// Optional Gemini AI Integration

import type { VulnerabilityFinding, AIExplanation, SeverityLevel } from '@/types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

interface GeminiRequest {
  contents: {
    parts: { text: string }[];
    role?: string;
  }[];
  generationConfig?: {
    temperature: number;
    maxOutputTokens: number;
  };
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY;
}

function getModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-1.5-flash';
}

export function isAIEnabled(): boolean {
  return !!getApiKey();
}

function buildVulnerabilitySummary(findings: VulnerabilityFinding[]): string {
  if (findings.length === 0) {
    return 'No known vulnerabilities found in scanned dependencies.';
  }
  
  const uniqueVulns = new Map<string, VulnerabilityFinding>();
  for (const f of findings) {
    if (!uniqueVulns.has(f.id)) {
      uniqueVulns.set(f.id, f);
    }
  }
  
  const bySeverity = new Map<SeverityLevel, VulnerabilityFinding[]>();
  for (const v of uniqueVulns.values()) {
    const arr = bySeverity.get(v.severity) || [];
    arr.push(v);
    bySeverity.set(v.severity, arr);
  }
  
  let summary = `Found ${uniqueVulns.size} unique vulnerabilities across ${findings.length} dependency instances:\n\n`;
  
  for (const [severity, vulns] of bySeverity.entries()) {
    if (vulns.length === 0) continue;
    summary += `${severity.toUpperCase()} (${vulns.length}):\n`;
    for (const v of vulns.slice(0, 5)) {
      summary += `  - ${v.packageName}@${v.installedVersion}: ${v.vulnerability.summary || v.id}\n`;
      if (v.fixedVersions.length > 0) {
        summary += `    Fixed in: ${v.fixedVersions.join(', ')}\n`;
      }
    }
    if (vulns.length > 5) {
      summary += `  ... and ${vulns.length - 5} more\n`;
    }
    summary += '\n';
  }
  
  return summary;
}

export async function generateExplanation(findings: VulnerabilityFinding[]): Promise<AIExplanation | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  
  const vulnerabilitySummary = buildVulnerabilitySummary(findings);
  
  const prompt = `You are a cybersecurity expert analyzing dependency vulnerabilities for a developer audience.

VULNERABILITY DATA:
${vulnerabilitySummary}

Provide a clear, actionable analysis in the following JSON format:
{
  "summary": "2-3 sentence executive summary for non-technical stakeholders",
  "impact": "Technical explanation of potential impact if exploited",
  "recommendations": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "priority": "immediate|high|medium|low"
}

Guidelines:
- Be concise and specific
- Only reference the vulnerabilities listed above
- Do not invent CVEs, versions, or fixes not in the data
- Prioritize based on severity and exploitability
- Recommendations should be practical (e.g., "Update package X to version Y", "Investigate CVE-ZZZ")
- If no vulnerabilities, explain that no known issues were found but regular scanning is recommended`;

  try {
    const response = await fetch(`${GEMINI_API_BASE}/models/${getModel()}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      } as GeminiRequest),
      signal: AbortSignal.timeout(30000),
    });
    
    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return null;
    }
    
    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!text) {
      return null;
    }
    
    // Parse JSON from response
    let parsed: AIExplanation;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      parsed = JSON.parse(jsonText);
    } catch {
      // Fallback if JSON parsing fails
      return {
        summary: 'AI analysis available but could not be parsed.',
        impact: text,
        recommendations: ['Review vulnerabilities manually'],
        priority: 'medium',
        generatedAt: new Date().toISOString(),
        model: getModel(),
      };
    }
    
    return {
      ...parsed,
      generatedAt: new Date().toISOString(),
      model: getModel(),
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return null;
  }
}

export async function generatePackageExplanation(finding: VulnerabilityFinding): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  
  const prompt = `Explain this vulnerability in simple terms for a developer:

Package: ${finding.packageName}@${finding.installedVersion}
Vulnerability: ${finding.id}
Severity: ${finding.severity}
Summary: ${finding.vulnerability.summary || 'Not available'}
Details: ${finding.vulnerability.details || 'Not available'}
Fixed versions: ${finding.fixedVersions.join(', ') || 'Not documented'}

Provide:
1. What this vulnerability is (1-2 sentences)
2. How it could be exploited (1-2 sentences)
3. What the developer should do (1 specific action)

Keep it under 150 words.`;

  try {
    const response = await fetch(`${GEMINI_API_BASE}/models/${getModel()}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
      }),
      signal: AbortSignal.timeout(15000),
    });
    
    if (!response.ok) return null;
    
    const data: GeminiResponse = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}