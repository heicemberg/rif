import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
  className?: string;
  format?: (value: number) => string;
  onComplete?: () => void;
  animateOnMount?: boolean;
  animateOnChange?: boolean;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
  className,
  format,
  onComplete,
  animateOnMount = true,
  animateOnChange = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(animateOnMount ? 0 : value);
  const [isAnimating, setIsAnimating] = useState(false);
  const previousValue = useRef(animateOnMount ? 0 : value);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const formatNumber = (num: number): string => {
    if (format) {
      return format(num);
    }

    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  };

  useEffect(() => {
    if (!animateOnChange && !animateOnMount) {
      setDisplayValue(value);
      return;
    }

    const shouldAnimate = 
      (animateOnMount && previousValue.current === 0) || 
      (animateOnChange && previousValue.current !== value);

    if (!shouldAnimate) {
      return;
    }

    const animate = () => {
      setIsAnimating(true);
      const startValue = previousValue.current;
      const endValue = value;
      const startTime = Date.now() + delay;
      startTimeRef.current = startTime;

      const updateValue = () => {
        const now = Date.now();
        const elapsed = Math.max(0, now - startTime);
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out-expo)
        const easeOutExpo = progress === 1 
          ? 1 
          : 1 - Math.pow(2, -10 * progress);

        const currentValue = startValue + (endValue - startValue) * easeOutExpo;
        setDisplayValue(currentValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(updateValue);
        } else {
          setIsAnimating(false);
          previousValue.current = value;
          if (onComplete) {
            onComplete();
          }
        }
      };

      if (delay > 0) {
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(updateValue);
        }, delay);
      } else {
        animationRef.current = requestAnimationFrame(updateValue);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, delay, animateOnMount, animateOnChange, onComplete]);

  return (
    <span 
      className={cn(
        'tabular-nums transition-colors',
        isAnimating && 'text-primary',
        className
      )}
    >
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}

// Counter component with additional features
interface CounterProps extends AnimatedNumberProps {
  showProgress?: boolean;
  progressColor?: string;
  icon?: React.ReactNode;
  label?: string;
}

export function Counter({
  value,
  showProgress = false,
  progressColor = 'bg-primary',
  icon,
  label,
  className,
  ...props
}: CounterProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (showProgress) {
      const timer = setTimeout(() => {
        setProgress(100);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, showProgress]);

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center space-x-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          {label && (
            <p className="text-sm text-muted-foreground">{label}</p>
          )}
          <p className="text-2xl font-bold">
            <AnimatedNumber value={value} {...props} />
          </p>
        </div>
      </div>
      {showProgress && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={cn(
              'h-full transition-all duration-1000 ease-out',
              progressColor
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Animated percentage with circle progress
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  duration?: number;
  className?: string;
  showValue?: boolean;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = 'rgb(99, 102, 241)',
  trackColor = 'rgb(229, 231, 235)',
  duration = 1000,
  className,
  showValue = true,
}: CircularProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: `stroke-dashoffset ${duration}ms ease-out`,
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">
            <AnimatedNumber
              value={animatedValue}
              duration={duration}
              suffix="%"
              decimals={0}
            />
          </span>
        </div>
      )}
    </div>
  );
}