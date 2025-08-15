import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, File, X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon, FileText, Send, Smartphone, Mail, Clock, Shield, ChevronRight, Trash2, ZoomIn } from 'lucide-react';

interface UploadProofProps {
  orderId: string;
  paymentMethod: string;
  totalAmount: number;
  onUploadComplete?: (fileUrl: string, additionalData: any) => void;
  userEmail?: string;
  userPhone?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

const UploadProof: React.FC<UploadProofProps> = ({
  orderId,
  paymentMethod,
  totalAmount,
  onUploadComplete,
  userEmail = '',
  userPhone = ''
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [contactEmail, setContactEmail] = useState(userEmail);
  const [contactPhone, setContactPhone] = useState(userPhone);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTime, setPaymentTime] = useState(new Date().toTimeString().slice(0, 5));
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

  const getPaymentMethodName = () => {
    const methods: Record<string, string> = {
      'binance': 'Binance Pay',
      'banco-azteca': 'Banco Azteca',
      'bancoppel': 'BanCoppel',
      'oxxo': 'Depósito OXXO'
    };
    return methods[paymentMethod] || paymentMethod;
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Tipo de archivo no válido. Solo se aceptan imágenes (JPG, PNG, WebP) y PDF.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'El archivo es demasiado grande. Máximo 10MB.';
    }
    return null;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = [];

    fileList.forEach(file => {
      const error = validateFile(file);
      if (!error) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const uploadedFile: UploadedFile = {
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: reader.result as string,
            uploading: false,
            uploaded: false
          };
          newFiles.push(uploadedFile);
          if (newFiles.length === fileList.length) {
            setFiles(prev => [...prev, ...newFiles].slice(0, 3)); // Max 3 files
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert(error);
      }
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert('Por favor, sube al menos un comprobante de pago');
      return;
    }

    if (!contactEmail || !contactPhone) {
      alert('Por favor, completa tus datos de contacto');
      return;
    }

    setUploading(true);

    try {
      // Simulación de upload - Aquí iría la lógica real
      await new Promise(resolve => setTimeout(resolve, 2000));

      const uploadData = {
        orderId,
        paymentMethod,
        totalAmount,
        files: files.map(f => ({
          name: f.file.name,
          type: f.file.type,
          size: f.file.size,
          preview: f.preview
        })),
        contact: {
          email: contactEmail,
          phone: contactPhone
        },
        paymentDetails: {
          reference: referenceNumber,
          date: paymentDate,
          time: paymentTime,
          notes: additionalNotes
        },
        timestamp: new Date().toISOString()
      };

      setUploadSuccess(true);
      
      if (onUploadComplete) {
        onUploadComplete(files[0].preview, uploadData);
      }

      // Reset después de 3 segundos
      setTimeout(() => {
        setFiles([]);
        setReferenceNumber('');
        setAdditionalNotes('');
        setUploadSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir el comprobante. Por favor, intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Subir Comprobante de Pago
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Envía tu comprobante para confirmar tu participación en la rifa
        </p>
      </div>

      {/* Order Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Orden ID:</span>
            <p className="font-mono font-bold text-blue-600">#{orderId}</p>
          </div>
          <div>
            <span className="text-gray-600">Método de Pago:</span>
            <p className="font-bold">{getPaymentMethodName()}</p>
          </div>
          <div>
            <span className="text-gray-600">Monto Total:</span>
            <p className="font-bold text-lg text-green-600">${totalAmount.toFixed(2)} MXN</p>
          </div>
          <div>
            <span className="text-gray-600">Estado:</span>
            <p className="font-bold text-orange-600">Esperando Comprobante</p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comprobante(s) de Pago
        </label>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          } ${files.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => files.length < 3 && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileInput}
            className="hidden"
            disabled={files.length >= 3}
          />

          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div>
              <p className="text-gray-700 font-medium">
                {files.length >= 3 
                  ? 'Máximo de archivos alcanzado (3)'
                  : 'Arrastra tus archivos aquí o haz clic para seleccionar'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WebP o PDF • Máximo 10MB • Hasta 3 archivos
              </p>
            </div>

            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                <span>Foto del ticket</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="w-4 h-4" />
                <span>Captura de pantalla</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>PDF del banco</span>
              </div>
            </div>
          </div>
        </div>

        {/* Files Preview */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="relative group">
                  {file.file.type.startsWith('image/') ? (
                    <div className="relative">
                      <img 
                        src={file.preview} 
                        alt={file.file.name}
                        className="w-16 h-16 object-cover rounded cursor-pointer"
                        onClick={() => setPreviewImage(file.preview)}
                      />
                      <button
                        onClick={() => setPreviewImage(file.preview)}
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <ZoomIn className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.file.size)}
                  </p>
                </div>

                {file.uploaded ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : file.uploading ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Detalles del Pago</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Referencia/Operación
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Ej: 123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha del Pago
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora del Pago
            </label>
            <input
              type="time"
              value={paymentTime}
              onChange={(e) => setPaymentTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco/Plataforma
            </label>
            <input
              type="text"
              value={getPaymentMethodName()}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas Adicionales (Opcional)
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Información adicional sobre tu pago..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Información de Contacto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Smartphone className="w-4 h-4 inline mr-1" />
              WhatsApp
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="555-123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={uploading || files.length === 0 || !contactEmail || !contactPhone}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            uploading || files.length === 0 || !contactEmail || !contactPhone
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar Comprobante
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-800">¡Comprobante Enviado!</h4>
              <p className="text-sm text-green-700 mt-1">
                Hemos recibido tu comprobante. Te notificaremos por WhatsApp y correo en cuanto se confirme tu pago.
              </p>
              <p className="text-xs text-green-600 mt-2">
                Tiempo estimado de verificación: 30 minutos a 2 horas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Proceso de Verificación:</p>
            <ol className="space-y-1 ml-4">
              <li>1. Recibiremos tu comprobante</li>
              <li>2. Verificaremos el pago en nuestro sistema</li>
              <li>3. Te enviaremos confirmación por WhatsApp y email</li>
              <li>4. Tus boletos quedarán registrados oficialmente</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={previewImage} 
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadProof;