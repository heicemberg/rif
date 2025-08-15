import { useState, useEffect, useCallback, useRef } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  syncData?: boolean;
  ttl?: number; // Time to live in milliseconds
  encrypt?: boolean;
  onError?: (error: Error) => void;
}

interface StorageValue<T> {
  data: T;
  timestamp: number;
  version?: string;
  ttl?: number;
}

// Simple encryption for sensitive data (use a proper library in production)
const simpleEncrypt = (text: string): string => {
  return btoa(encodeURIComponent(text));
};

const simpleDecrypt = (encrypted: string): string => {
  try {
    return decodeURIComponent(atob(encrypted));
  } catch {
    return encrypted;
  }
};

const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: SetValue<T>) => void, () => void, () => void, boolean] => {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncData = true,
    ttl,
    encrypt = false,
    onError = console.error
  } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      
      if (!item) {
        return initialValue;
      }

      const decryptedItem = encrypt ? simpleDecrypt(item) : item;
      const parsed: StorageValue<T> = deserializer(decryptedItem);

      // Check TTL
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.data;
    } catch (error) {
      onError(error as Error);
      return initialValue;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  // Set value in localStorage
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      setIsLoading(true);
      
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        const storageValue: StorageValue<T> = {
          data: valueToStore,
          timestamp: Date.now(),
          version: '1.0',
          ttl
        };

        const serialized = serializer(storageValue);
        const finalValue = encrypt ? simpleEncrypt(serialized) : serialized;
        
        window.localStorage.setItem(key, finalValue);

        // Dispatch custom event for cross-tab synchronization
        if (syncData) {
          window.dispatchEvent(new CustomEvent('local-storage', {
            detail: { key, value: valueToStore }
          }));
        }
      }
    } catch (error) {
      onError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, storedValue, serializer, ttl, encrypt, syncData, onError]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        if (syncData) {
          window.dispatchEvent(new CustomEvent('local-storage', {
            detail: { key, value: null }
          }));
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [key, initialValue, syncData, onError]);

  // Clear all localStorage
  const clearAll = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        setStoredValue(initialValue);
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [initialValue, onError]);

  // Sync between tabs
  useEffect(() => {
    if (!syncData || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue && isMountedRef.current) {
        try {
          const decryptedValue = encrypt ? simpleDecrypt(e.newValue) : e.newValue;
          const parsed: StorageValue<T> = deserializer(decryptedValue);
          
          if (!parsed.ttl || Date.now() - parsed.timestamp <= parsed.ttl) {
            setStoredValue(parsed.data);
          }
        } catch (error) {
          onError(error as Error);
        }
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail.key === key && isMountedRef.current) {
        setStoredValue(e.detail.value || initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleCustomEvent as EventListener);
    };
  }, [key, initialValue, deserializer, encrypt, syncData, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return [storedValue, setValue, removeValue, clearAll, isLoading];
};

// Hook especializado para carrito de rifa
export const useRaffleCart = () => {
  interface CartItem {
    id: string;
    ticketNumber: string;
    price: number;
    type: 'standard' | 'premium' | 'vip';
    addedAt: number;
  }

  interface Cart {
    items: CartItem[];
    total: number;
    quantity: number;
    lastUpdated: number;
  }

  const [cart, setCart, clearCart] = useLocalStorage<Cart>('raffle-cart', {
    items: [],
    total: 0,
    quantity: 0,
    lastUpdated: Date.now()
  }, {
    ttl: 24 * 60 * 60 * 1000, // 24 horas
    syncData: true
  });

  const addItem = useCallback((item: Omit<CartItem, 'addedAt'>) => {
    setCart(prevCart => {
      const exists = prevCart.items.some(i => i.ticketNumber === item.ticketNumber);
      
      if (exists) {
        return prevCart;
      }

      const newItem: CartItem = {
        ...item,
        addedAt: Date.now()
      };

      const newItems = [...prevCart.items, newItem];
      const newTotal = newItems.reduce((sum, i) => sum + i.price, 0);

      return {
        items: newItems,
        total: newTotal,
        quantity: newItems.length,
        lastUpdated: Date.now()
      };
    });
  }, [setCart]);

  const removeItem = useCallback((ticketNumber: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(i => i.ticketNumber !== ticketNumber);
      const newTotal = newItems.reduce((sum, i) => sum + i.price, 0);

      return {
        items: newItems,
        total: newTotal,
        quantity: newItems.length,
        lastUpdated: Date.now()
      };
    });
  }, [setCart]);

  const updateQuantity = useCallback((ticketNumber: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(ticketNumber);
      return;
    }

    setCart(prevCart => {
      const item = prevCart.items.find(i => i.ticketNumber === ticketNumber);
      if (!item) return prevCart;

      // Para boletos de rifa, generalmente no se puede cambiar cantidad del mismo número
      // pero se puede implementar lógica para múltiples boletos
      return prevCart;
    });
  }, [setCart, removeItem]);

  const getItemCount = useCallback((): number => {
    return cart.items.length;
  }, [cart]);

  const getTotalPrice = useCallback((): number => {
    return cart.total;
  }, [cart]);

  const isInCart = useCallback((ticketNumber: string): boolean => {
    return cart.items.some(i => i.ticketNumber === ticketNumber);
  }, [cart]);

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalPrice,
    isInCart
  };
};

// Hook para preferencias de usuario
export const useUserPreferences = () => {
  interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: 'es' | 'en';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      whatsapp: boolean;
    };
    paymentMethod: string;
    displayMode: 'grid' | 'list';
    soundEnabled: boolean;
  }

  const defaultPreferences: UserPreferences = {
    theme: 'light',
    language: 'es',
    notifications: {
      email: true,
      sms: false,
      push: true,
      whatsapp: true
    },
    paymentMethod: '',
    displayMode: 'grid',
    soundEnabled: true
  };

  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'user-preferences',
    defaultPreferences,
    {
      syncData: true,
      encrypt: false
    }
  );

  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setPreferences]);

  const updateNotification = useCallback((
    type: keyof UserPreferences['notifications'],
    enabled: boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: enabled
      }
    }));
  }, [setPreferences]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    updateNotification,
    resetPreferences
  };
};

// Hook para historial de compras
export const usePurchaseHistory = () => {
  interface Purchase {
    id: string;
    orderId: string;
    tickets: string[];
    amount: number;
    paymentMethod: string;
    status: 'pending' | 'completed' | 'failed';
    date: number;
  }

  const [history, setHistory, clearHistory] = useLocalStorage<Purchase[]>(
    'purchase-history',
    [],
    {
      ttl: 30 * 24 * 60 * 60 * 1000, // 30 días
      encrypt: true,
      syncData: true
    }
  );

  const addPurchase = useCallback((purchase: Omit<Purchase, 'date'>) => {
    setHistory(prev => [
      {
        ...purchase,
        date: Date.now()
      },
      ...prev
    ].slice(0, 50)); // Mantener solo las últimas 50 compras
  }, [setHistory]);

  const updatePurchaseStatus = useCallback((
    orderId: string,
    status: Purchase['status']
  ) => {
    setHistory(prev => prev.map(p => 
      p.orderId === orderId ? { ...p, status } : p
    ));
  }, [setHistory]);

  const getPurchaseById = useCallback((orderId: string): Purchase | undefined => {
    return history.find(p => p.orderId === orderId);
  }, [history]);

  const getRecentPurchases = useCallback((limit: number = 5): Purchase[] => {
    return history.slice(0, limit);
  }, [history]);

  const getTotalSpent = useCallback((): number => {
    return history
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [history]);

  return {
    history,
    addPurchase,
    updatePurchaseStatus,
    getPurchaseById,
    getRecentPurchases,
    getTotalSpent,
    clearHistory
  };
};

// Hook para sesión temporal
export const useSessionStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: SetValue<T>) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.error(error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;