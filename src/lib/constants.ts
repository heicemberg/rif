// src/lib/constants.ts

// Configuración del sitio
export const SITE_CONFIG = {
  name: 'RifAzteca',
  tagline: 'La Rifa Más Confiable de México',
  description: 'Participa en las mejores rifas de México con premios increíbles. Sorteos transparentes y pagos seguros garantizados.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rifazteca.com',
  
  // Imágenes
  images: {
    logo: '/logos/rifazteca-logo.png',
    ogImage: '/images/og-image.jpg',
    defaultPrize: '/premios/premio-rifa.png',
  },
  
  // Contacto
  contact: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '525512345678',
    whatsappFormatted: '+52 55 1234 5678',
    whatsappMessage: 'Hola, quiero información sobre la rifa',
    email: 'contacto@rifazteca.com',
    phone: '55-1234-5678',
    supportHours: 'Lun-Vie 9:00-18:00, Sáb 10:00-14:00',
  },
  
  // Redes sociales
  social: {
    facebook: 'https://facebook.com/rifazteca',
    instagram: 'https://instagram.com/rifazteca',
    tiktok: 'https://tiktok.com/@rifazteca',
  },
};

// Premio actual
export const CURRENT_PRIZE = {
  title: 'Silverado z71 + PS5 + $3,000 USD',
  subtitle: 'Un ganador se lleva TODO',
  image: '/premios/premio-rifa.png',
  value: 850000, // MXN
  details: [
    'Camioneta último modelo',
    'PlayStation 5 con 2 controles',
    '$3,000 USD en efectivo',
    'Seguro gratis por 1 año',
  ],
};

// Configuración de rifas
export const RAFFLE_CONFIG = {
  // Límites
  limits: {
    minTicketsPerPurchase: 2,
    maxTicketsPerPerson: 100,
    maxTicketsPerTransaction: 50,
    reservationDurationMinutes: 10,
  },
  
  // Precios (MXN)
  pricing: {
    defaultTicketPrice: 150,
    currency: 'MXN',
    currencySymbol: '$',
  },
  
  // Descuentos por volumen
  bulkDiscounts: [
    { min: 3, max: 4, discount: 0.05, label: '5% OFF', color: 'blue' },
    { min: 5, max: 9, discount: 0.10, label: '10% OFF', color: 'green' },
    { min: 10, max: 19, discount: 0.15, label: '15% OFF', color: 'purple', popular: true },
    { min: 20, max: 49, discount: 0.20, label: '20% OFF', color: 'orange', popular: true },
    { min: 50, max: null, discount: 0.25, label: '25% OFF', color: 'red', bestValue: true },
  ],
  
  // Estados de urgencia
  urgencyLevels: [
    { threshold: 0.9, message: '¡Últimos boletos!', color: 'red', pulse: true },
    { threshold: 0.75, message: '¡Se agotan rápido!', color: 'orange', pulse: true },
    { threshold: 0.5, message: 'Más del 50% vendido', color: 'yellow', pulse: false },
    { threshold: 0, message: 'Disponibles', color: 'green', pulse: false },
  ],
  
  // Números sugeridos
  quickPickOptions: [2, 3, 5, 10, 20, 50],
};

// Métodos de pago con imágenes locales
export const PAYMENT_METHODS = [
  {
    id: 'BINANCE',
    name: 'Binance',
    description: 'Pago con criptomonedas USDT',
    logo: '/logos/binance.svg',
    color: 'yellow',
    recommended: true,
    fee: 0,
    processingTime: '5 minutos',
    
    // Datos de cuenta para Binance
    accountInfo: {
      userName: process.env.NEXT_PUBLIC_BINANCE_USER || 'RifAztecaMX',
      wallet: process.env.NEXT_PUBLIC_BINANCE_WALLET || 'TRC20_WALLET_ADDRESS',
      network: 'TRC20 (Tron)',
      currency: 'USDT',
    },
    
    instructions: [
      'Abre tu app de Binance',
      'Envía USDT a la wallet indicada',
      'Usa la red TRC20 para comisiones bajas',
      'Toma captura del comprobante',
      'Súbela aquí para verificación inmediata',
    ],
  },
  {
    id: 'OXXO',
    name: 'OXXO',
    description: 'Pago en efectivo',
    logo: '/logos/oxxo.png',
    color: 'red',
    recommended: false,
    fee: 10,
    processingTime: '24 horas',
    
    instructions: [
      'Anota tu número de referencia',
      'Acude a cualquier tienda OXXO',
      'Realiza el pago en caja',
      'Guarda tu ticket',
      'Súbelo aquí como comprobante',
    ],
  },
  {
    id: 'AZTECA',
    name: 'Banco Azteca',
    description: 'Transferencia o depósito',
    logo: '/logos/bancoazteca.png',
    color: 'green',
    recommended: false,
    fee: 0,
    processingTime: '1-2 horas',
    
    accountInfo: {
      bank: 'Banco Azteca',
      accountNumber: process.env.NEXT_PUBLIC_AZTECA_ACCOUNT || '1234567890',
      clabe: process.env.NEXT_PUBLIC_AZTECA_CLABE || '127000000000000000',
      accountName: 'RifAzteca S.A. de C.V.',
    },
    
    instructions: [
      'Realiza transferencia a la cuenta Azteca',
      'Usa tu número de orden como referencia',
      'Guarda el comprobante',
      'Súbelo para verificación rápida',
    ],
  },
  {
    id: 'BANCOPPEL',
    name: 'BanCoppel',
    description: 'Transferencia o depósito',
    logo: '/logos/bancoppel.png',
    color: 'yellow',
    recommended: false,
    fee: 0,
    processingTime: '1-2 horas',
    
    accountInfo: {
      bank: 'BanCoppel',
      accountNumber: process.env.NEXT_PUBLIC_BANCOPPEL_ACCOUNT || '0987654321',
      clabe: process.env.NEXT_PUBLIC_BANCOPPEL_CLABE || '137000000000000000',
      accountName: 'RifAzteca S.A. de C.V.',
    },
    
    instructions: [
      'Realiza transferencia a BanCoppel',
      'Incluye número de orden en concepto',
      'Captura pantalla del comprobante',
      'Súbela para verificación',
    ],
  },
];

// Mensajes motivacionales para conversión
export const CONVERSION_MESSAGES = {
  urgency: [
    '⚡ Quedan menos de 100 boletos',
    '🔥 73 personas están viendo esta rifa',
    '⏰ La rifa termina pronto',
    '🎯 Últimas horas para participar',
  ],
  
  trust: [
    '✅ Más de 10,000 ganadores felices',
    '🛡️ Pagos 100% seguros',
    '📺 Sorteos transmitidos en vivo',
    '🏆 Premiación inmediata garantizada',
  ],
  
  social: [
    'Juan M. de CDMX acaba de comprar 5 boletos',
    'María G. de Guadalajara ganó el mes pasado',
    'Carlos R. de Monterrey compró 10 boletos',
    'Ana L. de Puebla está participando',
  ],
};

// Colores del tema
export const COLORS = {
  // Principales
  primary: '#1E40AF', // Azul confianza
  secondary: '#F59E0B', // Dorado premium
  accent: '#10B981', // Verde éxito
  
  // Estados
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Neutros
  dark: '#111827',
  gray: '#6B7280',
  light: '#F3F4F6',
  white: '#FFFFFF',
  
  // Métodos de pago
  binance: '#F3BA2F',
  oxxo: '#CE1126',
  azteca: '#006847',
  bancoppel: '#FFD700',
};

// Configuración de animaciones
export const ANIMATIONS = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  easing: {
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

// SEO
export const SEO_CONFIG = {
  titleTemplate: '%s | RifAzteca',
  defaultTitle: 'RifAzteca - Gana Increíbles Premios',
  description: SITE_CONFIG.description,
  openGraph: {
    images: [{ url: CURRENT_PRIZE.image }],
  },
};