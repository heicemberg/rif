import { Suspense } from 'react';
import { Hero } from '@/components/home/Hero';
import { FeaturedPrize } from '@/components/home/FeaturedPrize';
import { TrustBadges } from '@/components/widgets/TrustBadges';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Testimonials } from '@/components/home/Testimonials';
import { Winners } from '@/components/home/Winners';
import { SocialProof } from '@/components/widgets/SocialProof';
import { FAQ } from '@/components/home/FAQ';
import { TicketGrid } from '@/components/raffle/TicketGrid';
import { Countdown } from '@/components/widgets/Countdown';
import { LiveActivity } from '@/components/widgets/LiveIndicator';
import { PaymentMethods } from '@/components/widgets/TrustBadges';

// Loading placeholder
function SectionSkeleton({ height = "h-48" }: { height?: string }) {
  return (
    <div className={`${height} bg-gray-100 animate-pulse rounded-lg`}>
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Cargando...</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <Suspense fallback={<SectionSkeleton height="h-screen" />}>
        <Hero variant="centered" />
      </Suspense>

      {/* Trust Badges */}
      <section className="py-8 bg-white border-b">
        <Suspense fallback={<SectionSkeleton height="h-24" />}>
          <TrustBadges variant="inline" />
        </Suspense>
      </section>

      {/* Featured Prize - El componente estrella */}
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <FeaturedPrize 
          showStats={true}
          showCountdown={true}
          onEnterClick={() => console.log('¡Entrada al proceso de compra!')}
        />
      </Suspense>

      {/* Live Activity Sidebar */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold mb-6 text-center">
                🎯 Selecciona Tus Boletos de la Suerte
              </h2>
              <Suspense fallback={<SectionSkeleton height="h-64" />}>
                <TicketGrid 
                  mode="both"
                  showCalculator={true}
                  showAvailability={true}
                />
              </Suspense>
            </div>
            
            {/* Sidebar con actividad en vivo */}
            <div className="space-y-6">
              <Suspense fallback={<SectionSkeleton height="h-40" />}>
                <LiveActivity maxItems={5} />
              </Suspense>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-3">⏰ Tiempo Restante</h3>
                <Countdown 
                  targetDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                  variant="compact"
                  showDays={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <HowItWorks variant="timeline" />
      </Suspense>

      {/* Winners Section */}
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <Winners variant="featured" />
      </Suspense>

      {/* Testimonials */}
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <Testimonials variant="carousel" />
      </Suspense>

      {/* Social Proof */}
      <section className="py-16 bg-white">
        <Suspense fallback={<SectionSkeleton height="h-32" />}>
          <SocialProof variant="default" />
        </Suspense>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <FAQ />
      </Suspense>

      {/* Demo de Componentes UI */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            🎨 Showcase de Componentes UI
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Botones */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Botones</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Primario
                </button>
                <button className="w-full border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Secundario
                </button>
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                  Gradiente
                </button>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Badges</h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    Nuevo
                  </span>
                  <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    ✓ Verificado
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    🔥 Popular
                  </span>
                  <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    ⚡ Urgente
                  </span>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Cards</h3>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium mb-2">Premio Especial</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Participa y gana increíbles premios
                </p>
                <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded">
                  Participar
                </button>
              </div>
            </div>

            {/* Números Animados */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Números Animados</h3>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    $2,500,000
                  </div>
                  <div className="text-sm text-gray-500">Total Premios</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    150,000+
                  </div>
                  <div className="text-sm text-gray-500">Ganadores</div>
                </div>
              </div>
            </div>

            {/* Métodos de Pago */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Métodos de Pago</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-center p-2 border rounded text-xs">
                  💰 Binance
                </div>
                <div className="flex items-center justify-center p-2 border rounded text-xs">
                  🏪 OXXO
                </div>
                <div className="flex items-center justify-center p-2 border rounded text-xs">
                  🏦 Azteca
                </div>
                <div className="flex items-center justify-center p-2 border rounded text-xs">
                  💳 Coppel
                </div>
              </div>
            </div>

            {/* Skeleton Loading */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Loading States</h3>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer con estadísticas */}
      <footer className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">🏆</div>
              <div className="text-2xl font-bold">150,000+</div>
              <div className="text-blue-300">Ganadores Felices</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">💰</div>
              <div className="text-2xl font-bold">$2.5M+</div>
              <div className="text-blue-300">En Premios</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">⭐</div>
              <div className="text-2xl font-bold">4.8/5</div>
              <div className="text-blue-300">Calificación</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">🎯</div>
              <div className="text-2xl font-bold">98%</div>
              <div className="text-blue-300">Satisfacción</div>
            </div>
          </div>
          
          <div className="text-center mt-12 pt-8 border-t border-blue-800">
            <h2 className="text-2xl font-bold mb-2">🎊 RifAzteca</h2>
            <p className="text-blue-300">
              La plataforma de rifas más confiable de México
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}