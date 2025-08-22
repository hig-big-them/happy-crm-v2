import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/auth/callback', '/forgot-password', '/', '/privacy', '/terms']
  const skipAuthRoutes = ['/api/webhooks', '/api/whatsapp/webhook']
  
  // Remove bypass-login from allowed routes - security fix
  if (pathname.includes('bypass')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Restricted routes requiring authentication
  const restrictedRoutes = ['/messaging', '/admin', '/dashboard']
  
  if (restrictedRoutes.some(route => pathname.startsWith(route))) {
    // In production, check for proper authentication here
    // For now, redirect to login if attempting to access restricted routes
    const hasAuth = request.cookies.get('sb-kvjblasewcrztzcfrkgq-auth-token')
    
    if (!hasAuth) {
      return NextResponse.redirect(new URL('/login?restricted=true', request.url))
    }
  }
  
  if (publicRoutes.includes(pathname) || 
      skipAuthRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // For all other routes, check authentication
  const hasAuth = request.cookies.get('sb-kvjblasewcrztzcfrkgq-auth-token')
  
  if (!hasAuth) {
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