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
  title: 'AppName - Build Something Amazing',
  description: 'Building the future of web applications with cutting-edge technology and beautiful design.',
  keywords: 'web app, saas, nextjs, react, typescript',
  authors: [{ name: 'Your Name' }],
  creator: 'Your Company',
  publisher: 'Your Company',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourapp.com',
    title: 'AppName - Build Something Amazing',
    description: 'Building the future of web applications with cutting-edge technology and beautiful design.',
    siteName: 'AppName',
    images: [
      {
        url: 'https://yourapp.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AppName',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AppName - Build Something Amazing',
    description: 'Building the future of web applications with cutting-edge technology and beautiful design.',
    images: ['https://yourapp.com/twitter-image.jpg'],
    creator: '@yourusername',
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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