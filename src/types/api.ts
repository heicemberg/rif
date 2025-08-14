// src/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, any>;
  timestamp: string;
  signature?: string;
}

export type WebhookEvent = 
  | 'purchase.created'
  | 'purchase.completed'
  | 'purchase.failed'
  | 'payment.received'
  | 'payment.verified'
  | 'ticket.reserved'
  | 'ticket.purchased'
  | 'raffle.ending_soon'
  | 'raffle.ended';

// Request types
export interface CreateOrderRequest {
  raffleId: string;
  tickets: number[];
  customer: import('./purchase').Customer;
  paymentMethod: import('./purchase').PaymentMethod;
  metadata?: Record<string, any>;
}

export interface ReserveTicketsRequest {
  raffleId: string;
  tickets: number[];
  duration?: number; // minutos
}

// Response types
export interface ReserveTicketsResponse {
  success: boolean;
  reservedTickets: number[];
  reservationId: string;
  expiresAt: Date;
}

export interface UploadProofResponse {
  success: boolean;
  fileUrl: string;
  fileId: string;
  status: import('./purchase').ProofStatus;
}

export interface PaymentVerificationResponse {
  verified: boolean;
  status: import('./purchase').PaymentStatus;
  transactionId?: string;
  verifiedAt?: Date;
  notes?: string;
}

export interface TicketAvailabilityResponse {
  raffleId: string;
  totalTickets: number;
  availableTickets: number;
  soldTickets: number;
  reservedTickets: number;
  availableNumbers: number[];
  pricePerTicket: number;
  bulkDiscounts: import('./purchase').BulkDiscount[];
}

// Webhook para n8n
export interface N8nWebhookPayload {
  clientRequestId: string;
  source: 'web';
  event: string;
  
  raffle: {
    id: string;
    title: string;
    prizeImage: string;
  };
  
  customer: {
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
  };
  
  purchase: {
    orderNumber: string;
    ticketsCount: number;
    selectedTickets: number[];
    paymentMethod: 'BINANCE' | 'OXXO' | 'AZTECA' | 'BANCOPPEL';
    subtotal: number;
    discount: number;
    total: number;
    currency: string;
  };
  
  payment: {
    screenshotBase64?: string;
    reference?: string;
    proofUrl?: string;
    binanceUser?: string;
    binanceWallet?: string;
  };
  
  metadata: {
    timestamp: string;
    userAgent: string;
    ip?: string;
    url: string;
  };
}

// Analytics Events
export interface AnalyticsEvent {
  name: string;
  category: 'purchase' | 'navigation' | 'interaction' | 'conversion';
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

// Error codes
export const API_ERROR_CODES = {
  // General
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Raffle
  RAFFLE_NOT_FOUND: 'RAFFLE_NOT_FOUND',
  RAFFLE_ENDED: 'RAFFLE_ENDED',
  
  // Tickets
  TICKETS_NOT_AVAILABLE: 'TICKETS_NOT_AVAILABLE',
  TICKET_ALREADY_SOLD: 'TICKET_ALREADY_SOLD',
  MAX_TICKETS_EXCEEDED: 'MAX_TICKETS_EXCEEDED',
  RESERVATION_EXPIRED: 'RESERVATION_EXPIRED',
  
  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_PROOF: 'INVALID_PROOF',
  
  // Order
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_EXPIRED: 'ORDER_EXPIRED',
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];