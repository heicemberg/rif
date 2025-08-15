import { useState, useEffect, useCallback, useRef } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  formatted: string;
  percentage: number;
  isExpired: boolean;
}

interface CountdownConfig {
  targetDate: Date | string;
  onComplete?: () => void;
  onTick?: (timeLeft: TimeLeft) => void;
  autoStart?: boolean;
  format?: 'full' | 'short' | 'minimal';
  locale?: string;
}

interface CountdownControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  restart: () => void;
  add: (seconds: number) => void;
  subtract: (seconds: number) => void;
}

const useCountdown = (config: CountdownConfig): [TimeLeft, CountdownControls, boolean] => {
  const {
    targetDate,
    onComplete,
    onTick,
    autoStart = true,
    format = 'full',
    locale = 'es-MX'
  } = config;

  const [isActive, setIsActive] = useState<boolean>(autoStart);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetDateRef = useRef<Date>(
    typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  );
  const startDateRef = useRef<Date>(new Date());
  const pausedTimeRef = useRef<number>(0);

  function calculateTimeLeft(target: Date | string): TimeLeft {
    const now = new Date().getTime();
    const targetTime = typeof target === 'string' 
      ? new Date(target).getTime() 
      : target.getTime();
    
    const difference = targetTime - now;
    
    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
        formatted: getFormattedTime(0, 0, 0, 0, format),
        percentage: 100,
        isExpired: true
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Calcular porcentaje de tiempo transcurrido
    const totalTime = targetTime - startDateRef.current.getTime();
    const elapsedTime = totalTime - difference;
    const percentage = Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));

    return {
      days,
      hours,
      minutes,
      seconds,
      total: difference,
      formatted: getFormattedTime(days, hours, minutes, seconds, format),
      percentage,
      isExpired: false
    };
  }

  function getFormattedTime(
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    formatType: string
  ): string {
    const pad = (num: number): string => num.toString().padStart(2, '0');

    switch (formatType) {
      case 'minimal':
        if (days > 0) {
          return `${days}d ${pad(hours)}h`;
        }
        if (hours > 0) {
          return `${hours}h ${pad(minutes)}m`;
        }
        return `${minutes}m ${pad(seconds)}s`;
      
      case 'short':
        if (days > 0) {
          return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      
      case 'full':
      default:
        if (days > 0) {
          return `${days} ${days === 1 ? 'día' : 'días'}, ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
  }

  const updateTimeLeft = useCallback(() => {
    const newTimeLeft = calculateTimeLeft(targetDateRef.current);
    setTimeLeft(newTimeLeft);

    if (onTick) {
      onTick(newTimeLeft);
    }

    if (newTimeLeft.isExpired && !hasCompleted) {
      setHasCompleted(true);
      setIsActive(false);
      if (onComplete) {
        onComplete();
      }
    }
  }, [onComplete, onTick, hasCompleted]);

  // Control functions
  const start = useCallback(() => {
    if (!isActive && !timeLeft.isExpired) {
      setIsActive(true);
      if (pausedTimeRef.current > 0) {
        // Ajustar la fecha objetivo basándose en el tiempo pausado
        const adjustment = Date.now() - pausedTimeRef.current;
        targetDateRef.current = new Date(targetDateRef.current.getTime() + adjustment);
        pausedTimeRef.current = 0;
      }
    }
  }, [isActive, timeLeft.isExpired]);

  const pause = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      pausedTimeRef.current = Date.now();
    }
  }, [isActive]);

  const reset = useCallback(() => {
    setIsActive(false);
    pausedTimeRef.current = 0;
    targetDateRef.current = typeof targetDate === 'string' 
      ? new Date(targetDate) 
      : targetDate;
    startDateRef.current = new Date();
    setHasCompleted(false);
    setTimeLeft(calculateTimeLeft(targetDateRef.current));
  }, [targetDate]);

  const restart = useCallback(() => {
    reset();
    setTimeout(() => start(), 50);
  }, [reset, start]);

  const add = useCallback((seconds: number) => {
    targetDateRef.current = new Date(targetDateRef.current.getTime() + seconds * 1000);
    updateTimeLeft();
  }, [updateTimeLeft]);

  const subtract = useCallback((seconds: number) => {
    const newTarget = new Date(targetDateRef.current.getTime() - seconds * 1000);
    if (newTarget.getTime() > Date.now()) {
      targetDateRef.current = newTarget;
      updateTimeLeft();
    }
  }, [updateTimeLeft]);

  // Effect for countdown
  useEffect(() => {
    if (isActive && !timeLeft.isExpired) {
      intervalRef.current = setInterval(updateTimeLeft, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft.isExpired, updateTimeLeft]);

  // Effect for initial setup
  useEffect(() => {
    targetDateRef.current = typeof targetDate === 'string' 
      ? new Date(targetDate) 
      : targetDate;
    startDateRef.current = new Date();
    updateTimeLeft();
  }, [targetDate, updateTimeLeft]);

  const controls: CountdownControls = {
    start,
    pause,
    reset,
    restart,
    add,
    subtract
  };

  return [timeLeft, controls, isActive];
};

// Hook adicional para múltiples countdowns
export const useMultipleCountdowns = (
  targets: Array<{ id: string; date: Date | string; name?: string }>
) => {
  const [countdowns, setCountdowns] = useState<Map<string, TimeLeft>>(new Map());

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    targets.forEach(({ id, date }) => {
      const updateCountdown = () => {
        const timeLeft = calculateTimeLeftStatic(date);
        setCountdowns(prev => new Map(prev).set(id, timeLeft));
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      intervals.push(interval);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [targets]);

  return countdowns;
};

// Función estática helper
function calculateTimeLeftStatic(target: Date | string): TimeLeft {
  const now = new Date().getTime();
  const targetTime = typeof target === 'string' 
    ? new Date(target).getTime() 
    : target.getTime();
  
  const difference = targetTime - now;
  
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      formatted: '00:00:00',
      percentage: 100,
      isExpired: true
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  const pad = (num: number): string => num.toString().padStart(2, '0');
  const formatted = days > 0 
    ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    days,
    hours,
    minutes,
    seconds,
    total: difference,
    formatted,
    percentage: 0,
    isExpired: false
  };
}

// Hook para eventos especiales de rifa
export const useRaffleCountdown = (raffleDate: Date | string) => {
  const [timeLeft, controls, isActive] = useCountdown({
    targetDate: raffleDate,
    format: 'full',
    onComplete: () => {
      console.log('¡El sorteo ha comenzado!');
    }
  });

  const [phase, setPhase] = useState<'early' | 'normal' | 'final' | 'lastDay' | 'lastHour' | 'ended'>('normal');
  const [urgencyMessage, setUrgencyMessage] = useState<string>('');

  useEffect(() => {
    const { days, hours, total, isExpired } = timeLeft;

    if (isExpired) {
      setPhase('ended');
      setUrgencyMessage('¡El sorteo ha terminado!');
    } else if (total <= 60 * 60 * 1000) { // Última hora
      setPhase('lastHour');
      setUrgencyMessage('⏰ ¡ÚLTIMA HORA! El sorteo está por comenzar');
    } else if (days === 0) { // Último día
      setPhase('lastDay');
      setUrgencyMessage('🔥 ¡ÚLTIMO DÍA! No te quedes sin participar');
    } else if (days <= 3) { // Últimos 3 días
      setPhase('final');
      setUrgencyMessage(`⚡ ¡Solo ${days} días restantes!`);
    } else if (days <= 7) { // Última semana
      setPhase('normal');
      setUrgencyMessage('📅 Última semana para participar');
    } else {
      setPhase('early');
      setUrgencyMessage('');
    }
  }, [timeLeft]);

  const getUrgencyColor = (): string => {
    switch (phase) {
      case 'lastHour': return 'red';
      case 'lastDay': return 'orange';
      case 'final': return 'yellow';
      case 'normal': return 'blue';
      default: return 'gray';
    }
  };

  const shouldShowAlert = (): boolean => {
    return phase === 'lastHour' || phase === 'lastDay';
  };

  return {
    timeLeft,
    controls,
    isActive,
    phase,
    urgencyMessage,
    urgencyColor: getUrgencyColor(),
    showAlert: shouldShowAlert(),
    formattedDate: new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Mexico_City'
    }).format(typeof raffleDate === 'string' ? new Date(raffleDate) : raffleDate)
  };
};

export default useCountdown;