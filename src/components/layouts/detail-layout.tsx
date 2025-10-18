import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DetailLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

/**
 * Detail Layout
 * Reusable layout for detail/view pages
 *
 * Clean Code Principles:
 * - DRY: Single layout for all detail pages
 * - Consistency: Same structure across modules
 * - Flexibility: Optional subtitle and action buttons
 */
export function DetailLayout({
  title,
  subtitle,
  actions,
  children,
}: DetailLayoutProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Back Button, Title, and Actions */}
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
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Buttons (Edit, Delete, etc.) */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Detail Content (Cards) */}
      {children}
    </div>
  )
}
