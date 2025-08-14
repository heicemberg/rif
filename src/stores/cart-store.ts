// stores/cart-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DatosCliente {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  whatsapp?: string;
}

interface DatosPago {
  metodo: 'OXXO' | 'SPEI' | 'TARJETA' | 'PAYPAL' | 'MERCADOPAGO';
  referencia?: string;
  comprobante?: File;
  comprobanteUrl?: string;
}

interface OrdenCompra {
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

interface CartStore {
  // Estado del carrito
  orden: OrdenCompra | null;
  ordenes: OrdenCompra[];
  datosCliente: DatosCliente | null;
  datosPago: DatosPago | null;
  
  // Gestión de datos del cliente
  setDatosCliente: (datos: DatosCliente) => void;
  actualizarDatosCliente: (datos: Partial<DatosCliente>) => void;
  limpiarDatosCliente: () => void;
  
  // Gestión de datos de pago
  setDatosPago: (datos: DatosPago) => void;
  actualizarDatosPago: (datos: Partial<DatosPago>) => void;
  limpiarDatosPago: () => void;
  
  // Gestión de órdenes
  crearOrden: (orden: OrdenCompra) => void;
  actualizarOrden: (id: string, datos: Partial<OrdenCompra>) => void;
  actualizarEstadoOrden: (id: string, estado: OrdenCompra['estado']) => void;
  obtenerOrden: (id: string) => OrdenCompra | undefined;
  obtenerOrdenesActivas: () => OrdenCompra[];
  
  // Carrito
  limpiarCarrito: () => void;
  
  // Persistencia
  guardarDatosTemporales: () => void;
  recuperarDatosTemporales: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      orden: null,
      ordenes: [],
      datosCliente: null,
      datosPago: null,

      // Gestión de datos del cliente
      setDatosCliente: (datos) => {
        set({ datosCliente: datos });
        get().guardarDatosTemporales();
      },

      actualizarDatosCliente: (datos) => {
        const clienteActual = get().datosCliente;
        if (clienteActual) {
          set({
            datosCliente: {
              ...clienteActual,
              ...datos,
            },
          });
          get().guardarDatosTemporales();
        }
      },

      limpiarDatosCliente: () => {
        set({ datosCliente: null });
      },

      // Gestión de datos de pago
      setDatosPago: (datos) => {
        set({ datosPago: datos });
      },

      actualizarDatosPago: (datos) => {
        const pagoActual = get().datosPago;
        if (pagoActual) {
          set({
            datosPago: {
              ...pagoActual,
              ...datos,
            },
          });
        }
      },

      limpiarDatosPago: () => {
        set({ datosPago: null });
      },

      // Gestión de órdenes
      crearOrden: (orden) => {
        set((state) => ({
          orden,
          ordenes: [...state.ordenes, orden],
        }));
      },

      actualizarOrden: (id, datos) => {
        set((state) => {
          const ordenesActualizadas = state.ordenes.map((o) =>
            o.id === id ? { ...o, ...datos } : o
          );
          
          const ordenActual = state.orden?.id === id 
            ? { ...state.orden, ...datos }
            : state.orden;
          
          return {
            orden: ordenActual,
            ordenes: ordenesActualizadas,
          };
        });
      },

      actualizarEstadoOrden: (id, estado) => {
        get().actualizarOrden(id, { estado });
      },

      obtenerOrden: (id) => {
        return get().ordenes.find((o) => o.id === id);
      },

      obtenerOrdenesActivas: () => {
        return get().ordenes.filter(
          (o) => o.estado === 'pendiente' || o.estado === 'procesando'
        );
      },

      // Limpiar carrito
      limpiarCarrito: () => {
        set({
          orden: null,
          datosPago: null,
        });
      },

      // Persistencia temporal
      guardarDatosTemporales: () => {
        const { datosCliente } = get();
        if (datosCliente) {
          localStorage.setItem('datos_cliente_temp', JSON.stringify(datosCliente));
        }
      },

      recuperarDatosTemporales: () => {
        const datosGuardados = localStorage.getItem('datos_cliente_temp');
        if (datosGuardados) {
          try {
            const datos = JSON.parse(datosGuardados);
            set({ datosCliente: datos });
          } catch (error) {
            console.error('Error al recuperar datos temporales:', error);
          }
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        ordenes: state.ordenes,
        datosCliente: state.datosCliente,
      }),
    }
  )
);