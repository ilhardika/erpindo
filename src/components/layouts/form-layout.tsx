import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FormLayoutProps {
  title: string
  description: string
  children: ReactNode
}

/**
 * Form Layout
 * Reusable layout for create/edit form pages
 *
 * Clean Code Principles:
 * - DRY: Single layout for all form pages
 * - Consistency: Same structure across modules
 * - UX: Back button with icon for easy navigation
 */
export function FormLayout({ title, description, children }: FormLayoutProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Back Button */}
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
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Form Content */}
      {children}
    </div>
  )
}
