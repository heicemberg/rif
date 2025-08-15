import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Tipos para los diferentes webhooks
interface PaymentWebhook {
  event: string;
  timestamp: string;
  signature: string;
  data: {
    orderId: string;
    paymentId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    paymentMethod: string;
    metadata?: Record<string, any>;
  };
}

interface BinanceWebhook {
  bizType: string;
  bizId: string;
  bizStatus: string;
  data: {
    orderCode: string;
    transactionTime: number;
    totalFee: string;
    currency: string;
    openUserId: string;
  };
}

interface OxxoWebhook {
  id: string;
  type: 'charge.paid' | 'charge.pending' | 'charge.expired';
  created_at: number;
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      payment_method: {
        type: string;
        reference: string;
        barcode: string;
      };
      status: string;
      metadata: Record<string, any>;
    };
  };
}

interface BankTransferWebhook {
  transaction_id: string;
  account_number: string;
  reference: string;
  amount: number;
  timestamp: string;
  bank: 'azteca' | 'bancoppel';
  status: 'confirmed' | 'pending' | 'rejected';
}

// Configuración de webhooks por proveedor
const WEBHOOK_CONFIGS = {
  binance: {
    secret: process.env.BINANCE_WEBHOOK_SECRET || 'binance-secret-key',
    verifySignature: true
  },
  oxxo: {
    secret: process.env.OXXO_WEBHOOK_SECRET || 'oxxo-secret-key',
    verifySignature: true
  },
  azteca: {
    secret: process.env.AZTECA_WEBHOOK_SECRET || 'azteca-secret-key',
    verifySignature: false
  },
  bancoppel: {
    secret: process.env.BANCOPPEL_WEBHOOK_SECRET || 'bancoppel-secret-key',
    verifySignature: false
  }
};

// Base de datos simulada (en producción usar una real)
const paymentDatabase = new Map<string, any>();
const webhookLogs = new Map<string, any[]>();

// Funciones de utilidad
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  const expectedSignature = crypto
    .createHmac(algorithm, secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function logWebhookEvent(provider: string, event: any) {
  const logs = webhookLogs.get(provider) || [];
  logs.push({
    timestamp: new Date().toISOString(),
    event
  });
  webhookLogs.set(provider, logs.slice(-100)); // Mantener últimos 100 eventos
}

async function updatePaymentStatus(
  orderId: string,
  status: string,
  paymentDetails: any
) {
  // Actualizar en base de datos
  const payment = paymentDatabase.get(orderId) || {};
  payment.status = status;
  payment.lastUpdate = new Date().toISOString();
  payment.details = { ...payment.details, ...paymentDetails };
  paymentDatabase.set(orderId, payment);

  // Enviar notificaciones
  await sendNotifications(orderId, status, payment);
  
  return payment;
}

async function sendNotifications(orderId: string, status: string, payment: any) {
  const notifications = [];

  // Notificación por email
  if (payment.email) {
    notifications.push(
      sendEmail(payment.email, status, orderId)
    );
  }

  // Notificación por WhatsApp
  if (payment.phone) {
    notifications.push(
      sendWhatsApp(payment.phone, status, orderId)
    );
  }

  // Notificación push (si está habilitada)
  if (payment.pushToken) {
    notifications.push(
      sendPushNotification(payment.pushToken, status, orderId)
    );
  }

  await Promise.all(notifications);
}

async function sendEmail(email: string, status: string, orderId: string) {
  // Implementar envío de email
  console.log(`Email enviado a ${email}: Orden ${orderId} - Estado: ${status}`);
  return true;
}

async function sendWhatsApp(phone: string, status: string, orderId: string) {
  // Implementar envío de WhatsApp
  const message = getStatusMessage(status, orderId);
  console.log(`WhatsApp enviado a ${phone}: ${message}`);
  return true;
}

async function sendPushNotification(token: string, status: string, orderId: string) {
  // Implementar notificación push
  console.log(`Push notification enviada: ${status}`);
  return true;
}

function getStatusMessage(status: string, orderId: string): string {
  const messages: Record<string, string> = {
    pending: `Tu pago para la orden #${orderId} está pendiente de confirmación.`,
    processing: `Estamos procesando tu pago para la orden #${orderId}.`,
    completed: `¡Excelente! Tu pago para la orden #${orderId} ha sido confirmado. Tus boletos están asegurados.`,
    failed: `Lo sentimos, el pago para la orden #${orderId} no pudo ser procesado. Por favor, intenta nuevamente.`,
    cancelled: `El pago para la orden #${orderId} ha sido cancelado.`
  };
  
  return messages[status] || `Estado de pago actualizado: ${status}`;
}

// Manejadores específicos por proveedor
async function handleBinanceWebhook(data: BinanceWebhook) {
  const orderId = data.data.orderCode;
  const status = data.bizStatus === 'PAY_SUCCESS' ? 'completed' : 'processing';
  
  return await updatePaymentStatus(orderId, status, {
    provider: 'binance',
    transactionId: data.bizId,
    amount: parseFloat(data.data.totalFee),
    currency: data.data.currency,
    timestamp: new Date(data.data.transactionTime).toISOString()
  });
}

async function handleOxxoWebhook(data: OxxoWebhook) {
  const orderId = data.data.object.metadata?.orderId || data.data.object.id;
  const statusMap: Record<string, string> = {
    'charge.paid': 'completed',
    'charge.pending': 'pending',
    'charge.expired': 'cancelled'
  };
  
  const status = statusMap[data.type] || 'processing';
  
  return await updatePaymentStatus(orderId, status, {
    provider: 'oxxo',
    transactionId: data.id,
    amount: data.data.object.amount / 100, // Convertir de centavos
    currency: data.data.object.currency,
    reference: data.data.object.payment_method.reference,
    barcode: data.data.object.payment_method.barcode,
    timestamp: new Date(data.created_at * 1000).toISOString()
  });
}

async function handleBankTransferWebhook(data: BankTransferWebhook) {
  const orderId = data.reference.replace('RIFA-', '');
  const statusMap: Record<string, string> = {
    confirmed: 'completed',
    pending: 'processing',
    rejected: 'failed'
  };
  
  const status = statusMap[data.status] || 'processing';
  
  return await updatePaymentStatus(orderId, status, {
    provider: data.bank,
    transactionId: data.transaction_id,
    amount: data.amount,
    accountNumber: data.account_number,
    reference: data.reference,
    timestamp: data.timestamp
  });
}

// Rutas principales
export async function POST(request: NextRequest) {
  try {
    const provider = request.headers.get('x-webhook-provider') || 
                    request.nextUrl.searchParams.get('provider');
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not specified' },
        { status: 400 }
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';
    
    // Verificar firma si es necesario
    const config = WEBHOOK_CONFIGS[provider as keyof typeof WEBHOOK_CONFIGS];
    if (config?.verifySignature && signature) {
      const isValid = verifyWebhookSignature(
        rawBody,
        signature,
        config.secret
      );
      
      if (!isValid) {
        console.error(`Invalid signature for ${provider} webhook`);
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const data = JSON.parse(rawBody);
    logWebhookEvent(provider, data);

    let result;
    
    // Procesar según el proveedor
    switch (provider) {
      case 'binance':
        result = await handleBinanceWebhook(data as BinanceWebhook);
        break;
      
      case 'oxxo':
        result = await handleOxxoWebhook(data as OxxoWebhook);
        break;
      
      case 'azteca':
      case 'bancoppel':
        result = await handleBankTransferWebhook(data as BankTransferWebhook);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Unknown provider' },
          { status: 400 }
        );
    }

    // Responder con éxito
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      orderId: result.orderId,
      status: result.status
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint para verificar estado de pago
export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get('orderId');
    const provider = request.nextUrl.searchParams.get('provider');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Buscar en base de datos
    const payment = paymentDatabase.get(orderId);
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Si se especifica proveedor, obtener logs
    let logs = null;
    if (provider) {
      logs = webhookLogs.get(provider)?.filter(
        log => log.event?.data?.orderId === orderId ||
               log.event?.data?.orderCode === orderId ||
               log.event?.reference?.includes(orderId)
      );
    }

    return NextResponse.json({
      success: true,
      payment,
      logs: logs || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint para simular webhooks (solo desarrollo)
export async function PUT(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const { provider, orderId, status } = await request.json();
    
    // Simular webhook según proveedor
    const mockData = {
      binance: {
        bizType: 'PAY',
        bizId: `BINANCE_${Date.now()}`,
        bizStatus: status === 'completed' ? 'PAY_SUCCESS' : 'PAY_PROCESSING',
        data: {
          orderCode: orderId,
          transactionTime: Date.now(),
          totalFee: '100.00',
          currency: 'MXN',
          openUserId: 'user123'
        }
      },
      oxxo: {
        id: `OXXO_${Date.now()}`,
        type: status === 'completed' ? 'charge.paid' : 'charge.pending',
        created_at: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: orderId,
            amount: 10000,
            currency: 'MXN',
            payment_method: {
              type: 'oxxo',
              reference: `OXX${Date.now()}`,
              barcode: '1234567890123'
            },
            status,
            metadata: { orderId }
          }
        }
      }
    };

    const data = mockData[provider as keyof typeof mockData];
    
    if (!data) {
      return NextResponse.json(
        { error: 'Invalid provider for simulation' },
        { status: 400 }
      );
    }

    // Procesar webhook simulado
    let result;
    if (provider === 'binance') {
      result = await handleBinanceWebhook(data as any);
    } else if (provider === 'oxxo') {
      result = await handleOxxoWebhook(data as any);
    }

    return NextResponse.json({
      success: true,
      message: 'Simulated webhook processed',
      result
    });

  } catch (error) {
    console.error('Simulation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Simulation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint para limpiar datos (solo desarrollo)
export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  paymentDatabase.clear();
  webhookLogs.clear();

  return NextResponse.json({
    success: true,
    message: 'All data cleared'
  });
}