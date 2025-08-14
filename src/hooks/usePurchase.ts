// hooks/usePurchase.ts
import { useState, useCallback } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { useRaffleStore } from '@/stores/raffle-store';
import apiClient from '@/lib/api-client';

export interface DatosCliente {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  whatsapp?: string;
}

export interface DatosPago {
  metodo: 'OXXO' | 'SPEI' | 'TARJETA' | 'PAYPAL' | 'MERCADOPAGO';
  referencia?: string;
  comprobante?: File;
  comprobanteUrl?: string;
}

export interface OrdenCompra {
  id: string;
  numeroOrden: string;
  rifaId: string;
  boletos: number[];
  cliente: DatosCliente;
  pago: DatosPago;
  subtotal: number;
  descuento: number;
  total: number;
  estado: 'pendiente' | 'procesando' | 'confirmado' | 'rechazado' | 'cancelado';
  fechaCreacion: Date;
  fechaExpiracion: Date;
  instruccionesPago?: string[];
}

interface EstadoPurchase {
  paso: number;
  cargando: boolean;
  error: string | null;
  ordenActual: OrdenCompra | null;
}

export function usePurchase() {
  const { 
    orden,
    datosCliente,
    datosPago,
    setDatosCliente,
    setDatosPago,
    crearOrden,
    actualizarEstadoOrden,
    limpiarCarrito,
  } = useCartStore();

  const { 
    boletosSeleccionados,
    precioTotal,
    descuento,
    rifaActual,
    limpiarSeleccion,
  } = useRaffleStore();

  const [estado, setEstado] = useState<EstadoPurchase>({
    paso: 1,
    cargando: false,
    error: null,
    ordenActual: null,
  });

  // Validar datos del cliente
  const validarDatosCliente = useCallback((datos: DatosCliente): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];

    if (!datos.nombre || datos.nombre.length < 2) {
      errores.push('El nombre es requerido (mínimo 2 caracteres)');
    }

    if (!datos.apellidos || datos.apellidos.length < 2) {
      errores.push('Los apellidos son requeridos');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!datos.email || !emailRegex.test(datos.email)) {
      errores.push('Email válido es requerido');
    }

    const telefonoRegex = /^[0-9]{10}$/;
    if (!datos.telefono || !telefonoRegex.test(datos.telefono.replace(/\D/g, ''))) {
      errores.push('Teléfono válido de 10 dígitos es requerido');
    }

    return {
      valido: errores.length === 0,
      errores,
    };
  }, []);

  // Validar método de pago
  const validarMetodoPago = useCallback((datos: DatosPago): { valido: boolean; error: string | null } => {
    if (!datos.metodo) {
      return { valido: false, error: 'Selecciona un método de pago' };
    }

    // Validaciones específicas por método
    switch (datos.metodo) {
      case 'TARJETA':
        // Aquí irían validaciones de tarjeta si se procesan localmente
        break;
      case 'OXXO':
      case 'SPEI':
        // Estos métodos requieren comprobante después
        break;
    }

    return { valido: true, error: null };
  }, []);

  // Avanzar al siguiente paso
  const siguientePaso = useCallback(() => {
    const pasoActual = estado.paso;

    // Validaciones por paso
    if (pasoActual === 1) {
      // Validar que hay boletos seleccionados
      if (boletosSeleccionados.length === 0) {
        setEstado(prev => ({ ...prev, error: 'Selecciona al menos un boleto' }));
        return false;
      }
    } else if (pasoActual === 2) {
      // Validar datos del cliente
      if (!datosCliente) {
        setEstado(prev => ({ ...prev, error: 'Completa tus datos personales' }));
        return false;
      }

      const validacion = validarDatosCliente(datosCliente);
      if (!validacion.valido) {
        setEstado(prev => ({ ...prev, error: validacion.errores[0] }));
        return false;
      }
    } else if (pasoActual === 3) {
      // Validar método de pago
      if (!datosPago) {
        setEstado(prev => ({ ...prev, error: 'Selecciona un método de pago' }));
        return false;
      }

      const validacion = validarMetodoPago(datosPago);
      if (!validacion.valido) {
        setEstado(prev => ({ ...prev, error: validacion.error }));
        return false;
      }
    }

    setEstado(prev => ({
      ...prev,
      paso: Math.min(prev.paso + 1, 5),
      error: null,
    }));

    return true;
  }, [estado.paso, boletosSeleccionados, datosCliente, datosPago, validarDatosCliente, validarMetodoPago]);

  // Retroceder al paso anterior
  const pasoAnterior = useCallback(() => {
    setEstado(prev => ({
      ...prev,
      paso: Math.max(prev.paso - 1, 1),
      error: null,
    }));
  }, []);

  // Crear orden de compra
  const procesarOrden = useCallback(async () => {
    if (!rifaActual || !datosCliente || !datosPago) {
      setEstado(prev => ({ ...prev, error: 'Faltan datos para procesar la orden' }));
      return null;
    }

    setEstado(prev => ({ ...prev, cargando: true, error: null }));

    try {
      // Crear orden local
      const ordenData = {
        rifaId: rifaActual.id,
        boletos: boletosSeleccionados,
        cliente: datosCliente,
        pago: datosPago,
        subtotal: boletosSeleccionados.length * rifaActual.boletos.precio,
        descuento: descuento * (boletosSeleccionados.length * rifaActual.boletos.precio),
        total: precioTotal,
      };

      // Llamar a la API para crear la orden
      const response = await apiClient.createOrder({
        raffleId: rifaActual.id,
        tickets: boletosSeleccionados,
        customerInfo: {
          name: `${datosCliente.nombre} ${datosCliente.apellidos}`,
          email: datosCliente.email,
          phone: datosCliente.telefono,
        },
        paymentMethod: datosPago.metodo,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al crear la orden');
      }

      // Guardar orden en el store
      const nuevaOrden: OrdenCompra = {
        id: response.data.id,
        numeroOrden: response.data.orderNumber,
        rifaId: rifaActual.id,
        boletos: boletosSeleccionados,
        cliente: datosCliente,
        pago: datosPago,
        subtotal: ordenData.subtotal,
        descuento: ordenData.descuento,
        total: ordenData.total,
        estado: 'pendiente',
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
        instruccionesPago: obtenerInstruccionesPago(datosPago.metodo),
      };

      crearOrden(nuevaOrden);
      setEstado(prev => ({ 
        ...prev, 
        ordenActual: nuevaOrden,
        paso: 4, // Ir al paso de instrucciones de pago
        cargando: false,
      }));

      // Enviar webhook a n8n
      await enviarWebhook('orden_creada', nuevaOrden);

      return nuevaOrden;
    } catch (error) {
      console.error('Error al procesar orden:', error);
      setEstado(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error al procesar la orden',
        cargando: false,
      }));
      return null;
    }
  }, [rifaActual, datosCliente, datosPago, boletosSeleccionados, precioTotal, descuento, crearOrden]);

  // Subir comprobante de pago
  const subirComprobante = useCallback(async (archivo: File) => {
    if (!estado.ordenActual) {
      setEstado(prev => ({ ...prev, error: 'No hay orden activa' }));
      return false;
    }

    // Validar archivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!tiposPermitidos.includes(archivo.type)) {
      setEstado(prev => ({ ...prev, error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o PDF' }));
      return false;
    }

    const tamanioMaximo = 5 * 1024 * 1024; // 5MB
    if (archivo.size > tamanioMaximo) {
      setEstado(prev => ({ ...prev, error: 'El archivo es muy grande. Máximo 5MB' }));
      return false;
    }

    setEstado(prev => ({ ...prev, cargando: true, error: null }));

    try {
      // Subir archivo a la API
      const response = await apiClient.uploadPaymentProof(estado.ordenActual.id, archivo);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Error al subir comprobante');
      }

      // Actualizar estado de la orden
      actualizarEstadoOrden(estado.ordenActual.id, 'procesando');
      
      // Actualizar datos de pago con URL del comprobante
      setDatosPago({
        ...datosPago!,
        comprobante: archivo,
        comprobanteUrl: response.data.fileUrl,
      });

      // Enviar webhook
      await enviarWebhook('comprobante_subido', {
        ordenId: estado.ordenActual.id,
        comprobanteUrl: response.data.fileUrl,
      });

      setEstado(prev => ({ 
        ...prev, 
        paso: 5, // Ir al paso de confirmación
        cargando: false,
      }));

      return true;
    } catch (error) {
      console.error('Error al subir comprobante:', error);
      setEstado(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error al subir el comprobante',
        cargando: false,
      }));
      return false;
    }
  }, [estado.ordenActual, datosPago, setDatosPago, actualizarEstadoOrden]);

  // Enviar webhook a n8n
  const enviarWebhook = useCallback(async (evento: string, datos: any) => {
    try {
      await apiClient.sendToN8n({
        event: evento,
        orderId: datos.id || datos.ordenId,
        data: datos,
      });
    } catch (error) {
      console.error('Error al enviar webhook:', error);
      // No fallar si el webhook falla
    }
  }, []);

  // Obtener instrucciones de pago según el método
  const obtenerInstruccionesPago = useCallback((metodo: string): string[] => {
    switch (metodo) {
      case 'OXXO':
        return [
          'Dirígete a cualquier tienda OXXO',
          'Proporciona el número de referencia al cajero',
          'Realiza el pago en efectivo',
          'Guarda tu ticket de pago',
          'Sube una foto del comprobante en el siguiente paso',
        ];
      
      case 'SPEI':
        return [
          'Ingresa a tu banca en línea',
          'Realiza una transferencia SPEI',
          'Usa la CLABE: 012180001234567890',
          'Concepto: Tu número de orden',
          'Sube el comprobante de transferencia',
        ];
      
      case 'MERCADOPAGO':
        return [
          'Serás redirigido a MercadoPago',
          'Completa el pago de forma segura',
          'Recibirás confirmación inmediata',
          'Tu orden se procesará automáticamente',
        ];
      
      default:
        return ['Sigue las instrucciones específicas de tu método de pago'];
    }
  }, []);

  // Confirmar orden completada
  const confirmarOrden = useCallback(async () => {
    if (!estado.ordenActual) return false;

    setEstado(prev => ({ ...prev, cargando: true }));

    try {
      // Limpiar datos después de confirmación exitosa
      limpiarSeleccion();
      limpiarCarrito();
      
      // Enviar webhook de confirmación
      await enviarWebhook('orden_confirmada', estado.ordenActual);

      return true;
    } catch (error) {
      console.error('Error al confirmar orden:', error);
      return false;
    } finally {
      setEstado(prev => ({ ...prev, cargando: false }));
    }
  }, [estado.ordenActual, limpiarSeleccion, limpiarCarrito, enviarWebhook]);

  // Cancelar proceso de compra
  const cancelarCompra = useCallback(() => {
    if (estado.ordenActual) {
      actualizarEstadoOrden(estado.ordenActual.id, 'cancelado');
      enviarWebhook('orden_cancelada', { ordenId: estado.ordenActual.id });
    }
    
    setEstado({
      paso: 1,
      cargando: false,
      error: null,
      ordenActual: null,
    });
  }, [estado.ordenActual, actualizarEstadoOrden, enviarWebhook]);

  return {
    // Estado
    paso: estado.paso,
    cargando: estado.cargando,
    error: estado.error,
    ordenActual: estado.ordenActual,
    
    // Datos
    datosCliente,
    datosPago,
    boletosSeleccionados,
    precioTotal,
    descuento,
    
    // Acciones
    setDatosCliente,
    setDatosPago,
    siguientePaso,
    pasoAnterior,
    procesarOrden,
    subirComprobante,
    confirmarOrden,
    cancelarCompra,
    
    // Validaciones
    validarDatosCliente,
    validarMetodoPago,
    
    // Utilidades
    obtenerInstruccionesPago,
  };
}