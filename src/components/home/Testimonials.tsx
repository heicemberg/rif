'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
  title: string;
  content: string;
  prize?: string;
  date: string;
  verified?: boolean;
}

interface TestimonialsProps {
  className?: string;
  variant?: 'default' | 'grid' | 'carousel' | 'masonry';
  testimonials?: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'New York, USA',
    rating: 5,
    title: 'Life-changing win!',
    content: 'I never thought I\'d actually win something this big! The whole process was incredibly smooth and the team was super helpful. Got my prize within a week!',
    prize: 'Tesla Model 3',
    date: '2 weeks ago',
    verified: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    location: 'Los Angeles, CA',
    rating: 5,
    title: 'Absolutely legitimate!',
    content: 'Was skeptical at first, but this is 100% real! Won $5,000 cash and received it promptly. The platform is trustworthy and transparent.',
    prize: '$5,000 Cash',
    date: '1 month ago',
    verified: true,
  },
  {
    id: '3',
    name: 'Emma Williams',
    location: 'London, UK',
    rating: 5,
    title: 'Best decision ever',
    content: 'Playing here has been amazing! I\'ve won multiple smaller prizes and just hit the jackpot with a MacBook Pro. Customer service is outstanding!',
    prize: 'MacBook Pro',
    date: '3 weeks ago',
    verified: true,
  },
  {
    id: '4',
    name: 'David Martinez',
    location: 'Miami, FL',
    rating: 5,
    title: 'Dreams do come true',
    content: 'Won my dream vacation to Bali! Everything was arranged perfectly. This platform has changed my life. Highly recommend to everyone!',
    prize: 'Bali Vacation',
    date: '1 week ago',
    verified: true,
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    location: 'Chicago, IL',
    rating: 5,
    title: 'Incredible experience',
    content: 'The excitement of winning is unmatched! Fast payouts, great selection of prizes, and excellent support team. Already recommended to friends!',
    prize: 'iPhone 15 Pro',
    date: '4 days ago',
    verified: true,
  },
  {
    id: '6',
    name: 'James Wilson',
    location: 'Seattle, WA',
    rating: 5,
    title: 'Trustworthy platform',
    content: 'After winning my first prize, I was hooked! The odds are fair, and the variety of prizes is amazing. Just won a PS5!',
    prize: 'PlayStation 5',
    date: '6 days ago',
    verified: true,
  },
];

export function Testimonials({
  className,
  variant = 'default',
  testimonials = defaultTestimonials,
}: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
          )}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card className="p-6 h-full hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{testimonial.name}</h4>
            {testimonial.verified && (
              <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{testimonial.location}</p>
          <StarRating rating={testimonial.rating} />
        </div>
      </div>
      
      <h3 className="font-semibold mb-2">{testimonial.title}</h3>
      <p className="text-muted-foreground mb-4">{testimonial.content}</p>
      
      <div className="flex items-center justify-between pt-4 border-t">
        {testimonial.prize && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Won:</span>
            <span className="text-sm font-semibold text-primary">{testimonial.prize}</span>
          </div>
        )}
        <span className="text-xs text-muted-foreground">{testimonial.date}</span>
      </div>
    </Card>
  );

  if (variant === 'carousel') {
    return (
      <section className={cn('py-16 md:py-24', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Winners Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied winners who have changed their lives
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <Card className="p-8">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                        <p className="text-muted-foreground">{testimonial.location}</p>
                        <div className="flex justify-center mt-2">
                          <StarRating rating={testimonial.rating} />
                        </div>
                      </div>
                      
                      <blockquote className="text-center">
                        <p className="text-lg italic mb-4">"{testimonial.content}"</p>
                        <p className="font-semibold text-primary">{testimonial.title}</p>
                      </blockquote>
                      
                      {testimonial.prize && (
                        <div className="text-center mt-6 pt-6 border-t">
                          <span className="text-sm text-muted-foreground">Prize Won: </span>
                          <span className="font-semibold text-primary">{testimonial.prize}</span>
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-2 rounded-full bg-background border shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={currentIndex === 0}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentIndex(Math.min(testimonials.length - 1, currentIndex + 1))}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-2 rounded-full bg-background border shadow-lg hover:shadow-xl disabled:opacity-50"
              disabled={currentIndex === testimonials.length - 1}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    currentIndex === i ? 'w-8 bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'masonry') {
    return (
      <section className={cn('py-16 md:py-24 bg-muted/50', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real winners, real stories, real prizes
            </p>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {testimonials.map((testimonial, i) => (
              <div key={testimonial.id} className="break-inside-avoid">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg">
              View All Testimonials
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'grid') {
    return (
      <section className={cn('py-16 md:py-24', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Winner Testimonials</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our lucky winners have to say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Hear From Our Winners</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thousands of winners can't be wrong. Join them today!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.slice(0, 4).map((testimonial, i) => (
            <div
              key={testimonial.id}
              className={cn(
                'animate-slide-up',
                `animation-delay-${i * 100}`
              )}
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}