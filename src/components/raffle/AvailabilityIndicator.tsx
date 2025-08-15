'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRaffleStore } from '@/stores/raffle-store';
import { Badge } from '@/components/ui/Badge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { formatNumber } from '@/lib/utils';

interface AvailabilityIndicatorProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showAnimation?: boolean;
}

export function AvailabilityIndicator({
  className,
  variant = 'default',
  showAnimation = true,
}: AvailabilityIndicatorProps) {
  const { rifaActual, boletosOcupados } = useRaffleStore();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showAnimation) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [showAnimation]);

  if (!rifaActual) {
    return null;
  }

  const disponibles = rifaActual.boletos.disponibles;
  const vendidos = rifaActual.boletos.vendidos;
  const total = rifaActual.boletos.total;
  const porcentajeVendido = (vendidos / total) * 100;

  // Determinar urgencia
  const getUrgencyColor = () => {
    if (porcentajeVendido >= 90) return 'text-red-600';
    if (porcentajeVendido >= 75) return 'text-orange-600';
    if (porcentajeVendido >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUrgencyMessage = () => {
    if (porcentajeVendido >= 90) return '¡Últimos boletos!';
    if (porcentajeVendido >= 75) return '¡Se agotan rápido!';
    if (porcentajeVendido >= 50) return 'Más del 50% vendido';
    return 'Disponibles';
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant={porcentajeVendido >= 75 ? 'destructive' : 'secondary'}>
          {formatNumber(disponibles)} disponibles
        </Badge>
        <span className={cn('text-sm font-medium', getUrgencyColor())}>
          {getUrgencyMessage()}
        </span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4 p-4 border rounded-lg', className)}>
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Disponibilidad</h4>
          <Badge variant={porcentajeVendido >= 90 ? 'destructive' : 'secondary'}>
            {porcentajeVendido.toFixed(0)}% vendido
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              <AnimatedNumber value={disponibles} />
            </p>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              <AnimatedNumber value={vendidos} />
            </p>
            <p className="text-xs text-muted-foreground">Vendidos</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              <AnimatedNumber value={total} />
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={cn(
              'h-2.5 rounded-full transition-all duration-500',
              porcentajeVendido >= 90 ? 'bg-red-600' :
              porcentajeVendido >= 75 ? 'bg-orange-600' :
              porcentajeVendido >= 50 ? 'bg-yellow-600' : 'bg-green-600',
              isAnimating && 'animate-pulse'
            )}
            style={{ width: `${porcentajeVendido}%` }}
          />
        </div>

        <p className={cn('text-sm font-medium text-center', getUrgencyColor())}>
          {getUrgencyMessage()}
        </p>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Disponibilidad</span>
        <span className={cn('text-sm font-medium', getUrgencyColor())}>
          {getUrgencyMessage()}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                porcentajeVendido >= 90 ? 'bg-red-600' :
                porcentajeVendido >= 75 ? 'bg-orange-600' :
                porcentajeVendido >= 50 ? 'bg-yellow-600' : 'bg-green-600'
              )}
              style={{ width: `${porcentajeVendido}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-medium">
          {formatNumber(disponibles)}/{formatNumber(total)}
        </span>
      </div>
    </div>
  );
}