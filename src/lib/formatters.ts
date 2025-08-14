// lib/formatters.ts

// Payment method interface
interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  logo: string;
  color: string;
  instructions: string[];
  accountInfo?: {
    userName?: string;
    network?: string;
    currency?: string;
    accountNumber?: string;
    clabe?: string;
  };
}

// Default payment methods
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'BINANCE',
    name: 'Binance Pay',
    description: 'USDT Transfer (TRC20)',
    logo: '/payment/binance.svg',
    color: 'yellow',
    instructions: [
      'Open your Binance app',
      'Go to Send/Receive',
      'Select USDT on TRC20 network',
      'Send to the provided address',
    ],
    accountInfo: {
      userName: 'RafflePayments',
      network: 'TRC20',
      currency: 'USDT',
    },
  },
  {
    id: 'OXXO',
    name: 'OXXO',
    description: 'Cash payment at store',
    logo: '/payment/oxxo.svg',
    color: 'red',
    instructions: [
      'Go to any OXXO store',
      'Provide the reference number',
      'Make the cash payment',
      'Keep your receipt',
    ],
  },
  {
    id: 'AZTECA',
    name: 'Banco Azteca',
    description: 'Bank transfer or deposit',
    logo: '/payment/azteca.svg',
    color: 'green',
    instructions: [
      'Log in to your banking app',
      'Add beneficiary with CLABE',
      'Make the transfer',
      'Save the receipt',
    ],
    accountInfo: {
      accountNumber: '1234567890',
      clabe: '127180001234567890',
    },
  },
  {
    id: 'BANCOPPEL',
    name: 'BanCoppel',
    description: 'Bank transfer or deposit',
    logo: '/payment/bancoppel.svg',
    color: 'blue',
    instructions: [
      'Access BanCoppel app or branch',
      'Use the account number provided',
      'Complete the transfer',
      'Download or photograph receipt',
    ],
    accountInfo: {
      accountNumber: '0987654321',
      clabe: '137180000987654321',
    },
  },
];

// Format payment information
export function formatPaymentInfo(method: string): {
  title: string;
  subtitle: string;
  logo: string;
  color: string;
  details: string[];
} {
  const payment = PAYMENT_METHODS.find(p => p.id === method);
  
  if (!payment) {
    return {
      title: 'Method not available',
      subtitle: '',
      logo: '',
      color: 'gray',
      details: [],
    };
  }

  switch (method) {
    case 'BINANCE':
      return {
        title: 'Binance Payment',
        subtitle: 'USDT Transfer (TRC20)',
        logo: payment.logo,
        color: payment.color,
        details: [
          `User: ${payment.accountInfo?.userName}`,
          `Network: ${payment.accountInfo?.network}`,
          `Currency: ${payment.accountInfo?.currency}`,
          'Fee: ~$1 USD',
        ],
      };

    case 'OXXO':
      return {
        title: 'OXXO Payment',
        subtitle: 'Cash at store',
        logo: payment.logo,
        color: payment.color,
        details: [
          'Valid for 48 hours',
          'Fee: $10 MXN',
          'Over 19,000 stores',
          'Instant receipt',
        ],
      };

    case 'AZTECA':
      return {
        title: 'Banco Azteca',
        subtitle: 'Transfer or deposit',
        logo: payment.logo,
        color: payment.color,
        details: [
          `Account: ${payment.accountInfo?.accountNumber}`,
          `CLABE: ${payment.accountInfo?.clabe}`,
          'No fees',
          'Verification in 1 hour',
        ],
      };

    case 'BANCOPPEL':
      return {
        title: 'BanCoppel',
        subtitle: 'Transfer or deposit',
        logo: payment.logo,
        color: payment.color,
        details: [
          `Account: ${payment.accountInfo?.accountNumber}`,
          `CLABE: ${payment.accountInfo?.clabe}`,
          'No fees',
          'Verification in 1 hour',
        ],
      };

    default:
      return {
        title: payment.name,
        subtitle: payment.description,
        logo: payment.logo,
        color: payment.color,
        details: payment.instructions,
      };
  }
}

// Format purchase summary
export function formatPurchaseSummary(data: {
  tickets: number[];
  pricePerTicket: number;
  discount: number;
  paymentMethod: string;
}): {
  lines: Array<{ label: string; value: string; highlight?: boolean }>;
  total: string;
} {
  const quantity = data.tickets.length;
  const subtotal = quantity * data.pricePerTicket;
  const discountAmount = subtotal * data.discount;
  const total = subtotal - discountAmount;

  const lines: Array<{ label: string; value: string; highlight?: boolean }> = [
    {
      label: `${quantity} ticket${quantity !== 1 ? 's' : ''}`,
      value: `${subtotal.toLocaleString()}`,
    },
  ];

  if (discountAmount > 0) {
    lines.push({
      label: `Discount (${(data.discount * 100).toFixed(0)}%)`,
      value: `-${discountAmount.toLocaleString()}`,
      highlight: true,
    });
  }

  // OXXO fee
  if (data.paymentMethod === 'OXXO') {
    lines.push({
      label: 'OXXO Fee',
      value: '+$10',
    });
  }

  return {
    lines,
    total: `${(total + (data.paymentMethod === 'OXXO' ? 10 : 0)).toLocaleString()}`,
  };
}

// Format ticket list
export function formatTicketList(tickets: number[], maxDisplay: number = 5): string {
  const sorted = [...tickets].sort((a, b) => a - b);
  const display = sorted.slice(0, maxDisplay).map(n => `#${n.toString().padStart(5, '0')}`);
  
  if (sorted.length > maxDisplay) {
    return `${display.join(', ')} and ${sorted.length - maxDisplay} more`;
  }
  
  return display.join(', ');
}

// Format WhatsApp message
export function formatWhatsAppMessage(data: {
  orderNumber: string;
  tickets: number[];
  total: number;
  paymentMethod: string;
}): string {
  const ticketNumbers = data.tickets
    .slice(0, 5)
    .map(n => n.toString().padStart(5, '0'))
    .join(', ');
  
  const more = data.tickets.length > 5 ? ` and ${data.tickets.length - 5} more` : '';
  
  return `🎫 *New Raffle Order*\n\n` +
    `📋 Order: ${data.orderNumber}\n` +
    `🎯 Tickets: ${ticketNumbers}${more}\n` +
    `💰 Total: $${data.total.toLocaleString()}\n` +
    `💳 Method: ${data.paymentMethod}\n\n` +
    `Please send your payment proof to verify your purchase.`;
}

// Format payment instructions
export function formatPaymentInstructions(method: string, amount: number, reference: string): string[] {
  const payment = PAYMENT_METHODS.find(p => p.id === method);
  if (!payment) return [];

  const formatted = [...payment.instructions];
  
  // Customize with specific data
  switch (method) {
    case 'BINANCE':
      formatted.unshift(`Amount: ${(amount / 20).toFixed(2)} USDT`);
      formatted.push(`Reference: ${reference}`);
      break;
      
    case 'OXXO':
      formatted.unshift(`Total amount: $${(amount + 10).toLocaleString()}`);
      formatted.push(`Reference: ${reference}`);
      break;
      
    case 'AZTECA':
    case 'BANCOPPEL':
      formatted.unshift(`Amount: $${amount.toLocaleString()}`);
      formatted.push(`Reference: ${reference}`);
      break;
  }
  
  return formatted;
}

// Format order status
export function formatOrderStatus(status: string): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  const statuses: Record<string, any> = {
    draft: {
      label: 'Draft',
      color: 'gray',
      icon: '📝',
      description: 'Order being created',
    },
    pending_payment: {
      label: 'Awaiting payment',
      color: 'yellow',
      icon: '⏳',
      description: 'Waiting for your payment proof',
    },
    pending_verification: {
      label: 'Verifying',
      color: 'blue',
      icon: '🔍',
      description: 'Verifying your payment',
    },
    completed: {
      label: 'Completed',
      color: 'green',
      icon: '✅',
      description: 'Tickets confirmed!',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'red',
      icon: '❌',
      description: 'Order cancelled',
    },
    expired: {
      label: 'Expired',
      color: 'gray',
      icon: '⏰',
      description: 'Payment time expired',
    },
  };

  return statuses[status] || statuses.draft;
}

// Format raffle statistics
export function formatRaffleStats(data: {
  total: number;
  sold: number;
  available: number;
}): {
  percentage: number;
  percentageText: string;
  availableText: string;
  soldText: string;
  progressColor: string;
  urgencyMessage?: string;
} {
  const percentage = (data.sold / data.total) * 100;
  
  let progressColor = 'bg-green-500';
  let urgencyMessage;
  
  if (percentage >= 90) {
    progressColor = 'bg-red-500';
    urgencyMessage = 'Last tickets available!';
  } else if (percentage >= 75) {
    progressColor = 'bg-orange-500';
    urgencyMessage = 'Selling out fast!';
  } else if (percentage >= 50) {
    progressColor = 'bg-yellow-500';
    urgencyMessage = 'Over half sold';
  }

  return {
    percentage,
    percentageText: `${percentage.toFixed(1)}%`,
    availableText: `${data.available.toLocaleString()} available`,
    soldText: `${data.sold.toLocaleString()} sold`,
    progressColor,
    urgencyMessage,
  };
}

// Format countdown time
export function formatCountdownTime(time: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}): {
  display: string;
  units: Array<{ value: string; label: string }>;
  urgency: 'low' | 'medium' | 'high' | 'critical';
} {
  const units = [
    { value: time.days.toString().padStart(2, '0'), label: 'Days' },
    { value: time.hours.toString().padStart(2, '0'), label: 'Hours' },
    { value: time.minutes.toString().padStart(2, '0'), label: 'Min' },
    { value: time.seconds.toString().padStart(2, '0'), label: 'Sec' },
  ];

  let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (time.days === 0 && time.hours < 1) {
    urgency = 'critical';
  } else if (time.days === 0 && time.hours < 12) {
    urgency = 'high';
  } else if (time.days < 3) {
    urgency = 'medium';
  }

  const display = `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`;

  return { display, units, urgency };
}

// Format testimonial
export function formatTestimonial(data: {
  name: string;
  location: string;
  prize: string;
  date: Date;
  amount?: number;
}): {
  displayName: string;
  locationText: string;
  prizeText: string;
  dateText: string;
  initials: string;
} {
  // Partially hide name for privacy
  const firstName = data.name.split(' ')[0];
  const lastName = data.name.split(' ')[1] || '';
  const displayName = `${firstName} ${lastName.charAt(0)}.`;
  
  const initials = `${firstName.charAt(0)}${lastName.charAt(0) || ''}`.toUpperCase();

  return {
    displayName,
    locationText: data.location,
    prizeText: data.amount ? `Won ${formatCurrency(data.amount)}` : data.prize,
    dateText: formatRelativeTime(data.date),
    initials,
  };
}

// Format error messages
export function formatErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    NETWORK_ERROR: 'Connection error. Check your internet.',
    INVALID_DATA: 'Invalid information. Review the entered data.',
    TICKETS_UNAVAILABLE: 'Selected tickets are no longer available.',
    PAYMENT_FAILED: 'Payment could not be processed.',
    SESSION_EXPIRED: 'Your session has expired. Reload the page.',
    FILE_TOO_LARGE: 'File is too large. Maximum 5MB.',
    INVALID_FILE_TYPE: 'Invalid file type. Only JPG, PNG or WebP images.',
    ORDER_NOT_FOUND: 'Order not found.',
    UNKNOWN: 'Something went wrong. Try again.',
  };

  return messages[code] || messages.UNKNOWN;
}

// Local helpers
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  
  return date.toLocaleDateString();
}