'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { SupplierForm } from '@/components/suppliers/supplier-form'
import { createSupplier } from '@/lib/suppliers/api'
import type { SupplierFormData } from '@/lib/suppliers/validation'

/**
 * Create Supplier Page
 * Page for creating a new supplier record
 *
 * Clean Code Principles:
 * - Single Responsibility: Only handles supplier creation flow
 * - DRY: Reuses SupplierForm component
 * - Separation of Concerns: Form logic in component, data loading in page
 */
export default function CreateSupplierPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: SupplierFormData) => {
    try {
      setIsSubmitting(true)

      // Create supplier via API
      const supplier = await createSupplier({
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

      if (supplier) {
        toast.success('Supplier created successfully')
        router.push(`/erp/suppliers/${supplier.id}`)
      } else {
        toast.error('Failed to create supplier')
      }
    } catch (error) {
      console.error('Error creating supplier:', error)
      toast.error('An error occurred while creating the supplier')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Supplier
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new supplier to your database
          </p>
        </div>
      </div>

      {/* Form */}
      <SupplierForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}
