'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { CustomerForm } from '@/components/customers/customer-form'
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
            Create New Customer
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a new customer to your database
          </p>
        </div>
      </div>

      {/* Form */}
      <CustomerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}
