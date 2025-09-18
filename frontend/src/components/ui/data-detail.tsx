/**
 * Reusable Detail Components
 * Consistent layout components for detail pages across all modules
 * Mobile-first responsive design
 * Date: 2025-09-18
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

// ============================================================================
// DETAIL FIELD COMPONENT
// ============================================================================

interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'currency';
}

export const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  icon,
  className,
  variant = 'default',
}) => {
  const getValueStyles = () => {
    switch (variant) {
      case 'highlight':
        return 'text-lg font-semibold text-primary';
      case 'currency':
        return 'text-xl font-bold text-green-600';
      default:
        return 'text-base';
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className={cn('flex items-center gap-2', getValueStyles())}>
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
};

// ============================================================================
// DETAIL CARD COMPONENT
// ============================================================================

interface DetailCardProps {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const DetailCard: React.FC<DetailCardProps> = ({
  title,
  icon,
  badge,
  children,
  className,
  actions,
}) => {
  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
            {badge}
          </CardTitle>
          {actions && (
            <div className="flex items-center gap-2 flex-wrap">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// DETAIL GRID COMPONENT
// ============================================================================

interface DetailGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const DetailGrid: React.FC<DetailGridProps> = ({
  children,
  columns = 2,
  className,
}) => {
  const getGridClass = () => {
    switch (columns) {
      case 1:
        return 'grid grid-cols-1 gap-4';
      case 2:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-4';
      case 3:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
      case 4:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 gap-4';
    }
  };

  return (
    <div className={cn(getGridClass(), className)}>
      {children}
    </div>
  );
};

// ============================================================================
// DETAIL HEADER COMPONENT
// ============================================================================

interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  backAction?: React.ReactNode;
  className?: string;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  backAction,
  className,
}) => {
  return (
    <div className={cn('space-y-4 mb-6', className)}>
      {/* Back button row */}
      {backAction && (
        <div className="flex items-center">
          {backAction}
        </div>
      )}
      
      {/* Title and actions row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Title section */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Actions section */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// DETAIL LAYOUT COMPONENT
// ============================================================================

interface DetailLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const DetailLayout: React.FC<DetailLayoutProps> = ({
  children,
  className,
  maxWidth = 'full',
}) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-2xl';
      case 'md':
        return 'max-w-4xl';
      case 'lg':
        return 'max-w-6xl';
      case 'xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-none';
      default:
        return 'max-w-none';
    }
  };

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <div className={cn('mx-auto p-4 sm:p-6 lg:p-8', getMaxWidthClass())}>
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
  subValue?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  variant = 'default',
  className,
  subValue,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-900';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-900';
      case 'danger':
        return 'border-red-200 bg-red-50 text-red-900';
      default:
        return 'border-border bg-card text-card-foreground';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-700';
      case 'warning':
        return 'text-yellow-700';
      case 'danger':
        return 'text-red-700';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className={cn('p-4 border-2', getVariantStyles(), className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <div className="space-y-1">
            <p className={cn('text-2xl font-bold', getValueColor())}>
              {value}
            </p>
            {subValue && (
              <p className="text-xs text-muted-foreground">
                {subValue}
              </p>
            )}
          </div>
        </div>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};