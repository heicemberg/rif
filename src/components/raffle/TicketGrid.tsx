'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRaffleStore } from '@/stores/raffle-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QuickPick } from './QuickPick';
import { TicketSelector } from './TicketSelector';
import { PriceCalculator } from './PriceCalculator';
import { AvailabilityIndicator } from './AvailabilityIndicator';

interface TicketGridProps {
  className?: string;
  mode?: 'quick' | 'manual' | 'both';
  showCalculator?: boolean;
  showAvailability?: boolean;
}

export function TicketGrid({
  className,
  mode = 'both',
  showCalculator = true,
  showAvailability = true,
}: TicketGridProps) {
  const {
    rifaActual,
    boletosSeleccionados,
    limpiarSeleccion,
    setBoletosOcupados,
  } = useRaffleStore();

  const [modoSeleccion, setModoSeleccion] = useState<'quick' | 'manual'>(
    mode === 'both' ? 'quick' : mode
  );
  const [cargando, setCargando] = useState(true);

  // Simular carga de boletos ocupados
  useEffect(() => {
    const cargarBoletosOcupados = async () => {
      setCargando(true);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generar algunos boletos ocupados aleatorios para demostración
      if (rifaActual) {
        const ocupados: number[] = [];
        for (let i = 0; i < rifaActual.boletos.vendidos; i++) {
          const numero = Math.floor(Math.random() * rifaActual.boletos.total) + 1;
          if (!ocupados.includes(numero)) {
            ocupados.push(numero);
          }
        }
        setBoletosOcupados(ocupados);
      }
      
      setCargando(false);
    };

    if (rifaActual) {
      cargarBoletosOcupados();
    }
  }, [rifaActual, setBoletosOcupados]);

  if (!rifaActual) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <p className="text-muted-foreground">No hay rifa activa en este momento</p>
      </Card>
    );
  }

  if (cargando) {
    return (
      <Card className={cn('p-8', className)}>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="grid grid-cols-10 gap-2">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Encabezado */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Selecciona tus Boletos</h2>
            <p className="text-muted-foreground">
              Elige tus números de la suerte para participar en la rifa
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            ${rifaActual.boletos.precio} c/u
          </Badge>
        </div>

        {/* Indicador de disponibilidad */}
        {showAvailability && (
          <AvailabilityIndicator variant="default" />
        )}
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Panel principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selector de modo */}
          {mode === 'both' && (
            <Card className="p-4">
              <div className="flex gap-2">
                <Button
                  variant={modoSeleccion === 'quick' ? 'default' : 'outline'}
                  onClick={() => setModoSeleccion('quick')}
                  className="flex-1"
                >
                  🎲 Selección Rápida
                </Button>
                <Button
                  variant={modoSeleccion === 'manual' ? 'default' : 'outline'}
                  onClick={() => setModoSeleccion('manual')}
                  className="flex-1"
                >
                  ✋ Selección Manual
                </Button>
              </div>
            </Card>
          )}

          {/* Área de selección */}
          <Card className="p-6">
            {modoSeleccion === 'quick' ? (
              <QuickPick variant="grid" />
            ) : (
              <TicketSelector maxVisible={100} />
            )}
          </Card>

          {/* Boletos seleccionados */}
          {boletosSeleccionados.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Tus Boletos Seleccionados</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={limpiarSeleccion}
                >
                  Limpiar todo
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {boletosSeleccionados.map((numero) => (
                  <Badge
                    key={numero}
                    variant="default"
                    className="px-3 py-1"
                  >
                    #{numero.toString().padStart(5, '0')}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Calculadora de precio */}
          {showCalculator && (
            <Card className="p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Resumen de Compra</h3>
              <PriceCalculator variant="default" />
              
              <div className="mt-6 space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={boletosSeleccionados.length === 0}
                >
                  Continuar al Pago
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Al continuar aceptas nuestros términos y condiciones
                </p>
              </div>
            </Card>
          )}

          {/* Información adicional */}
          <Card className="p-4">
            <h4 className="font-medium mb-3">¿Necesitas ayuda?</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <p>Puedes seleccionar hasta {rifaActual.boletos.maxPorPersona} boletos</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <p>Los números se asignan aleatoriamente en la selección rápida</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <p>Recibirás un correo de confirmación después del pago</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}