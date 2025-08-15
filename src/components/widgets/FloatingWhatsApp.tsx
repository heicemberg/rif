import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Clock, Phone, User, ChevronDown, Sparkles, HeadphonesIcon } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'agent' | 'user';
  time: string;
}

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  welcomeMessage?: string;
  agentName?: string;
  agentImage?: string;
  position?: 'left' | 'right';
  offsetX?: number;
  offsetY?: number;
}

const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phoneNumber = '5215512345678',
  welcomeMessage = '¡Hola! 👋 ¿En qué puedo ayudarte con tu participación en la rifa?',
  agentName = 'Soporte Rifas México',
  agentImage = '/logos/agent-avatar.png',
  position = 'right',
  offsetX = 20,
  offsetY = 20
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(true);

  const quickReplies = [
    '¿Cómo compro boletos?',
    '¿Cuándo es el sorteo?',
    '¿Cómo verifico mi pago?',
    'Necesito ayuda con mi compra',
    'Información sobre premios'
  ];

  useEffect(() => {
    // Mostrar notificación después de 5 segundos
    const notificationTimer = setTimeout(() => {
      if (!hasInteracted && !isOpen) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    }, 5000);

    // Detener animación de pulso después de 10 segundos
    const pulseTimer = setTimeout(() => {
      setPulseAnimation(false);
    }, 10000);

    return () => {
      clearTimeout(notificationTimer);
      clearTimeout(pulseTimer);
    };
  }, [hasInteracted, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Agregar mensaje de bienvenida
      const welcomeMsg: Message = {
        id: '1',
        text: welcomeMessage,
        sender: 'agent',
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, welcomeMessage]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasInteracted(true);
    setShowNotification(false);
    setPulseAnimation(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const sendToWhatsApp = (message?: string) => {
    const text = message || inputMessage;
    if (!text.trim()) return;

    // Agregar mensaje a la conversación local
    const newMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Simular respuesta del agente
    setIsTyping(true);
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAgentResponse(text),
        sender: 'agent',
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentResponse]);
      setIsTyping(false);
    }, 1500);

    // Abrir WhatsApp real después de un delay
    setTimeout(() => {
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }, 2000);
  };

  const getAgentResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('comprar') || lowerMessage.includes('boleto')) {
      return 'Para comprar boletos: 1️⃣ Selecciona tus números 2️⃣ Elige método de pago 3️⃣ Envía comprobante. ¡Te redirigí a WhatsApp para asistencia personalizada!';
    }
    if (lowerMessage.includes('sorteo') || lowerMessage.includes('cuando')) {
      return 'El sorteo es el 31 de Diciembre 2024 a las 20:00 hrs. Se transmitirá en vivo. ¡Contáctame por WhatsApp para más detalles!';
    }
    if (lowerMessage.includes('pago') || lowerMessage.includes('verificar')) {
      return 'Para verificar tu pago, envía tu comprobante por WhatsApp con tu número de orden. Verificamos en 30 min a 2 horas.';
    }
    if (lowerMessage.includes('premio')) {
      return '🎁 Premio Mayor: $1,000,000 MXN. También hay premios secundarios. ¡Escríbeme por WhatsApp para conocer todos los premios!';
    }
    return 'Gracias por tu mensaje. Te estoy redirigiendo a WhatsApp donde un agente te atenderá personalmente en breve. 🚀';
  };

  const handleQuickReply = (reply: string) => {
    sendToWhatsApp(reply);
  };

  const positionStyles = position === 'right' 
    ? { right: `${offsetX}px`, bottom: `${offsetY}px` }
    : { left: `${offsetX}px`, bottom: `${offsetY}px` };

  return (
    <>
      {/* Botón flotante */}
      <div
        className="fixed z-40 group"
        style={positionStyles}
      >
        {/* Notificación popup */}
        {showNotification && !isOpen && (
          <div className={`absolute bottom-20 ${position === 'right' ? 'right-0' : 'left-0'} 
            bg-white rounded-lg shadow-2xl p-4 w-72 animate-slide-up`}>
            <button
              onClick={() => setShowNotification(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <HeadphonesIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{agentName}</p>
                <p className="text-xs text-gray-600 mt-1">{welcomeMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botón WhatsApp */}
        <button
          onClick={handleOpen}
          className={`bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl 
            hover:shadow-3xl transform hover:scale-110 transition-all duration-300 
            ${pulseAnimation ? 'animate-pulse-slow' : ''}`}
          aria-label="Abrir WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          {!hasInteracted && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed z-50 animate-slide-up"
          style={{
            ...positionStyles,
            width: '360px',
            height: '600px',
            maxHeight: '80vh'
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-500" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{agentName}</h3>
                    <p className="text-xs opacity-90 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                      En línea ahora
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/20 rounded-full px-3 py-1 w-fit">
                <Clock className="w-3 h-3" />
                <span>Respuesta típica: 2 min</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-green-500 text-white rounded-tl-2xl rounded-tr-sm rounded-b-2xl'
                      : 'bg-white text-gray-800 rounded-tl-sm rounded-tr-2xl rounded-b-2xl shadow-sm'
                  } px-4 py-2`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-green-100' : 'text-gray-400'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 bg-white border-t">
                <p className="text-xs text-gray-500 mb-2">Respuestas rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 
                        transition-colors border border-gray-300 hover:border-gray-400"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendToWhatsApp()}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full 
                    focus:outline-none focus:border-green-500 text-sm"
                />
                <button
                  onClick={() => sendToWhatsApp()}
                  disabled={!inputMessage.trim()}
                  className={`p-2 rounded-full transition-all ${
                    inputMessage.trim()
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">
                Powered by WhatsApp Business
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
};

export default FloatingWhatsApp;