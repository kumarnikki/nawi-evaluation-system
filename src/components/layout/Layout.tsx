import React, { useState, useCallback } from 'react'
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Archive,
  Scale,
  Award,
  Settings,
  Users,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

// ─── DoCA / NAWI emblem SVG ──────────────────────────────────────────────────

function DocaEmblem() {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 shrink-0"
      aria-label="Department of Consumer Affairs emblem"
      role="img"
    >
      {/* Outer ring */}
      <circle cx="40" cy="40" r="38" fill="none" stroke="#FF9933" strokeWidth="2" />
      {/* Inner ring */}
      <circle cx="40" cy="40" r="30" fill="none" stroke="#FF9933" strokeWidth="1" opacity="0.6" />
      {/* Ashoka wheel spokes – simplified 24-spoke */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i * 360) / 24
        const rad   = (angle * Math.PI) / 180
        const x1    = 40 + 10 * Math.cos(rad)
        const y1    = 40 + 10 * Math.sin(rad)
        const x2    = 40 + 26 * Math.cos(rad)
        const y2    = 40 + 26 * Math.sin(rad)
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#4ea6d8"
            strokeWidth="1"
            opacity="0.8"
          />
        )
      })}
      {/* Hub */}
      <circle cx="40" cy="40" r="6" fill="#FF9933" opacity="0.9" />
      <circle cx="40" cy="40" r="3" fill="#ffffff" />
      {/* Scale / balance beam – symbol of Legal Metrology */}
      <line x1="28" y1="58" x2="52" y2="58" stroke="#FF9933" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="52" x2="40" y2="58" stroke="#FF9933" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="52" x2="52" y2="52" stroke="#FF9933" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="28" cy="55" r="2.5" fill="none" stroke="#FF9933" strokeWidth="1" />
      <circle cx="52" cy="55" r="2.5" fill="none" stroke="#FF9933" strokeWidth="1" />
    </svg>
  )
}

// ─── Nav item definition ─────────────────────────────────────────────────────

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  /** Roles that may see this item; undefined → visible to all authenticated users */
  allowedRoles?: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to:    '/dashboard',
    icon:  <LayoutDashboard className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'New Evaluation',
    to:    '/reports/new',
    icon:  <FilePlus2 className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'Reports',
    to:    '/reports',
    icon:  <FileText className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'Repository',
    to:    '/repository',
    icon:  <Archive className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'Instruments',
    to:    '/instruments',
    icon:  <Scale className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'Certificates',
    to:    '/certificates',
    icon:  <Award className="h-5 w-5 shrink-0" />,
  },
  {
    label: 'Rule Sets',
    to:    '/rulesets',
    icon:  <Settings className="h-5 w-5 shrink-0" />,
  },
  {
    label:        'Users',
    to:           '/users',
    icon:         <Users className="h-5 w-5 shrink-0" />,
    allowedRoles: ['admin', 'approver', 'reviewer'],
  },
  {
    label: 'Profile',
    to:    '/profile',
    icon:  <User className="h-5 w-5 shrink-0" />,
  },
]

// ─── Sidebar content (shared between desktop + mobile) ───────────────────────

interface SidebarContentProps {
  onNavigate?: () => void
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { user, logout } = useAuth()
  const location         = useLocation()
  const navigate         = useNavigate()

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.allowedRoles) return true
    return user ? item.allowedRoles.includes(user.role) : false
  })

  return (
    <div className="flex flex-col h-full">
      {/* ── Brand header ── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-navy-700">
        <DocaEmblem />
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">NAWI</p>
          <p className="text-navy-300 text-[10px] leading-tight truncate">
            Type Evaluation System
          </p>
          <p className="text-navy-400 text-[9px] leading-tight truncate mt-0.5">
            DoCA · Legal Metrology
          </p>
        </div>
      </div>

      {/* Tricolour accent strip */}
      <div className="national-accent-bar" aria-hidden="true" />

      {/* ── Nav links ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Main navigation">
        {visibleItems.map((item) => {
          /*
           * "New Evaluation" should only be active when the URL is exactly
           * /reports/new, otherwise the "Reports" link (/reports) would also
           * match since it's a prefix.
           */
          const isActive = item.to === '/reports/new'
            ? location.pathname === '/reports/new'
            : location.pathname === item.to ||
              (item.to !== '/dashboard' && location.pathname.startsWith(item.to + '/'))

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/reports' || item.to === '/dashboard'}
              onClick={onNavigate}
              className={() =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* ── User strip + logout ── */}
      <div className="border-t border-navy-700 px-3 py-4 space-y-2 shrink-0">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-navy-800/60">
            {/* Avatar initials */}
            <span
              className="flex items-center justify-center h-8 w-8 rounded-full bg-saffron-500 text-white text-xs font-bold shrink-0 uppercase select-none"
              aria-hidden="true"
            >
              {user.name.trim().charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate leading-tight">{user.name}</p>
              <p className="text-navy-300 text-[10px] capitalize truncate leading-tight">{user.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="sidebar-link sidebar-link-inactive w-full text-left hover:text-red-300 group"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:text-red-300" aria-hidden="true" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>
    </div>
  )
}

// ─── Main Layout ─────────────────────────────────────────────────────────────

/**
 * Root application layout.
 *
 * Desktop  – fixed left sidebar (w-64) + scrollable main area.
 * Mobile   – hidden sidebar, hamburger button reveals a slide-in drawer
 *            with a semi-transparent overlay that closes on tap.
 *
 * Renders <Outlet /> so it integrates directly with react-router nested routes.
 */
export interface LayoutProps {
  children?: React.ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile                  = useCallback(() => setMobileOpen(false), [])
  const toggleMobile                 = useCallback(() => setMobileOpen((v) => !v), [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-64 bg-navy-900 shrink-0"
        aria-label="Application sidebar"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-navy-900 flex flex-col
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        {/* Close button */}
        <button
          onClick={closeMobile}
          className="absolute top-4 right-3 p-1.5 rounded-lg text-navy-300 hover:text-white hover:bg-navy-700 transition-colors"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onNavigate={closeMobile} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-navy-900 border-b border-navy-700 shrink-0">
          <button
            onClick={toggleMobile}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
            className="p-2 rounded-lg text-navy-200 hover:text-white hover:bg-navy-700 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <DocaEmblem />
            <span className="text-white font-bold text-sm">NAWI</span>
          </div>

          {/* Placeholder right slot for symmetry */}
          <span className="w-9" aria-hidden="true" />
        </header>

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default Layout

