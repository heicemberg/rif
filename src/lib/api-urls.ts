// API Base URLs
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_VERSION = 'v1';

// API Endpoints
export const API_URLS = {
  // Base URL
  BASE: API_BASE_URL,
  
  // Auth Endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  
  // User Endpoints
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    PROFILE: `${API_BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`,
    UPLOAD_AVATAR: `${API_BASE_URL}/users/avatar`,
    DELETE_ACCOUNT: `${API_BASE_URL}/users/account`,
  },
  
  // Prize Endpoints
  PRIZES: {
    BASE: `${API_BASE_URL}/prizes`,
    LIST: `${API_BASE_URL}/prizes`,
    FEATURED: `${API_BASE_URL}/prizes/featured`,
    DETAILS: (id: string) => `${API_BASE_URL}/prizes/${id}`,
    CATEGORIES: `${API_BASE_URL}/prizes/categories`,
    SEARCH: `${API_BASE_URL}/prizes/search`,
  },
  
  // Entry Endpoints
  ENTRIES: {
    BASE: `${API_BASE_URL}/entries`,
    CREATE: `${API_BASE_URL}/entries`,
    MY_ENTRIES: `${API_BASE_URL}/entries/my-entries`,
    CHECK_ELIGIBILITY: `${API_BASE_URL}/entries/check-eligibility`,
    ENTRY_HISTORY: `${API_BASE_URL}/entries/history`,
  },
  
  // Draw Endpoints
  DRAWS: {
    BASE: `${API_BASE_URL}/draws`,
    ACTIVE: `${API_BASE_URL}/draws/active`,
    UPCOMING: `${API_BASE_URL}/draws/upcoming`,
    RESULTS: `${API_BASE_URL}/draws/results`,
    DETAILS: (id: string) => `${API_BASE_URL}/draws/${id}`,
    WINNERS: `${API_BASE_URL}/draws/winners`,
  },
  
  // Payment Endpoints
  PAYMENTS: {
    BASE: `${API_BASE_URL}/payments`,
    CREATE_INTENT: `${API_BASE_URL}/payments/create-intent`,
    CONFIRM: `${API_BASE_URL}/payments/confirm`,
    HISTORY: `${API_BASE_URL}/payments/history`,
    METHODS: `${API_BASE_URL}/payments/methods`,
    ADD_METHOD: `${API_BASE_URL}/payments/add-method`,
  },
  
  // Notification Endpoints
  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/notifications`,
    LIST: `${API_BASE_URL}/notifications`,
    MARK_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read`,
    PREFERENCES: `${API_BASE_URL}/notifications/preferences`,
  },
  
  // Stats Endpoints
  STATS: {
    DASHBOARD: `${API_BASE_URL}/stats/dashboard`,
    LIVE_ACTIVITY: `${API_BASE_URL}/stats/live-activity`,
    WINNERS_COUNT: `${API_BASE_URL}/stats/winners-count`,
    PRIZE_POOL: `${API_BASE_URL}/stats/prize-pool`,
  },
  
  // Support Endpoints
  SUPPORT: {
    TICKETS: `${API_BASE_URL}/support/tickets`,
    CREATE_TICKET: `${API_BASE_URL}/support/tickets`,
    TICKET_DETAILS: (id: string) => `${API_BASE_URL}/support/tickets/${id}`,
    FAQ: `${API_BASE_URL}/support/faq`,
  },
  
  // Admin Endpoints (if needed)
  ADMIN: {
    BASE: `${API_BASE_URL}/admin`,
    USERS: `${API_BASE_URL}/admin/users`,
    PRIZES: `${API_BASE_URL}/admin/prizes`,
    DRAWS: `${API_BASE_URL}/admin/draws`,
    ANALYTICS: `${API_BASE_URL}/admin/analytics`,
  },
};

// WebSocket URLs (if using real-time features)
export const WS_URLS = {
  BASE: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  LIVE_DRAW: '/live-draw',
  NOTIFICATIONS: '/notifications',
  ACTIVITY_FEED: '/activity-feed',
};

// External API URLs (third-party services)
export const EXTERNAL_APIS = {
  STRIPE: 'https://api.stripe.com/v1',
  PAYPAL: 'https://api.paypal.com/v2',
  SENDGRID: 'https://api.sendgrid.com/v3',
  ANALYTICS: 'https://www.google-analytics.com/collect',
};

// Helper function to build URL with query params
export function buildUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params) return baseUrl;
  
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
}

// Helper function to get full asset URL
export function getAssetUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_ASSET_URL || '';
  return `${baseUrl}${path}`;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Error Response Type
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export default API_URLS;