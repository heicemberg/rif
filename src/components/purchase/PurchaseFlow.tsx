'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRaffleStore } from '@/stores/raffle-store';
import { useCartStore } from '@/stores/cart-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { PriceCalculator } from '@/components/raffle/PriceCalculator';
import { formatCurrency, formatTicketNumber, formatPhone, getWhatsAppUrl } from '@/lib/utils';
import { validateCustomer } from '@/lib/validators';
import { PAYMENT_METHODS, SITE_CONFIG } from '@/lib/constants';

interface PurchaseFlowProps {
  className?: string;
  onComplete?: (orderId: string) => void;
}

type Step = 'selection' | 'information' | 'payment' | 'confirmation';

export function PurchaseFlow({ className, onComplete }: PurchaseFlowProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const { 
    boletosSeleccionados, 
    precioTotal, 
    rifaActual, 
    limpiarSeleccion 
  } = useRaffleStore();
  
  const { 
    datosCliente, 
    setDatosCliente,
    datosPago,
    setDatosPago,
    crearOrden 
  } = useCartStore();

  const [currentStep, setCurrentStep] = useState<Step>('selection');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  // Formulario de cliente
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    whatsapp: '',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedPayment, setSelectedPayment] = useState('');

  // Validar si hay boletos seleccionados
  useEffect(() => {
    if (boletosSeleccionados.length === 0 && currentStep !== 'confirmation') {
      router.push('/');
    }
  }, [boletosSeleccionados, currentStep, router]);

  // Paso 1: Mostrar resumen de selección
  const renderSelectionStep = () => (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Resumen de tu Selección</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Boletos seleccionados:</p>
          <div className="flex flex-wrap gap-2">
            {boletosSeleccionados.slice(0, 10).map(num => (
              <Badge key={num} variant="secondary">
                #{formatTicketNumber(num)}
              </Badge>
            ))}
            {boletosSeleccionados.length > 10 && (
              <Badge variant="outline">
                +{boletosSeleccionados.length - 10} más
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <PriceCalculator variant="compact" showPromoCode={false} />
        </div>

        <Button 
          className="w-full" 
          size="lg"
          onClick={() => setCurrentStep('information')}
        >
          Continuar
        </Button>
      </div>
    </Card>
  );

  // Paso 2: Información del cliente
  const handleCustomerSubmit = () => {
    const validation = validateCustomer(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    
    setDatosCliente({
      nombre: formData.nombre,
      apellidos: formData.apellidos,
      email: formData.email,
      telefono: formData.telefono,
      whatsapp: formData.whatsapp,
    });
    
    setCurrentStep('payment');
  };

  const renderInformationStep = () => (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Información de Contacto</h3>
      
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className={cn(
                'w-full px-3 py-2 border rounded-lg',
                formErrors.nombre && 'border-red-500'
              )}
            />
            {formErrors.nombre && (
              <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Apellidos</label>
            <input
              type="text"
              value={formData.apellidos}
              onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
              className={cn(
                'w-full px-3 py-2 border rounded-lg',
                formErrors.apellidos && 'border-red-500'
              )}
            />
            {formErrors.apellidos && (
              <p className="text-red-500 text-xs mt-1">{formErrors.apellidos}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className={cn(
              'w-full px-3 py-2 border rounded-lg',
              formErrors.email && 'border-red-500'
            )}
          />
          {formErrors.email && (
            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className={cn(
                'w-full px-3 py-2 border rounded-lg',
                formErrors.telefono && 'border-red-500'
              )}
            />
            {formErrors.telefono && (
              <p className="text-red-500 text-xs mt-1">{formErrors.telefono}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep('selection')}
          >
            Atrás
          </Button>
          <Button 
            className="flex-1"
            onClick={handleCustomerSubmit}
          >
            Continuar
          </Button>
        </div>
      </div>
    </Card>
  );

  // Paso 3: Método de pago
  const handlePaymentSubmit = async () => {
    if (!selectedPayment) {
      toast({
        title: 'Error',
        description: 'Selecciona un método de pago',
        variant: 'error',
      });
      return;
    }

    setLoading(true);
    
    try {
      setDatosPago({
        metodo: selectedPayment as any,
      });

      // Crear orden
      const nuevaOrden = {
        id: `ORD-${Date.now()}`,
        numeroOrden: `RA-${Date.now().toString(36).toUpperCase()}`,
        rifaId: rifaActual?.id || '',
        boletos: boletosSeleccionados,
        cliente: datosCliente!,
        pago: { metodo: selectedPayment as any },
        subtotal: boletosSeleccionados.length * (rifaActual?.boletos.precio || 0),
        descuento: 0,
        total: precioTotal,
        estado: 'pendiente' as const,
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 48 * 60 * 60 * 1000),
      };

      crearOrden(nuevaOrden);
      setOrderId(nuevaOrden.numeroOrden);
      setCurrentStep('confirmation');
      
      if (onComplete) {
        onComplete(nuevaOrden.numeroOrden);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo procesar la orden',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentStep = () => (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Método de Pago</h3>
      
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={cn(
                'p-4 rounded-lg border-2 text-left transition-all',
                selectedPayment === method.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <h4 className="font-medium">{method.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {method.description}
              </p>
              {method.recommended && (
                <Badge variant="success" size="sm" className="mt-2">
                  Recomendado
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep('information')}
            disabled={loading}
          >
            Atrás
          </Button>
          <Button 
            className="flex-1"
            onClick={handlePaymentSubmit}
            loading={loading}
          >
            Crear Orden
          </Button>
        </div>
      </div>
    </Card>
  );

  // Paso 4: Confirmación
  const renderConfirmationStep = () => {
    const paymentMethod = PAYMENT_METHODS.find(m => m.id === selectedPayment);
    
    return (
      <Card className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold">¡Orden Creada!</h3>
          <p className="text-muted-foreground mt-2">Número de orden: {orderId}</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2">Instrucciones de Pago</h4>
            <ol className="space-y-2 text-sm">
              {paymentMethod?.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-2">
                  <span className="font-medium">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {paymentMethod?.accountInfo && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg space-y-2">
              <h4 className="font-medium">Datos para el pago:</h4>
              {paymentMethod.id === 'BINANCE' && (
                <>
                  <p className="text-sm">Usuario: <strong>{paymentMethod.accountInfo.userName}</strong></p>
                  <p className="text-sm">Red: <strong>{paymentMethod.accountInfo.network}</strong></p>
                </>
              )}
              {(paymentMethod.id === 'AZTECA' || paymentMethod.id === 'BANCOPPEL') && (
                <>
                  <p className="text-sm">Cuenta: <strong>{paymentMethod.accountInfo.accountNumber}</strong></p>
                  <p className="text-sm">CLABE: <strong>{paymentMethod.accountInfo.clabe}</strong></p>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              size="lg"
              onClick={() => {
                const message = `Hola, acabo de hacer una orden #${orderId} por ${boletosSeleccionados.length} boletos`;
                window.open(getWhatsAppUrl(SITE_CONFIG.contact.whatsapp, message), '_blank');
              }}
            >
              Enviar Comprobante por WhatsApp
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                limpiarSeleccion();
                router.push('/');
              }}
            >
              Volver al Inicio
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Renderizar paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'selection':
        return renderSelectionStep();
      case 'information':
        return renderInformationStep();
      case 'payment':
        return renderPaymentStep();
      case 'confirmation':
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  if (!rifaActual) {
    return null;
  }

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Progress indicator */}
      {currentStep !== 'confirmation' && (
        <div className="flex items-center justify-between mb-6">
          <div className={cn(
            'flex-1 h-2 bg-gray-200 rounded-full mr-2',
            currentStep !== 'selection' && 'bg-primary'
          )} />
          <div className={cn(
            'flex-1 h-2 bg-gray-200 rounded-full mx-2',
            (currentStep === 'payment' || currentStep === 'confirmation') && 'bg-primary'
          )} />
          <div className={cn(
            'flex-1 h-2 bg-gray-200 rounded-full ml-2',
            currentStep === 'confirmation' && 'bg-primary'
          )} />
        </div>
      )}

      {renderCurrentStep()}
    </div>
  );
}