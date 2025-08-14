'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  className?: string;
  text?: string;
  variant?: 'dot' | 'badge' | 'text';
  size?: 'sm' | 'md' | 'lg';
  color?: 'red' | 'green' | 'blue' | 'yellow';
  pulse?: boolean;
}

export function LiveIndicator({
  className,
  text = 'LIVE',
  variant = 'dot',
  size = 'md',
  color = 'red',
  pulse = true
}: LiveIndicatorProps) {
  const colors = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500'
  };

  const sizes = {
    sm: { dot: 'h-2 w-2', text: 'text-xs' },
    md: { dot: 'h-3 w-3', text: 'text-sm' },
    lg: { dot: 'h-4 w-4', text: 'text-base' }
  };

  if (variant === 'badge') {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        color === 'red' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        color === 'green' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
        color === 'blue' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        color === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        sizes[size].text,
        className
      )}>
        <span className="relative flex">
          {pulse && (
            <span className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              colors[color]
            )} />
          )}
          <span className={cn(
            'relative inline-flex rounded-full',
            sizes[size].dot,
            colors[color]
          )} />
        </span>
        <span className="font-semibold uppercase tracking-wider">{text}</span>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('inline-flex items-center gap-1.5', className)}>
        <span className="relative flex">
          {pulse && (
            <span className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              colors[color]
            )} />
          )}
          <span className={cn(
            'relative inline-flex rounded-full',
            sizes[size].dot,
            colors[color]
          )} />
        </span>
        <span className={cn(
          'font-semibold uppercase tracking-wider',
          sizes[size].text,
          color === 'red' && 'text-red-600',
          color === 'green' && 'text-green-600',
          color === 'blue' && 'text-blue-600',
          color === 'yellow' && 'text-yellow-600'
        )}>
          {text}
        </span>
      </div>
    );
  }

  // Default: dot only
  return (
    <span className={cn('relative inline-flex', className)}>
      {pulse && (
        <span className={cn(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          colors[color]
        )} />
      )}
      <span className={cn(
        'relative inline-flex rounded-full',
        sizes[size].dot,
        colors[color]
      )} />
    </span>
  );
}

// Live Activity Component
interface Activity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
}

export function LiveActivity({ 
  className,
  maxItems = 3 
}: { 
  className?: string;
  maxItems?: number;
}) {
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, user: 'Sarah M.', action: 'won $500', timestamp: '2 min ago' },
    { id: 2, user: 'John D.', action: 'entered draw', timestamp: '5 min ago' },
    { id: 3, user: 'Emma L.', action: 'claimed prize', timestamp: '8 min ago' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const users = ['Alex K.', 'Maria G.', 'David R.', 'Lisa T.', 'Tom W.'];
      const actions = ['won $1,000', 'entered draw', 'claimed prize', 'won iPhone 15'];
      
      const newActivity: Activity = {
        id: Date.now(),
        user: users[Math.floor(Math.random() * users.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        timestamp: 'just now'
      };

      setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)]);
    }, 10000);

    return () => clearInterval(interval);
  }, [maxItems]);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 mb-3">
        <LiveIndicator variant="badge" text="LIVE" size="sm" />
        <span className="text-sm font-medium">Recent Activity</span>
      </div>
      {activities.map((activity, index) => (
        <div 
          key={activity.id}
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg bg-card border transition-all',
            index === 0 && 'animate-slide-in-right border-primary/50'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user}</span>
              {' '}
              <span className="text-muted-foreground">{activity.action}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Live Counter Component
export function LiveCounter({ 
  className,
  label = 'Watching Now',
  initialCount = 234
}: { 
  className?: string;
  label?: string;
  initialCount?: number;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const change = Math.floor(Math.random() * 20) - 10;
        return Math.max(50, prev + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <LiveIndicator variant="dot" color="green" />
      <div>
        <p className="text-2xl font-bold">{count.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}