'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react'
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

import { getSupplierById, deleteSupplier } from '@/lib/suppliers/api'
import type { Supplier } from '@/lib/suppliers/types'

/**
 * Supplier Detail Page
 * Read-only view of a supplier with Edit and Delete actions
 *
 * Clean Code Principles:
 * - Single Responsibility: Only displays supplier details
 * - KISS: Simple read-only display without complex logic
 * - Separation of Concerns: Data fetching separate from UI rendering
 */
export default function SupplierDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supplierId = params.id as string

  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
      } finally {
        setIsLoading(false)
      }
    }

    if (supplierId) {
      loadSupplier()
    }
  }, [supplierId])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this supplier?')) {
      return
    }

    try {
      const success = await deleteSupplier(supplierId)
      if (success) {
        toast.success('Supplier deleted successfully')
        router.push('/erp/suppliers')
      } else {
        toast.error('Failed to delete supplier')
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('An error occurred while deleting the supplier')
    }
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
              Loading supplier details...
            </p>
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              {supplier.name}
            </h1>
            <p className="text-sm text-muted-foreground">Supplier Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/erp/suppliers/${supplier.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Supplier identification and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Supplier Name
              </p>
              <p className="text-base font-semibold">{supplier.name}</p>
            </div>

            {supplier.code && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Supplier Code
                  </p>
                  <p className="text-base font-mono">{supplier.code}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <Badge
                variant={supplier.status === 'active' ? 'default' : 'secondary'}
              >
                {supplier.status}
              </Badge>
            </div>

            {supplier.category && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Category
                  </p>
                  <p className="text-base">{supplier.category.name}</p>
                  {supplier.category.description && (
                    <p className="text-sm text-muted-foreground">
                      {supplier.category.description}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Communication details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.email && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <a
                  href={`mailto:${supplier.email}`}
                  className="text-base text-primary hover:underline"
                >
                  {supplier.email}
                </a>
              </div>
            )}

            {supplier.phone && (
              <>
                {supplier.email && <Separator />}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone
                  </p>
                  <a
                    href={`tel:${supplier.phone}`}
                    className="text-base text-primary hover:underline"
                  >
                    {supplier.phone}
                  </a>
                </div>
              </>
            )}

            {supplier.address && (
              <>
                {(supplier.email || supplier.phone) && <Separator />}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Address
                  </p>
                  <p className="text-base whitespace-pre-line">
                    {supplier.address}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Procurement Terms */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Procurement Terms</CardTitle>
            <CardDescription>Payment and delivery information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {supplier.payment_terms && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Payment Terms
                </p>
                <p className="text-base">{supplier.payment_terms}</p>
              </div>
            )}

            {supplier.lead_time_days !== null && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Lead Time
                </p>
                <p className="text-base">{supplier.lead_time_days} days</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
            <CardDescription>Audit trail information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Created At
              </p>
              <p className="text-base">{formatDate(supplier.created_at)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <p className="text-base">{formatDate(supplier.updated_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
