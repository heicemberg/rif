'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PAYMENT_METHODS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface PaymentMethodsProps {
  className?: string;
  onSelect?: (methodId: string) => void;
  selectedMethod?: string;
  showDetails?: boolean;
  showFees?: boolean;
  variant?: 'grid' | 'list' | 'compact';
}

export function PaymentMethods({
  className,
  onSelect,
  selectedMethod: propSelectedMethod,
  showDetails = true,
  showFees = true,
  variant = 'grid',
}: PaymentMethodsProps) {
  const { datosPago, setDatosPago } = useCartStore();
  const [selectedMethod, setSelectedMethod] = useState(
    propSelectedMethod || datosPago?.metodo || ''
  );
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const handleSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setDatosPago({
      metodo: methodId as any,
    });
    if (onSelect) {
      onSelect(methodId);
    }
  };

  const toggleExpanded = (methodId: string) => {
    setExpandedMethod(expandedMethod === methodId ? null : methodId);
  };

  // Renderizar método compacto
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {PAYMENT_METHODS.map((method) => (
          <Button
            key={method.id}
            variant={selectedMethod === method.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSelect(method.id)}
            className="flex items-center gap-2"
          >
            <span className="text-lg">{method.id === 'BINANCE' ? '₿' : '💳'}</span>
            <span>{method.name}</span>
            {method.recommended && (
              <Badge variant="success" size="sm">
                ⭐
              </Badge>
            )}
          </Button>
        ))}
      </div>
    );
  }

  // Renderizar lista
  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isExpanded = expandedMethod === method.id;

          return (
            <Card
              key={method.id}
              className={cn(
                'p-4 cursor-pointer transition-all',
                isSelected && 'border-primary bg-primary/5',
                'hover:shadow-md'
              )}
              onClick={() => handleSelect(method.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <img
                      src={method.logo}
                      alt={method.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '';
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.innerHTML = method.id === 'BINANCE' ? '₿' : '💳';
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{method.name}</h4>
                      {method.recommended && (
                        <Badge variant="success" size="sm">
                          Recomendado
                        </Badge>
                      )}
                      {isSelected && (
                        <Badge variant="default" size="sm">
                          Seleccionado
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                    
                    {showFees && (
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-green-600">
                          ⚡ {method.processingTime}
                        </span>
                        <span className={cn(
                          method.fee === 0 ? 'text-green-600' : 'text-orange-600'
                        )}>
                          {method.fee === 0 ? '✓ Sin comisión' : `Comisión: $${method.fee}`}
                        </span>
                      </div>
                    )}

                    {showDetails && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(method.id);
                        }}
                        className="text-xs text-primary hover:underline mt-2"
                      >
                        {isExpanded ? 'Ver menos' : 'Ver detalles'}
                      </button>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="text-primary">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {isExpanded && showDetails && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  {method.accountInfo && (
                    <div className="space-y-2 text-sm">
                      <h5 className="font-medium">Datos para el pago:</h5>
                      {method.id === 'BINANCE' && (
                        <>
                          <p>Usuario: <span className="font-mono">{method.accountInfo.userName}</span></p>
                          <p>Red: <span className="font-mono">{method.accountInfo.network}</span></p>
                          <p>Moneda: <span className="font-mono">{method.accountInfo.currency}</span></p>
                        </>
                      )}
                      {(method.id === 'AZTECA' || method.id === 'BANCOPPEL') && (
                        <>
                          <p>Cuenta: <span className="font-mono">{method.accountInfo.accountNumber}</span></p>
                          <p>CLABE: <span className="font-mono">{method.accountInfo.clabe}</span></p>
                          <p>Titular: {method.accountInfo.accountName}</p>
                        </>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Instrucciones:</h5>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                      {method.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary">{idx + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // Renderizar grid (default)
  return (
    <div className={cn('grid md:grid-cols-2 gap-4', className)}>
      {PAYMENT_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id;
        
        return (
          <Card
            key={method.id}
            className={cn(
              'relative p-4 cursor-pointer transition-all',
              isSelected && 'border-primary bg-primary/5 shadow-lg',
              !isSelected && 'hover:border-gray-300 hover:shadow-md'
            )}
            onClick={() => handleSelect(method.id)}
          >
            {method.recommended && (
              <Badge 
                variant="success" 
                className="absolute -top-2 -right-2"
              >
                ⭐ Recomendado
              </Badge>
            )}

            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <img
                  src={method.logo}
                  alt={method.name}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '';
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = method.id === 'BINANCE' ? '₿' : '💳';
                      target.parentElement.classList.add('text-2xl');
                    }
                  }}
                />
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">{method.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {method.description}
                </p>

                {showFees && (
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{method.processingTime}</span>
                    </div>
                    
                    {method.fee === 0 ? (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-600">Sin comisión</span>
                      </div>
                    ) : (
                      <span className="text-orange-600">
                        +${method.fee} comisión
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 text-primary">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Componente para mostrar método seleccionado
export function SelectedPaymentMethod({ 
  methodId,
  className 
}: { 
  methodId: string;
  className?: string;
}) {
  const method = PAYMENT_METHODS.find(m => m.id === methodId);
  
  if (!method) return null;

  return (
    <div className={cn('flex items-center gap-3 p-3 bg-muted rounded-lg', className)}>
      <div className="w-10 h-10 rounded bg-white flex items-center justify-center">
        <img
          src={method.logo}
          alt={method.name}
          className="w-8 h-8 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '';
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.innerHTML = method.id === 'BINANCE' ? '₿' : '💳';
            }
          }}
        />
      </div>
      <div className="flex-1">
        <p className="font-medium">{method.name}</p>
        <p className="text-xs text-muted-foreground">{method.description}</p>
      </div>
      <Badge variant="default" size="sm">
        Seleccionado
      </Badge>
    </div>
  );
}