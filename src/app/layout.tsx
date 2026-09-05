import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://casamento.local'),
  title: 'Fernanda & Gabryel | Nosso Casamento 💍',
  description: 'Com muita alegria convidamos você para celebrar o nosso amor e o início do nosso para sempre! Acesse para confirmar sua presença e ver todos os detalhes.',
  openGraph: {
    title: 'Fernanda & Gabryel | Nosso Casamento 💍',
    description: 'Com muita alegria convidamos você para celebrar o nosso grande dia! Acesse para confirmar sua presença e ver todos os detalhes.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Casamento Fernanda & Gabryel',
    images: [
      {
        url: '/api/og',
        width: 600,
        height: 600,
        alt: 'Foto dos Noivos - Fernanda & Gabryel',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Fernanda & Gabryel | Nosso Casamento 💍',
    description: 'Com muita alegria convidamos você para celebrar o nosso grande dia!',
    images: ['/api/og'],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="pt-BR" 
      suppressHydrationWarning 
      className={`${serif.variable} ${sans.variable} scroll-smooth`}
    >
      <body 
        suppressHydrationWarning 
        className="min-h-screen flex flex-col font-sans antialiased text-[#2D2422] bg-[#FDFBF7] overflow-x-hidden w-full max-w-full"
      >
        {children}
      </body>
    </html>
  );
}
