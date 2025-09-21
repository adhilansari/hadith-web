import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { SearchProvider } from '@/components/search/SearchProvider';
import { Header } from '@/components/layout/Header';
import '@/styles/globals.css';
import { PWAInstaller } from '@/components/PWAInstaller';
import { inter, notoNaskhArabic } from '@/lib/utils/fonts';

export const metadata: Metadata = {
  title: 'Hadith.net - Authentic Islamic Hadith Collections',
  description: 'Read authentic Hadith collections with translations in multiple languages. A modern PWA for Islamic studies.',
  keywords: 'hadith, islamic, quran, bukhari, muslim, authentic, translations',
  authors: [{ name: 'Hadith.net Team' }],
  creator: 'Hadith.net',
  publisher: 'Hadith.net',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hadith.net',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hadith.net',
    siteName: 'Hadith.net',
    title: 'Hadith.net - Authentic Islamic Hadith Collections',
    description: 'Read authentic Hadith collections with translations in multiple languages.',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192x192.png',
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0ea5e9' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoNaskhArabic.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <PWAInstaller />
          <SearchProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </SearchProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}