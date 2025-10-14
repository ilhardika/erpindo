import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - ERPindo',
  description: 'Sign in to ERPindo ERP System',
}

import { AuthDebugger } from '@/components/debug/auth-debugger'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AuthDebugger />
      {children}
    </>
  )
}
