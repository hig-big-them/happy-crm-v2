import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/auth/callback', '/forgot-password', '/', '/privacy', '/terms', '/whatsapp-signup', '/oauth']
  const skipAuthRoutes = ['/api/webhooks', '/api/whatsapp/webhook']
  
  // SECURITY: Block all bypass routes in production
  if (pathname.includes('bypass') || pathname.includes('admin-bypass')) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`🚨 SECURITY: Blocked bypass attempt from ${request.ip} to ${pathname}`)
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // In development, log the bypass usage
    console.log(`⚠️ DEV: Bypass route accessed: ${pathname}`)
  }
  
  // Restricted routes requiring authentication
  const restrictedRoutes = ['/messaging', '/admin', '/dashboard']
  
  if (restrictedRoutes.some(route => pathname.startsWith(route))) {
    // Check for authentication - both real Supabase auth and mock auth
    const hasAuth = request.cookies.get('sb-kvjblasewcrztzcfrkgq-auth-token')
    const mockAuth = request.cookies.get('mock-auth-user')
    
    if (!hasAuth && !mockAuth) {
      return NextResponse.redirect(new URL('/login?restricted=true', request.url))
    }
  }
  
  if (publicRoutes.includes(pathname) || 
      skipAuthRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // For all other routes, check authentication
  const hasAuth = request.cookies.get('sb-kvjblasewcrztzcfrkgq-auth-token')
  const mockAuth = request.cookies.get('mock-auth-user')
  
  if (!hasAuth && !mockAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
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