import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - ERPindo',
  description: 'Sign in to ERPindo ERP System',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
