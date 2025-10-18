'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { SupplierForm } from '@/components/suppliers/supplier-form'
import { FormLayout } from '@/components/layouts'
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
    <FormLayout
      title="Create New Supplier"
      description="Add a new supplier to your database"
    >
      {/* Form */}
      <SupplierForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </FormLayout>
  )
}
