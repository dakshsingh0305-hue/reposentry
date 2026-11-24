'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  className?: string;
}

export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ progress, size = 64, strokeWidth = 3, showPercentage = false, className, children, ...props }, ref) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-reposentry-border"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="text-reposentry-primary transition-all duration-300 ease-out-expo"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' }}
          />
        </svg>
        {(showPercentage || children) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-reposentry-text">
              {showPercentage ? `${Math.round(progress)}%` : children}
            </span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  progress?: number; // 0-100
  value?: number; // alias for progress
  max?: number; // for value prop
  height?: number;
  size?: 'sm' | 'md' | 'lg'; // size preset
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  className?: string;
}

export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  ({ progress, value, max = 100, height = 4, size, showPercentage = false, variant = 'primary', className, ...props }, ref) => {
    const p = value !== undefined ? (value / max) * 100 : (progress ?? 0);
    
    // Map size to height
    const sizeMap: Record<string, number> = { sm: 2, md: 4, lg: 8 };
    const h = size ? sizeMap[size] : height;
    const variantColors: Record<string, string> = {
      primary: 'bg-gradient-to-r from-reposentry-primary to-reposentry-secondary',
      success: 'bg-reposentry-success',
      warning: 'bg-reposentry-warning',
      danger: 'bg-reposentry-danger',
      default: 'bg-reposentry-primary',
    };

    return (
      <div ref={ref} className={cn('relative w-full overflow-hidden rounded-full bg-reposentry-border', className)} style={{ height: h }} {...props}>
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out-expo', variantColors[variant])}
          style={{ width: `${Math.min(100, Math.max(0, p))}%` }}
        />
        {showPercentage && (
          <span className="absolute right-0 top-full mt-1 text-xs font-medium text-reposentry-textMuted">
            {Math.round(p)}%
          </span>
        )}
      </div>
    );
  }
);

LinearProgress.displayName = 'LinearProgress';

// Alias for backward compatibility - uses LinearProgress
export const Progress = LinearProgress;