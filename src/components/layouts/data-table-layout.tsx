import { ReactNode } from 'react'

interface DataTableLayoutProps {
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}

/**
 * Data Table Layout
 * Reusable layout for list/table pages across all modules
 *
 * Clean Code Principles:
 * - DRY: Single source of truth for table page layout
 * - Consistency: Same layout structure for all modules
 * - Reusability: Can be used in any data table page
 * - Flexibility: Optional actions slot for buttons
 */
export function DataTableLayout({
  title,
  description,
  actions,
  children,
}: DataTableLayoutProps) {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {/* Actions slot for buttons */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
