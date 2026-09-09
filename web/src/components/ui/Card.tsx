import { ReactNode, memo } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Card = memo(({ children, className = '', padding = 'md', hover = false, onClick }: CardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer' : '';

  return (
    <div
      className={`card ${paddingClasses[padding]} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick({} as React.MouseEvent<HTMLDivElement>); }} : undefined}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const CardHeader = memo(({ title, subtitle, action, className = '' }: CardHeaderProps) => (
  <div className={`card-header ${className}`}>
    <div>
      <h3 className="card-title">{title}</h3>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
));

CardHeader.displayName = 'CardHeader';

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

const CardContent = memo(({ children, className = '' }: CardContentProps) => (
  <div className={className}>{children}</div>
));

CardContent.displayName = 'CardContent';

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const CardFooter = memo(({ children, className = '' }: CardFooterProps) => (
  <div className={`flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800 ${className}`}>
    {children}
  </div>
));

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };