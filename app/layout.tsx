import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: 'Wenvest - Gestão Inteligente de Patrimônio',
    template: '%s | Wenvest'
  },
  description: 'Plataforma completa para gestão e análise de investimentos. Tenha uma visão 360° do seu patrimônio no Brasil e no exterior.',
  keywords: ['investimentos', 'gestão de patrimônio', 'assessoria financeira', 'wealth management', 'investimentos globais'],
  authors: [{ name: 'Wenvest' }],
  creator: 'Wenvest',
  publisher: 'Wenvest',

  // Open Graph (WhatsApp, Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://wenvest-vpu2.vercel.app',
    siteName: 'Wenvest',
    title: 'Wenvest - Gestão Inteligente de Patrimônio',
    description: 'Plataforma completa para gestão e análise de investimentos. Tenha uma visão 360° do seu patrimônio no Brasil e no exterior.',
    images: [
      {
        url: 'https://www.wenvestadvisor.com.br/assets/images/logo-wenvest-304x96.webp',
        width: 304,
        height: 96,
        alt: 'Wenvest Logo',
      }
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Wenvest - Gestão Inteligente de Patrimônio',
    description: 'Plataforma completa para gestão e análise de investimentos no Brasil e exterior.',
    images: ['https://www.wenvestadvisor.com.br/assets/images/logo-wenvest-304x96.webp'],
  },

  // Favicon and icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  // Manifest for PWA
  manifest: '/manifest.json',

  // Theme color
  themeColor: '#fcbf18',
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1e293b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} antialiased`}>
      <body className="font-sans antialiased bg-background text-foreground h-dvh w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
