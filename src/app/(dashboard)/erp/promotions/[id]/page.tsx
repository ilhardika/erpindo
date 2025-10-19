'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  Calendar,
  Tag,
  DollarSign,
  Users,
  ArrowLeft,
  Edit,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DetailLayout } from '@/components/layouts/detail-layout'
import { getPromotionById, deletePromotion } from '@/lib/promotions/api'
import type { Promotion } from '@/types/promotions'

export default function PromotionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const promotionId = params.id as string

  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

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

  const handleDelete = async () => {
    if (!promotion) return

    if (!confirm('Are you sure you want to delete this promotion?')) return

    try {
      setDeleting(true)
      await deletePromotion(promotion.id)
      toast.success('Promotion deleted successfully')
      router.push('/erp/promotions')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete promotion'
      )
    } finally {
      setDeleting(false)
    }
  }

  // Get status badge
  const getStatusBadge = () => {
    if (!promotion) return null

    const now = new Date()
    const startDate = new Date(promotion.start_date)
    const endDate = new Date(promotion.end_date)

    if (promotion.status === 'cancelled') {
      return <Badge variant="secondary">Cancelled</Badge>
    }
    if (promotion.status === 'draft') {
      return <Badge variant="outline">Draft</Badge>
    }
    if (now < startDate) {
      return <Badge className="bg-blue-500">Scheduled</Badge>
    }
    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (promotion.is_active) {
      return <Badge className="bg-green-500">Active</Badge>
    }
    return <Badge variant="secondary">Inactive</Badge>
  }

  // Format discount
  const formatDiscount = () => {
    if (!promotion) return '-'

    if (promotion.type === 'percentage') {
      return `${promotion.discount_value}%`
    }
    if (promotion.type === 'fixed') {
      return `Rp ${promotion.discount_value?.toLocaleString()}`
    }
    if (promotion.type === 'buy_x_get_y') {
      return `Buy ${promotion.buy_quantity} Get ${promotion.get_quantity}`
    }
    return '-'
  }

  if (loading) {
    return (
      <DetailLayout title="Loading..." subtitle="Please wait...">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Loading promotion details...
            </p>
          </CardContent>
        </Card>
      </DetailLayout>
    )
  }

  if (!promotion) {
    return null
  }

  return (
    <DetailLayout
      title={promotion.name}
      subtitle={`Promotion Code: ${promotion.code}`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/erp/promotions/${promotion.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Tag className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Promotion Code
                  </p>
                  <p className="text-base font-semibold">{promotion.code}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Promotion Type
                  </p>
                  <p className="text-base font-semibold capitalize">
                    {promotion.type.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Discount Value
                  </p>
                  <p className="text-base font-semibold">{formatDiscount()}</p>
                </div>
              </div>
            </div>

            {promotion.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 text-base">{promotion.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Validity Period */}
        <Card>
          <CardHeader>
            <CardTitle>Validity Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Start Date
                  </p>
                  <p className="text-base font-semibold">
                    {new Date(promotion.start_date).toLocaleDateString(
                      'en-US',
                      {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    End Date
                  </p>
                  <p className="text-base font-semibold">
                    {new Date(promotion.end_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Rules */}
        {(promotion.min_purchase_amount || promotion.max_discount_amount) && (
          <Card>
            <CardHeader>
              <CardTitle>Purchase Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {promotion.min_purchase_amount && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Minimum Purchase
                      </p>
                      <p className="text-base font-semibold">
                        Rp {promotion.min_purchase_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {promotion.max_discount_amount && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Maximum Discount Cap
                      </p>
                      <p className="text-base font-semibold">
                        Rp {promotion.max_discount_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Segment */}
        {promotion.customer_segment && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Targeting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <Users className="mt-1 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Customer Segment
                  </p>
                  <p className="text-base font-semibold">
                    {promotion.customer_segment}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="flex justify-start">
          <Button
            variant="outline"
            onClick={() => router.push('/erp/promotions')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Promotions
          </Button>
        </div>
      </div>
    </DetailLayout>
  )
}
