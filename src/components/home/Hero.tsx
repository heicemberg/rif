'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface HeroProps {
  className?: string;
  variant?: 'default' | 'centered' | 'split' | 'video';
}

export function Hero({ className, variant = 'default' }: HeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (variant === 'centered') {
    return (
      <section className={cn('relative overflow-hidden bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-background', className)}>
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-400/20 to-purple-400/20 blur-3xl" />

        <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <Badge variant="outline" className="mb-4 animate-fade-in">
              <span className="mr-2">🎉</span>
              New: Win Amazing Prizes Daily
            </Badge>

            {/* Heading */}
            <h1 className={cn(
              "mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl",
              mounted && "animate-slide-up"
            )}>
              Win Your Dream
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Prize Today
              </span>
            </h1>

            {/* Description */}
            <p className={cn(
              "mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl",
              mounted && "animate-slide-up animation-delay-200"
            )}>
              Join millions of winners in the most trusted online prize platform. 
              Enter daily draws for a chance to win cars, electronics, vacations, and more!
            </p>

            {/* CTA Buttons */}
            <div className={cn(
              "flex flex-col sm:flex-row gap-4 justify-center",
              mounted && "animate-slide-up animation-delay-400"
            )}>
              <Button size="lg" className="group">
                Start Playing Now
                <svg
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
              <Button size="lg" variant="outline">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className={cn(
              "mt-12 grid grid-cols-3 gap-8",
              mounted && "animate-fade-in animation-delay-600"
            )}>
              <div>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={2500000} prefix="$" suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground">Total Prizes Won</p>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={150000} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground">Happy Winners</p>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={98} suffix="%" />
                </div>
                <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section className={cn('relative overflow-hidden', className)}>
        <div className="container mx-auto px-4">
          <div className="grid min-h-[600px] items-center gap-8 py-12 md:min-h-[700px] lg:grid-cols-2 lg:gap-12 lg:py-20">
            {/* Left Content */}
            <div className="order-2 lg:order-1">
              <Badge variant="secondary" className="mb-4">
                <span className="mr-2">🔥</span>
                Limited Time Offer
              </Badge>
              
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                The Biggest Prize
                <span className="text-gradient"> Platform Online</span>
              </h1>
              
              <p className="mb-8 text-lg text-muted-foreground">
                Your chance to win life-changing prizes is just one click away. 
                Join our community of winners and start your journey today.
              </p>

              <div className="mb-8 flex items-center gap-4">
                <Button size="lg">
                  Get Started Free
                </Button>
                <Button size="lg" variant="ghost">
                  View Prizes
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-purple-400 to-pink-400"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Join 150k+ winners</p>
                  <div className="flex text-yellow-500">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Image/Visual */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl opacity-20" />
                <div className="relative rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-8 text-white">
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      LIVE
                    </Badge>
                  </div>
                  
                  <h3 className="mb-4 text-2xl font-bold">Today's Grand Prize</h3>
                  <div className="mb-6 text-5xl font-bold">$50,000</div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <span>Drawing in 2 hours</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <span>12,543 entries so far</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                      <span>Guaranteed winner</span>
                    </div>
                  </div>

                  <Button className="mt-6 w-full bg-white text-purple-600 hover:bg-white/90">
                    Enter Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className={cn('relative min-h-[600px] overflow-hidden', className)}>
      {/* Background Image/Video */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-pink-900/90 z-10" />
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl animate-pulse animation-delay-400" />
      </div>

      {/* Content */}
      <div className="container relative z-20 mx-auto px-4 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center text-white">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white">
            🎯 Over $10M in Prizes Given Away
          </Badge>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your Lucky Day
            <span className="block text-yellow-400">Starts Here</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 sm:text-xl">
            The most exciting prize platform where dreams come true. 
            Enter now for your chance to win incredible prizes!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
              Play Now - It's Free!
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Browse Prizes
            </Button>
          </div>

          {/* Floating Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {[
              { icon: "🏆", label: "Daily Winners", value: "500+" },
              { icon: "💰", label: "Total Prize Pool", value: "$1M+" },
              { icon: "🎁", label: "Active Prizes", value: "1,200+" },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg bg-white/10 backdrop-blur-md p-4 border border-white/20",
                  mounted && `animate-slide-up animation-delay-${(i + 1) * 200}`
                )}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-sm text-white/80">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}