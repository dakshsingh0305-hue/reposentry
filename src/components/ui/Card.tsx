'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const baseStyles = 'rounded-xl transition-all duration-200';

    const variantStyles = {
      default: 'bg-reposentry-surface border border-reposentry-border shadow-card',
      elevated: 'bg-reposentry-surface border border-reposentry-border shadow-card-elevated',
      interactive: 'bg-reposentry-surface border border-reposentry-border hover:border-reposentry-primary/50 cursor-pointer',
      outlined: 'bg-transparent border border-reposentry-border',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], paddingStyles[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
