// src/lib/validators.ts

// Validar datos del cliente
export function validateCustomer(data: any): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Nombre
  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres';
  } else if (data.name.length > 100) {
    errors.name = 'El nombre es muy largo';
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.name)) {
    errors.name = 'El nombre solo puede contener letras';
  }

  // Email
  if (!data.email) {
    errors.email = 'El email es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email inválido';
  } else if (data.email.length > 100) {
    errors.email = 'El email es muy largo';
  }

  // Teléfono
  if (!data.phone) {
    errors.phone = 'El teléfono es requerido';
  } else {
    const cleaned = data.phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      errors.phone = 'El teléfono debe tener 10 dígitos';
    } else if (!/^[2-9]\d{9}$/.test(cleaned)) {
      errors.phone = 'Teléfono inválido';
    }
  }

  // WhatsApp (opcional pero si existe debe ser válido)
  if (data.whatsapp) {
    const cleanedWa = data.whatsapp.replace(/\D/g, '');
    if (cleanedWa.length !== 10 && cleanedWa.length !== 12) {
      errors.whatsapp = 'WhatsApp debe tener 10 dígitos';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validar selección de boletos
export function validateTicketSelection(data: {
  tickets: number[];
  minTickets: number;
  maxTickets: number;
  availableTickets: number[];
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Cantidad mínima
  if (data.tickets.length < data.minTickets) {
    errors.push(`Debes seleccionar al menos ${data.minTickets} boleto${data.minTickets !== 1 ? 's' : ''}`);
  }

  // Cantidad máxima
  if (data.tickets.length > data.maxTickets) {
    errors.push(`No puedes seleccionar más de ${data.maxTickets} boletos`);
  }

  // Verificar disponibilidad
  const unavailable = data.tickets.filter(t => !data.availableTickets.includes(t));
  if (unavailable.length > 0) {
    errors.push(`Los boletos ${unavailable.join(', ')} no están disponibles`);
  }

  // Verificar duplicados
  const uniqueTickets = new Set(data.tickets);
  if (uniqueTickets.size !== data.tickets.length) {
    errors.push('Hay boletos duplicados en tu selección');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validar archivo de comprobante
export function validatePaymentProof(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Tamaño máximo 5MB
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo debe ser menor a 5MB',
    };
  }

  // Tipos permitidos
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Solo se permiten imágenes JPG, PNG o WebP',
    };
  }

  // Validar que realmente sea una imagen
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'El archivo debe ser una imagen',
    };
  }

  return { isValid: true };
}

// Validar método de pago
export function validatePaymentMethod(method: string): boolean {
  const validMethods = ['BINANCE', 'OXXO', 'AZTECA', 'BANCOPPEL'];
  return validMethods.includes(method);
}

// Validar orden completa
export function validateOrder(data: any): {
  isValid: boolean;
  errors: Record<string, any>;
} {
  const errors: Record<string, any> = {};

  // Validar cliente
  const customerValidation = validateCustomer(data.customer);
  if (!customerValidation.isValid) {
    errors.customer = customerValidation.errors;
  }

  // Validar boletos
  if (!data.tickets || !Array.isArray(data.tickets) || data.tickets.length === 0) {
    errors.tickets = 'Debes seleccionar al menos un boleto';
  }

  // Validar método de pago
  if (!validatePaymentMethod(data.paymentMethod)) {
    errors.paymentMethod = 'Método de pago inválido';
  }

  // Validar términos y condiciones
  if (!data.acceptedTerms) {
    errors.terms = 'Debes aceptar los términos y condiciones';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validar datos de Binance
export function validateBinanceData(data: {
  transactionId?: string;
  walletAddress?: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.transactionId) {
    errors.transactionId = 'ID de transacción requerido';
  } else if (data.transactionId.length < 10) {
    errors.transactionId = 'ID de transacción inválido';
  }

  // Validar formato de wallet (TRC20)
  if (data.walletAddress && !data.walletAddress.startsWith('T')) {
    errors.walletAddress = 'La wallet debe ser una dirección TRC20 válida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validar referencia OXXO
export function validateOxxoReference(reference: string): boolean {
  // OXXO usa referencias de 14 dígitos generalmente
  const cleaned = reference.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 20;
}

// Validar CLABE bancaria
export function validateCLABE(clabe: string): boolean {
  const cleaned = clabe.replace(/\D/g, '');
  if (cleaned.length !== 18) return false;
  
  // Algoritmo de validación CLABE (simplificado)
  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
  let sum = 0;
  
  for (let i = 0; i < 17; i++) {
    const digit = parseInt(cleaned[i]);
    const product = digit * weights[i];
    sum += product % 10;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(cleaned[17]);
}

// Validar número de cuenta bancaria
export function validateBankAccount(account: string, bank: 'AZTECA' | 'BANCOPPEL'): boolean {
  const cleaned = account.replace(/\D/g, '');
  
  switch (bank) {
    case 'AZTECA':
      // Banco Azteca usa cuentas de 10-16 dígitos
      return cleaned.length >= 10 && cleaned.length <= 16;
    
    case 'BANCOPPEL':
      // BanCoppel usa cuentas de 10-11 dígitos
      return cleaned.length >= 10 && cleaned.length <= 11;
    
    default:
      return false;
  }
}

// Validar formulario de contacto
export function validateContactForm(data: {
  name: string;
  email: string;
  message: string;
}): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'El nombre es muy corto';
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email inválido';
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'El mensaje debe tener al menos 10 caracteres';
  } else if (data.message.length > 1000) {
    errors.message = 'El mensaje es muy largo (máximo 1000 caracteres)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Validar edad (mayor de 18)
export function validateAge(birthDate: Date | string): boolean {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
}

// Sanitizar entrada de texto
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '');
}

// Validar URL segura
export function isSecureUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
 // Continuación de lib/validators.ts

   return parsed.protocol === 'https:';
 } catch {
   return false;
 }
}

// Validar código postal mexicano
export function validateZipCode(zipCode: string): boolean {
 const cleaned = zipCode.replace(/\D/g, '');
 return cleaned.length === 5 && /^[0-9]{5}$/.test(cleaned);
}

// Validar RFC mexicano (opcional para facturas)
export function validateRFC(rfc: string): boolean {
 const pattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
 return pattern.test(rfc.toUpperCase());
}

// Validar sesión activa
export function validateSession(sessionData: {
 startedAt: Date;
 lastActivity: Date;
 maxInactivityMinutes?: number;
}): {
 isValid: boolean;
 reason?: string;
} {
 const now = new Date();
 const maxInactivity = sessionData.maxInactivityMinutes || 30;
 const inactivityMs = now.getTime() - new Date(sessionData.lastActivity).getTime();
 const inactivityMinutes = Math.floor(inactivityMs / 60000);

 if (inactivityMinutes > maxInactivity) {
   return {
     isValid: false,
     reason: 'Sesión expirada por inactividad',
   };
 }

 const sessionDurationMs = now.getTime() - new Date(sessionData.startedAt).getTime();
 const sessionHours = sessionDurationMs / (1000 * 60 * 60);

 if (sessionHours > 24) {
   return {
     isValid: false,
     reason: 'Sesión expirada',
   };
 }

 return { isValid: true };
}

// Validar cantidad de boletos para descuento
export function validateBulkPurchase(quantity: number): {
 isEligibleForDiscount: boolean;
 discountPercentage: number;
 nextTierQuantity?: number;
 nextTierDiscount?: number;
} {
 const discounts = [
   { min: 3, discount: 5 },
   { min: 5, discount: 10 },
   { min: 10, discount: 15 },
   { min: 20, discount: 20 },
   { min: 50, discount: 25 },
 ];

 const applicable = discounts.filter(d => quantity >= d.min);
 const current = applicable[applicable.length - 1];
 const next = discounts.find(d => d.min > quantity);

 if (!current) {
   return {
     isEligibleForDiscount: false,
     discountPercentage: 0,
     nextTierQuantity: discounts[0].min,
     nextTierDiscount: discounts[0].discount,
   };
 }

 return {
   isEligibleForDiscount: true,
   discountPercentage: current.discount,
   nextTierQuantity: next?.min,
   nextTierDiscount: next?.discount,
 };
}

// Validar horario de atención
export function isWithinBusinessHours(): boolean {
 const now = new Date();
 const day = now.getDay(); // 0 = Domingo
 const hour = now.getHours();

 // Lunes a Viernes: 9:00 - 18:00
 if (day >= 1 && day <= 5) {
   return hour >= 9 && hour < 18;
 }

 // Sábado: 10:00 - 14:00
 if (day === 6) {
   return hour >= 10 && hour < 14;
 }

 // Domingo cerrado
 return false;
}

// Validar disponibilidad de boletos
export function validateTicketAvailability(
 requested: number[],
 available: number[],
 reserved: number[]
): {
 isValid: boolean;
 unavailable: number[];
 alreadyReserved: number[];
} {
 const availableSet = new Set(available);
 const reservedSet = new Set(reserved);
 const unavailable: number[] = [];
 const alreadyReserved: number[] = [];

 for (const ticket of requested) {
   if (!availableSet.has(ticket)) {
     unavailable.push(ticket);
   }
   if (reservedSet.has(ticket)) {
     alreadyReserved.push(ticket);
   }
 }

 return {
   isValid: unavailable.length === 0 && alreadyReserved.length === 0,
   unavailable,
   alreadyReserved,
 };
}