import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './react-polyfills'
import { Navbar } from '../components/navbar'
import { I18nProvider } from '../lib/i18n/client'
import { getLocaleFromCookie } from '../lib/i18n/server'
import { Toaster } from '../components/ui/toaster'
import { ThemeProvider } from '../providers/theme-provider'
import { MockAuthProvider } from '../components/mock-auth-provider'
import { QueryProvider } from '../lib/providers/query-provider'
// import { NotificationPopup } from '../components/messaging/notification-popup'
// import { PWAInstallBanner } from '../components/pwa-install-banner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Happy CRM',
  description: 'Müşteri yönetim ve takip sistemi',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Happy CRM'
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png'
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#4F46E5' }
  ]
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocaleFromCookie()
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            console.log('🚀 PWA: Initializing Happy CRM (Demo Mode)...');
            
            // Service Worker Registration
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('✅ PWA: Service Worker registered', registration.scope);
                  })
                  .catch(function(error) {
                    console.warn('⚠️ PWA: Service Worker registration failed', error);
                  });
              });
            }
            
            // Error handling for production
            window.addEventListener('error', function(e) {
              console.error('❌ Error:', e.message, 'at', e.filename, ':', e.lineno);
            });
            
            window.addEventListener('unhandledrejection', function(e) {
              console.error('❌ Promise rejection:', e.reason);
            });
          `
        }} />
      </head>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <MockAuthProvider>
              <I18nProvider initialLocale={locale}>
                <Navbar />
                <main className="flex-grow container mx-auto p-4">
                  {children}
                </main>
                {/* İleride bir Footer eklenebilir */}
                <Toaster />
                {/* <NotificationPopup /> */}
                {/* <PWAInstallBanner /> */}
              </I18nProvider>
            </MockAuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 