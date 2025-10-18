'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { SupplierForm } from '@/components/suppliers/supplier-form'
import { FormLayout } from '@/components/layouts'
import { getSupplierById, updateSupplier } from '@/lib/suppliers/api'
import type { Supplier } from '@/lib/suppliers/types'
import type { SupplierFormData } from '@/lib/suppliers/validation'

/**
 * Edit Supplier Page
 * Page for editing an existing supplier record
 *
 * Clean Code Principles:
 * - Single Responsibility: Only handles supplier editing flow
 * - DRY: Reuses SupplierForm component
 * - Separation of Concerns: Form logic in component, data loading in page
 */
export default function EditSupplierPage() {
  const router = useRouter()
  const params = useParams()
  const supplierId = params.id as string

  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load supplier data
  useEffect(() => {
    const loadSupplier = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getSupplierById(supplierId)
        setSupplier(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load supplier')
        toast.error('Failed to load supplier')
      } finally {
        setIsLoading(false)
      }
    }

    if (supplierId) {
      loadSupplier()
    }
  }, [supplierId])

  const handleSubmit = async (data: SupplierFormData) => {
    try {
      setIsSubmitting(true)

      // Update supplier via API
      const updated = await updateSupplier(supplierId, {
        name: data.name,
        code: data.code,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        category_id: data.category_id,
        payment_terms: data.payment_terms,
        lead_time_days: data.lead_time_days,
        status: data.status,
      })

      if (updated) {
        toast.success('Supplier updated successfully')
        router.push(`/erp/suppliers/${supplierId}`)
      } else {
        toast.error('Failed to update supplier')
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
      toast.error('An error occurred while updating the supplier')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/erp/suppliers/${supplierId}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading supplier...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !supplier) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-sm text-red-500">
              {error || 'Supplier not found'}
            </p>
            <Button onClick={() => router.push('/erp/suppliers')}>
              Back to Suppliers
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FormLayout title="Edit Supplier" description="Update supplier information">
      {/* Form */}
      <SupplierForm
        supplier={supplier}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </FormLayout>
  )
}
