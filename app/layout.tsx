import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
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
  description: 'Customer relationship management and WhatsApp messaging platform',
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
            // Service Worker Registration
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    // Service Worker registered successfully
                  })
                  .catch(function(error) {
                    // Service Worker registration failed
                  });
              });
            }
            
            // Error handling for production - send to monitoring service instead of console
            window.addEventListener('error', function(e) {
              // Send to error monitoring service (e.g., Sentry) instead of console
              if (window.Sentry) {
                window.Sentry.captureException(new Error(e.message));
              }
            });
            
            window.addEventListener('unhandledrejection', function(e) {
              // Send to error monitoring service instead of console
              if (window.Sentry) {
                window.Sentry.captureException(e.reason);
              }
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
        
        {/* Facebook JavaScript SDK */}
        <Script
          id="facebook-jssdk"
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="lazyOnload"
        />
        <Script
          id="facebook-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // @ts-ignore
              window.fbAsyncInit = function () {
                // @ts-ignore
                FB.init({
                  appId: '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}',
                  cookie: true,
                  xfbml: true,
                  version: '${process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v20.0'}',
                });
              };
            `
          }}
        />
      </body>
    </html>
  )
} 