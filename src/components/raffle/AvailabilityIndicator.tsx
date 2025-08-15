'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useRaffleStore } from '@/stores/raffle-store';
import { Badge } from '@/components/ui/Badge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { CircularProgress } from '@/components/ui/AnimatedNumber';
import { ProgressBar } from '@/components/widgets/ProgressBar';
import { LiveIndicator } from '@/components/widgets/LiveIndicator';
import { getUrgencyLevel, formatNumber, calculateWinProbability } from '@/lib/utils';

interface AvailabilityIndicatorProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  showLiveCount?: boolean;
  showUrgency?: boolean;
  showProgress?: boolean;
  animated?: boolean;
  onUrgencyChange?: (level: string) => void;
}

export function AvailabilityIndicator({
  className,
  variant = 'default',
  showLiveCount = true,
  showUrgency = true,
  showProgress = true,
  animated = true,
  onUrgencyChange,
}: AvailabilityIndicatorProps) {
  const { rifaActual, boletosSeleccionados } = useRaffleStore();
  
  const [viewersCount, setViewersCount] = useState(73);
  const [recentActivity, setRecentActivity] = useState<string>('Juan M. compró 5 boletos');
  const [isUpdating, setIsUpdating] = useState(false);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!rifaActual) {
      return {
        disponibles: 0,
        vendidos: 0,
        total: 0,
        porcentajeVendido: 0,
        porcentajeDisponible: 0,
        velocidadVenta: 0,
        tiempoEstimado: 'N/A',
        probabilidadGanar: '0',
      };
    }

    const disponibles = rifaActual.boletos.disponibles;
    const vendidos = rifaActual.boletos.vendidos;
    const total = rifaActual.boletos.total;
    const porcentajeVendido = (vendidos / total) * 100;
    const porcentajeDisponible = (disponibles / total) * 100;
    
    // Estimar velocidad de venta (boletos por hora)
    const horasTranscurridas = Math.max(1, Math.floor((Date.now() - new Date(rifaActual.fechas.inicio).getTime()) / (1000 * 60 * 60)));
    const velocidadVenta = Math.floor(vendidos / horasTranscurridas);
    
    // Estimar tiempo restante
    const horasRestantes = disponibles > 0 && velocidadVenta > 0 
      ? Math.ceil(disponibles / velocidadVenta)
      : 0;
    
    let tiempoEstimado = 'Pronto';
    if (horasRestantes > 48) {
      tiempoEstimado = `${Math.floor(horasRestantes / 24)} días`;
    } else if (horasRestantes > 0) {
      tiempoEstimado = `${horasRestantes} horas`;
    }

    // Calcular probabilidad de ganar
    const probabilidadGanar = boletosSeleccionados.length > 0
      ? calculateWinProbability(boletosSeleccionados.length, total)
      : '0';

    return {
      disponibles,
      vendidos,
      total,
      porcentajeVendido,
      porcentajeDisponible,
      velocidadVenta,
      tiempoEstimado,
      probabilidadGanar,
    };
  }, [rifaActual, boletosSeleccionados]);

  // Obtener nivel de urgencia
  const urgencyLevel = useMemo(() => {
    return getUrgencyLevel(stats.porcentajeVendido);
  }, [stats.porcentajeVendido]);

  // Simular actividad en vivo
  useEffect(() => {
    const interval = setInterval(() => {
      // Actualizar viewers
      setViewersCount(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(20, Math.min(200, prev + change));
      });

      // Actualizar actividad reciente
      const activities = [
        'María G. de CDMX compró 3 boletos',
        'Carlos R. está viendo la rifa',
        'Ana L. compró 10 boletos',
        'Luis M. reservó 5 boletos',
        'Sofia H. ganó el mes pasado',
      ];
      setRecentActivity(activities[Math.floor(Math.random() * activities.length)]);
      
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Notificar cambios de urgencia
  useEffect(() => {
    if (onUrgencyChange && urgencyLevel.message) {
      onUrgencyChange(urgencyLevel.message);
    }
  }, [urgencyLevel, onUrgencyChange]);

  if (!rifaActual) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground', className)}>
        No hay información disponible
      </div>
    );
  }

  // Variante minimal
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <Badge variant={stats.disponibles < 100 ? 'destructive' : 'secondary'}>
          {formatNumber(stats.disponibles)} disponibles
        </Badge>
        {showLiveCount && (
          <div className="flex items-center gap-1">
            <LiveIndicator size="sm" />
            <span className="text-sm">{viewersCount} viendo</span>
          </div>
        )}
      </div>
    );
  }

  // Variante compact
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Disponibilidad</span>
          <Badge 
            variant={stats.porcentajeVendido > 75 ? 'destructive' : 'secondary'}
            className={urgencyLevel.pulse ? 'animate-pulse' : ''}
          >
            {stats.porcentajeVendido.toFixed(0)}% vendido
          </Badge>
        </div>
        
        {showProgress && (
          <ProgressBar 
            value={stats.vendidos} 
            max={stats.total}
            variant="gradient"
            color={stats.porcentajeVendido > 75 ? 'danger' : 'primary'}
            size="sm"
            animated={animated}
          />
        )}
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatNumber(stats.disponibles)} disponibles</span>
          <span>{formatNumber(stats.vendidos)} vendidos</span>
        </div>
      </div>
    );
  }

  // Variante detailed
  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-4 p-4 bg-card rounded-lg border', className)}>
        {/* Header con urgencia */}
        {showUrgency && urgencyLevel.message && (
          <div className={cn(
            'flex items-center gap-2 p-3 rounded-lg',
            urgencyLevel.color === 'red' && 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
            urgencyLevel.color === 'orange' && 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
            urgencyLevel.color === 'yellow' && 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
            urgencyLevel.color === 'green' && 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
            urgencyLevel.pulse && 'animate-pulse'
          )}>
            <span className="text-xl">{urgencyLevel.icon}</span>
            <span className="font-medium">{urgencyLevel.message}</span>
          </div>
        )}

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Boletos Disponibles</p>
            <p className="text-2xl font-bold">
              <AnimatedNumber value={stats.disponibles} separator="," />
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Boletos Vendidos</p>
            <p className="text-2xl font-bold text-primary">
              <AnimatedNumber value={stats.vendidos} separator="," />
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        {showProgress && (
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progreso de Venta</span>
              <span className="text-sm text-muted-foreground">
                {stats.porcentajeVendido.toFixed(1)}%
              </span>
            </div>
            <ProgressBar 
              value={stats.vendidos}
              max={stats.total}
              variant="striped"
              color={
                stats.porcentajeVendido > 90 ? 'danger' :
                stats.porcentajeVendido > 75 ? 'warning' :
                stats.porcentajeVendido > 50 ? 'info' : 'success'
              }
              showLabel={false}
              animated={animated}
            />
          </div>
        )}

        {/* Métricas adicionales */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-xs text-muted-foreground">Velocidad</p>
            <p className="text-sm font-semibold">{stats.velocidadVenta}/hora</p>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-xs text-muted-foreground">Se agota en</p>
            <p className="text-sm font-semibold">{stats.tiempoEstimado}</p>
          </div>
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-xs text-muted-foreground">Tu probabilidad</p>
            <p className="text-sm font-semibold">{stats.probabilidadGanar}%</p>
          </div>
        </div>

        {/* Actividad en vivo */}
        {showLiveCount && (
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <LiveIndicator size="sm" color="green" />
              <span className="text-sm">
                <strong>{viewersCount}</strong> personas viendo
              </span>
            </div>
            <p className={cn(
              'text-xs text-muted-foreground transition-opacity',
              isUpdating && 'opacity-100',
              !isUpdating && 'opacity-70'
            )}>
              {recentActivity}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Variante default
  return (
    <div className={cn('space-y-3', className)}>
      {/* Indicador de urgencia */}
      {showUrgency && urgencyLevel.message && (
        <div className={cn(
          'flex items-center gap-2 text-sm font-medium',
          urgencyLevel.color === 'red' && 'text-red-600',
          urgencyLevel.color === 'orange' && 'text-orange-600',
          urgencyLevel.color === 'yellow' && 'text-yellow-600',
          urgencyLevel.color === 'green' && 'text-green-600',
          urgencyLevel.pulse && 'animate-pulse'
        )}>
          <span>{urgencyLevel.icon}</span>
          <span>{urgencyLevel.message}</span>
        </div>
      )}

      {/* Números principales */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Disponibles</p>
          <p className="text-xl font-bold">
            <AnimatedNumber value={stats.disponibles} separator="," />
            <span className="text-sm font-normal text-muted-foreground ml-1">
              de {formatNumber(stats.total)}
            </span>
          </p>
        </div>
        
        {showLiveCount && (
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end mb-1">
              <LiveIndicator size="sm" color="green" />
              <span className="text-sm font-medium">{viewersCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">viendo ahora</p>
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {showProgress && (
        <ProgressBar
          value={stats.vendidos}
          max={stats.total}
          variant={stats.porcentajeVendido > 75 ? 'animated' : 'gradient'}
          color={
            stats.porcentajeVendido > 90 ? 'danger' :
            stats.porcentajeVendido > 75 ? 'warning' : 'primary'
          }
          size="md"
          showLabel={true}
          labelPosition="top"
          animated={animated}
        />
      )}

      {/* Actividad reciente */}
      {recentActivity && (
        <p className={cn(
          'text-xs text-muted-foreground italic transition-all',
          isUpdating && 'text-primary font-medium'
        )}>
          {recentActivity}
        </p>
      )}
    </div>
  );
}

// Componente adicional para mostrar disponibilidad en círculo
export function CircularAvailability({
  available,
  total,
  size = 120,
  className,
}: {
  available: number;
  total: number;
  size?: number;
  className?: string;
}) {
  const percentage = (available / total) * 100;
  const sold = total - available;
  const soldPercentage = (sold / total) * 100;

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <CircularProgress
        value={soldPercentage}
        max={100}
        size={size}
        strokeWidth={8}
        color={
          soldPercentage > 90 ? 'danger' :
          soldPercentage > 75 ? 'warning' :
          soldPercentage > 50 ? 'info' : 'success'
        }
        showLabel={false}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-2xl font-bold">{percentage.toFixed(0)}%</p>
        <p className="text-xs text-muted-foreground">disponible</p>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium">{formatNumber(available)}</p>
        <p className="text-xs text-muted-foreground">boletos libres</p>
      </div>
    </div>
  );
}