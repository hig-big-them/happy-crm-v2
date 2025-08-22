import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔍 [MIDDLEWARE] Processing request:', pathname)
  
  // Mock auth mode - skip all Supabase checks
  console.log('🎭 [MIDDLEWARE] Mock auth mode - skipping Supabase checks')
  
  // Skip auth check for public routes and API routes that don't need auth
  const publicRoutes = ['/login', '/auth/callback', '/forgot-password', '/bypass-login', '/']
  const skipAuthRoutes = ['/api/webhooks', '/api/cron', '/api/twilio', '/api/admin/system-settings']
  
  // Messaging routes - güvenlik için kısıtlandı
  const restrictedRoutes = ['/messaging']
  
  if (restrictedRoutes.some(route => pathname.startsWith(route))) {
    console.log('🔒 [MIDDLEWARE] Restricted route access blocked:', pathname)
    return NextResponse.redirect(new URL('/login?restricted=messaging', request.url))
  }
  
  if (publicRoutes.includes(pathname) || 
      skipAuthRoutes.some(route => pathname.startsWith(route))) {
    console.log('🔓 [MIDDLEWARE] Public route, skipping auth check:', pathname)
    return NextResponse.next()
  }

  // For all other routes, allow access (mock auth mode)
  console.log('✅ [MIDDLEWARE] Mock auth mode - allowing access to:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 