import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthActions } from '@/stores/authStore'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'

// Placeholder pages for other routes
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600">Halaman ini sedang dalam pengembangan</p>
    </div>
  </div>
)

function App() {
  const { initializeAuth } = useAuthActions()

  // Initialize authentication on app start
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes with dashboard layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* POS */}
          <Route path="pos" element={
            <ProtectedRoute requiredPermissions={['orders.create']}>
              <PlaceholderPage title="Kasir (POS)" />
            </ProtectedRoute>
          } />

          {/* Products */}
          <Route path="products" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']} requiredPermissions={['products.manage']}>
              <PlaceholderPage title="Manajemen Produk" />
            </ProtectedRoute>
          } />

          {/* Customers */}
          <Route path="customers" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']} requiredPermissions={['customers.manage']}>
              <PlaceholderPage title="Manajemen Pelanggan" />
            </ProtectedRoute>
          } />

          {/* Orders */}
          <Route path="orders" element={
            <ProtectedRoute requiredPermissions={['orders.view']}>
              <PlaceholderPage title="Pesanan" />
            </ProtectedRoute>
          } />

          {/* Invoices */}
          <Route path="invoices" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']} requiredPermissions={['orders.manage']}>
              <PlaceholderPage title="Faktur" />
            </ProtectedRoute>
          } />

          {/* Reports */}
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']} requiredPermissions={['reports.view']}>
              <PlaceholderPage title="Laporan" />
            </ProtectedRoute>
          } />

          {/* Payments */}
          <Route path="payments" element={
            <ProtectedRoute allowedRoles={['owner', 'admin']} requiredPermissions={['orders.manage']}>
              <PlaceholderPage title="Pembayaran" />
            </ProtectedRoute>
          } />

          {/* User Management */}
          <Route path="users" element={
            <ProtectedRoute requiredRole="owner" requiredPermissions={['users.manage']}>
              <PlaceholderPage title="Manajemen User" />
            </ProtectedRoute>
          } />

          {/* Company Management */}
          <Route path="company" element={
            <ProtectedRoute requiredRole="owner" requiredPermissions={['tenant.manage']}>
              <PlaceholderPage title="Pengaturan Perusahaan" />
            </ProtectedRoute>
          } />

          {/* Settings */}
          <Route path="settings" element={<PlaceholderPage title="Pengaturan" />} />
          <Route path="profile" element={<PlaceholderPage title="Profil Saya" />} />
        </Route>

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h1>
              <p className="text-gray-600 mb-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Kembali
              </button>
            </div>
          </div>
        } />

        {/* 404 page */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Halaman Tidak Ditemukan</h1>
              <p className="text-gray-600 mb-4">Halaman yang Anda cari tidak ada.</p>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App
