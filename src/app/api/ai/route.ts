// AI Explanation API Route

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAIEnabled, generateExplanation, generatePackageExplanation } from '@/lib/ai/gemini';
import type { VulnerabilityFinding, AIExplanation } from '@/types';

const aiRequestSchema = z.object({
  findings: z.array(z.any()),
  type: z.enum(['summary', 'package']).default('summary'),
  packageId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: 'AI explanations not configured. Add GEMINI_API_KEY to enable.' },
        { status: 503 }
      );
    }
    
    const body = await request.json();
    const { findings, type, packageId } = aiRequestSchema.parse(body);
    
    if (!findings || findings.length === 0) {
      return NextResponse.json(
        { error: 'No vulnerability findings provided' },
        { status: 400 }
      );
    }
    
    if (type === 'package') {
      if (!packageId) {
        return NextResponse.json(
          { error: 'Package ID required for package explanation' },
          { status: 400 }
        );
      }
      
      const finding = findings.find((f: VulnerabilityFinding) => f.id === packageId);
      if (!finding) {
        return NextResponse.json(
          { error: 'Vulnerability not found' },
          { status: 404 }
        );
      }
      
      const explanation = await generatePackageExplanation(finding);
      
      if (!explanation) {
        return NextResponse.json(
          { error: 'Failed to generate explanation' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ explanation });
    }
    
    // Summary explanation
    const explanation = await generateExplanation(findings);
    
    if (!explanation) {
      return NextResponse.json(
        { error: 'Failed to generate explanation' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ explanation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'AI explanation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    enabled: isAIEnabled(),
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  });
}