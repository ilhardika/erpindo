import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// For client-side operations
export const createClientSupabase = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// For server-side operations with service role
export const createServiceSupabase = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

// Default client for most operations
export const supabase = createClientSupabase()
