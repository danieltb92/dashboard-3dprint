import { ReactNode, memo } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const Badge = memo(({ children, variant = 'neutral', size = 'md', className = '', dot = false }: BadgeProps) => {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral',
    brand: 'badge-brand',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70`} aria-hidden="true" />}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export { Badge };