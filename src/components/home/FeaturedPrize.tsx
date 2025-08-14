'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Countdown } from '@/components/widgets/Countdown';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface Prize {
  id: string;
  title: string;
  description: string;
  retailValue: number;
  imageUrl?: string;
  category: string;
  drawDate: Date | string;
  currentEntries: number;
  maxEntries: number;
  features: string[];
  sponsored?: boolean;
  sponsorName?: string;
}

interface FeaturedPrizeProps {
  prize?: Prize;
  className?: string;
  showStats?: boolean;
  showCountdown?: boolean;
  onEnterClick?: () => void;
}

const mockPrize: Prize = {
  id: 'prize-001',
  title: '2024 Tesla Model 3',
  description: 'Win the ultimate electric driving experience with the latest Tesla Model 3, featuring Autopilot, premium interior, and cutting-edge technology.',
  retailValue: 47990,
  category: 'Automotive',
  drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  currentEntries: 234567,
  maxEntries: 500000,
  features: [
    'Autopilot included',
    'Premium interior package',
    'Full self-driving capability',
    '1 year free Supercharging',
    'Pearl White Multi-Coat paint',
    '19" Sport Wheels'
  ],
  sponsored: true,
  sponsorName: 'Tesla Motors'
};

export function FeaturedPrize({
  prize = mockPrize,
  className,
  showStats = true,
  showCountdown = true,
  onEnterClick
}: FeaturedPrizeProps) {
  const [entries, setEntries] = useState(prize.currentEntries);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const progressPercentage = (entries / prize.maxEntries) * 100;
  const spotsLeft = prize.maxEntries - entries;

  // Simulate live entry updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (entries < prize.maxEntries) {
        const increment = Math.floor(Math.random() * 5) + 1;
        setEntries(prev => Math.min(prev + increment, prize.maxEntries));
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [entries, prize.maxEntries]);

  return (
    <section className={cn('w-full', className)}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            <span className="mr-2">⭐</span>
            Featured Prize
          </Badge>
          <h2 className="text-4xl font-bold mb-2">This Week's Grand Prize</h2>
          <p className="text-muted-foreground text-lg">
            Don't miss your chance to win this incredible prize
          </p>
        </div>

        {/* Main Prize Card */}
        <Card className="max-w-6xl mx-auto overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/10 dark:to-blue-900/20">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <Badge className="bg-red-500 text-white">
                  <span className="mr-1">🔥</span>
                  HOT
                </Badge>
                {prize.sponsored && (
                  <Badge variant="secondary">
                    Sponsored
                  </Badge>
                )}
              </div>
              
              {/* Prize Visual */}
              <div className="flex items-center justify-center h-full min-h-[400px] p-8">
                <div className="text-center">
                  <div className="text-8xl mb-4 animate-bounce">🚗</div>
                  {prize.sponsorName && (
                    <p className="text-sm text-muted-foreground">
                      Sponsored by <span className="font-semibold">{prize.sponsorName}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 flex flex-col">
              <CardHeader className="p-0 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{prize.category}</Badge>
                  <Badge variant="outline">
                    Value: ${prize.retailValue.toLocaleString()}
                  </Badge>
                </div>
                <CardTitle className="text-3xl">{prize.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {prize.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 flex-1">
                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">What's Included:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {prize.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Section */}
                {showStats && (
                  <div className="space-y-4 mb-6">
                    {/* Entry Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Entry Progress</span>
                        <span className="font-semibold">
                          {progressPercentage.toFixed(1)}% Full
                        </span>
                      </div>
                      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500",
                            isAnimating && "animate-pulse"
                          )}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-muted-foreground">
                          <AnimatedNumber value={entries} /> entries
                        </span>
                        <span className="text-muted-foreground">
                          <AnimatedNumber value={spotsLeft} /> spots left
                        </span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          <AnimatedNumber value={entries} />
                        </p>
                        <p className="text-xs text-muted-foreground">Total Entries</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          ${(prize.retailValue / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-muted-foreground">Prize Value</p>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">
                          1:{Math.floor(prize.maxEntries / 100)}
                        </p>
                        <p className="text-xs text-muted-foreground">Win Odds</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Countdown */}
                {showCountdown && (
                  <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200 dark:border-purple-800 mb-6">
                    <p className="text-sm font-medium text-center mb-2">Draw ends in:</p>
                    <Countdown 
                      targetDate={prize.drawDate} 
                      variant="compact"
                      showDays={true}
                    />
                  </Card>
                )}
              </CardContent>

              <CardFooter className="p-0 pt-6 flex gap-3">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={onEnterClick}
                >
                  Enter Now
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
                <Button size="lg" variant="outline">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Button>
                <Button size="lg" variant="outline">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0" />
                  </svg>
                </Button>
              </CardFooter>
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="max-w-6xl mx-auto mt-8 grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Daily Draws</p>
                <p className="text-sm text-muted-foreground">New winners every day</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">100% Verified</p>
                <p className="text-sm text-muted-foreground">All prizes guaranteed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Instant Delivery</p>
                <p className="text-sm text-muted-foreground">Quick prize fulfillment</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}