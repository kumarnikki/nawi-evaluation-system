import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { UserRole } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  /** The page / layout to render when access is granted */
  children: React.ReactNode
  /**
   * Optional whitelist of roles allowed to view this route.
   * When omitted any authenticated user may access the route.
   */
  roles?: UserRole[]
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Route guard component.
 *
 * Behaviour matrix:
 * | Auth state | Roles prop | Outcome                                |
 * |------------|-----------|----------------------------------------|
 * | loading    | any       | Full-screen spinner                    |
 * | not authed | any       | Redirect to /login (preserves `from`) |
 * | authed     | none      | Render children                        |
 * | authed     | match     | Render children                        |
 * | authed     | no match  | Inline "Access Denied" message         |
 */
export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location          = useLocation()

  /* ── 1. Loading state ───────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  /* ── 2. Not authenticated ───────────────────────────────────────────────── */
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  /* ── 3. Role check ──────────────────────────────────────────────────────── */
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-red-100 p-8 text-center">
          {/* Shield icon inline SVG to avoid extra dependency */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-14 w-14 text-red-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2.25c-4.243 0-7.875 1.628-10.607 4.285A.75.75 0 001.25 7.5v4.714c0 5.424 3.766 10.204 9 11.408a1.5 1.5 0 00.5.128 1.5 1.5 0 00.5-.128c5.234-1.204 9-5.984 9-11.408V7.5a.75.75 0 00-.143-.465A15.053 15.053 0 0012 2.25z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.008"
            />
          </svg>

          <h1 className="text-xl font-bold text-navy-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm mb-1">
            You do not have permission to view this page.
          </p>
          <p className="text-gray-400 text-xs">
            Required role{roles.length > 1 ? 's' : ''}:{' '}
            <span className="font-semibold text-navy-700">{roles.join(', ')}</span>
            {' '}· Your role:{' '}
            <span className="font-semibold text-navy-700">{user.role}</span>
          </p>
        </div>
      </div>
    )
  }

  /* ── 4. Access granted ──────────────────────────────────────────────────── */
  return <>{children}</>
}

export default ProtectedRoute

