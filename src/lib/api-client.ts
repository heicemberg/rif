// src/lib/api-client.ts
import { API_URLS } from './constants';
import type { 
  ApiResponse, 
  CreateOrderRequest,
  N8nWebhookPayload,
  TicketAvailabilityResponse,
  PaymentVerificationResponse,
  UploadProofResponse,
} from '@/types/api';
import type { PurchaseOrder } from '@/types/purchase';
import type { Raffle, RaffleStats } from '@/types/raffle';

class ApiClient {
  private baseUrl: string;
  private webhookUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = API_URLS.base;
    this.webhookUrl = API_URLS.webhook;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Método genérico para peticiones
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || 'Error en la petición',
            details: data.details,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============ RIFAS ============

  async getRaffles(): Promise<ApiResponse<Raffle[]>> {
    return this.request<Raffle[]>('/raffles');
  }

  async getRaffle(id: string): Promise<ApiResponse<Raffle>> {
    return this.request<Raffle>(`/raffles/${id}`);
  }

  async getRaffleStats(raffleId: string): Promise<ApiResponse<RaffleStats>> {
    return this.request<RaffleStats>(`/raffles/${raffleId}/stats`);
  }

  async getAvailableTickets(raffleId: string): Promise<ApiResponse<TicketAvailabilityResponse>> {
    return this.request<TicketAvailabilityResponse>(`/raffles/${raffleId}/tickets/available`);
  }

  async reserveTickets(
    raffleId: string,
    tickets: number[]
  ): Promise<ApiResponse<{ reservationId: string; expiresAt: Date }>> {
    return this.request(`/raffles/${raffleId}/tickets/reserve`, {
      method: 'POST',
      body: JSON.stringify({ tickets }),
    });
  }

  // ============ ÓRDENES ============

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<PurchaseOrder>> {
    return this.request<PurchaseOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrder(orderId: string): Promise<ApiResponse<PurchaseOrder>> {
    return this.request<PurchaseOrder>(`/orders/${orderId}`);
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<void>> {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  }

  // ============ PAGOS ============

  async uploadPaymentProof(
    orderId: string,
    file: File
  ): Promise<ApiResponse<UploadProofResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderId', orderId);

    try {
      const response = await fetch(`${this.baseUrl}/payments/upload-proof`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || 'UPLOAD_FAILED',
            message: data.message || 'Error al subir archivo',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Error al subir el comprobante',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async verifyPayment(orderId: string): Promise<ApiResponse<PaymentVerificationResponse>> {
    return this.request<PaymentVerificationResponse>(`/payments/${orderId}/verify`, {
      method: 'POST',
    });
  }

  // ============ WEBHOOK N8N ============

  async sendToN8n(payload: N8nWebhookPayload): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'WEBHOOK_ERROR',
            message: 'Error al enviar webhook',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        message: 'Webhook enviado correctamente',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WEBHOOK_CONNECTION_ERROR',
          message: 'No se pudo conectar con el webhook',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============ UTILIDADES ============

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Simular API para desarrollo
  async simulateApi<T>(data: T, delay: number = 1000): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data,
          timestamp: new Date().toISOString(),
        });
      }, delay);
    });
  }

  // Mock data para desarrollo
  getMockRaffle(): Raffle {
    return {
      id: 'raffle-001',
      slug: 'camioneta-ps5-3000usd',
      title: 'Camioneta + PS5 + $3,000 USD',
      subtitle: 'Un ganador se lleva TODO',
      description: 'Participa en la rifa más grande del año',
      rules: [
        'Debes ser mayor de 18 años',
        'Un ganador se lleva todo',
        'Sorteo transmitido en vivo',
        'Entrega inmediata del premio',
      ],
      prize: {
        name: 'Gran Premio',
        description: 'Camioneta último modelo + PlayStation 5 + $3,000 USD',
        images: ['/premios/premio-rifa.png'],
        value: 850000,
        currency: 'MXN',
        specifications: {
          vehiculo: 'Camioneta 2024',
          consola: 'PlayStation 5 con 2 controles',
          efectivo: '$3,000 USD',
        },
      },
      tickets: {
        total: 10000,
        available: 2457,
        sold: 7543,
        price: 150,
        currency: 'MXN',
        maxPerPerson: 100,
        minPerPurchase: 1,
      },
      dates: {
        start: new Date('2024-01-01'),
        end: new Date('2024-02-01'),
        drawing: new Date('2024-02-02'),
      },
      status: 'active',
      featured: true,
      metadata: {
        views: 45678,
        participants: 3421,
        lastPurchase: new Date(),
        currentViewers: 127,
      },
    };
  }

  getMockStats(): RaffleStats {
    return {
      totalTickets: 10000,
      soldTickets: 7543,
      availableTickets: 2457,
      progress: 75.43,
      estimatedEndDate: new Date('2024-02-01'),
      recentPurchases: [
        {
          name: 'Juan M.',
          location: 'CDMX',
          tickets: 5,
          timeAgo: 'hace 2 min',
          verified: true,
        },
        {
          name: 'María G.',
          location: 'Guadalajara',
          tickets: 3,
          timeAgo: 'hace 5 min',
          verified: true,
        },
        {
          name: 'Carlos R.',
          location: 'Monterrey',
          tickets: 10,
          timeAgo: 'hace 8 min',
          verified: true,
        },
      ],
    };
  }
}

// Singleton instance
const apiClient = new ApiClient();

export default apiClient;

// Export individual methods for convenience
export const {
  getRaffles,
  getRaffle,
  getRaffleStats,
  getAvailableTickets,
  reserveTickets,
  createOrder,
  getOrder,
  cancelOrder,
  uploadPaymentProof,
  verifyPayment,
  sendToN8n,
  checkHealth,
  simulateApi,
  getMockRaffle,
  getMockStats,
} = apiClient;