import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Spinner from '@/components/ui/Spinner'

// Eagerly loaded pages
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'

// Lazily loaded for code splitting
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const NewEvaluationPage = lazy(() => import('@/pages/reports/NewEvaluationPage'))
const ReportListPage = lazy(() => import('@/pages/reports/ReportListPage'))
const ReportDetailPage = lazy(() => import('@/pages/reports/ReportDetailPage'))
const ReportPrintPage = lazy(() => import('@/pages/reports/ReportPrintPage'))
const RepositoryPage = lazy(() => import('@/pages/repository/RepositoryPage'))
const InstrumentHistoryPage = lazy(() => import('@/pages/instruments/InstrumentHistoryPage'))
const InstrumentsPage = lazy(() => import('@/pages/instruments/InstrumentsPage'))
const CertificatesPage = lazy(() => import('@/pages/certificates/CertificatesPage'))
const CertificateDetailPage = lazy(() => import('@/pages/certificates/CertificateDetailPage'))
const CertificateNewPage = lazy(() => import('@/pages/certificates/CertificateNewPage'))
const RulesetManagerPage = lazy(() => import('@/pages/admin/RulesetManagerPage'))
const UsersPage = lazy(() => import('@/pages/admin/UsersPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const VerifyPage = lazy(() => import('@/pages/public/VerifyPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SuspenseWrapper>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/verify/:type/:id" element={<VerifyPage />} />

            {/* Protected routes — any authenticated user */}
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute><ReportListPage /></ProtectedRoute>
            } />
            <Route path="/reports/new" element={
              <ProtectedRoute roles={['admin', 'technician']}><NewEvaluationPage /></ProtectedRoute>
            } />
            <Route path="/reports/:id" element={
              <ProtectedRoute><ReportDetailPage /></ProtectedRoute>
            } />
            <Route path="/reports/:id/print" element={
              <ProtectedRoute><ReportPrintPage /></ProtectedRoute>
            } />
            <Route path="/repository" element={
              <ProtectedRoute><RepositoryPage /></ProtectedRoute>
            } />
            <Route path="/instruments" element={
              <ProtectedRoute><InstrumentsPage /></ProtectedRoute>
            } />
            <Route path="/instruments/:id/history" element={
              <ProtectedRoute><InstrumentHistoryPage /></ProtectedRoute>
            } />
            <Route path="/certificates" element={
              <ProtectedRoute><CertificatesPage /></ProtectedRoute>
            } />
            <Route path="/certificates/new" element={
              <ProtectedRoute roles={['admin', 'approver']}><CertificateNewPage /></ProtectedRoute>
            } />
            <Route path="/certificates/:id" element={
              <ProtectedRoute><CertificateDetailPage /></ProtectedRoute>
            } />

            {/* Admin-only routes */}
            <Route path="/rulesets" element={
              <ProtectedRoute roles={['admin']}><RulesetManagerPage /></ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute roles={['admin', 'approver', 'reviewer']}><UsersPage /></ProtectedRoute>
            } />

            {/* User profile */}
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </SuspenseWrapper>
      </AuthProvider>
    </BrowserRouter>
  )
}
