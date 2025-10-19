'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableLayout } from '@/components/layouts/data-table-layout'
import { PromotionTable } from '@/components/promotions/promotion-table'
import { getPromotions } from '@/lib/promotions/api'
import type { Promotion, PromotionFilters } from '@/types/promotions'

export default function PromotionsPage() {
  const router = useRouter()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PromotionFilters>({})

  // Load promotions
  const loadPromotions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPromotions(filters)
      setPromotions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promotions')
    } finally {
      setLoading(false)
    }
  }

  // Load on mount and filter changes
  useEffect(() => {
    loadPromotions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.status])

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<PromotionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  return (
    <DataTableLayout
      title="Promotions"
      description="Manage promotional offers and discounts"
      actions={
        <Button onClick={() => router.push('/erp/promotions/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Promotion
        </Button>
      }
    >
      <PromotionTable
        promotions={promotions}
        loading={loading}
        error={error}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={loadPromotions}
      />
    </DataTableLayout>
  )
}
