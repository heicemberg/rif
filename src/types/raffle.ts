// src/types/raffle.ts
export interface Raffle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  rules: string[];
  
  // Premio
  prize: {
    name: string;
    description: string;
    images: string[];
    value: number;
    currency: string;
    specifications?: Record<string, string>;
  };
  
  // Boletos
  tickets: {
    total: number;
    available: number;
    sold: number;
    price: number;
    currency: string;
    maxPerPerson: number;
    minPerPurchase: number;
  };
  
  // Fechas
  dates: {
    start: Date;
    end: Date;
    drawing: Date;
  };
  
  // Estado
  status: 'upcoming' | 'active' | 'ending_soon' | 'ended' | 'drawn';
  featured: boolean;
  
  // Metadata
  metadata: {
    views: number;
    participants: number;
    lastPurchase?: Date;
    currentViewers?: number;
  };
}

export interface Ticket {
  number: number;
  status: 'available' | 'reserved' | 'sold';
  reservedUntil?: Date;
  owner?: string;
}

export interface TicketSelection {
  raffleId: string;
  tickets: number[];
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface RaffleStats {
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  progress: number;
  estimatedEndDate: Date;
  recentPurchases: RecentPurchase[];
}

export interface RecentPurchase {
  name: string;
  location: string;
  tickets: number;
  timeAgo: string;
  verified: boolean;
}

export interface Winner {
  raffleId: string;
  name: string;
  location: string;
  ticketNumber: number;
  prize: string;
  date: Date;
  testimonial?: string;
  image?: string;
}