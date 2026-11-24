'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'outline' | 'success' | 'warning' | 'danger' | 'critical' | 'high' | 'moderate' | 'low' | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', dot = false, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200';

    const variantStyles: Record<BadgeVariant, string> = {
      default: 'bg-reposentry-surfaceLight text-reposentry-textMuted border border-reposentry-border',
      primary: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      secondary: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      accent: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
      outline: 'bg-transparent border border-reposentry-border text-reposentry-textMuted',
      success: 'bg-green-500/20 text-green-400 border border-green-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
      critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      moderate: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    };

    const sizeStyles: Record<string, string> = {
      sm: 'px-2.5 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
