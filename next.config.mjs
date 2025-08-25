import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

// Security headers configuration
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), bluetooth=()',
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.google.com https://connect.facebook.net;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: blob: https: http:;
      media-src 'self' data: blob: https:;
      connect-src 'self' https://*.supabase.co https://graph.facebook.com https://api.whatsapp.com https://www.facebook.com https://connect.facebook.net https://sentry.io;
      frame-src 'self' https://www.facebook.com https://web.facebook.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim(),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // PWA ve mobile access için cross-origin fix
  allowedDevOrigins: [
    '192.168.30.241:3000',
    'localhost:3000'
  ],

  // Mobile Safari için WebSocket HMR disable
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    // React 19 compatibility fix for useLayoutEffect
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force React to use useEffect instead of useLayoutEffect in SSR
      ...(isServer ? { 
        'react': 'react',
        'react-dom': 'react-dom'
      } : {})
    }
    
    return config
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Development server ayarları
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP']
  },

  // Gerekirse buraya ek yapılandırmalar eklenebilir
  // Örneğin, experimental özellikler veya domain izinleri
  // experimental: {
  //   serverActions: true,
  // },
}

export default withNextIntl(nextConfig) 