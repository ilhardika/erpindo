'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/auth-provider'
import { Module } from '@/types/modules'

export function useUserModules() {
  const { userProfile } = useAuth()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userProfile) {
      setModules([])
      setLoading(false)
      return
    }

    fetchUserModules()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile])

  const fetchUserModules = async () => {
    if (!userProfile) return

    try {
      setLoading(true)
      setError(null)

      // Get all active modules
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('sort_order')

      if (moduleError) throw moduleError

      if (!moduleData) {
        setModules([])
        return
      }

      // Filter modules based on user role (simplified for Phase 1)
      const filteredModules = moduleData.filter((module: Module) => {
        switch (userProfile.role) {
          case 'dev':
            return true // Dev can see all modules
          case 'owner':
            return ['company', 'erp'].includes(module.category)
          case 'staff':
            return module.category === 'erp'
          default:
            return false
        }
      })

      setModules(filteredModules)
    } catch (err) {
      console.error('Error fetching user modules:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch modules')
      setModules([])
    } finally {
      setLoading(false)
    }
  }

  return {
    modules,
    loading,
    error,
    refetch: fetchUserModules,
  }
}
