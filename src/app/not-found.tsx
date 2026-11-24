import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-reposentry-bg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-reposentry-primary/10 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 container-custom px-6 text-center">
        <div className="max-w-md mx-auto">
          {/* Error Code */}
          <div className="mb-8">
            <span className="font-bold text-[8rem] md:text-[12rem] lg:text-[14rem] leading-none text-reposentry-text">
              404
            </span>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-semibold mb-4 text-reposentry-text">
            Page Not Found
          </h1>

          <p className="text-lg text-reposentry-textMuted mb-10">
            The repository scan page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
                Back to Home
              </Button>
            </Link>
            <Link href="/scan">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto min-w-[200px]">
                Start a Scan
              </Button>
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-16">
            <p className="text-sm text-reposentry-textDim uppercase tracking-wider mb-4">
              Or explore these sections:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/scan" className="text-sm text-reposentry-textMuted hover:text-reposentry-primary transition-colors">Scan</Link>
              <span className="text-reposentry-border">/</span>
              <Link href="/" className="text-sm text-reposentry-textMuted hover:text-reposentry-primary transition-colors">Home</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
