'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { FormLayout } from '@/components/layouts/form-layout'
import {
  PromotionForm,
  type PromotionFormData,
} from '@/components/promotions/promotion-form'
import { getPromotionById, updatePromotion } from '@/lib/promotions/api'
import type { Promotion } from '@/types/promotions'

export default function EditPromotionPage() {
  const router = useRouter()
  const params = useParams()
  const promotionId = params.id as string

  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadPromotion = async () => {
      try {
        setLoading(true)
        const data = await getPromotionById(promotionId)
        setPromotion(data)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Failed to load promotion'
        )
        router.push('/erp/promotions')
      } finally {
        setLoading(false)
      }
    }

    if (promotionId) {
      loadPromotion()
    }
  }, [promotionId, router])

  const handleSubmit = async (data: PromotionFormData) => {
    if (!promotion) return

    try {
      setIsSubmitting(true)

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
      await updatePromotion(promotion.id, promotionData as any)
      toast.success('Promotion updated successfully')
      router.push(`/erp/promotions/${promotion.id}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update promotion'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/erp/promotions/${promotionId}`)
  }

  if (loading) {
    return (
      <FormLayout title="Loading..." description="Please wait...">
        <div className="text-center">Loading promotion data...</div>
      </FormLayout>
    )
  }

  if (!promotion) {
    return null
  }

  return (
    <FormLayout
      title="Edit Promotion"
      description={`Editing: ${promotion.name}`}
    >
      <PromotionForm
        promotion={promotion}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </FormLayout>
  )
}
