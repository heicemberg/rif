'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface SocialProofProps {
  className?: string;
  variant?: 'default' | 'banner' | 'floating' | 'inline';
}

export function SocialProof({ className, variant = 'default' }: SocialProofProps) {
  const [recentWinner, setRecentWinner] = useState({
    name: 'Sarah M.',
    location: 'New York',
    prize: 'iPhone 15 Pro',
    time: '5 minutes ago',
  });

  useEffect(() => {
    const winners = [
      { name: 'John D.', location: 'Los Angeles', prize: '$1,000 Cash', time: '2 minutes ago' },
      { name: 'Emma W.', location: 'Chicago', prize: 'MacBook Air', time: '8 minutes ago' },
      { name: 'Mike R.', location: 'Houston', prize: 'PS5 Console', time: '12 minutes ago' },
      { name: 'Lisa K.', location: 'Phoenix', prize: '$500 Gift Card', time: '15 minutes ago' },
    ];

    const interval = setInterval(() => {
      setRecentWinner(winners[Math.floor(Math.random() * winners.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (variant === 'banner') {
    return (
      <div className={cn('bg-gradient-to-r from-purple-600 to-pink-600 text-white', className)}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold">🎉 Latest Winner:</span>
              <span>{recentWinner.name} from {recentWinner.location}</span>
              <span className="opacity-80">won</span>
              <span className="font-bold">{recentWinner.prize}</span>
              <span className="opacity-80">{recentWinner.time}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={cn(
        'fixed bottom-4 left-4 z-50 max-w-sm animate-slide-in-left',
        className
      )}>
        <div className="bg-background border rounded-lg shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">New Winner!</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{recentWinner.name}</span> from {recentWinner.location} just won{' '}
                <span className="font-medium text-primary">{recentWinner.prize}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{recentWinner.time}</p>
            </div>
            <button className="text-muted-foreground hover:text-foreground">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex flex-wrap items-center justify-center gap-8 py-8', className)}>
        <div className="text-center">
          <div className="text-3xl font-bold">
            <AnimatedNumber value={2500000} prefix="$" suffix="+" />
          </div>
          <p className="text-sm text-muted-foreground">Prizes Given</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">
            <AnimatedNumber value={150000} suffix="+" />
          </div>
          <p className="text-sm text-muted-foreground">Happy Winners</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">
            <AnimatedNumber value={4.8} decimals={1} />
            <span className="text-yellow-500 ml-1">★</span>
          </div>
          <p className="text-sm text-muted-foreground">Average Rating</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">
            <AnimatedNumber value={98} suffix="%" />
          </div>
          <p className="text-sm text-muted-foreground">Satisfaction</p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('bg-muted/50 rounded-lg p-6', className)}>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="🏆"
          value={2500000}
          label="Total Prizes Won"
          prefix="$"
          suffix="+"
        />
        <StatCard
          icon="🎉"
          value={150000}
          label="Happy Winners"
          suffix="+"
        />
        <StatCard
          icon="⭐"
          value={4.8}
          label="Average Rating"
          decimals={1}
          suffix="/5"
        />
        <StatCard
          icon="✅"
          value={98}
          label="Satisfaction Rate"
          suffix="%"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  prefix,
  suffix,
  decimals = 0,
}: {
  icon: string;
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div className="text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">
        <AnimatedNumber
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

// Social Media Followers
export function SocialFollowers({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-6', className)}>
      {[
        { platform: 'Facebook', followers: 125000, icon: '👍' },
        { platform: 'Instagram', followers: 89000, icon: '📷' },
        { platform: 'Twitter', followers: 45000, icon: '🐦' },
        { platform: 'YouTube', followers: 67000, icon: '▶️' },
      ].map((social) => (
        <div key={social.platform} className="text-center">
          <div className="text-2xl mb-1">{social.icon}</div>
          <div className="font-bold">
            {(social.followers / 1000).toFixed(0)}K
          </div>
          <p className="text-xs text-muted-foreground">{social.platform}</p>
        </div>
      ))}
    </div>
  );
}

// Trust Score
export function TrustScore({ className }: { className?: string }) {
  const score = 4.8;
  const reviews = 12543;

  return (
    <div className={cn('inline-flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800', className)}>
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold text-green-600">{score}</div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={cn(
                'h-3 w-3',
                i < Math.floor(score) ? 'text-yellow-500 fill-current' : 'text-gray-300'
              )}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
      <div className="text-sm">
        <p className="font-semibold text-green-700">Excellent</p>
        <p className="text-green-600">{reviews.toLocaleString()} reviews</p>
      </div>
    </div>
  );
}