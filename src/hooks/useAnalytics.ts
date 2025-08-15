import { useEffect, useCallback, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
  searchParams?: Record<string, string>;
  timestamp: number;
  duration?: number;
}

interface RaffleAnalyticsConfig {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  enableConsoleLog?: boolean;
  enableLocalStorage?: boolean;
  userId?: string;
  debug?: boolean;
}

interface UserMetrics {
  totalTimeSpent: number;
  pageViews: number;
  ticketsViewed: number;
  ticketsAddedToCart: number;
  purchasesCompleted: number;
  totalSpent: number;
  lastVisit: number;
  conversionRate: number;
}

// Analytics principal
const useAnalytics = (config: RaffleAnalyticsConfig = {}) => {
  const {
    googleAnalyticsId,
    facebookPixelId,
    enableConsoleLog = false,
    enableLocalStorage = true,
    userId,
    debug = false
  } = config;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    totalTimeSpent: 0,
    pageViews: 0,
    ticketsViewed: 0,
    ticketsAddedToCart: 0,
    purchasesCompleted: 0,
    totalSpent: 0,
    lastVisit: Date.now(),
    conversionRate: 0
  });

  const sessionId = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const pageStartTime = useRef<number>(Date.now());
  const eventsQueue = useRef<AnalyticsEvent[]>([]);

  // Inicializar analytics
  useEffect(() => {
    if (!isInitialized) {
      // Google Analytics
      if (googleAnalyticsId && typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(args);
        }
        gtag('js', new Date());
        gtag('config', googleAnalyticsId);
        
        (window as any).gtag = gtag;
      }

      // Facebook Pixel
      if (facebookPixelId && typeof window !== 'undefined') {
        (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        
        (window as any).fbq('init', facebookPixelId);
      }

      setIsInitialized(true);
    }
  }, [googleAnalyticsId, facebookPixelId, isInitialized]);

  // Track page view
  const trackPageView = useCallback((customPath?: string) => {
    const path = customPath || pathname;
    const duration = Date.now() - pageStartTime.current;

    const pageViewEvent: PageViewEvent = {
      path,
      title: document.title,
      referrer: document.referrer,
      searchParams: Object.fromEntries(searchParams.entries()),
      timestamp: Date.now(),
      duration
    };

    if (debug || enableConsoleLog) {
      console.log('📊 Page View:', pageViewEvent);
    }

    // Google Analytics
    if (googleAnalyticsId && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
        page_referrer: document.referrer
      });
    }

    // Facebook Pixel
    if (facebookPixelId && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }

    // Update metrics
    setUserMetrics(prev => ({
      ...prev,
      pageViews: prev.pageViews + 1,
      totalTimeSpent: prev.totalTimeSpent + duration
    }));

    // Store in localStorage
    if (enableLocalStorage) {
      const stored = localStorage.getItem('analytics_page_views') || '[]';
      const views = JSON.parse(stored);
      views.push(pageViewEvent);
      localStorage.setItem('analytics_page_views', JSON.stringify(views.slice(-50)));
    }

    pageStartTime.current = Date.now();
  }, [pathname, searchParams, googleAnalyticsId, facebookPixelId, enableConsoleLog, enableLocalStorage, debug]);

  // Track event genérico
  const trackEvent = useCallback((name: string, properties?: Record<string, any>) => {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
      userId,
      sessionId: sessionId.current
    };

    if (debug || enableConsoleLog) {
      console.log('📊 Event:', event);
    }

    // Google Analytics
    if (googleAnalyticsId && (window as any).gtag) {
      (window as any).gtag('event', name, properties);
    }

    // Facebook Pixel
    if (facebookPixelId && (window as any).fbq) {
      (window as any).fbq('track', name, properties);
    }

    // Queue event
    eventsQueue.current.push(event);

    // Store in localStorage
    if (enableLocalStorage) {
      const stored = localStorage.getItem('analytics_events') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      localStorage.setItem('analytics_events', JSON.stringify(events.slice(-100)));
    }
  }, [googleAnalyticsId, facebookPixelId, userId, enableConsoleLog, enableLocalStorage, debug]);

  // Eventos específicos de rifa
  const trackTicketView = useCallback((ticketNumber: string, price: number) => {
    trackEvent('view_ticket', {
      ticket_number: ticketNumber,
      price,
      currency: 'MXN'
    });

    setUserMetrics(prev => ({
      ...prev,
      ticketsViewed: prev.ticketsViewed + 1
    }));
  }, [trackEvent]);

  const trackAddToCart = useCallback((ticketNumber: string, price: number, quantity: number = 1) => {
    trackEvent('add_to_cart', {
      ticket_number: ticketNumber,
      price,
      quantity,
      total: price * quantity,
      currency: 'MXN'
    });

    setUserMetrics(prev => ({
      ...prev,
      ticketsAddedToCart: prev.ticketsAddedToCart + quantity
    }));

    // Facebook Pixel
    if (facebookPixelId && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_ids: [ticketNumber],
        content_type: 'raffle_ticket',
        value: price,
        currency: 'MXN'
      });
    }
  }, [trackEvent, facebookPixelId]);

  const trackRemoveFromCart = useCallback((ticketNumber: string, price: number) => {
    trackEvent('remove_from_cart', {
      ticket_number: ticketNumber,
      price,
      currency: 'MXN'
    });
  }, [trackEvent]);

  const trackBeginCheckout = useCallback((totalAmount: number, ticketCount: number) => {
    trackEvent('begin_checkout', {
      total_amount: totalAmount,
      ticket_count: ticketCount,
      currency: 'MXN'
    });

    // Facebook Pixel
    if (facebookPixelId && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        value: totalAmount,
        currency: 'MXN',
        num_items: ticketCount
      });
    }
  }, [trackEvent, facebookPixelId]);

  const trackPurchase = useCallback((
    orderId: string,
    totalAmount: number,
    ticketNumbers: string[],
    paymentMethod: string
  ) => {
    trackEvent('purchase', {
      order_id: orderId,
      total_amount: totalAmount,
      ticket_numbers: ticketNumbers,
      ticket_count: ticketNumbers.length,
      payment_method: paymentMethod,
      currency: 'MXN'
    });

    setUserMetrics(prev => {
      const newPurchases = prev.purchasesCompleted + 1;
      const newSpent = prev.totalSpent + totalAmount;
      const conversionRate = (newPurchases / Math.max(prev.ticketsViewed, 1)) * 100;

      return {
        ...prev,
        purchasesCompleted: newPurchases,
        totalSpent: newSpent,
        conversionRate
      };
    });

    // Google Analytics E-commerce
    if (googleAnalyticsId && (window as any).gtag) {
      (window as any).gtag('event', 'purchase', {
        transaction_id: orderId,
        value: totalAmount,
        currency: 'MXN',
        items: ticketNumbers.map(num => ({
          item_id: num,
          item_name: `Boleto ${num}`,
          item_category: 'raffle_ticket',
          price: totalAmount / ticketNumbers.length,
          quantity: 1
        }))
      });
    }

    // Facebook Pixel
    if (facebookPixelId && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', {
        value: totalAmount,
        currency: 'MXN',
        content_ids: ticketNumbers,
        content_type: 'raffle_ticket',
        num_items: ticketNumbers.length
      });
    }
  }, [trackEvent, googleAnalyticsId, facebookPixelId]);

  const trackShare = useCallback((platform: string, ticketNumber?: string) => {
    trackEvent('share', {
      platform,
      ticket_number: ticketNumber,
      url: window.location.href
    });
  }, [trackEvent]);

  const trackPaymentMethodSelected = useCallback((method: string) => {
    trackEvent('payment_method_selected', {
      method,
      timestamp: Date.now()
    });
  }, [trackEvent]);

  const trackError = useCallback((error: string, context?: Record<string, any>) => {
    trackEvent('error', {
      error_message: error,
      context,
      url: window.location.href,
      timestamp: Date.now()
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: query,
      results_count: resultsCount
    });

    // Google Analytics
    if (googleAnalyticsId && (window as any).gtag) {
      (window as any).gtag('event', 'search', {
        search_term: query
      });
    }
  }, [trackEvent, googleAnalyticsId]);

  const trackTimingEvent = useCallback((category: string, variable: string, duration: number) => {
    trackEvent('timing_complete', {
      timing_category: category,
      timing_variable: variable,
      timing_value: duration
    });

    // Google Analytics
    if (googleAnalyticsId && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name: variable,
        value: duration,
        event_category: category
      });
    }
  }, [trackEvent, googleAnalyticsId]);

  // Track automático de page views
  useEffect(() => {
    trackPageView();
  }, [pathname, trackPageView]);

  // Track tiempo en página al salir
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - pageStartTime.current;
      trackTimingEvent('engagement', 'time_on_page', timeSpent);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [trackTimingEvent]);

  // Guardar métricas al salir
  useEffect(() => {
    const handleUnload = () => {
      if (enableLocalStorage) {
        localStorage.setItem('user_metrics', JSON.stringify(userMetrics));
      }
    };

    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, [userMetrics, enableLocalStorage]);

  // Cargar métricas previas
  useEffect(() => {
    if (enableLocalStorage && typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_metrics');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUserMetrics(prev => ({
            ...prev,
            ...parsed,
            lastVisit: Date.now()
          }));
        } catch (error) {
          console.error('Error loading user metrics:', error);
        }
      }
    }
  }, [enableLocalStorage]);

  return {
    // Métodos de tracking
    trackEvent,
    trackPageView,
    trackTicketView,
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackPurchase,
    trackShare,
    trackPaymentMethodSelected,
    trackError,
    trackSearch,
    trackTimingEvent,
    
    // Datos
    userMetrics,
    sessionId: sessionId.current,
    isInitialized,
    
    // Utilidades
    getEvents: () => eventsQueue.current,
    clearEvents: () => { eventsQueue.current = []; }
  };
};

// Hook para A/B Testing
export const useABTest = (experimentName: string, variants: string[]) => {
  const [variant, setVariant] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Verificar si ya hay una variante asignada
    const storageKey = `ab_test_${experimentName}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      setVariant(stored);
      setIsLoading(false);
    } else {
      // Asignar variante aleatoria
      const randomIndex = Math.floor(Math.random() * variants.length);
      const selectedVariant = variants[randomIndex];
      
      setVariant(selectedVariant);
      localStorage.setItem(storageKey, selectedVariant);
      
      // Track exposición al experimento
      trackEvent('ab_test_exposure', {
        experiment: experimentName,
        variant: selectedVariant
      });
      
      setIsLoading(false);
    }
  }, [experimentName, variants, trackEvent]);

  const trackConversion = useCallback((conversionName: string, value?: number) => {
    trackEvent('ab_test_conversion', {
      experiment: experimentName,
      variant,
      conversion: conversionName,
      value
    });
  }, [experimentName, variant, trackEvent]);

  return {
    variant,
    isLoading,
    trackConversion,
    isVariant: (v: string) => variant === v
  };
};

// Hook para funnel tracking
export const useFunnelTracking = (funnelName: string) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { trackEvent } = useAnalytics();
  const startTime = useRef(Date.now());

  const trackStep = useCallback((stepNumber: number, stepName: string, data?: Record<string, any>) => {
    const duration = Date.now() - startTime.current;
    
    trackEvent('funnel_step', {
      funnel: funnelName,
      step_number: stepNumber,
      step_name: stepName,
      duration,
      ...data
    });

    setCurrentStep(stepNumber);
    setCompletedSteps(prev => [...new Set([...prev, stepNumber])]);
    startTime.current = Date.now();
  }, [funnelName, trackEvent]);

  const trackCompletion = useCallback((data?: Record<string, any>) => {
    const totalDuration = Date.now() - startTime.current;
    
    trackEvent('funnel_complete', {
      funnel: funnelName,
      total_steps: completedSteps.length,
      total_duration: totalDuration,
      ...data
    });
  }, [funnelName, completedSteps, trackEvent]);

  const trackAbandonment = useCallback((reason?: string) => {
    trackEvent('funnel_abandon', {
      funnel: funnelName,
      abandoned_at_step: currentStep,
      completed_steps: completedSteps,
      reason
    });
  }, [funnelName, currentStep, completedSteps, trackEvent]);

  return {
    currentStep,
    completedSteps,
    trackStep,
    trackCompletion,
    trackAbandonment,
    getProgress: () => (completedSteps.length / (currentStep + 1)) * 100
  };
};

// Declaración de tipos globales
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

export default useAnalytics;