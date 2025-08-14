// lib/api-client.ts
import { API_URLS } from './api-urls';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
}

export interface CreateOrderRequest {
  raffleId: string;
  tickets: number[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
}

export interface N8nWebhookPayload {
  event: string;
  orderId: string;
  data: any;
}

export interface TicketAvailabilityResponse {
  available: number[];
  reserved: number[];
  sold: number[];
}

export interface PaymentVerificationResponse {
  verified: boolean;
  status: string;
  transactionId?: string;
}

export interface UploadProofResponse {
  fileUrl: string;
  fileId: string;
  uploadedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  raffleId: string;
  orderNumber: string;
  tickets: number[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  payment: {
    method: string;
    amount: number;
    currency: string;
    status: string;
    proofUrl?: string;
  };
  status: 'draft' | 'pending_payment' | 'pending_verification' | 'completed' | 'cancelled' | 'expired';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface Raffle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  rules: string[];
  prize: {
    name: string;
    description: string;
    images: string[];
    value: number;
    currency: string;
    specifications?: Record<string, string>;
  };
  tickets: {
    total: number;
    available: number;
    sold: number;
    price: number;
    currency: string;
    maxPerPerson: number;
    minPerPurchase: number;
  };
  dates: {
    start: Date;
    end: Date;
    drawing: Date;
  };
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  featured: boolean;
  metadata?: {
    views?: number;
    participants?: number;
    lastPurchase?: Date;
    currentViewers?: number;
  };
}

export interface RaffleStats {
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  progress: number;
  estimatedEndDate: Date;
  recentPurchases: Array<{
    name: string;
    location: string;
    tickets: number;
    timeAgo: string;
    verified: boolean;
  }>;
}

class ApiClient {
  private baseUrl: string;
  private webhookUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    this.webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'http://localhost:3001/webhook';
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
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
            message: data.message || 'Request failed',
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
          message: 'Connection error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============ RAFFLES ============

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

  // ============ ORDERS ============

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

  // ============ PAYMENTS ============

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
            message: data.message || 'Upload failed',
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
          message: 'Failed to upload proof',
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
            message: 'Webhook send failed',
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        message: 'Webhook sent successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WEBHOOK_CONNECTION_ERROR',
          message: 'Could not connect to webhook',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============ UTILITIES ============

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Simulate API for development
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

  // Mock data for development
  getMockRaffle(): Raffle {
    return {
      id: 'raffle-001',
      slug: 'grand-prize-2024',
      title: 'Grand Prize Draw 2024',
      subtitle: 'Win Amazing Prizes',
      description: 'Participate in the biggest raffle of the year',
      rules: [
        'Must be 18 years or older',
        'One winner takes all',
        'Live draw broadcast',
        'Immediate prize delivery',
      ],
      prize: {
        name: 'Grand Prize Package',
        description: 'Latest model vehicle + PlayStation 5 + $3,000 USD',
        images: ['/prizes/grand-prize.png'],
        value: 50000,
        currency: 'USD',
        specifications: {
          vehicle: '2024 Model',
          console: 'PlayStation 5 with 2 controllers',
          cash: '$3,000 USD',
        },
      },
      tickets: {
        total: 10000,
        available: 2457,
        sold: 7543,
        price: 10,
        currency: 'USD',
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
          name: 'John D.',
          location: 'New York',
          tickets: 5,
          timeAgo: '2 min ago',
          verified: true,
        },
        {
          name: 'Sarah M.',
          location: 'Los Angeles',
          tickets: 3,
          timeAgo: '5 min ago',
          verified: true,
        },
        {
          name: 'Mike R.',
          location: 'Chicago',
          tickets: 10,
          timeAgo: '8 min ago',
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