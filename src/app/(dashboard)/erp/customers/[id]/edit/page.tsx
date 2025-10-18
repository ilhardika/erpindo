'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { CustomerForm } from '@/components/customers/customer-form'
import { getCustomerById, updateCustomer } from '@/lib/customers/api'
import type { Customer } from '@/types/customers'
import type { CustomerFormData } from '@/lib/customers/validation'

/**
 * Edit Customer Page
 * Edit existing customer with form validation and error handling
 *
 * Clean Code Principles:
 * - Single Responsibility: Only handles customer edit flow
 * - Separation of Concerns: Form UI in CustomerForm, API calls here, validation in schema
 * - KISS: Simple page structure with clear purpose
 * - DRY: Reuses CustomerForm component
 */
export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load customer data
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getCustomerById(customerId)
        setCustomer(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load customer')
        toast.error('Failed to load customer')
      } finally {
        setIsLoading(false)
      }
    }

    if (customerId) {
      loadCustomer()
    }
  }, [customerId])

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true)

      // Update customer via API
      await updateCustomer({
        id: customerId,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        category_id: data.category_id,
        credit_limit: data.credit_limit,
        status: data.status,
      })

      toast.success('Customer updated successfully')

      // Redirect to customer detail
      router.push(`/erp/customers/${customerId}`)
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update customer'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/erp/customers/${customerId}`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading customer...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !customer) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <p className="text-sm text-red-500">
              {error || 'Customer not found'}
            </p>
            <Button onClick={() => router.push('/erp/customers')}>
              Back to Customers
            </Button>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold tracking-tight">Edit Customer</h1>
          <p className="text-sm text-muted-foreground">
            Update customer information
          </p>
        </div>
      </div>

      {/* Form */}
      <CustomerForm
        customer={customer}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  )
}
