import { NextRequest } from 'next/server'

// Simple mock API endpoints for user management
// TODO: Implement proper Supabase integration once database is set up

interface User {
  id: string
  email: string
  name: string
  role: 'dev' | 'owner' | 'staff'
  company_id: string | null
  is_active: boolean
  created_at: string
}

// Mock data - replace with actual database queries
const mockUsers: User[] = [
  {
    id: '1',
    email: 'dev@erpindo.com',
    name: 'System Administrator',
    role: 'dev',
    company_id: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let users = mockUsers

    if (role) {
      users = users.filter(user => user.role === role)
    }

    return Response.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, company_id } = body

    // Validate required fields
    if (!email || !password || !name || !role) {
      return Response.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    if (mockUsers.some(user => user.email === email)) {
      return Response.json(
        { error: 'Email address already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: role as 'dev' | 'owner' | 'staff',
      company_id,
      is_active: true,
      created_at: new Date().toISOString(),
    }

    mockUsers.push(newUser)

    return Response.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        company_id: newUser.company_id,
      },
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return Response.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
