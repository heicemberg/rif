// /src/hooks/useN8nPurchase.ts
// Hook de cliente para enviar compras a un webhook de n8n.
// - Sin dependencias externas
// - 100% tipado (TS estricto)
// - Incluye validaciones básicas, timeout, reintento y control de estado
//
// Requiere definir en tu entorno (o pasar por opciones):
//   NEXT_PUBLIC_N8N_PURCHASE_WEBHOOK_URL="https://tu-n8n.com/webhook/xxxx"
// Uso habitual:
//   import { useN8nPurchase } from "@/hooks/useN8nPurchase";
//   const { sendPurchase, isLoading, isSuccess, isError, errorMessage, reset } = useN8nPurchase();

"use client";

import { useCallback, useRef, useState } from "react";

export type PaymentMethod = "BINANCE" | "OXXO" | "AZTECA" | "BANCOPPEL";

export type PurchasePayload = {
  ticketsCount: number;              // cantidad final
  selectedTickets: number[];         // números exactos (si vienen del grid)
  paymentMethod: PaymentMethod;      // 'BINANCE'|'OXXO'|'AZTECA'|'BANCOPPEL'
  total: number;                     // USD
  name: string;
  email: string;
  whatsapp: string;
  screenshotBase64: string;          // data:image/...;base64,...
  timestamp: string;                 // new Date().toISOString()
  userAgent: string;                 // navigator.userAgent
};

type UseN8nPurchaseOptions = {
  webhookUrl?: string;               // por defecto usa process.env.NEXT_PUBLIC_N8N_PURCHASE_WEBHOOK_URL
  timeoutMs?: number;                // por defecto: 15000 ms
  retries?: number;                  // por defecto: 1 (sin reintentos extra)
  headers?: Record<string, string>;  // cabeceras adicionales
};

export type UseN8nPurchaseReturn = {
  sendPurchase: (payload: PurchasePayload) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  errorMessage: string | null;
  reset: () => void;
};

function getEnvWebhook(): string | undefined {
  // Next.js solo expone variables que comienzan con NEXT_PUBLIC_
  return process.env.NEXT_PUBLIC_N8N_PURCHASE_WEBHOOK_URL;
}

function uuid(): string {
  // Genera un id estable para trazabilidad/deduplicación
  const g = globalThis as { crypto?: Crypto };
  if (g.crypto && "randomUUID" in g.crypto && typeof g.crypto.randomUUID === "function") {
    return g.crypto.randomUUID();
  }
  // Fallback simple
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v);
}

function isValidPhone(v: string): boolean {
  // +52XXXXXXXXXX o 10-15 dígitos
  return /^\+?\d{10,15}$/.test(v);
}

function validatePayload(p: PurchasePayload, availableTicketsMax?: number): { ok: true } | { ok: false; reason: string } {
  if (typeof p.ticketsCount !== "number" || !Number.isFinite(p.ticketsCount) || p.ticketsCount <= 0) {
    return { ok: false, reason: "ticketsCount inválido." };
  }
  if (availableTicketsMax && p.ticketsCount > availableTicketsMax) {
    return { ok: false, reason: "ticketsCount supera el máximo disponible." };
  }
  if (!Array.isArray(p.selectedTickets) || p.selectedTickets.some((n) => !Number.isInteger(n) || n <= 0)) {
    return { ok: false, reason: "selectedTickets inválidos." };
  }
  if (!["BINANCE", "OXXO", "AZTECA", "BANCOPPEL"].includes(p.paymentMethod)) {
    return { ok: false, reason: "paymentMethod inválido." };
  }
  if (typeof p.total !== "number" || !Number.isFinite(p.total) || p.total <= 0) {
    return { ok: false, reason: "total inválido." };
  }
  if (!isNonEmptyString(p.name)) {
    return { ok: false, reason: "name requerido." };
  }
  if (!isValidEmail(p.email)) {
    return { ok: false, reason: "email inválido." };
  }
  if (!isValidPhone(p.whatsapp)) {
    return { ok: false, reason: "whatsapp inválido." };
  }
  if (!isNonEmptyString(p.screenshotBase64) || !p.screenshotBase64.startsWith("data:image/")) {
    return { ok: false, reason: "screenshotBase64 inválido (debe ser data:image/...)." };
  }
  if (!isNonEmptyString(p.timestamp)) {
    return { ok: false, reason: "timestamp requerido." };
  }
  if (!isNonEmptyString(p.userAgent)) {
    return { ok: false, reason: "userAgent requerido." };
  }
  return { ok: true };
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...init, signal: controller.signal });
    return resp;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Hook para enviar una compra al webhook de n8n.
 * Maneja estados de carga/éxito/error, timeout y reintentos simples.
 */
export function useN8nPurchase(options?: UseN8nPurchaseOptions): UseN8nPurchaseReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const optsRef = useRef<UseN8nPurchaseOptions>({
    timeoutMs: 15000,
    retries: 1,
    headers: {},
    ...options,
  });

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage(null);
  }, []);

  const sendPurchase = useCallback(async (payload: PurchasePayload) => {
    if (isLoading) return;

    reset();
    setIsLoading(true);

    const url = optsRef.current.webhookUrl ?? getEnvWebhook();
    if (!url) {
      setIsLoading(false);
      setIsError(true);
      setErrorMessage("Webhook no configurado. Define NEXT_PUBLIC_N8N_PURCHASE_WEBHOOK_URL o pasa webhookUrl.");
      return;
    }

    // Validación básica de payload (límite máximo opcional no se conoce aquí)
    const val = validatePayload(payload);
    if (!val.ok) {
      setIsLoading(false);
      setIsError(true);
      setErrorMessage(`Payload inválido: ${val.reason}`);
      return;
    }

    const requestId = uuid();
    const body = JSON.stringify({
      clientRequestId: requestId,
      source: "web",
      ...payload,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...optsRef.current.headers,
    };

    const attempts = Math.max(1, optsRef.current.retries ?? 1);
    const timeoutMs = Math.max(3000, optsRef.current.timeoutMs ?? 15000);

    let lastErr: unknown = null;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const resp = await fetchWithTimeout(
          url,
          {
            method: "POST",
            headers,
            body,
            credentials: "omit",
            cache: "no-store",
          },
          timeoutMs
        );

        // Aceptamos 2xx como éxito
        if (resp.ok) {
          setIsSuccess(true);
          setIsLoading(false);
          return;
        }

        // Intentamos leer mensaje de error de n8n
        let detail = "";
        try {
          const data = (await resp.json()) as unknown;
          detail = typeof data === "object" && data && "message" in (data as Record<string, unknown>)
            ? String((data as Record<string, unknown>).message)
            : resp.statusText;
        } catch {
          detail = resp.statusText || `HTTP ${resp.status}`;
        }

        // Si 4xx, no reintentar
        if (resp.status >= 400 && resp.status < 500) {
          setIsError(true);
          setErrorMessage(detail || "Error en la solicitud (4xx).");
          setIsLoading(false);
          return;
        }

        // Si 5xx, reintenta si quedan intentos
        lastErr = new Error(detail || `Error del servidor (HTTP ${resp.status})`);
      } catch (e) {
        lastErr = e;
      }

      // backoff simple entre reintentos
      if (attempt < attempts) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }

    setIsError(true);
    setErrorMessage(lastErr instanceof Error ? lastErr.message : "Error al enviar la compra.");
    setIsLoading(false);
  }, [isLoading, reset]);

  return { sendPurchase, isLoading, isSuccess, isError, errorMessage, reset };
}

export default useN8nPurchase;
