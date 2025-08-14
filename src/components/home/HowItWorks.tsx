'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
}

interface HowItWorksProps {
  className?: string;
  variant?: 'default' | 'timeline' | 'cards' | 'interactive';
  steps?: Step[];
}

const defaultSteps: Step[] = [
  {
    number: 1,
    title: 'Sign Up Free',
    description: 'Create your account in seconds. No credit card required to get started.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Choose Your Prize',
    description: 'Browse through our amazing selection of prizes and pick your favorites.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Enter the Draw',
    description: 'Submit your entry for a chance to win. Multiple entries increase your odds!',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Win Amazing Prizes',
    description: 'Winners are selected randomly and notified instantly. Claim your prize!',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
  },
];

export function HowItWorks({
  className,
  variant = 'default',
  steps = defaultSteps,
}: HowItWorksProps) {
  const [activeStep, setActiveStep] = useState(0);

  if (variant === 'timeline') {
    return (
      <section className={cn('py-16 md:py-24', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to begin your winning journey.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative flex items-center mb-8 last:mb-0">
                {/* Timeline Line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-full bg-gradient-to-b from-purple-600 to-pink-600" />
                )}

                {/* Step Number */}
                <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  {step.number}
                </div>

                {/* Content */}
                <div className="ml-8 flex-1">
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="text-primary">{step.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg">
              Get Started Now
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'cards') {
    return (
      <section className={cn('py-16 md:py-24 bg-muted/50', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Steps to Win</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of winners in just 4 easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <Card
                key={i}
                className="relative p-6 hover:shadow-xl transition-all hover:-translate-y-2"
              >
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 -translate-y-1/2">
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M9 6l6 6-6 6" />
                    </svg>
                  </div>
                )}

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 mb-4">
                    <div className="text-primary">{step.icon}</div>
                  </div>
                  
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Step {step.number}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'interactive') {
    return (
      <section className={cn('py-16 md:py-24', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Does It Work?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Click through each step to learn more about our simple process
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Steps Navigation */}
            <div className="space-y-4">
              {steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border transition-all',
                    activeStep === i
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-card hover:bg-accent border-border'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold',
                      activeStep === i
                        ? 'bg-white/20'
                        : 'bg-primary/10 text-primary'
                    )}>
                      {step.number}
                    </div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className={cn(
                        'text-sm mt-1',
                        activeStep === i ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      )}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Active Step Display */}
            <div className="relative">
              <Card className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 mb-6">
                  <div className="text-primary scale-150">{steps[activeStep].icon}</div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4">{steps[activeStep].title}</h3>
                <p className="text-muted-foreground mb-6">{steps[activeStep].description}</p>
                
                {activeStep === steps.length - 1 ? (
                  <Button size="lg" className="w-full">
                    Start Winning Now
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep(activeStep + 1)}
                    className="w-full"
                  >
                    Next Step
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start winning in 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className={cn(
                'text-center',
                `animate-slide-up animation-delay-${i * 100}`
              )}
            >
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold">
                  {step.number}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg">
            Get Started - It's Free
          </Button>
        </div>
      </div>
    </section>
  );
}