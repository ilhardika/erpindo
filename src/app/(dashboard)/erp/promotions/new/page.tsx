'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FormLayout } from '@/components/layouts/form-layout'
import {
  PromotionForm,
  type PromotionFormData,
} from '@/components/promotions/promotion-form'
import { createPromotion } from '@/lib/promotions/api'

export default function NewPromotionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: PromotionFormData) => {
    try {
      setIsLoading(true)

      // Transform data for API
      const promotionData = {
        name: data.name,
        code: data.code,
        type: data.type,
        description: data.description || undefined,
        discount_value: data.discount_value || undefined,
        buy_quantity: data.buy_quantity || undefined,
        get_quantity: data.get_quantity || undefined,
        start_date: data.start_date,
        end_date: data.end_date,
        min_purchase_amount: data.min_purchase_amount || undefined,
        max_discount_amount: data.max_discount_amount || undefined,
        customer_segment: data.customer_segment || undefined,
        status: data.status,
        is_active: data.is_active,
        product_ids: data.product_ids || [],
        category_ids: data.category_ids || [],
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createPromotion(promotionData as any)
      toast.success('Promotion created successfully')
      router.push('/erp/promotions')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create promotion'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/erp/promotions')
  }

  return (
    <FormLayout
      title="New Promotion"
      description="Create a new promotional offer"
    >
      <PromotionForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </FormLayout>
  )
}
