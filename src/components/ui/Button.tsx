'use client';

import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      href,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-reposentry-bg disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles: Record<string, string> = {
      primary: 'bg-reposentry-primary text-white hover:bg-reposentry-primaryHover shadow-lg shadow-blue-500/20 focus:ring-reposentry-primary',
      secondary: 'bg-reposentry-surface text-reposentry-text border border-reposentry-border hover:border-reposentry-primary/50 hover:text-reposentry-primary focus:ring-reposentry-primary',
      ghost: 'bg-transparent text-reposentry-textMuted hover:text-reposentry-text hover:bg-reposentry-surface focus:ring-reposentry-border',
      outline: 'bg-transparent text-reposentry-text border border-reposentry-border hover:border-reposentry-primary/50 hover:text-reposentry-primary focus:ring-reposentry-primary',
    };

    const sizeStyles: Record<string, string> = {
      sm: 'px-4 py-2 rounded-lg text-sm',
      md: 'px-6 py-3 rounded-lg text-sm',
      lg: 'px-8 py-4 rounded-xl text-base',
    };

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
          href={href}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {isLoading && (
            <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';