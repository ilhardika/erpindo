'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { Module } from '@/types/modules'

interface DashboardLayoutProps {
  children: React.ReactNode
  modules: Module[]
  className?: string
}

export function DashboardLayout({
  children,
  modules,
  className,
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <aside className="hidden md:block border-r bg-muted/40">
        <Sidebar modules={modules} />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header with menu button */}
        <div className="md:hidden flex items-center justify-between border-b bg-background p-4">
          <h1 className="text-lg font-semibold">ERPindo</h1>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar modules={modules} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">{children}</div>
        </div>
      </main>
    </div>
  )
}

// Header component for pages
export function DashboardHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
