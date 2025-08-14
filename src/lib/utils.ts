// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RAFFLE_CONFIG } from './constants';

// Combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateo de moneda mexicana
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Formateo de USD
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Formateo de número de boleto (00001, 00002, etc)
export function formatTicketNumber(num: number): string {
  return num.toString().padStart(5, '0');
}

// Formateo de número con comas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-MX').format(num);
}

// Calcular descuento basado en cantidad
export function calculateDiscount(quantity: number, pricePerUnit: number): {
  percentage: number;
  amount: number;
  finalPrice: number;
  savedAmount: number;
  label: string;
  color: string;
  bestValue: boolean;
} {
  const discount = RAFFLE_CONFIG.bulkDiscounts.find(
    d => quantity >= d.min && (!d.max || quantity <= d.max)
  );

  const subtotal = quantity * pricePerUnit;

  if (!discount) {
    return {
      percentage: 0,
      amount: subtotal,
      finalPrice: subtotal,
      savedAmount: 0,
      label: '',
      color: '',
      bestValue: false,
    };
  }

  const discountAmount = subtotal * discount.discount;
  const finalPrice = subtotal - discountAmount;

  return {
    percentage: discount.discount * 100,
    amount: discountAmount,
    finalPrice,
    savedAmount: discountAmount,
    label: discount.label,
    color: discount.color,
    bestValue: discount.bestValue || false,
  };
}

// Generar números aleatorios para QuickPick
export function generateRandomNumbers(
  count: number,
  min: number = 1,
  max: number = 10000,
  exclude: number[] = []
): number[] {
  const numbers = new Set<number>();
  const excludeSet = new Set(exclude);
  
  // Validación
  const availableNumbers = max - min + 1 - excludeSet.size;
  if (count > availableNumbers) {
    throw new Error('No hay suficientes números disponibles');
  }

  while (numbers.size < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!excludeSet.has(num)) {
      numbers.add(num);
    }
  }

  return Array.from(numbers).sort((a, b) => a - b);
}

// Tiempo restante para countdown
export function timeUntil(targetDate: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  expired: boolean;
  percentage: number;
} {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Asumiendo 30 días de duración
  const totalDuration = target - startDate.getTime();
  const elapsed = now - startDate.getTime();
  const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  
  const difference = target - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      expired: true,
      percentage: 100,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    total: difference,
    expired: false,
    percentage,
  };
}

// Formatear tiempo relativo (hace X minutos)
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  
  return past.toLocaleDateString('es-MX', { 
    day: 'numeric',
    month: 'short' 
  });
}

// Validar email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validar teléfono mexicano
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 && /^[0-9]{10}$/.test(cleaned);
}

// Formatear teléfono mexicano
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

// Formatear para WhatsApp
export function formatWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('52')) {
    return cleaned;
  }
  return `52${cleaned}`;
}

// Generar URL de WhatsApp
export function getWhatsAppUrl(phone: string, message: string = ''): string {
  const formattedPhone = formatWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}${message ? `?text=${encodedMessage}` : ''}`;
}

// Generar ID único para órdenes
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `RA-${timestamp}-${random}`;
}

// Convertir imagen a base64
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Validar tamaño de archivo (max 5MB)
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
  return file.size <= maxSize;
}

// Validar tipo de archivo (solo imágenes)
export function validateFileType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

// Obtener nivel de urgencia según disponibilidad
export function getUrgencyLevel(soldPercentage: number): {
  message: string;
  color: string;
  pulse: boolean;
  icon: string;
} {
  const level = RAFFLE_CONFIG.urgencyLevels.find(
    l => soldPercentage >= l.threshold
  ) || RAFFLE_CONFIG.urgencyLevels[RAFFLE_CONFIG.urgencyLevels.length - 1];

  const icons = {
    red: '🔥',
    orange: '⚡',
    yellow: '⏰',
    green: '✅',
  };

  return {
    ...level,
    icon: icons[level.color as keyof typeof icons] || '📢',
  };
}

// Copiar al portapapeles
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para navegadores antiguos
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}
// Debounce función
export function debounce<T extends (...args: any[]) => any>(
 func: T,
 wait: number
): (...args: Parameters<T>) => void {
 let timeout: NodeJS.Timeout;
 return (...args: Parameters<T>) => {
   clearTimeout(timeout);
   timeout = setTimeout(() => func(...args), wait);
 };
}

// Throttle función
export function throttle<T extends (...args: any[]) => any>(
 func: T,
 limit: number
): (...args: Parameters<T>) => void {
 let inThrottle: boolean;
 return (...args: Parameters<T>) => {
   if (!inThrottle) {
     func(...args);
     inThrottle = true;
     setTimeout(() => inThrottle = false, limit);
   }
 };
}

// Obtener mensaje aleatorio de conversión
export function getRandomConversionMessage(type: 'urgency' | 'trust' | 'social'): string {
 const messages = {
   urgency: [
     '⚡ Solo quedan 87 boletos disponibles',
     '🔥 42 personas están viendo esta rifa ahora',
     '⏰ Faltan 3 días para el sorteo',
     '🎯 Últimas 24 horas de venta',
   ],
   trust: [
     '✅ 12,847 ganadores satisfechos',
     '🛡️ Pagos verificados y seguros',
     '📺 Sorteo en vivo por Facebook',
     '🏆 Entrega inmediata de premios',
   ],
   social: [
     'Miguel H. de Puebla compró 5 boletos',
     'Laura S. de CDMX acaba de participar',
     'Roberto M. ganó $50,000 el mes pasado',
     'Carmen G. de Monterrey compró 10 boletos',
   ],
 };

 const messageList = messages[type];
 return messageList[Math.floor(Math.random() * messageList.length)];
}

// Calcular probabilidad de ganar
export function calculateWinProbability(ticketCount: number, totalTickets: number): string {
 const probability = (ticketCount / totalTickets) * 100;
 return probability.toFixed(4);
}

// Formatear fecha para mostrar
export function formatDisplayDate(date: Date | string): string {
 return new Date(date).toLocaleDateString('es-MX', {
   weekday: 'long',
   year: 'numeric',
   month: 'long',
   day: 'numeric',
   hour: '2-digit',
   minute: '2-digit',
 });
}

// Obtener saludo según hora del día
export function getGreeting(): string {
 const hour = new Date().getHours();
 if (hour < 12) return 'Buenos días';
 if (hour < 19) return 'Buenas tardes';
 return 'Buenas noches';
}

// Validar CURP mexicana (opcional)
export function isValidCURP(curp: string): boolean {
 const pattern = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
 return pattern.test(curp.toUpperCase());
}

// Obtener dispositivo del usuario
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
 const userAgent = navigator.userAgent;
 if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
   if (/iPad|Tablet/i.test(userAgent)) {
     return 'tablet';
   }
   return 'mobile';
 }
 return 'desktop';
}

// Scroll suave a elemento
export function smoothScrollTo(elementId: string, offset: number = 0): void {
 const element = document.getElementById(elementId);
 if (element) {
   const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
   window.scrollTo({ top: y, behavior: 'smooth' });
 }
}

// Detectar si es Safari (para fixes específicos)
export function isSafari(): boolean {
 return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

// Obtener query params
export function getQueryParams(): Record<string, string> {
 const params = new URLSearchParams(window.location.search);
 const result: Record<string, string> = {};
 params.forEach((value, key) => {
   result[key] = value;
 });
 return result;
}

// Formatear bytes a tamaño legible
export function formatFileSize(bytes: number): string {
 if (bytes === 0) return '0 Bytes';
 const k = 1024;
 const sizes = ['Bytes', 'KB', 'MB', 'GB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Generar slug desde texto
export function generateSlug(text: string): string {
 return text
   .toLowerCase()
   .normalize('NFD')
   .replace(/[\u0300-\u036f]/g, '')
   .replace(/[^a-z0-9]+/g, '-')
   .replace(/^-+|-+$/g, '');
}

// Mezclar array (para testimonios aleatorios)
export function shuffleArray<T>(array: T[]): T[] {
 const newArray = [...array];
 for (let i = newArray.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
 }
 return newArray;
}