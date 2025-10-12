'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { UserProfile, AuthContextType } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProfileFetching, setIsProfileFetching] = useState(false)

  // Add cache to prevent redundant API calls
  const profileCacheRef = useRef<{
    userId: string
    profile: UserProfile
  } | null>(null)

  useEffect(() => {
    let isMounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!isMounted) return

        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ [AuthProvider] Error getting initial session:', error)
        if (isMounted) setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes - ultra simplified to prevent loops
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      // Handle sign out
      if (event === 'SIGNED_OUT' || !session?.user) {
        // Clear cache immediately
        profileCacheRef.current = null
        setUser(null)
        setUserProfile(null)
        setLoading(false)
        return
      }

      // Handle sign in - ignore TOKEN_REFRESHED to prevent loops
      if (event === 'SIGNED_IN') {
        const newUser = session.user
        setUser(newUser)

        // Fetch profile only once per user session
        setLoading(true)
        await fetchUserProfile(newUser.id)
      }

      // For TOKEN_REFRESHED, just update user but don't refetch profile
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
        // Don't refetch profile, just ensure loading is false if we have profile
        if (userProfile) {
          setLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async (userId: string) => {
    // Check cache first
    if (profileCacheRef.current?.userId === userId) {
      setUserProfile(profileCacheRef.current.profile)
      setLoading(false)
      return
    }

    // Strict prevention of duplicate calls
    if (isProfileFetching) {
      return
    }

    if (userProfile?.id === userId) {
      setLoading(false)
      return
    }

    try {
      setIsProfileFetching(true)

      const { data, error } = await supabase
        .from('users')
        .select(
          `
          id,
          email,
          name,
          role,
          company_id,
          is_active
        `
        )
        .eq('id', userId)
        .single()

      if (error || !data) {
        throw error || new Error('User not found')
      }

      const userData = data as UserProfile

      // Get company info if exists
      let companyData = null
      if (userData.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('id, name, is_active')
          .eq('id', userData.company_id)
          .single()

        companyData = company
      }

      const profileData = {
        ...userData,
        companies: companyData || undefined,
      }

      // Cache the profile
      profileCacheRef.current = { userId, profile: profileData }
      setUserProfile(profileData)
    } catch (error) {
      console.error('❌ [AuthProvider] Error fetching user profile:', error)
      setUserProfile(null)
    } finally {
      setLoading(false)
      setIsProfileFetching(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ [AuthProvider] Supabase signIn error:', error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear cache
    profileCacheRef.current = null
    setUser(null)
    setUserProfile(null)
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    refreshProfile: () => user && fetchUserProfile(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
