// stores/raffle-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RaffleData {
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

interface RaffleStore {
  // Estado
  rifaActual: RaffleData | null;
  boletosSeleccionados: number[];
  boletosOcupados: number[];
  precioTotal: number;
  descuento: number;
  metodoPago: string | null;
  
  // Acciones básicas
  setRifaActual: (rifa: RaffleData) => void;
  seleccionarBoleto: (numero: number) => void;
  deseleccionarBoleto: (numero: number) => void;
  toggleBoleto: (numero: number) => void;
  limpiarSeleccion: () => void;
  
  // Selección rápida
  seleccionRapida: (cantidad: number) => void;
  seleccionarRango: (inicio: number, fin: number) => void;
  seleccionarAleatorios: (cantidad: number) => void;
  
  // Métodos de pago y cálculos
  setMetodoPago: (metodo: string) => void;
  aplicarDescuento: (porcentaje: number) => void;
  calcularTotal: () => void;
  
  // Gestión de boletos ocupados
  setBoletosOcupados: (boletos: number[]) => void;
  estaDisponible: (numero: number) => boolean;
  estaSeleccionado: (numero: number) => boolean;
  
  // Utilidades
  obtenerResumen: () => {
    cantidad: number;
    subtotal: number;
    descuento: number;
    total: number;
    boletos: number[];
  };
  
  // Reset
  resetearTodo: () => void;
}

export const useRaffleStore = create<RaffleStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      rifaActual: null,
      boletosSeleccionados: [],
      boletosOcupados: [],
      precioTotal: 0,
      descuento: 0,
      metodoPago: null,

      // Setear rifa actual
      setRifaActual: (rifa) => set({ rifaActual: rifa }),

      // Seleccionar boleto individual
      seleccionarBoleto: (numero) => {
        const state = get();
        
        // Validar si está disponible
        if (state.boletosOcupados.includes(numero)) {
          return;
        }
        
        // Validar si ya está seleccionado
        if (state.boletosSeleccionados.includes(numero)) {
          return;
        }
        
        // Validar máximo por persona
        if (state.rifaActual && 
            state.boletosSeleccionados.length >= state.rifaActual.boletos.maxPorPersona) {
          return;
        }
        
        set((state) => ({
          boletosSeleccionados: [...state.boletosSeleccionados, numero].sort((a, b) => a - b),
        }));
        
        // Recalcular total
        get().calcularTotal();
      },

      // Deseleccionar boleto
      deseleccionarBoleto: (numero) => {
        set((state) => ({
          boletosSeleccionados: state.boletosSeleccionados.filter(n => n !== numero),
        }));
        
        get().calcularTotal();
      },

      // Toggle boleto (seleccionar/deseleccionar)
      toggleBoleto: (numero) => {
        const state = get();
        
        if (state.boletosSeleccionados.includes(numero)) {
          state.deseleccionarBoleto(numero);
        } else {
          state.seleccionarBoleto(numero);
        }
      },

      // Limpiar selección
      limpiarSeleccion: () => {
        set({
          boletosSeleccionados: [],
          precioTotal: 0,
        });
      },

      // Selección rápida predefinida
      seleccionRapida: (cantidad) => {
        const state = get();
        
        if (!state.rifaActual) return;
        
        // Validar cantidad máxima
        const maxPermitido = Math.min(cantidad, state.rifaActual.boletos.maxPorPersona);
        
        // Generar números aleatorios disponibles
        const disponibles: number[] = [];
        for (let i = 1; i <= state.rifaActual.boletos.total; i++) {
          if (!state.boletosOcupados.includes(i)) {
            disponibles.push(i);
          }
        }
        
        // Mezclar y tomar la cantidad necesaria
        const mezclados = disponibles.sort(() => Math.random() - 0.5);
        const seleccionados = mezclados.slice(0, maxPermitido);
        
        set({
          boletosSeleccionados: seleccionados.sort((a, b) => a - b),
        });
        
        get().calcularTotal();
      },

      // Seleccionar rango de boletos
      seleccionarRango: (inicio, fin) => {
        const state = get();
        
        if (!state.rifaActual) return;
        
        const nuevosSeleccionados: number[] = [];
        
        for (let i = inicio; i <= fin; i++) {
          if (!state.boletosOcupados.includes(i) && 
              !state.boletosSeleccionados.includes(i)) {
            nuevosSeleccionados.push(i);
          }
        }
        
        // Verificar límite
        const totalSeleccionados = state.boletosSeleccionados.length + nuevosSeleccionados.length;
        
        if (totalSeleccionados <= state.rifaActual.boletos.maxPorPersona) {
          set((state) => ({
            boletosSeleccionados: [...state.boletosSeleccionados, ...nuevosSeleccionados]
              .sort((a, b) => a - b),
          }));
          
          get().calcularTotal();
        }
      },

      // Seleccionar números aleatorios
      seleccionarAleatorios: (cantidad) => {
        const state = get();
        
        if (!state.rifaActual) return;
        
        // Limpiar selección actual
        state.limpiarSeleccion();
        
        // Usar selección rápida
        state.seleccionRapida(cantidad);
      },

      // Establecer método de pago
      setMetodoPago: (metodo) => {
        set({ metodoPago: metodo });
        get().calcularTotal();
      },

      // Aplicar descuento
      aplicarDescuento: (porcentaje) => {
        set({ descuento: porcentaje });
        get().calcularTotal();
      },

      // Calcular precio total
      calcularTotal: () => {
        const state = get();
        
        if (!state.rifaActual) {
          set({ precioTotal: 0 });
          return;
        }
        
        const cantidad = state.boletosSeleccionados.length;
        const subtotal = cantidad * state.rifaActual.boletos.precio;
        
        // Aplicar descuentos por cantidad
        let descuentoAplicado = state.descuento;
        
        if (cantidad >= 50) {
          descuentoAplicado = Math.max(descuentoAplicado, 0.20); // 20% descuento
        } else if (cantidad >= 20) {
          descuentoAplicado = Math.max(descuentoAplicado, 0.15); // 15% descuento
        } else if (cantidad >= 10) {
          descuentoAplicado = Math.max(descuentoAplicado, 0.10); // 10% descuento
        } else if (cantidad >= 5) {
          descuentoAplicado = Math.max(descuentoAplicado, 0.05); // 5% descuento
        }
        
        const montoDescuento = subtotal * descuentoAplicado;
        const total = subtotal - montoDescuento;
        
        set({
          descuento: descuentoAplicado,
          precioTotal: total,
        });
      },

      // Establecer boletos ocupados
      setBoletosOcupados: (boletos) => {
        set({ boletosOcupados: boletos });
      },

      // Verificar si un boleto está disponible
      estaDisponible: (numero) => {
        const state = get();
        return !state.boletosOcupados.includes(numero);
      },

      // Verificar si un boleto está seleccionado
      estaSeleccionado: (numero) => {
        const state = get();
        return state.boletosSeleccionados.includes(numero);
      },

      // Obtener resumen de la selección
      obtenerResumen: () => {
        const state = get();
        
        if (!state.rifaActual) {
          return {
            cantidad: 0,
            subtotal: 0,
            descuento: 0,
            total: 0,
            boletos: [],
          };
        }
        
        const cantidad = state.boletosSeleccionados.length;
        const subtotal = cantidad * state.rifaActual.boletos.precio;
        const montoDescuento = subtotal * state.descuento;
        const total = subtotal - montoDescuento;
        
        return {
          cantidad,
          subtotal,
          descuento: montoDescuento,
          total,
          boletos: state.boletosSeleccionados,
        };
      },

      // Resetear todo el estado
      resetearTodo: () => {
        set({
          rifaActual: null,
          boletosSeleccionados: [],
          boletosOcupados: [],
          precioTotal: 0,
          descuento: 0,
          metodoPago: null,
        });
      },
    }),
    {
      name: 'raffle-storage',
      partialize: (state) => ({
        boletosSeleccionados: state.boletosSeleccionados,
        metodoPago: state.metodoPago,
      }),
    }
  )
);