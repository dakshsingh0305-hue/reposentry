import { Suspense } from 'react';
import { ScanPageClient } from './ScanPageClient';

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-reposentry-bg flex items-center justify-center">
        <p className="text-reposentry-textMuted">Loading...</p>
      </div>
    }>
      <ScanPageClient />
    </Suspense>
  );
}
