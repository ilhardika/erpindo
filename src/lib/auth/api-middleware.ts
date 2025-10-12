import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@/types/auth'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  company_id: string | null
  is_active: boolean
}

export async function withAuth(
  request: NextRequest,
  requiredRole?: UserRole
): Promise<{
  user: AuthenticatedUser | null
  response: NextResponse | null
}> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  try {
    // Get session from request
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        ),
      }
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, company_id, is_active')
      .eq('id', session.user.id)
      .single()

    if (profileError || !userProfile) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 }
        ),
      }
    }

    if (!userProfile.is_active) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'Account is inactive' },
          { status: 403 }
        ),
      }
    }

    // Check role permissions
    if (requiredRole && !hasRoleAccess(userProfile.role, requiredRole)) {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        ),
      }
    }

    return {
      user: userProfile as AuthenticatedUser,
      response: null,
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      ),
    }
  }
}

function hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    dev: 3,
    owner: 2,
    staff: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Helper function to create protected API routes
export function createProtectedApiRoute(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>,
  requiredRole?: UserRole
) {
  return async function (request: NextRequest) {
    const { user, response } = await withAuth(request, requiredRole)

    if (response) {
      return response
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    return handler(request, user)
  }
}
