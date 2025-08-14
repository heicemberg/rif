// src/types/purchase.ts
export type PaymentMethod = 'BINANCE' | 'OXXO' | 'AZTECA' | 'BANCOPPEL';
export type PaymentStatus = 'pending' | 'processing' | 'verified' | 'completed' | 'failed' | 'refunded';
export type ProofStatus = 'pending' | 'uploaded' | 'reviewing' | 'approved' | 'rejected';

export interface Customer {
  // Información básica
  id?: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  
  // Para Binance
  binanceUser?: string;
  binanceWallet?: string;
  cryptoCurrency?: 'USDT' | 'BUSD' | 'BTC' | 'ETH';
  network?: 'BSC' | 'TRC20' | 'ERC20';
  transactionId?: string;
  
  // Para OXXO
  oxxoReference?: string;
  oxxoReceiptNumber?: string;
  
  // Para Banco Azteca
  aztecaReference?: string;
  aztecaAccountNumber?: string;
  aztecaBranch?: string;
  
  // Para BanCoppel
  bancoppelReference?: string;
  bancoppelAccountNumber?: string;
  
  // Comprobante
  proof?: {
    url: string;
    uploadedAt: Date;
    type: 'image' | 'pdf';
    size: number;
    status: ProofStatus;
    reviewNotes?: string;
  };
}

export interface PurchaseOrder {
  // Identificación
  id: string;
  orderNumber: string;
  raffleId: string;
  
  // Boletos
  tickets: {
    numbers: number[];
    quantity: number;
    pricePerTicket: number;
  };
  
  // Cliente
  customer: Customer;
  
  // Pricing
  pricing: {
    subtotal: number;
    discountPercentage: number;
    discountAmount: number;
    total: number;
    currency: string;
  };
  
  // Pago
  payment: PaymentDetails;
  paymentStatus: PaymentStatus;
  
  // Fechas
  dates: {
    created: Date;
    expires: Date;
    paid?: Date;
    verified?: Date;
    completed?: Date;
  };
  
  // Estado
  status: 'draft' | 'pending_payment' | 'pending_verification' | 'completed' | 'cancelled' | 'expired';
  
  // Metadata
  metadata: {
    ip?: string;
    userAgent?: string;
    source?: string;
    notes?: string;
  };
}

export interface Cart {
  raffleId: string;
  tickets: number[];
  quantity: number;
  pricing: {
    unitPrice: number;
    subtotal: number;
    discount: number;
    total: number;
  };
  expiresAt?: Date;
}

export interface CheckoutSession {
  id: string;
  cart: Cart;
  customer?: Partial<Customer>;
  paymentMethod?: PaymentMethod;
  step: 'tickets' | 'information' | 'payment' | 'confirmation';
  startedAt: Date;
  lastActivity: Date;
  completed: boolean;
}

export interface PaymentInstruction {
  method: PaymentMethod;
  logo: string; // ruta a la imagen
  instructions: string[];
  
  // Datos específicos por método
  binanceInfo?: {
    userName: string;
    walletAddress: string;
    network: string;
    currency: string;
    note: string;
  };
  
  oxxoInfo?: {
    reference: string;
    barcode?: string;
    expiresAt: Date;
  };
  
  aztecaInfo?: {
    accountNumber: string;
    accountName: string;
    clabe: string;
    reference: string;
  };
  
  bancoppelInfo?: {
    accountNumber: string;
    accountName: string;
    clabe: string;
    reference: string;
  };
  
  amount: number;
  currency: string;
  reference: string;
  expiresAt: Date;
}

export interface BulkDiscount {
  minQuantity: number;
  maxQuantity?: number;
  discountPercentage: number;
  label: string;
  highlighted?: boolean;
}

export const BULK_DISCOUNTS: BulkDiscount[] = [
  { minQuantity: 3, maxQuantity: 4, discountPercentage: 5, label: '5% OFF - 3 boletos' },
  { minQuantity: 5, maxQuantity: 9, discountPercentage: 10, label: '10% OFF - 5 boletos' },
  { minQuantity: 10, maxQuantity: 19, discountPercentage: 15, label: '15% OFF - 10 boletos', highlighted: true },
  { minQuantity: 20, maxQuantity: 49, discountPercentage: 20, label: '20% OFF - 20 boletos', highlighted: true },
  { minQuantity: 50, discountPercentage: 25, label: '25% OFF - MÁXIMO DESCUENTO', highlighted: true },
];