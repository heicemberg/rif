import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'RifAzteca - Gana Increíbles Premios',
  description: 'La plataforma de rifas más confiable de México. Participa y gana autos, dinero en efectivo y mucho más.',
  keywords: 'rifas, premios, México, sorteos, autos, dinero',
  authors: [{ name: 'RifAzteca' }],
  creator: 'RifAzteca',
  publisher: 'RifAzteca',
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://rifazteca.com',
    title: 'RifAzteca - Gana Increíbles Premios',
    description: 'La plataforma de rifas más confiable de México. Participa y gana autos, dinero en efectivo y mucho más.',
    siteName: 'RifAzteca',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RifAzteca - Rifas en México',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RifAzteca - Gana Increíbles Premios',
    description: 'La plataforma de rifas más confiable de México.',
    images: ['/twitter-image.jpg'],
    creator: '@rifazteca',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={cn(
        inter.variable,
        'font-sans antialiased'
      )}>
        <ToastProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}