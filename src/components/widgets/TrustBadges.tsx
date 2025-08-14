'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TrustBadge {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

interface TrustBadgesProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed' | 'inline';
  badges?: TrustBadge[];
  animated?: boolean;
}

const defaultBadges: TrustBadge[] = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'SSL Secured',
    description: '256-bit encryption',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Money Back',
    description: '30-day guarantee',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: '24/7 Support',
    description: 'Always here to help',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Verified',
    description: 'Licensed & regulated',
  },
];

export function TrustBadges({
  className,
  variant = 'default',
  badges = defaultBadges,
  animated = true,
}: TrustBadgesProps) {
  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-wrap items-center gap-6', className)}>
        {badges.map((badge, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-2 text-muted-foreground',
              animated && `animate-fade-in animation-delay-${i * 100}`
            )}
          >
            <div className="text-primary">{badge.icon}</div>
            <span className="text-sm font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
        {badges.map((badge, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col items-center text-center p-4 rounded-lg border bg-card hover:shadow-md transition-all',
              animated && `animate-slide-up animation-delay-${i * 100}`
            )}
          >
            <div className="mb-2 text-primary">{badge.icon}</div>
            <p className="text-sm font-medium">{badge.title}</p>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {badges.map((badge, i) => (
          <div
            key={i}
            className={cn(
              'group relative overflow-hidden rounded-xl border bg-card p-6 hover:shadow-lg transition-all',
              animated && `animate-zoom-in animation-delay-${i * 100}`
            )}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform" />
            
            <div className="relative">
              <div className="mb-3 text-primary transform group-hover:scale-110 transition-transform">
                {badge.icon}
              </div>
              <h3 className="font-semibold mb-1">{badge.title}</h3>
              {badge.description && (
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-8', className)}>
      {badges.map((badge, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-3 group',
            animated && `animate-fade-in animation-delay-${i * 100}`
          )}
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {badge.icon}
          </div>
          <div>
            <p className="font-medium">{badge.title}</p>
            {badge.description && (
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Trust Badges Bar (for headers/footers)
export function TrustBadgesBar({ className }: { className?: string }) {
  return (
    <div className={cn('bg-muted/50 border-y', className)}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Trusted by 150,000+ Users</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>4.8/5 Average Rating</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <svg className="h-4 w-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>Daily Draws</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payment Methods Display
export function PaymentMethods({ className }: { className?: string }) {
  const methods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'PayPal', icon: '💰' },
    { name: 'Apple Pay', icon: '🍎' },
    { name: 'Google Pay', icon: '🔍' },
  ];

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <span className="text-sm text-muted-foreground">Accepted:</span>
      <div className="flex items-center gap-2">
        {methods.map((method, i) => (
          <div
            key={i}
            className="flex items-center justify-center w-12 h-8 rounded border bg-white text-lg"
            title={method.name}
          >
            {method.icon}
          </div>
        ))}
      </div>
    </div>
  );
}