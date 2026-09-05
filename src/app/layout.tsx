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
  title: 'Fernanda & Gabryel | Nosso Casamento',
  description: 'Com muita alegria convidamos você para celebrar o nosso amor e o início do nosso para sempre.',
  icons: {
    icon: '/favicon.ico',
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
