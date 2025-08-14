'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownProps {
  targetDate: Date | string;
  className?: string;
  variant?: 'default' | 'compact' | 'large' | 'minimal';
  onComplete?: () => void;
  showLabels?: boolean;
  showDays?: boolean;
  animateOnMount?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({
  targetDate,
  className,
  variant = 'default',
  onComplete,
  showLabels = true,
  showDays = true,
  animateOnMount = true,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onComplete) {
          onComplete();
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const formatNumber = (num: number) => {
    return num.toString().padStart(2, '0');
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('inline-flex items-center gap-1 text-sm font-mono', className)}>
        {showDays && timeLeft.days > 0 && (
          <>
            <span>{formatNumber(timeLeft.days)}d</span>
            <span>:</span>
          </>
        )}
        <span>{formatNumber(timeLeft.hours)}h</span>
        <span>:</span>
        <span>{formatNumber(timeLeft.minutes)}m</span>
        <span>:</span>
        <span>{formatNumber(timeLeft.seconds)}s</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        {showDays && timeLeft.days > 0 && (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{formatNumber(timeLeft.days)}</span>
            {showLabels && <span className="text-xs text-muted-foreground">days</span>}
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{formatNumber(timeLeft.hours)}</span>
          {showLabels && <span className="text-xs text-muted-foreground">hrs</span>}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{formatNumber(timeLeft.minutes)}</span>
          {showLabels && <span className="text-xs text-muted-foreground">min</span>}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{formatNumber(timeLeft.seconds)}</span>
          {showLabels && <span className="text-xs text-muted-foreground">sec</span>}
        </div>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className={cn('grid grid-cols-4 gap-4', className)}>
        {[
          { value: timeLeft.days, label: 'Days', show: showDays },
          { value: timeLeft.hours, label: 'Hours', show: true },
          { value: timeLeft.minutes, label: 'Minutes', show: true },
          { value: timeLeft.seconds, label: 'Seconds', show: true },
        ].map((item, i) => 
          item.show ? (
            <div
              key={item.label}
              className={cn(
                'relative',
                animateOnMount && mounted && `animate-zoom-in animation-delay-${i * 100}`
              )}
            >
              <div className="rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 p-1">
                <div className="rounded-lg bg-background p-4 text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-1">
                    {formatNumber(item.value)}
                  </div>
                  {showLabels && (
                    <div className="text-sm text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </div>
                  )}
                </div>
              </div>
              {/* Pulse effect */}
              {item.label === 'Seconds' && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 opacity-50 animate-ping" />
              )}
            </div>
          ) : null
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {[
        { value: timeLeft.days, label: 'Days', show: showDays },
        { value: timeLeft.hours, label: 'Hours', show: true },
        { value: timeLeft.minutes, label: 'Minutes', show: true },
        { value: timeLeft.seconds, label: 'Seconds', show: true },
      ].map((item, i) => (
        <React.Fragment key={item.label}>
          {item.show && (
            <>
              {i > 0 && showDays && (
                <span className="text-2xl font-bold text-muted-foreground">:</span>
              )}
              <div
                className={cn(
                  'text-center',
                  animateOnMount && mounted && `animate-fade-in animation-delay-${i * 100}`
                )}
              >
                <div className="rounded-lg bg-card border px-3 py-2">
                  <div className="text-3xl font-bold tabular-nums">
                    {formatNumber(item.value)}
                  </div>
                  {showLabels && (
                    <div className="text-xs text-muted-foreground uppercase">
                      {item.label}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Countdown with progress bar
export function CountdownWithProgress({
  targetDate,
  startDate,
  className,
  title,
}: {
  targetDate: Date | string;
  startDate?: Date | string;
  className?: string;
  title?: string;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const start = new Date(startDate || new Date()).getTime();
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      
      const total = target - start;
      const elapsed = now - start;
      const progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
      
      setProgress(progressPercent);
    };

    calculateProgress();
    const timer = setInterval(calculateProgress, 1000);

    return () => clearInterval(timer);
  }, [targetDate, startDate]);

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
      )}
      
      <Countdown targetDate={targetDate} variant="compact" showDays={false} />
      
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Flip countdown (advanced animation)
export function FlipCountdown({
  targetDate,
  className,
}: {
  targetDate: Date | string;
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [prevTimeLeft, setPrevTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setPrevTimeLeft(timeLeft);
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, timeLeft]);

  const FlipUnit = ({ value, label }: { value: number; label: string }) => {
    const formattedValue = value.toString().padStart(2, '0');
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative h-24 w-20 perspective-1000">
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 text-4xl font-bold text-white">
            {formattedValue}
          </div>
        </div>
        <span className="mt-2 text-sm text-muted-foreground uppercase">{label}</span>
      </div>
    );
  };

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <FlipUnit value={timeLeft.days} label="Days" />
      <FlipUnit value={timeLeft.hours} label="Hours" />
      <FlipUnit value={timeLeft.minutes} label="Minutes" />
      <FlipUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}