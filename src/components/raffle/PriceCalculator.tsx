'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRaffleStore } from '@/stores/raffle-store';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface PriceCalculatorProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showPromoCode?: boolean;
}

export function PriceCalculator({
  className,
  variant = 'default',
  showPromoCode = true,
}: PriceCalculatorProps) {
  const { 
    rifaActual, 
    boletosSeleccionados, 
    descuento,
    aplicarDescuento,
    obtenerResumen 
  } = useRaffleStore();
  
  const [codigoPromo, setCodigoPromo] = useState('');
  const [codigoAplicado, setCodigoAplicado] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState('');

  const resumen = obtenerResumen();

  // Códigos promocionales válidos
  const codigosValidos: Record<string, number> = {
    'PRIMERA10': 0.10,
    'AMIGO15': 0.15,
    'VIP20': 0.20,
    'MEGA25': 0.25,
  };

  const aplicarCodigoPromo = () => {
    const codigo = codigoPromo.toUpperCase();
    
    if (codigosValidos[codigo]) {
      aplicarDescuento(codigosValidos[codigo]);
      setCodigoAplicado(true);
      setErrorCodigo('');
    } else {
      setErrorCodigo('Código inválido');
      setCodigoAplicado(false);
    }
  };

  const obtenerDescuentoPorCantidad = () => {
    const cantidad = boletosSeleccionados.length;
    
    if (cantidad >= 50) return { porcentaje: 20, mensaje: '¡20% de descuento por 50+ boletos!' };
    if (cantidad >= 20) return { porcentaje: 15, mensaje: '¡15% de descuento por 20+ boletos!' };
    if (cantidad >= 10) return { porcentaje: 10, mensaje: '¡10% de descuento por 10+ boletos!' };
    if (cantidad >= 5) return { porcentaje: 5, mensaje: '¡5% de descuento por 5+ boletos!' };
    
    return { porcentaje: 0, mensaje: '' };
  };

  const descuentoCantidad = obtenerDescuentoPorCantidad();

  useEffect(() => {
    // Aplicar descuento automático por cantidad si no hay código promo
    if (!codigoAplicado && descuentoCantidad.porcentaje > 0) {
      aplicarDescuento(descuentoCantidad.porcentaje / 100);
    }
  }, [boletosSeleccionados.length]);

  if (!rifaActual) return null;

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {resumen.cantidad} {resumen.cantidad === 1 ? 'boleto' : 'boletos'}
          </span>
          <span className="text-lg font-bold">
            ${resumen.total.toLocaleString('es-MX')}
          </span>
        </div>
        
        {descuento > 0 && (
          <Badge variant="success" className="w-full justify-center">
            ¡Ahorraste ${resumen.descuento.toLocaleString('es-MX')}!
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn('p-6', className)}>
        <h3 className="text-lg font-semibold mb-4">Resumen de Compra</h3>
        
        {/* Tabla de precios por cantidad */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-3">Tabla de descuentos:</p>
          <div className="space-y-2">
            {[
              { cantidad: '5-9', descuento: '5%', ahorro: 5 * rifaActual.boletos.precio * 0.05 },
              { cantidad: '10-19', descuento: '10%', ahorro: 10 * rifaActual.boletos.precio * 0.10 },
              { cantidad: '20-49', descuento: '15%', ahorro: 20 * rifaActual.boletos.precio * 0.15 },
              { cantidad: '50+', descuento: '20%', ahorro: 50 * rifaActual.boletos.precio * 0.20 },
            ].map((item) => (
              <div key={item.cantidad} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                <span>{item.cantidad} boletos</span>
                <span className="font-medium text-green-600">{item.descuento} OFF</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calculadora interactiva */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Cantidad de boletos
            </label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {/* Lógica para disminuir */}}
                disabled={resumen.cantidad <= 1}
              >
                -
              </Button>
              <input
                type="number"
                value={resumen.cantidad}
                readOnly
                className="w-20 text-center border rounded px-2 py-1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {/* Lógica para aumentar */}}
                disabled={resumen.cantidad >= rifaActual.boletos.maxPorPersona}
              >
                +
              </Button>
            </div>
          </div>

          {/* Desglose detallado */}
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Precio unitario:</span>
              <span>${rifaActual.boletos.precio.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cantidad:</span>
              <span>×{resumen.cantidad}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span>Subtotal:</span>
              <span>${resumen.subtotal.toLocaleString('es-MX')}</span>
            </div>
            
            {resumen.descuento > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento ({(descuento * 100).toFixed(0)}%):</span>
                  <span>-${resumen.descuento.toLocaleString('es-MX')}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">
                    ${resumen.total.toLocaleString('es-MX')}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Código promocional */}
          {showPromoCode && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Código promocional
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoPromo}
                  onChange={(e) => setCodigoPromo(e.target.value)}
                  placeholder="Ingresa tu código"
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <Button onClick={aplicarCodigoPromo}>
                  Aplicar
                </Button>
              </div>
              {errorCodigo && (
                <p className="text-sm text-red-500">{errorCodigo}</p>
              )}
              {codigoAplicado && (
                <p className="text-sm text-green-500">¡Código aplicado con éxito!</p>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={cn('space-y-4', className)}>
      {/* Descuento por cantidad */}
      {descuentoCantidad.mensaje && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            {descuentoCantidad.mensaje}
          </p>
        </div>
      )}

      {/* Resumen de precio */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {resumen.cantidad} {resumen.cantidad === 1 ? 'boleto' : 'boletos'} × ${rifaActual.boletos.precio}
          </span>
          <span>${resumen.subtotal.toLocaleString('es-MX')}</span>
        </div>

        {resumen.descuento > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento aplicado:</span>
            <span>-${resumen.descuento.toLocaleString('es-MX')}</span>
          </div>
        )}

        <div className="border-t pt-3 flex justify-between">
          <span className="font-semibold">Total a pagar:</span>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              <AnimatedNumber 
                value={resumen.total} 
                prefix="$" 
                separator="," 
                decimals={0}
              />
            </p>
            <p className="text-xs text-muted-foreground">MXN</p>
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Pago 100% seguro</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Confirmación inmediata</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Sorteo certificado</span>
        </div>
      </div>
    </div>
  );
}