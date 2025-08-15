'use client';

import React, { useState } from 'react';
import { useCartStore } from '../stores/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Upload, CreditCard, Banknote, Building2, Store, ArrowLeft, AlertTriangle } from 'lucide-react';

interface PaymentMethodsProps {
  total: number;
  onContinuar: () => void;
  onVolver: () => void;
}

interface PaymentData {
  metodo: 'BINANCE' | 'BANCOPPEL' | 'AZTECA' | 'OXXO';
  referencia?: string;
  comprobante?: File;
  comprobanteUrl?: string;
}

const PAYMENT_INFO = {
  BINANCE: {
    title: 'Binance Pay / USDT',
    icon: '₿',
    color: 'from-yellow-500 to-orange-500',
    datos: {
      email: 'rifas@silverado2024.com',
      id: 'ID: 123456789',
      wallet: 'USDT (TRC20): TQn9Y2khEsLMWCoupe...',
      qr: '/images/binance-qr.png'
    },
    instrucciones: [
      'Envía el monto exacto en USDT a la wallet proporcionada',
      'Usa la red TRC20 para menores comisiones',
      'Guarda el hash de la transacción',
      'Sube captura de pantalla del pago realizado'
    ]
  },
  BANCOPPEL: {
    title: 'Banco Coppel',
    icon: '🏪',
    color: 'from-blue-500 to-cyan-500',
    datos: {
      banco: 'Banco Coppel',
      titular: 'RIFAS SILVERADO 2024 S.A. DE C.V.',
      cuenta: '1234567890123456',
      clabe: '137180123456789012'
    },
    instrucciones: [
      'Realiza transferencia SPEI o depósito en ventanilla',
      'Usa la CLABE para transferencias desde otros bancos',
      'Anota tu número de referencia del depósito',
      'Sube foto del comprobante de pago'
    ]
  },
  AZTECA: {
    title: 'Banco Azteca',
    icon: '🏦',
    color: 'from-green-500 to-emerald-500',
    datos: {
      banco: 'Banco Azteca',
      titular: 'RIFAS SILVERADO 2024 S.A. DE C.V.',
      cuenta: '9876543210987654',
      clabe: '127180987654321098'
    },
    instrucciones: [
      'Realiza depósito en cualquier sucursal Banco Azteca',
      'También puedes usar Elektra para el depósito',
      'Guarda tu número de referencia',
      'Toma foto clara del ticket de depósito'
    ]
  },
  OXXO: {
    title: 'Depósito OXXO',
    icon: '🏪',
    color: 'from-red-500 to-pink-500',
    datos: {
      tienda: 'OXXO',
      referencia: 'Será generada al confirmar',
      comision: '$12 MXN por depósito',
      limite: 'Máximo $10,000 MXN por depósito'
    },
    instrucciones: [
      'Ve a cualquier tienda OXXO',
      'Presenta la referencia generada',
      'Paga el monto exacto más $12 MXN de comisión',
      'Guarda tu ticket de pago como comprobante'
    ]
  }
};

export default function PaymentMethods({ total, onContinuar, onVolver }: PaymentMethodsProps) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<PaymentData['metodo'] | null>(null);
  const [referencia, setReferencia] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  
  const { setDatosPago } = useCartStore();

  const copiarTexto = async (texto: string, tipo: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(tipo);
      setTimeout(() => setCopiado(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const manejarArchivoComprobante = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      if (archivo.size > 5 * 1024 * 1024) { // 5MB
        alert('El archivo es muy grande. Máximo 5MB.');
        return;
      }
      if (!archivo.type.startsWith('image/')) {
        alert('Solo se permiten imágenes.');
        return;
      }
      setComprobante(archivo);
    }
  };

  const generarReferenciaOXXO = () => {
    return `RIF${Date.now().toString().slice(-8)}`;
  };

  const handleContinuar = () => {
    if (!metodoSeleccionado) {
      alert('Por favor selecciona un método de pago');
      return;
    }

    let referenciaFinal = referencia;
    if (metodoSeleccionado === 'OXXO' && !referencia) {
      referenciaFinal = generarReferenciaOXXO();
      setReferencia(referenciaFinal);
    }

    const datosPago: PaymentData = {
      metodo: metodoSeleccionado,
      referencia: referenciaFinal,
      comprobante,
      comprobanteUrl: comprobante ? URL.createObjectURL(comprobante) : undefined
    };

    setDatosPago(datosPago);
    onContinuar();
  };

  const convertirUSDtoMXN = (usd: number) => {
    const tipoCambio = 17.5; // Tipo de cambio aproximado
    return usd * tipoCambio;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Selecciona tu Método de Pago
        </h2>
        <p className="text-gray-300">
          Total a pagar: <span className="text-yellow-400 font-bold text-xl">${total.toFixed(2)} USD</span>
          <span className="text-gray-400 ml-2">
            (≈ ${convertirUSDtoMXN(total).toLocaleString()} MXN)
          </span>
        </p>
      </div>

      {/* Métodos de Pago Disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(PAYMENT_INFO).map(([key, info]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all duration-300 border-2 ${
              metodoSeleccionado === key
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-white/20 bg-white/5 hover:border-white/40'
            }`}
            onClick={() => setMetodoSeleccionado(key as PaymentData['metodo'])}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${info.color} flex items-center justify-center text-2xl`}>
                  {info.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{info.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {key === 'BINANCE' && 'Criptomonedas - Instantáneo'}
                    {key === 'BANCOPPEL' && 'Transferencia bancaria'}
                    {key === 'AZTECA' && 'Depósito en sucursal'}
                    {key === 'OXXO' && 'Pago en efectivo'}
                  </p>
                </div>
                {metodoSeleccionado === key && (
                  <Badge className="bg-yellow-500 text-black">Seleccionado</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detalles del Método Seleccionado */}
      {metodoSeleccionado && (
        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <span className="text-2xl">{PAYMENT_INFO[metodoSeleccionado].icon}</span>
              <span>Datos para {PAYMENT_INFO[metodoSeleccionado].title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Datos de Pago */}
            <div className="bg-black/20 rounded-lg p-4 space-y-3">
              <h4 className="text-lg font-semibold text-yellow-400 mb-3">Información de Pago</h4>
              
              {metodoSeleccionado === 'BINANCE' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Email Binance:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono">{PAYMENT_INFO.BINANCE.datos.email}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copiarTexto(PAYMENT_INFO.BINANCE.datos.email, 'email')}
                      >
                        <Copy size={14} />
                        {copiado === 'email' ? '¡Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">ID Binance:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono">{PAYMENT_INFO.BINANCE.datos.id}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copiarTexto(PAYMENT_INFO.BINANCE.datos.id, 'id')}
                      >
                        <Copy size={14} />
                        {copiado === 'id' ? '¡Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Wallet USDT:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono text-xs">{PAYMENT_INFO.BINANCE.datos.wallet}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copiarTexto(PAYMENT_INFO.BINANCE.datos.wallet, 'wallet')}
                      >
                        <Copy size={14} />
                        {copiado === 'wallet' ? '¡Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {(metodoSeleccionado === 'BANCOPPEL' || metodoSeleccionado === 'AZTECA') && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Banco:</span>
                    <span className="text-white font-semibold">{PAYMENT_INFO[metodoSeleccionado].datos.banco}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Titular:</span>
                    <span className="text-white font-mono text-sm">{PAYMENT_INFO[metodoSeleccionado].datos.titular}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Cuenta:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono">{PAYMENT_INFO[metodoSeleccionado].datos.cuenta}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copiarTexto(PAYMENT_INFO[metodoSeleccionado].datos.cuenta, 'cuenta')}
                      >
                        <Copy size={14} />
                        {copiado === 'cuenta' ? '¡Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">CLABE:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono">{PAYMENT_INFO[metodoSeleccionado].datos.clabe}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copiarTexto(PAYMENT_INFO[metodoSeleccionado].datos.clabe, 'clabe')}
                      >
                        <Copy size={14} />
                        {copiado === 'clabe' ? '¡Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {metodoSeleccionado === 'OXXO' && (
                <div className="space-y-3">
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                      <AlertTriangle size={20} />
                      <span className="font-semibold">Importante</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      La referencia se generará automáticamente al confirmar tu pedido. 
                      Tendrás 24 horas para realizar el pago.
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Comisión OXXO:</span>
                    <span className="text-yellow-400 font-semibold">$12 MXN</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total a pagar:</span>
                    <span className="text-white font-bold">
                      ${(convertirUSDtoMXN(total) + 12).toLocaleString()} MXN
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-400 mb-3">Instrucciones de Pago</h4>
              <ol className="space-y-2 text-gray-300">
                {PAYMENT_INFO[metodoSeleccionado].instrucciones.map((instruccion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm">{instruccion}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Formulario de Comprobante */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Información del Pago</h4>
              
              {metodoSeleccionado !== 'OXXO' && (
                <div>
                  <Label htmlFor="referencia" className="text-gray-300">
                    Número de Referencia / Hash de Transacción *
                  </Label>
                  <Input
                    id="referencia"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder={
                      metodoSeleccionado === 'BINANCE' 
                        ? 'Hash de la transacción blockchain'
                        : 'Número de referencia del depósito'
                    }
                    className="mt-1"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="comprobante" className="text-gray-300">
                  Comprobante de Pago *
                </Label>
                <div className="mt-1">
                  <input
                    type="file"
                    id="comprobante"
                    accept="image/*"
                    onChange={manejarArchivoComprobante}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('comprobante')?.click()}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Upload size={18} />
                    <span>
                      {comprobante ? comprobante.name : 'Subir comprobante (imagen, máx 5MB)'}
                    </span>
                  </Button>
                </div>
                {comprobante && (
                  <div className="mt-2 text-green-400 text-sm">
                    ✓ Archivo seleccionado: {comprobante.name}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de Navegación */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onVolver} className="flex items-center space-x-2">
          <ArrowLeft size={18} />
          <span>Volver</span>
        </Button>

        <Button
          onClick={handleContinuar}
          disabled={
            !metodoSeleccionado || 
            (metodoSeleccionado !== 'OXXO' && !referencia) ||
            !comprobante
          }
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold px-8 py-3"
        >
          Continuar al Resumen
        </Button>
      </div>
    </div>
  );
}