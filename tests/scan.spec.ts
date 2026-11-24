import { test, expect } from '@playwright/test';

test.describe('RepoSentry Scan Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('landing page loads correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Know What\'s Hiding Inside');
    await expect(page.locator('text=RepoSentry')).toBeVisible();
    await expect(page.locator('button:has-text("Start Security Scan")')).toBeVisible();
  });

  test('navigates to scan page', async ({ page }) => {
    await page.click('a:has-text("Start Security Scan")');
    await expect(page).toHaveURL(/.*scan/);
    await expect(page.locator('text=Analyze Your Dependencies')).toBeVisible();
  });

  test('validates GitHub URL input', async ({ page }) => {
    await page.goto('/scan');
    
    // Test invalid URL
    await page.fill('input[placeholder*="github"]', 'not-a-url');
    await page.click('button:has-text("Start Security Scan")');
    await expect(page.locator('text=Please enter a valid URL')).toBeVisible();
    
    // Test non-GitHub URL
    await page.fill('input[placeholder*="github"]', 'https://gitlab.com/owner/repo');
    await page.click('button:has-text("Start Security Scan")');
    await expect(page.locator('text=Please enter a valid GitHub repository URL')).toBeVisible();
    
    // Test incomplete GitHub URL
    await page.fill('input[placeholder*="github"]', 'https://github.com/owner');
    await page.click('button:has-text("Start Security Scan")');
    await expect(page.locator('text=Please enter a complete repository URL')).toBeVisible();
  });

  test('shows example repositories', async ({ page }) => {
    await page.goto('/scan');
    await expect(page.locator('text=Express.js')).toBeVisible();
    await expect(page.locator('text=Django')).toBeVisible();
    await expect(page.locator('text=React')).toBeVisible();
  });

  test('scan form submits with valid URL', async ({ page }) => {
    await page.goto('/scan');
    await page.fill('input[placeholder*="github"]', 'https://github.com/expressjs/express');
    
    // Mock the API response to avoid actual network calls in tests
    await page.route('**/api/scan', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          repository: {
            owner: 'expressjs',
            name: 'express',
            fullName: 'expressjs/express',
            description: 'Fast, unopinionated web framework for Node.js',
            defaultBranch: 'master',
            htmlUrl: 'https://github.com/expressjs/express',
            updatedAt: '2024-01-01T00:00:00Z',
            isPrivate: false,
          },
          scannedAt: new Date().toISOString(),
          dependenciesScanned: 10,
          dependenciesWithVulns: 0,
          totalVulnerabilities: 0,
          severityCounts: { critical: 0, high: 0, moderate: 0, low: 0, unknown: 0 },
          riskScore: 0,
          riskLevel: 'minimal',
          findings: [],
          allDependencies: [
            { name: 'express', version: '4.18.2', ecosystem: 'npm', sourceFile: 'package-lock.json' },
          ],
          skippedDependencies: [],
          scanDurationMs: 1000,
        }),
      });
    });
    
    await page.click('button:has-text("Start Security Scan")');
    
    // Wait for progress to complete
    await expect(page.locator('text=Scan Complete')).toBeVisible({ timeout: 30000 });
    
    // Check results page
    await expect(page.locator('text=expressjs / express')).toBeVisible();
    await expect(page.locator('text=Minimal Risk')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Start Security Scan")')).toBeVisible();
  });

  test('works on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
  });
});