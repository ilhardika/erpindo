import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // For now, let RouteGuard handle authentication on client-side
  // This is more reliable for Supabase session management
  const pathname = request.nextUrl.pathname

  // Only protect specific sensitive routes that absolutely need server-side protection
  const adminRoutes = ['/api/admin', '/system/admin']
  const needsServerProtection = adminRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (needsServerProtection) {
    // Only apply server-side auth for admin routes
    return handleServerAuth(request)
  }

  // For all other routes, let client-side RouteGuard handle it
  return NextResponse.next()
}

async function handleServerAuth(request: NextRequest) {
  // Original middleware code for admin routes only
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  const publicRoutes = ['/', '/login']
  const isPublicRoute = publicRoutes.includes(pathname)

  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && pathname === '/login') {
    // Get user profile to determine correct dashboard
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userProfile) {
      const dashboardRoute = getDashboardRoute(userProfile.role)

      return NextResponse.redirect(new URL(dashboardRoute, request.url))
    } else {
    }
  }

  // Role-based route protection
  if (session && !isPublicRoute) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    if (!userProfile || !userProfile.is_active) {
      // User not found or inactive, sign out and redirect to login
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check role-based access
    const hasAccess = checkRouteAccess(pathname, userProfile.role)

    if (!hasAccess) {
      // Redirect to appropriate dashboard
      const dashboardRoute = getDashboardRoute(userProfile.role)

      return NextResponse.redirect(new URL(dashboardRoute, request.url))
    } else {
    }
  }

  return response
}

function getDashboardRoute(role: string): string {
  switch (role) {
    case 'dev':
      return '/system/dashboard'
    case 'owner':
      return '/company/dashboard'
    case 'staff':
      return '/erp/dashboard'
    default:
      return '/login'
  }
}

function checkRouteAccess(pathname: string, role: string): boolean {
  // System routes - only dev
  if (pathname.startsWith('/system')) {
    const hasAccess = role === 'dev'
    return hasAccess
  }

  // Company routes - dev and owner
  if (pathname.startsWith('/company')) {
    const hasAccess = role === 'dev' || role === 'owner'
    return hasAccess
  }

  // ERP routes - all authenticated users
  if (pathname.startsWith('/erp')) {
    return true
  }

  // Dashboard route - redirect to role-specific dashboard
  if (pathname === '/dashboard') {
    return false // Will trigger redirect to role-specific dashboard
  }

  return true
}

export const config = {
  matcher: [
    // Only protect admin/sensitive routes server-side
    '/api/admin/:path*',
    '/system/admin/:path*',
  ],
}
