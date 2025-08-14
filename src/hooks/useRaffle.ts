// hooks/useRaffle.ts
import { useState, useEffect, useCallback } from 'react';
import { useRaffleStore } from '@/stores/raffle-store';

export interface RaffleData {
  id: string;
  nombre: string;
  descripcion: string;
  premio: {
    titulo: string;
    descripcion: string;
    valorEstimado: number;
    imagen?: string;
  };
  boletos: {
    total: number;
    disponibles: number;
    vendidos: number;
    precio: number;
    maxPorPersona: number;
    minPorCompra: number;
  };
  fechas: {
    inicio: Date;
    fin: Date;
    sorteo: Date;
  };
  estado: 'activo' | 'pausado' | 'finalizado' | 'proximo';
}

export function useRaffle(raffleId?: string) {
  const {
    rifaActual,
    boletosSeleccionados,
    precioTotal,
    descuento,
    metodoPago,
    setRifaActual,
    seleccionarBoleto,
    deseleccionarBoleto,
    limpiarSeleccion,
    seleccionRapida,
    setMetodoPago,
    calcularTotal,
  } = useRaffleStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boletosReservados, setBoletosReservados] = useState<number[]>([]);
  const [tiempoRestante, setTiempoRestante] = useState<{
    dias: number;
    horas: number;
    minutos: number;
    segundos: number;
  } | null>(null);

  // Cargar datos de la rifa
  const cargarRifa = useCallback(async () => {
    if (!raffleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulación de carga de datos
      // En producción, esto sería una llamada a la API
      const rifaData: RaffleData = {
        id: raffleId,
        nombre: 'Gran Rifa 2024',
        descripcion: 'Participa y gana increíbles premios',
        premio: {
          titulo: 'Auto último modelo + $50,000 MXN',
          descripcion: 'Un auto 0km y dinero en efectivo',
          valorEstimado: 500000,
          imagen: '/premio.jpg',
        },
        boletos: {
          total: 10000,
          disponibles: 3456,
          vendidos: 6544,
          precio: 100,
          maxPorPersona: 100,
          minPorCompra: 1,
        },
        fechas: {
          inicio: new Date('2024-01-01'),
          fin: new Date('2024-12-31'),
          sorteo: new Date('2025-01-01'),
        },
        estado: 'activo',
      };
      
      setRifaActual(rifaData);
    } catch (err) {
      setError('Error al cargar la rifa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [raffleId, setRifaActual]);

  // Calcular tiempo restante
  useEffect(() => {
    if (!rifaActual) return;

    const calcularTiempo = () => {
      const ahora = new Date().getTime();
      const fechaSorteo = new Date(rifaActual.fechas.sorteo).getTime();
      const diferencia = fechaSorteo - ahora;

      if (diferencia > 0) {
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        setTiempoRestante({ dias, horas, minutos, segundos });
      } else {
        setTiempoRestante(null);
      }
    };

    calcularTiempo();
    const intervalo = setInterval(calcularTiempo, 1000);

    return () => clearInterval(intervalo);
  }, [rifaActual]);

  // Verificar disponibilidad de boletos
  const verificarDisponibilidad = useCallback(async (numeros: number[]) => {
    setLoading(true);
    try {
      // Simulación de verificación
      // En producción, esto sería una llamada a la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simular algunos boletos no disponibles
      const noDisponibles = numeros.filter(() => Math.random() > 0.9);
      
      if (noDisponibles.length > 0) {
        throw new Error(`Los boletos ${noDisponibles.join(', ')} no están disponibles`);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar disponibilidad');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reservar boletos
  const reservarBoletos = useCallback(async () => {
    if (boletosSeleccionados.length === 0) {
      setError('No has seleccionado ningún boleto');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const disponibles = await verificarDisponibilidad(boletosSeleccionados);
      
      if (!disponibles) {
        return false;
      }

      // Simular reserva
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBoletosReservados(boletosSeleccionados);
      
      return true;
    } catch (err) {
      setError('Error al reservar los boletos');
      return false;
    } finally {
      setLoading(false);
    }
  }, [boletosSeleccionados, verificarDisponibilidad]);

  // Procesar compra
  const procesarCompra = useCallback(async (datosCliente: {
    nombre: string;
    email: string;
    telefono: string;
  }) => {
    if (boletosReservados.length === 0) {
      setError('Primero debes reservar los boletos');
      return false;
    }

    if (!metodoPago) {
      setError('Selecciona un método de pago');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orden = {
        id: `ORD-${Date.now()}`,
        cliente: datosCliente,
        boletos: boletosReservados,
        total: precioTotal,
        metodoPago,
        fecha: new Date(),
        estado: 'pendiente',
      };

      // Limpiar después de la compra
      limpiarSeleccion();
      setBoletosReservados([]);
      
      return orden;
    } catch (err) {
      setError('Error al procesar la compra');
      return null;
    } finally {
      setLoading(false);
    }
  }, [boletosReservados, metodoPago, precioTotal, limpiarSeleccion]);

  // Estadísticas de la rifa
  const obtenerEstadisticas = useCallback(() => {
    if (!rifaActual) return null;

    const porcentajeVendido = (rifaActual.boletos.vendidos / rifaActual.boletos.total) * 100;
    const recaudado = rifaActual.boletos.vendidos * rifaActual.boletos.precio;
    const boletosRestantes = rifaActual.boletos.disponibles;

    return {
      porcentajeVendido,
      recaudado,
      boletosRestantes,
      participantes: Math.floor(rifaActual.boletos.vendidos / 3), // Estimación
      tiempoRestante,
    };
  }, [rifaActual, tiempoRestante]);

  // Validaciones
  const validarSeleccion = useCallback(() => {
    if (!rifaActual) return { valido: false, mensaje: 'No hay rifa activa' };
    
    if (boletosSeleccionados.length === 0) {
      return { valido: false, mensaje: 'Selecciona al menos un boleto' };
    }

    if (boletosSeleccionados.length < rifaActual.boletos.minPorCompra) {
      return { 
        valido: false, 
        mensaje: `Mínimo ${rifaActual.boletos.minPorCompra} boletos por compra` 
      };
    }

    if (boletosSeleccionados.length > rifaActual.boletos.maxPorPersona) {
      return { 
        valido: false, 
        mensaje: `Máximo ${rifaActual.boletos.maxPorPersona} boletos por persona` 
      };
    }

    return { valido: true, mensaje: '' };
  }, [rifaActual, boletosSeleccionados]);

  // Cargar rifa al montar
  useEffect(() => {
    if (raffleId) {
      cargarRifa();
    }
  }, [raffleId, cargarRifa]);

  // Actualizar total cuando cambian los boletos
  useEffect(() => {
    calcularTotal();
  }, [boletosSeleccionados, calcularTotal]);

  return {
    // Estado
    rifaActual,
    boletosSeleccionados,
    boletosReservados,
    precioTotal,
    descuento,
    metodoPago,
    loading,
    error,
    tiempoRestante,
    
    // Acciones
    seleccionarBoleto,
    deseleccionarBoleto,
    limpiarSeleccion,
    seleccionRapida,
    setMetodoPago,
    reservarBoletos,
    procesarCompra,
    
    // Utilidades
    verificarDisponibilidad,
    obtenerEstadisticas,
    validarSeleccion,
    
    // Helpers
    cantidadSeleccionada: boletosSeleccionados.length,
    haySeleccion: boletosSeleccionados.length > 0,
    puedeComprar: boletosSeleccionados.length > 0 && !loading,
  };
}