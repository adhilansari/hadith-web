import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { SearchProvider } from '@/components/search/SearchProvider';
import { Header } from '@/components/layout/Header';
import '@/styles/globals.css';

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
  twitter: {
    card: 'summary_large_image',
    title: 'Hadith.net - Authentic Islamic Hadith Collections',
    description: 'Read authentic Hadith collections with translations in multiple languages.',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
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