import React, { useState } from 'react';
import { Shield, Check, AlertCircle, Lock, Copy, Clock, DollarSign, Zap, Info } from 'lucide-react';

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  description: string;
  fee?: number;
  processingTime: string;
  available: boolean;
  popular?: boolean;
}

interface PaymentMethodsProps {
  onSelectMethod: (methodId: string) => void;
  selectedMethod: string | null;
  totalAmount: number;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ onSelectMethod, selectedMethod, totalAmount }) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [confirmPayment, setConfirmPayment] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'binance',
      name: 'Binance Pay',
      logo: '/logos/binance.svg',
      description: 'Paga con criptomonedas (USDT, BTC, ETH)',
      processingTime: '5-15 minutos',
      available: true,
      popular: true
    },
    {
      id: 'banco-azteca',
      name: 'Banco Azteca',
      logo: '/logos/bancoazteca.png',
      description: 'Transferencia o depósito en sucursal',
      fee: 0,
      processingTime: '30 minutos - 2 horas',
      available: true
    },
    {
      id: 'bancoppel',
      name: 'BanCoppel',
      logo: '/logos/bancoppel.png',
      description: 'Transferencia bancaria o depósito',
      processingTime: '30 minutos - 2 horas',
      available: true
    },
    {
      id: 'oxxo',
      name: 'Depósito OXXO',
      logo: '/logos/oxxo.png',
      description: 'Paga en efectivo en cualquier OXXO',
      fee: 10,
      processingTime: '24-48 horas',
      available: true
    }
  ];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(field);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;
    return !match[2] ? match[1] : `${match[1]}-${match[2]}${match[3] ? `-${match[3]}` : ''}`;
  };

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
  const finalTotal = selectedMethodData?.fee ? totalAmount + selectedMethodData.fee : totalAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-3">
        <h2 className="text-xl font-bold text-gray-900">Método de Pago</h2>
        <p className="text-sm text-gray-600 mt-1">Selecciona tu forma de pago preferida</p>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => method.available && onSelectMethod(method.id)}
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : method.available
                ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
            }`}
          >
            {method.popular && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                Popular
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-white rounded-lg p-2 border border-gray-200 flex items-center justify-center">
                  <img 
                    src={method.logo} 
                    alt={method.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    {!method.available && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">No disponible</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {method.processingTime}
                    </span>
                    {method.fee !== undefined && (
                      <span className={`text-xs font-medium ${method.fee === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {method.fee === 0 ? '✓ Sin comisión' : `+$${method.fee} MXN comisión`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {selectedMethod === method.id && (
                <div className="bg-blue-500 text-white rounded-full p-1 shadow-lg">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Binance Pay Details */}
      {selectedMethod === 'binance' && (
        <div className="border-t pt-6 space-y-4">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-lg text-black">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-bold">Pago Rápido con Cripto</span>
            </div>
            <p className="text-xs">Confirmación en minutos • Sin comisiones bancarias</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Datos para Binance Pay
            </h4>
            
            <div className="space-y-3">
              <div className="bg-white rounded p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Binance ID:</span>
                  <button
                    onClick={() => copyToClipboard('123456789', 'binance-id')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-mono font-bold text-lg">123456789</p>
                {copiedText === 'binance-id' && (
                  <span className="text-xs text-green-600">¡Copiado!</span>
                )}
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Email Binance:</span>
                  <button
                    onClick={() => copyToClipboard('rifasmexico@binance.com', 'binance-email')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-mono font-bold">rifasmexico@binance.com</p>
                {copiedText === 'binance-email' && (
                  <span className="text-xs text-green-600">¡Copiado!</span>
                )}
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <span className="text-sm text-gray-600">Monto exacto:</span>
                <p className="font-bold text-xl text-blue-600">${totalAmount.toFixed(2)} MXN</p>
                <p className="text-xs text-gray-500 mt-1">Equivalente en USDT al tipo de cambio actual</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-semibold mb-1">Importante:</p>
                    <ul className="space-y-0.5">
                      <li>• Usa el ID o email exacto para localizar nuestra cuenta</li>
                      <li>• Acepta pagos en USDT, BTC, ETH y BNB</li>
                      <li>• Envía captura de pantalla al completar</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banco Azteca Details */}
      {selectedMethod === 'banco-azteca' && (
        <div className="border-t pt-6 space-y-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-bold">Banco de Confianza</span>
            </div>
            <p className="text-xs">Transferencia SPEI disponible 24/7</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900">Datos Bancarios - Banco Azteca</h4>
            
            <div className="space-y-3">
              <div className="bg-white rounded p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Número de Cuenta:</span>
                  <button
                    onClick={() => copyToClipboard('1234567890123456', 'cuenta-azteca')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-mono font-bold text-lg">1234 5678 9012 3456</p>
                {copiedText === 'cuenta-azteca' && (
                  <span className="text-xs text-green-600">¡Copiado!</span>
                )}
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">CLABE:</span>
                  <button
                    onClick={() => copyToClipboard('127180001234567890', 'clabe-azteca')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-mono font-bold">127 180 00123 45678 90</p>
                {copiedText === 'clabe-azteca' && (
                  <span className="text-xs text-green-600">¡Copiado!</span>
                )}
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-600">Titular:</p>
                <p className="font-bold">RIFAS MÉXICO S.A. DE C.V.</p>
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-600">Referencia/Concepto:</p>
                <p className="font-mono font-bold text-blue-600">RIFA-{Date.now()}</p>
                <p className="text-xs text-gray-500 mt-1">Usa esta referencia exacta</p>
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-600">Monto exacto a depositar:</p>
                <p className="font-bold text-2xl text-green-600">${totalAmount.toFixed(2)} MXN</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BanCoppel Details */}
      {selectedMethod === 'bancoppel' && (
        <div className="border-t pt-6 space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-bold">Pago Seguro BanCoppel</span>
            </div>
            <p className="text-xs">Sucursales en todo México</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900">Datos Bancarios - BanCoppel</h4>
            
            <div className="space-y-3">
              <div className="bg-white rounded p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Número de Cuenta:</span>
                  <button
                    onClick={() => copyToClipboard('9876543210987654', 'cuenta-coppel')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-mono font-bold text-lg">9876 5432 1098 7654</p>
                {copiedText === 'cuenta-coppel' && (
                  <span className="text-xs text-green-600">¡Copiado!</span>
                )}
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">CLABE:</span>
                  <button
                    onClick={() => copyToClipboard('137180009876543210', 'clabe-coppel')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-mono font-bold">137 180 00987 65432 10</p>
                {copiedText === 'clabe-coppel' && (
                  <span className="text-xs text-green-600">¡Copiado!</span>
                )}
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-600">Titular:</p>
                <p className="font-bold">RIFAS MÉXICO S.A. DE C.V.</p>
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-600">Referencia:</p>
                <p className="font-mono font-bold text-blue-600">RIFA-{Date.now()}</p>
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-600">Total a pagar:</p>
                <p className="font-bold text-2xl text-blue-600">${totalAmount.toFixed(2)} MXN</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OXXO Details */}
      {selectedMethod === 'oxxo' && (
        <div className="border-t pt-6 space-y-4">
          <div className="bg-gradient-to-r from-red-500 to-yellow-500 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-bold">Pago en Efectivo</span>
            </div>
            <p className="text-xs">+13,000 tiendas en todo México</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-bold text-yellow-800 mb-2">Instrucciones para pagar en OXXO:</p>
                <ol className="space-y-2 text-yellow-700">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span>
                    <span>Anota o toma captura del código de referencia</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span>
                    <span>Acude a cualquier tienda OXXO</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span>
                    <span>Indica que realizarás un depósito a cuenta Banamex</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">4.</span>
                    <span>Proporciona el código de referencia al cajero</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">5.</span>
                    <span>Realiza el pago en efectivo por el monto exacto</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">6.</span>
                    <span>Conserva tu ticket y envíanos la foto</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900">Datos para Depósito OXXO</h4>
            
            <div className="space-y-3">
              <div className="bg-white rounded p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Código de Referencia:</span>
                  <button
                    onClick={() => copyToClipboard(`OXX${Date.now()}`, 'ref-oxxo')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-mono font-bold text-xl text-red-600">OXX{Date.now()}</p>
                {copiedText === 'ref-oxxo' && (
                  <span className="text-xs text-green-600">¡Copiado!</span>
                )}
              </div>

              <div className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-600">Empresa/Servicio:</p>
                <p className="font-bold">RIFAS MÉXICO</p>
              </div>

              <div className="bg-white rounded p-3 border border-orange-200 border-2">
                <p className="text-sm text-gray-600">Total a pagar (incluye comisión):</p>
                <p className="font-bold text-2xl text-orange-600">${(totalAmount + 10).toFixed(2)} MXN</p>
                <p className="text-xs text-gray-500 mt-1">Incluye $10 MXN de comisión OXXO</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-xs text-red-700 font-medium">
                  ⚠️ El código vence en 48 horas. Paga antes para asegurar tus boletos.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form for all methods */}
      {selectedMethod && (
        <div className="border-t pt-6 space-y-4">
          <h4 className="font-semibold text-gray-900">Datos de Contacto</h4>
          <p className="text-sm text-gray-600">Para enviarte la confirmación de tu compra</p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono WhatsApp
              </label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(formatPhoneNumber(e.target.value))}
                placeholder="555-123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Te notificaremos por WhatsApp cuando se confirme tu pago</p>
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="confirm-payment"
                checked={confirmPayment}
                onChange={(e) => setConfirmPayment(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
              />
              <label htmlFor="confirm-payment" className="text-sm text-gray-700">
                Confirmo que he realizado o realizaré el pago según las instrucciones proporcionadas
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Final Total Summary */}
      {selectedMethod && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal boletos:</span>
              <span className="font-medium">${totalAmount.toFixed(2)} MXN</span>
            </div>
            {selectedMethodData?.fee && selectedMethodData.fee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Comisión {selectedMethodData.name}:</span>
                <span className="font-medium">${selectedMethodData.fee.toFixed(2)} MXN</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between items-center">
              <div>
                <span className="font-bold text-gray-900">Total Final:</span>
                <p className="text-xs text-gray-500">IVA incluido</p>
              </div>
              <span className="font-bold text-xl text-blue-600">
                ${finalTotal.toFixed(2)} MXN
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lock className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Tu información está segura</p>
            <p>• Todos los pagos son verificados manualmente</p>
            <p>• Recibirás confirmación en tu correo y WhatsApp</p>
            <p>• Tus boletos quedan apartados al realizar el pago</p>
            <p>• Soporte disponible 24/7 vía WhatsApp</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;