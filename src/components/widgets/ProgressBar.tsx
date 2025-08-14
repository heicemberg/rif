'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  variant?: 'default' | 'gradient' | 'striped' | 'animated';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside' | 'top';
  animated?: boolean;
  indeterminate?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  variant = 'default',
  color = 'primary',
  size = 'md',
  showLabel = false,
  labelPosition = 'inside',
  animated = true,
  indeterminate = false,
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = indeterminate ? 100 : Math.min(100, Math.max(0, (displayValue / max) * 100));

  useEffect(() => {
    if (animated && !indeterminate) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated, indeterminate]);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8',
  };

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const variantClasses = {
    default: '',
    gradient: 'bg-gradient-to-r',
    striped: 'progress-bar-striped',
    animated: 'progress-bar-animated',
  };

  const gradientColors = {
    primary: 'from-purple-500 to-pink-500',
    success: 'from-green-400 to-green-600',
    warning: 'from-yellow-400 to-orange-500',
    danger: 'from-red-400 to-red-600',
    info: 'from-blue-400 to-blue-600',
  };

  const getProgressBarClass = () => {
    let classes = [colorClasses[color]];
    
    if (variant === 'gradient') {
      classes = ['bg-gradient-to-r', gradientColors[color]];
    } else if (variant === 'striped' || variant === 'animated') {
      classes.push('relative overflow-hidden');
    }
    
    return classes.join(' ');
  };

  const renderLabel = () => {
    if (!showLabel || indeterminate) return null;
    
    const label = `${Math.round(percentage)}%`;
    
    if (labelPosition === 'top') {
      return (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-muted-foreground">
            {displayValue} / {max}
          </span>
        </div>
      );
    }
    
    if (labelPosition === 'outside') {
      return (
        <span className="ml-3 text-sm font-medium">{label}</span>
      );
    }
    
    return null;
  };

  const renderInsideLabel = () => {
    if (!showLabel || labelPosition !== 'inside' || indeterminate) return null;
    
    return (
      <span className={cn(
        'absolute inset-0 flex items-center justify-center text-xs font-medium',
        percentage > 50 ? 'text-white' : 'text-foreground'
      )}>
        {Math.round(percentage)}%
      </span>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {labelPosition === 'top' && renderLabel()}
      
      <div className="flex items-center">
        <div className={cn(
          'flex-1 bg-muted rounded-full overflow-hidden relative',
          sizeClasses[size]
        )}>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out relative',
              getProgressBarClass(),
              indeterminate && 'animate-pulse'
            )}
            style={{ 
              width: indeterminate ? '100%' : `${percentage}%`,
              transition: animated ? 'width 0.5s ease-out' : 'none'
            }}
          >
            {(variant === 'striped' || variant === 'animated') && (
              <div 
                className={cn(
                  'absolute inset-0 opacity-20',
                  variant === 'animated' && 'animate-slide'
                )}
                style={{
                  backgroundImage: `linear-gradient(
                    45deg,
                    rgba(255, 255, 255, 0.15) 25%,
                    transparent 25%,
                    transparent 50%,
                    rgba(255, 255, 255, 0.15) 50%,
                    rgba(255, 255, 255, 0.15) 75%,
                    transparent 75%,
                    transparent
                  )`,
                  backgroundSize: '1rem 1rem',
                }}
              />
            )}
          </div>
          
          {renderInsideLabel()}
        </div>
        
        {labelPosition === 'outside' && renderLabel()}
      </div>
    </div>
  );
}

// Componente de progreso múltiple
interface MultiProgressItem {
  value: number;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  label?: string;
}

interface MultiProgressBarProps {
  items: MultiProgressItem[];
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabels?: boolean;
}

export function MultiProgressBar({
  items,
  max = 100,
  className,
  size = 'md',
  showLabels = false,
}: MultiProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8',
  };

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const total = items.reduce((sum, item) => sum + item.value, 0);
  const normalizedItems = items.map(item => ({
    ...item,
    percentage: (item.value / total) * 100,
  }));

  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className="flex flex-wrap gap-3 mb-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className={cn('w-3 h-3 rounded', colorClasses[item.color])} />
              <span>{item.label || `Item ${index + 1}`}: {item.value}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className={cn(
        'flex bg-muted rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        {normalizedItems.map((item, index) => (
          <div
            key={index}
            className={cn(
              'h-full transition-all duration-500',
              colorClasses[item.color],
              index === 0 && 'rounded-l-full',
              index === normalizedItems.length - 1 && 'rounded-r-full'
            )}
            style={{ width: `${item.percentage}%` }}
            title={`${item.label}: ${item.value} (${item.percentage.toFixed(1)}%)`}
          />
        ))}
      </div>
    </div>
  );
}

// Componente de progreso circular
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
  className,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    primary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}