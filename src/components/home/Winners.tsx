'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Winner {
  id: string;
  name: string;
  location: string;
  prize: string;
  prizeValue: number;
  date: string;
  image?: string;
  testimonial?: string;
  verified: boolean;
}

interface WinnersProps {
  className?: string;
  variant?: 'default' | 'gallery' | 'list' | 'featured';
  winners?: Winner[];
}

const defaultWinners: Winner[] = [
  {
    id: '1',
    name: 'Alexandra Thompson',
    location: 'Miami, FL',
    prize: 'Tesla Model Y',
    prizeValue: 52000,
    date: '2024-01-15',
    testimonial: 'Still can\'t believe I won! The whole process was amazing.',
    verified: true,
  },
  {
    id: '2',
    name: 'Robert Chen',
    location: 'San Francisco, CA',
    prize: 'MacBook Pro M3',
    prizeValue: 3500,
    date: '2024-01-14',
    verified: true,
  },
  {
    id: '3',
    name: 'Maria Garcia',
    location: 'New York, NY',
    prize: '$10,000 Cash',
    prizeValue: 10000,
    date: '2024-01-13',
    testimonial: 'This changed my life! Thank you so much!',
    verified: true,
  },
  {
    id: '4',
    name: 'James Wilson',
    location: 'Chicago, IL',
    prize: 'iPhone 15 Pro Max',
    prizeValue: 1500,
    date: '2024-01-12',
    verified: true,
  },
  {
    id: '5',
    name: 'Emily Davis',
    location: 'Austin, TX',
    prize: 'Dream Vacation to Bali',
    prizeValue: 5000,
    date: '2024-01-11',
    testimonial: 'Best vacation ever! Everything was perfect.',
    verified: true,
  },
  {
    id: '6',
    name: 'David Martinez',
    location: 'Phoenix, AZ',
    prize: 'PlayStation 5 Bundle',
    prizeValue: 800,
    date: '2024-01-10',
    verified: true,
  },
];

export function Winners({
  className,
  variant = 'default',
  winners = defaultWinners,
}: WinnersProps) {
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (variant === 'gallery') {
    return (
      <section className={cn('py-16 md:py-24', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <span className="mr-2">🏆</span>
              Recent Winners
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Winners Gallery</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See our latest winners and their amazing prizes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.slice(0, showAll ? undefined : 6).map((winner, i) => (
              <Card
                key={winner.id}
                className={cn(
                  'overflow-hidden hover:shadow-xl transition-all',
                  `animate-zoom-in animation-delay-${i * 100}`
                )}
              >
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">🎁</div>
                  </div>
                  {winner.verified && (
                    <Badge className="absolute top-4 right-4 bg-green-500">
                      <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{winner.name}</h3>
                      <p className="text-sm text-muted-foreground">{winner.location}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(winner.date)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-muted-foreground">Won:</p>
                    <p className="font-semibold text-lg text-primary">{winner.prize}</p>
                    <p className="text-sm font-medium">${winner.prizeValue.toLocaleString()}</p>
                  </div>
                  
                  {winner.testimonial && (
                    <p className="text-sm italic text-muted-foreground border-l-2 border-primary pl-3">
                      "{winner.testimonial}"
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {!showAll && winners.length > 6 && (
            <div className="text-center mt-8">
              <Button onClick={() => setShowAll(true)} variant="outline">
                Show All Winners
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (variant === 'list') {
    return (
      <section className={cn('py-16 md:py-24 bg-muted/50', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Recent Winners</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparency is key - see all our recent winners
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Winner</th>
                    <th className="text-left p-4 font-medium">Location</th>
                    <th className="text-left p-4 font-medium">Prize</th>
                    <th className="text-left p-4 font-medium">Value</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {winners.map((winner, i) => (
                    <tr key={winner.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
                          <span className="font-medium">{winner.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{winner.location}</td>
                      <td className="p-4 font-medium text-primary">{winner.prize}</td>
                      <td className="p-4">${winner.prizeValue.toLocaleString()}</td>
                      <td className="p-4 text-muted-foreground">{formatDate(winner.date)}</td>
                      <td className="p-4">
                        {winner.verified ? (
                          <Badge variant="success" className="bg-green-100 text-green-700">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  if (variant === 'featured') {
    const featuredWinner = winners[0];
    const recentWinners = winners.slice(1, 4);

    return (
      <section className={cn('py-16 md:py-24', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Winners</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our growing community of lucky winners
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Featured Winner */}
            <Card className="overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-purple-600 to-pink-600">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎊</div>
                    <Badge className="bg-white/20 text-white border-white/30">
                      GRAND PRIZE WINNER
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
                  <div>
                    <h3 className="text-2xl font-bold">{featuredWinner.name}</h3>
                    <p className="text-muted-foreground">{featuredWinner.location}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prize Won</p>
                    <p className="text-2xl font-bold text-primary">{featuredWinner.prize}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prize Value</p>
                    <p className="text-xl font-semibold">${featuredWinner.prizeValue.toLocaleString()}</p>
                  </div>
                  
                  {featuredWinner.testimonial && (
                    <blockquote className="border-l-4 border-primary pl-4 italic">
                      "{featuredWinner.testimonial}"
                    </blockquote>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Won {formatDate(featuredWinner.date)}
                    </span>
                    {featuredWinner.verified && (
                      <Badge variant="success" className="bg-green-100 text-green-700">
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Winner
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Winners List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">More Recent Winners</h3>
              {recentWinners.map((winner) => (
                <Card key={winner.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{winner.name}</h4>
                        {winner.verified && (
                          <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{winner.location}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-medium text-primary">{winner.prize}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(winner.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              <Button className="w-full" variant="outline">
                View All Winners
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className={cn('py-16 md:py-24 bg-muted/50', className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Winners</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real people, real wins, real stories
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {['all', 'today', 'week', 'month'].map((period) => (
            <Button
              key={period}
              variant={filter === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(period)}
              className="capitalize"
            >
              {period === 'all' ? 'All Time' : `This ${period}`}
            </Button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {winners.slice(0, 6).map((winner, i) => (
            <Card
              key={winner.id}
              className={cn(
                'p-6 hover:shadow-lg transition-all',
                `animate-fade-in animation-delay-${i * 100}`
              )}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
                <div className="flex-1">
                  <h3 className="font-semibold">{winner.name}</h3>
                  <p className="text-sm text-muted-foreground">{winner.location}</p>
                </div>
                {winner.verified && (
                  <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prize:</span>
                  <span className="font-semibold text-primary">{winner.prize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Value:</span>
                  <span className="font-medium">${winner.prizeValue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Won:</span>
                  <span className="text-sm">{formatDate(winner.date)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}