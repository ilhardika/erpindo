'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Edit,
  Loader2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DetailLayout } from '@/components/layouts'

import { getCustomerById, deleteCustomer } from '@/lib/customers/api'
import type { Customer } from '@/types/customers'

/**
 * Customer Detail Page (View Only)
 * Display customer information in read-only mode
 *
 * Clean Code Principles:
 * - Single Responsibility: Only displays customer details
 * - Separation of Concerns: Display logic separate from edit logic
 * - KISS: Simple, clear information display
 */
export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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

  // Handle delete
  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this customer? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      await deleteCustomer(customerId)
      toast.success('Customer deleted successfully')
      router.push('/erp/customers')
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete customer'
      )
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(dateString))
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading customer details...
            </p>
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
    <DetailLayout
      title={customer.name}
      subtitle="Customer Details"
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => router.push(`/erp/customers/${customerId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Customer identification and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Customer Name
              </p>
              <p className="text-base font-semibold">{customer.name}</p>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Category
              </p>
              <Badge variant="outline" className="font-normal">
                {customer.category?.name || 'Uncategorized'}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge
                variant={customer.status === 'active' ? 'default' : 'secondary'}
              >
                {customer.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How to reach this customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customer.email && (
              <>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="text-base">{customer.email}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {customer.phone && (
              <>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Phone
                    </p>
                    <p className="text-base">{customer.phone}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Address
                  </p>
                  <p className="text-base whitespace-pre-wrap">
                    {customer.address}
                  </p>
                </div>
              </div>
            )}

            {!customer.email && !customer.phone && !customer.address && (
              <p className="text-sm text-muted-foreground">
                No contact information available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
            <CardDescription>Credit limit and payment terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Credit Limit
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(Number(customer.credit_limit))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
            <CardDescription>Creation and modification details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base">{formatDate(customer.created_at)}</p>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-base">{formatDate(customer.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => router.push('/erp/customers')}>
          Back to List
        </Button>
      </div>
    </DetailLayout>
  )
}
