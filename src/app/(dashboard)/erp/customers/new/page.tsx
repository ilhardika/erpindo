'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { CustomerForm } from '@/components/customers/customer-form'
import { FormLayout } from '@/components/layouts'
import { createCustomer } from '@/lib/customers/api'
import type { CustomerFormData } from '@/lib/customers/validation'

/**
 * New Customer Page
 * Create new customer with form validation and error handling
 *
 * Clean Code Principles:
 * - Single Responsibility: Only handles new customer creation flow
 * - Separation of Concerns: Form UI in CustomerForm, API calls here, validation in schema
 * - KISS: Simple page structure with clear purpose
 */
export default function NewCustomerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true)

      // Create customer via API
      await createCustomer({
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        category_id: data.category_id,
        credit_limit: data.credit_limit,
        status: data.status,
      })

      toast.success('Customer created successfully')

      // Redirect to customer list
      router.push('/erp/customers')
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create customer'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <FormLayout
      title="Create New Customer"
      description="Add a new customer to your database"
    >
      {/* Form */}
      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </FormLayout>
  )
}
