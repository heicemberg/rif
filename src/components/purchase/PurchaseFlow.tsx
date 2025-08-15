'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePurchase } from '@/hooks/usePurchase';
import { useRaffleStore } from '@/stores/raffle-store';
import { useCartStore } from '@/stores/cart-store';
import { useN8nPurchase } from '@/hooks/useN8nPurchase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal, Dialog, AlertDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ProgressBar } from '@/components/widgets/ProgressBar';
import { Countdown } from '@/components/widgets/Countdown';
import { PriceCalculator } from '@/components/raffle/PriceCalculator';
import { formatCurrency, formatTicketNumber, getWhatsAppUrl, generateOrderId } from '@/lib/utils';
import { validateCustomer, validatePaymentMethod } from '@/lib/validators';
import { SITE_CONFIG, PAYMENT_METHODS } from '@/lib/constants';
import type { DatosCliente, DatosPago } from '@/hooks/usePurchase';

interface PurchaseFlowProps {
  className?: string;
  onComplete?: (orderId: string) => void;
  onCancel?: () => void;
}

interface StepProps {
  isActive: boolean;
  isCompleted: boolean;
  onEdit?: () => void;
}

// Componente para cada paso
function StepIndicator({ 
  step, 
  currentStep, 
  title 
}: { 
  step: number; 
  currentStep: number; 
  title: string;
}) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className={cn(
      'flex items-center',
      step < 4 && 'flex-1'
    )}>
      <div className="flex items-center">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
          isCompleted && 'bg-green-500 text-white',
          isActive && 'bg-primary text-white ring-4 ring-primary/20',
          !isCompleted && !isActive && 'bg-gray-200 text-gray-500'
        )}>
          {isCompleted ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            step
          )}
        </div>
        <span className={cn(
          'ml-3 text-sm font-medium hidden sm:block',
          isActive && 'text-primary',
          isCompleted && 'text-green-600',
          !isActive && !isCompleted && 'text-gray-500'
        )}>
          {title}
        </span>
      </div>
      {step < 4 && (
        <div className={cn(
          'flex-1 h-0.5 mx-4',
          isCompleted ? 'bg-green-500' : 'bg-gray-200'
        )} />
      )}
    </div>
  );
}

// Step 1: Resumen de selección
function SelectionSummary({ isActive, isCompleted, onEdit }: StepProps) {
  const { boletosSeleccionados, rifaActual, precioTotal } = useRaffleStore();

  if (!isActive && !isCompleted) return null;

  return (
    <Card className={cn(
      'p-6 transition-all',
      !isActive && 'opacity-75'
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Boletos Seleccionados</h3>
        {isCompleted && onEdit && (
          <Button size="sm" variant="ghost" onClick={onEdit}>
            Editar
          </Button>
        )}
      </div>

      <div className="space-y-4">
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

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              Total ({boletosSeleccionados.length} boletos)
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(precioTotal)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Step 2: Información del cliente
function CustomerInfo({ isActive, isCompleted, onEdit }: StepProps) {
  const { datosCliente, setDatosCliente } = useCartStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<DatosCliente>(
    datosCliente || {
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      whatsapp: '',
    }
  );

  const handleChange = (field: keyof DatosCliente, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = () => {
    const validation = validateCustomer(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }
    setDatosCliente(formData);
    return true;
  };

  if (!isActive && !isCompleted) return null;

  if (isCompleted && datosCliente) {
    return (
      <Card className="p-6 opacity-75">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Información de Contacto</h3>
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              Editar
            </Button>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <p><strong>Nombre:</strong> {datosCliente.nombre} {datosCliente.apellidos}</p>
          <p><strong>Email:</strong> {datosCliente.email}</p>
          <p><strong>Teléfono:</strong> {datosCliente.telefono}</p>
          {datosCliente.whatsapp && (
            <p><strong>WhatsApp:</strong> {datosCliente.whatsapp}</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
      
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg',
                errors.nombre && 'border-red-500'
              )}
              placeholder="Juan"
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.apellidos}
              onChange={(e) => handleChange('apellidos', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg',
                errors.apellidos && 'border-red-500'
              )}
              placeholder="Pérez García"
            />
            {errors.apellidos && (
              <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-lg',
              errors.email && 'border-red-500'
            )}
            placeholder="correo@ejemplo.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-lg',
                errors.telefono && 'border-red-500'
              )}
              placeholder="5512345678"
            />
            {errors.telefono && (
              <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp (opcional)
            </label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="5512345678"
            />
          </div>
        </div>

        <div className="pt-4">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" required />
            <span className="text-sm text-muted-foreground">
              Acepto los términos y condiciones y la política de privacidad
            </span>
          </label>
        </div>
      </div>
    </Card>
  );
}

// Step 3: Método de pago
function PaymentMethod({ isActive, isCompleted, onEdit }: StepProps) {
  const { datosPago, setDatosPago } = useCartStore();
  const [selectedMethod, setSelectedMethod] = useState<string>(datosPago?.metodo || '');

  const handleSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setDatosPago({ 
      metodo: methodId as any 
    });
  };

  if (!isActive && !isCompleted) return null;

  if (isCompleted && datosPago) {
    const method = PAYMENT_METHODS.find(m => m.id === datosPago.metodo);
    return (
      <Card className="p-6 opacity-75">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Método de Pago</h3>
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              Editar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <img src={method?.logo} alt={method?.name} className="w-12 h-12 object-contain" />
          <div>
            <p className="font-medium">{method?.name}</p>
            <p className="text-sm text-muted-foreground">{method?.description}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Selecciona tu Método de Pago</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {PAYMENT_METHODS.map(method => (
          <button
            key={method.id}
            onClick={() => handleSelect(method.id)}
            className={cn(
              'p-4 rounded-lg border-2 transition-all text-left',
              selectedMethod === method.id 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-start gap-3">
              <img 
                src={method.logo} 
                alt={method.name}
                className="w-12 h-12 object-contain"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{method.name}</h4>
                  {method.recommended && (
                    <Badge variant="success" size="sm">Recomendado</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {method.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                 <span className="text-green-600">
                   ⚡ {method.processingTime}
                 </span>
                 {method.fee > 0 && (
                   <span className="text-muted-foreground">
                     Comisión: ${method.fee}
                   </span>
                 )}
               </div>
             </div>
             {selectedMethod === method.id && (
               <div className="text-primary">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
               </div>
             )}
           </div>
         </button>
       ))}
     </div>
   </Card>
 );
}

// Step 4: Confirmación y pago
function PaymentConfirmation({ orderId }: { orderId: string }) {
 const { datosPago, datosCliente } = useCartStore();
 const { boletosSeleccionados, precioTotal, rifaActual } = useRaffleStore();
 const router = useRouter();
 const { toast } = useToast();
 
 const [copiado, setCopiado] = useState<string>('');
 const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);

 const paymentMethod = PAYMENT_METHODS.find(m => m.id === datosPago?.metodo);

 const handleCopy = async (text: string, label: string) => {
   try {
     await navigator.clipboard.writeText(text);
     setCopiado(label);
     toast({
       title: 'Copiado',
       description: `${label} copiado al portapapeles`,
       variant: 'success',
     });
     setTimeout(() => setCopiado(''), 3000);
   } catch (error) {
     toast({
       title: 'Error',
       description: 'No se pudo copiar al portapapeles',
       variant: 'error',
     });
   }
 };

 const handleWhatsApp = () => {
   setEnviandoWhatsApp(true);
   const message = `🎫 *Nueva Orden de Rifa*\n\n` +
     `📋 Orden: ${orderId}\n` +
     `🎯 Boletos: ${boletosSeleccionados.length}\n` +
     `💰 Total: ${formatCurrency(precioTotal)}\n` +
     `💳 Método: ${paymentMethod?.name}\n\n` +
     `Por favor, envía tu comprobante de pago para verificar tu compra.`;
   
   const whatsappUrl = getWhatsAppUrl(SITE_CONFIG.contact.whatsapp, message);
   window.open(whatsappUrl, '_blank');
   setEnviandoWhatsApp(false);
 };

 return (
   <div className="space-y-6">
     {/* Resumen de orden */}
     <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200">
       <div className="flex items-center gap-3 mb-4">
         <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
           </svg>
         </div>
         <div>
           <h3 className="text-lg font-semibold">¡Orden Creada Exitosamente!</h3>
           <p className="text-sm text-muted-foreground">Número de orden: {orderId}</p>
         </div>
       </div>

       <div className="space-y-3 text-sm">
         <div className="flex justify-between">
           <span>Boletos seleccionados:</span>
           <span className="font-medium">{boletosSeleccionados.length}</span>
         </div>
         <div className="flex justify-between">
           <span>Total a pagar:</span>
           <span className="font-bold text-lg">{formatCurrency(precioTotal)}</span>
         </div>
         <div className="flex justify-between">
           <span>Método de pago:</span>
           <span className="font-medium">{paymentMethod?.name}</span>
         </div>
       </div>
     </Card>

     {/* Instrucciones de pago */}
     <Card className="p-6">
       <h3 className="text-lg font-semibold mb-4">Instrucciones de Pago</h3>
       
       {/* Datos específicos según método */}
       {datosPago?.metodo === 'BINANCE' && paymentMethod?.accountInfo && (
         <div className="space-y-4 mb-6">
           <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
             <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
               ⚠️ Importante: Usa la red TRC20 para comisiones bajas
             </p>
           </div>
           
           <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
               <div>
                 <p className="text-xs text-muted-foreground">Usuario Binance</p>
                 <p className="font-mono font-medium">{paymentMethod.accountInfo.userName}</p>
               </div>
               <Button
                 size="sm"
                 variant="outline"
                 onClick={() => handleCopy(paymentMethod.accountInfo.userName || '', 'Usuario')}
               >
                 {copiado === 'Usuario' ? '✓ Copiado' : 'Copiar'}
               </Button>
             </div>

             <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
               <div>
                 <p className="text-xs text-muted-foreground">Wallet USDT (TRC20)</p>
                 <p className="font-mono text-sm break-all">{paymentMethod.accountInfo.wallet}</p>
               </div>
               <Button
                 size="sm"
                 variant="outline"
                 onClick={() => handleCopy(paymentMethod.accountInfo.wallet || '', 'Wallet')}
               >
                 {copiado === 'Wallet' ? '✓ Copiado' : 'Copiar'}
               </Button>
             </div>

             <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
               <div>
                 <p className="text-xs text-muted-foreground">Monto en USDT</p>
                 <p className="font-mono font-medium">{(precioTotal / 20).toFixed(2)} USDT</p>
               </div>
               <Button
                 size="sm"
                 variant="outline"
                 onClick={() => handleCopy((precioTotal / 20).toFixed(2), 'Monto')}
               >
                 {copiado === 'Monto' ? '✓ Copiado' : 'Copiar'}
               </Button>
             </div>
           </div>
         </div>
       )}

       {(datosPago?.metodo === 'AZTECA' || datosPago?.metodo === 'BANCOPPEL') && 
        paymentMethod?.accountInfo && (
         <div className="space-y-4 mb-6">
           <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
               <div>
                 <p className="text-xs text-muted-foreground">Número de cuenta</p>
                 <p className="font-mono font-medium">{paymentMethod.accountInfo.accountNumber}</p>
               </div>
               <Button
                 size="sm"
                 variant="outline"
                 onClick={() => handleCopy(paymentMethod.accountInfo.accountNumber || '', 'Cuenta')}
               >
                 {copiado === 'Cuenta' ? '✓ Copiado' : 'Copiar'}
               </Button>
             </div>

             <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
               <div>
                 <p className="text-xs text-muted-foreground">CLABE</p>
                 <p className="font-mono text-sm">{paymentMethod.accountInfo.clabe}</p>
               </div>
               <Button
                 size="sm"
                 variant="outline"
                 onClick={() => handleCopy(paymentMethod.accountInfo.clabe || '', 'CLABE')}
               >
                 {copiado === 'CLABE' ? '✓ Copiado' : 'Copiar'}
               </Button>
             </div>

             <div className="p-3 bg-muted rounded-lg">
               <p className="text-xs text-muted-foreground">Beneficiario</p>
               <p className="font-medium">{paymentMethod.accountInfo.accountName}</p>
             </div>

             <div className="p-3 bg-muted rounded-lg">
               <p className="text-xs text-muted-foreground">Referencia/Concepto</p>
               <p className="font-mono font-medium">{orderId}</p>
             </div>
           </div>
         </div>
       )}

       {datosPago?.metodo === 'OXXO' && (
         <div className="space-y-4 mb-6">
           <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
             <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
               📍 Dirígete a cualquier tienda OXXO con esta referencia
             </p>
           </div>
           
           <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
             <div>
               <p className="text-xs text-muted-foreground">Referencia OXXO</p>
               <p className="font-mono text-lg font-bold">{orderId}</p>
             </div>
             <Button
               size="sm"
               variant="outline"
               onClick={() => handleCopy(orderId, 'Referencia')}
             >
               {copiado === 'Referencia' ? '✓ Copiado' : 'Copiar'}
             </Button>
           </div>

           <div className="p-3 bg-muted rounded-lg">
             <p className="text-xs text-muted-foreground">Total a pagar (incluye comisión)</p>
             <p className="font-bold text-lg">{formatCurrency(precioTotal + 10)}</p>
           </div>
         </div>
       )}

       {/* Pasos a seguir */}
       <div className="space-y-3">
         <h4 className="font-medium">Pasos a seguir:</h4>
         <ol className="space-y-2">
           {paymentMethod?.instructions.map((instruction, index) => (
             <li key={index} className="flex gap-2 text-sm">
               <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                 {index + 1}
               </span>
               <span className="text-muted-foreground">{instruction}</span>
             </li>
           ))}
         </ol>
       </div>

       {/* Tiempo límite */}
       <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
         <div className="flex items-center gap-2 mb-2">
           <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
           </svg>
           <p className="font-medium text-orange-800 dark:text-orange-200">
             Tiempo para completar el pago:
           </p>
         </div>
         <Countdown 
           targetDate={new Date(Date.now() + 48 * 60 * 60 * 1000)} 
           variant="compact"
           showDays={false}
         />
       </div>
     </Card>

     {/* Acciones */}
     <div className="flex flex-col sm:flex-row gap-3">
       <Button
         size="lg"
         className="flex-1"
         onClick={handleWhatsApp}
         loading={enviandoWhatsApp}
       >
         <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
           <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
           <path d="M12 2C6.486 2 2 6.486 2 12c0 1.885.52 3.651 1.426 5.153L2 22l4.993-1.31A9.93 9.93 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2z"/>
         </svg>
         Enviar Comprobante por WhatsApp
       </Button>
       
       <Button
         size="lg"
         variant="outline"
         onClick={() => router.push('/mis-ordenes')}
       >
         Ver Mis Órdenes
       </Button>
     </div>

     {/* Información adicional */}
     <div className="text-center text-sm text-muted-foreground">
       <p>¿Necesitas ayuda? Contáctanos:</p>
       <p className="font-medium">{SITE_CONFIG.contact.whatsappFormatted}</p>
       <p>{SITE_CONFIG.contact.email}</p>
     </div>
   </div>
 );
}

// Componente principal
export function PurchaseFlow({ 
 className, 
 onComplete, 
 onCancel 
}: PurchaseFlowProps) {
 const router = useRouter();
 const { toast } = useToast();
 const { sendPurchase, isLoading: sendingToN8n } = useN8nPurchase();
 
 const {
   paso,
   cargando,
   error,
   ordenActual,
   boletosSeleccionados,
   precioTotal,
   datosCliente,
   datosPago,
   siguientePaso,
   pasoAnterior,
   procesarOrden,
   cancelarCompra,
 } = usePurchase();

 const { rifaActual } = useRaffleStore();
 
 const [showCancelModal, setShowCancelModal] = useState(false);
 const [orderCompleted, setOrderCompleted] = useState(false);
 const [currentOrderId, setCurrentOrderId] = useState('');

 // Validar que hay boletos seleccionados
 useEffect(() => {
   if (boletosSeleccionados.length === 0 && !orderCompleted) {
     toast({
       title: 'Sin boletos',
       description: 'Primero debes seleccionar tus boletos',
       variant: 'warning',
     });
     router.push('/');
   }
 }, [boletosSeleccionados, orderCompleted, router, toast]);

 // Manejar siguiente paso
 const handleNext = async () => {
   if (paso === 1) {
     // Validar selección
     if (boletosSeleccionados.length === 0) {
       toast({
         title: 'Error',
         description: 'Debes seleccionar al menos un boleto',
         variant: 'error',
       });
       return;
     }
     siguientePaso();
   } else if (paso === 2) {
     // Validar datos del cliente
     if (!datosCliente) {
       toast({
         title: 'Error',
         description: 'Completa tu información de contacto',
         variant: 'error',
       });
       return;
     }
     siguientePaso();
   } else if (paso === 3) {
     // Validar método de pago y procesar orden
     if (!datosPago?.metodo) {
       toast({
         title: 'Error',
         description: 'Selecciona un método de pago',
         variant: 'error',
       });
       return;
     }

     // Crear orden
     const orden = await procesarOrden();
     
     if (orden) {
       setCurrentOrderId(orden.numeroOrden);
       setOrderCompleted(true);
       
       // Enviar a n8n
       try {
         await sendPurchase({
           ticketsCount: boletosSeleccionados.length,
           selectedTickets: boletosSeleccionados,
           paymentMethod: datosPago.metodo as any,
           total: precioTotal,
           name: `${datosCliente.nombre} ${datosCliente.apellidos}`,
           email: datosCliente.email,
           whatsapp: datosCliente.whatsapp || datosCliente.telefono,
           screenshotBase64: '', // Se agregará cuando suba el comprobante
           timestamp: new Date().toISOString(),
           userAgent: navigator.userAgent,
         });
       } catch (error) {
         console.error('Error enviando a n8n:', error);
       }

       toast({
         title: '¡Orden creada!',
         description: 'Ahora realiza tu pago siguiendo las instrucciones',
         variant: 'success',
       });
       
       siguientePaso();
       
       if (onComplete) {
         onComplete(orden.numeroOrden);
       }
     }
   }
 };

 // Manejar cancelación
 const handleCancel = () => {
   setShowCancelModal(true);
 };

 const confirmCancel = () => {
   cancelarCompra();
   setShowCancelModal(false);
   if (onCancel) {
     onCancel();
   } else {
     router.push('/');
   }
 };

 if (!rifaActual) {
   return (
     <Card className="p-8 text-center">
       <p className="text-muted-foreground">No hay rifa activa</p>
     </Card>
   );
 }

 return (
   <div className={cn('space-y-6', className)}>
     {/* Progress Steps */}
     {!orderCompleted && (
       <div className="flex items-center justify-between">
         <StepIndicator step={1} currentStep={paso} title="Boletos" />
         <StepIndicator step={2} currentStep={paso} title="Información" />
         <StepIndicator step={3} currentStep={paso} title="Pago" />
         <StepIndicator step={4} currentStep={paso} title="Confirmación" />
       </div>
     )}

     {/* Contenido del paso actual */}
     <div className="space-y-6">
       {paso === 1 && (
         <SelectionSummary
           isActive={true}
           isCompleted={false}
           onEdit={() => router.push('/')}
         />
       )}

       {paso === 2 && (
         <>
           <SelectionSummary
             isActive={false}
             isCompleted={true}
             onEdit={() => pasoAnterior()}
           />
           <CustomerInfo
             isActive={true}
             isCompleted={false}
             onEdit={() => {}}
           />
         </>
       )}

       {paso === 3 && (
         <>
           <SelectionSummary
             isActive={false}
             isCompleted={true}
             onEdit={() => router.push('/')}
           />
           <CustomerInfo
             isActive={false}
             isCompleted={true}
             onEdit={() => pasoAnterior()}
           />
           <PaymentMethod
             isActive={true}
             isCompleted={false}
             onEdit={() => {}}
           />
         </>
       )}

       {paso === 4 && (
         <PaymentConfirmation orderId={currentOrderId} />
       )}
     </div>

     {/* Calculadora de precio lateral */}
     {paso < 4 && (
       <Card className="p-6 bg-muted/50">
         <PriceCalculator variant="default" showPromoCode={false} />
       </Card>
     )}

     {/* Mensajes de error */}
     {error && (
       <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
         <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
       </div>
     )}

     {/* Botones de navegación */}
     {paso < 4 && (
       <div className="flex gap-3">
         {paso > 1 && (
           <Button
             size="lg"
             variant="outline"
             onClick={pasoAnterior}
             disabled={cargando}
           >
             Anterior
           </Button>
         )}
         
         <Button
           size="lg"
           className="flex-1"
           onClick={handleNext}
           loading={cargando || sendingToN8n}
         >
           {paso === 3 ? 'Crear Orden' : 'Siguiente'}
         </Button>
         
         <Button
           size="lg"
           variant="ghost"
           onClick={handleCancel}
           disabled={cargando}
         >
           Cancelar
         </Button>
       </div>
     )}

     {/* Modal de cancelación */}
     <AlertDialog
       isOpen={showCancelModal}
       onClose={() => setShowCancelModal(false)}
       onConfirm={confirmCancel}
       title="¿Cancelar compra?"
       description="Se perderá tu selección de boletos y tendrás que empezar de nuevo."
       confirmText="Sí, cancelar"
       cancelText="Continuar comprando"
       variant="warning"
     />
   </div>
 );
}