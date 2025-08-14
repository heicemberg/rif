'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useRaffleStore } from '@/stores/raffle-store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface QuickPickProps {
  className?: string;
  variant?: 'default' | 'compact' | 'grid';
}

export function QuickPick({
  className,
  variant = 'default',
}: QuickPickProps) {
  const { 
    rifaActual,
    boletosSeleccionados,
    seleccionRapida,
    limpiarSeleccion,
  } = useRaffleStore();
  
  const [animando, setAnimando] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);

  if (!rifaActual) return null;

  const opciones = [
    { cantidad: 1, label: '1 Boleto', precio: rifaActual.boletos.precio, descuento: 0 },
    { cantidad: 5, label: '5 Boletos', precio: rifaActual.boletos.precio * 5, descuento: 5 },
    { cantidad: 10, label: '10 Boletos', precio: rifaActual.boletos.precio * 10, descuento: 10 },
    { cantidad: 20, label: '20 Boletos', precio: rifaActual.boletos.precio * 20, descuento: 15 },
    { cantidad: 50, label: '50 Boletos', precio: rifaActual.boletos.precio * 50, descuento: 20 },
    { cantidad: 100, label: '100 Boletos', precio: rifaActual.boletos.precio * 100, descuento: 25 },
  ];

  const seleccionarOpcion = async (cantidad: number) => {
    setAnimando(true);
    setOpcionSeleccionada(cantidad);
    
    // Limpiar selección actual
    limpiarSeleccion();
    
    // Simular animación de selección
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Realizar selección rápida
    seleccionRapida(cantidad);
    
    setAnimando(false);
    setTimeout(() => setOpcionSeleccionada(null), 2000);
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {opciones.slice(0, 4).map((opcion) => (
          <Button
            key={opcion.cantidad}
            size="sm"
            variant={boletosSeleccionados.length === opcion.cantidad ? 'default' : 'outline'}
            onClick={() => seleccionarOpcion(opcion.cantidad)}
            disabled={animando}
            className="relative"
          >
            {opcion.label}
            {opcion.descuento > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 text-xs"
              >
                -{opcion.descuento}%
              </Badge>
            )}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-4', className)}>
        {opciones.map((opcion) => (
          <button
            key={opcion.cantidad}
            onClick={() => seleccionarOpcion(opcion.cantidad)}
            disabled={animando}
            className={cn(
              'relative p-4 rounded-lg border-2 transition-all',
              'hover:shadow-lg hover:border-primary hover:-translate-y-1',
              opcionSeleccionada === opcion.cantidad && 'border-primary bg-primary/5',
              boletosSeleccionados.length === opcion.cantidad && 'ring-2 ring-primary',
              animando && 'opacity-50 cursor-not-allowed'
            )}
          >
            {opcion.descuento > 0 && (
              <Badge 
                className="absolute -top-3 -right-3 bg-green-500"
              >
                AHORRA {opcion.descuento}%
              </Badge>
            )}
            
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">{opcion.cantidad}</p>
              <p className="text-sm text-muted-foreground">
                {opcion.cantidad === 1 ? 'Boleto' : 'Boletos'}
              </p>
              
              <div>
                {opcion.descuento > 0 && (
                  <p className="text-xs line-through text-muted-foreground">
                    ${opcion.precio.toLocaleString('es-MX')}
                  </p>
                )}
                <p className="text-lg font-semibold text-primary">
                  ${(opcion.precio * (1 - opcion.descuento / 100)).toLocaleString('es-MX')}
                </p>
              </div>
              
              {opcionSeleccionada === opcion.cantidad && (
                <div className="mt-2">
                  <Badge variant="success">
                    ✓ Seleccionado
                  </Badge>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Selección Rápida</h3>
        <Badge variant="secondary">
          🎲 Números aleatorios
        </Badge>
      </div>

      <div className="space-y-3">
        {opciones.slice(0, 5).map((opcion) => (
          <button
            key={opcion.cantidad}
            onClick={() => seleccionarOpcion(opcion.cantidad)}
            disabled={animando}
            className={cn(
              'w-full p-3 rounded-lg border transition-all',
              'hover:shadow-md hover:border-primary',
              opcionSeleccionada === opcion.cantidad && 'border-primary bg-primary/5',
              boletosSeleccionados.length === opcion.cantidad && 'ring-2 ring-primary',
              animando && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold">{opcion.cantidad}</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">{opcion.label}</p>
                  <p className="text-sm text-muted-foreground">
                    Selección aleatoria instantánea
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                {opcion.descuento > 0 && (
                  <Badge variant="success" className="mb-1">
                    -{opcion.descuento}%
                  </Badge>
                )}
                <p className="font-semibold">
                  ${(opcion.precio * (1 - opcion.descuento / 100)).toLocaleString('es-MX')}
                </p>
              </div>
            </div>
            
            {opcionSeleccionada === opcion.cantidad && (
              <div className="mt-2 text-center">
                <span className="text-sm text-green-600 font-medium">
                  ✓ ¡Boletos seleccionados exitosamente!
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {boletosSeleccionados.length > 0 && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {boletosSeleccionados.length} boletos seleccionados
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={limpiarSeleccion}
            >
              Limpiar selección
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}