import type { User, UserRole } from '@/types'

export const DEMO_ACCOUNTS: Array<{ email: string; password: string; user: User }> = [
  {
    email: 'admin@nawi.gov.in',
    password: 'Admin@123',
    user: {
      id: 'user-admin-001',
      email: 'admin@nawi.gov.in',
      name: 'Dr. Rajesh Kumar',
      role: 'admin' as UserRole,
      labId: 'lab-001',
      createdAt: '2026-01-01T00:00:00Z',
    },
  },
  {
    email: 'technician@nawi.gov.in',
    password: 'Tech@123',
    user: {
      id: 'user-tech-001',
      email: 'technician@nawi.gov.in',
      name: 'Priya Sharma',
      role: 'technician' as UserRole,
      labId: 'lab-001',
      createdAt: '2026-01-01T00:00:00Z',
    },
  },
  {
    email: 'reviewer@nawi.gov.in',
    password: 'Review@123',
    user: {
      id: 'user-rev-001',
      email: 'reviewer@nawi.gov.in',
      name: 'Amit Verma',
      role: 'reviewer' as UserRole,
      labId: 'lab-002',
      createdAt: '2026-01-01T00:00:00Z',
    },
  },
  {
    email: 'approver@nawi.gov.in',
    password: 'Approve@123',
    user: {
      id: 'user-app-001',
      email: 'approver@nawi.gov.in',
      name: 'Dr. Sunita Patel',
      role: 'approver' as UserRole,
      labId: 'lab-002',
      createdAt: '2026-01-01T00:00:00Z',
    },
  },
  {
    email: 'viewer@nawi.gov.in',
    password: 'View@123',
    user: {
      id: 'user-view-001',
      email: 'viewer@nawi.gov.in',
      name: 'Rakesh Singh',
      role: 'viewer' as UserRole,
      createdAt: '2026-01-01T00:00:00Z',
    },
  },
]

const SESSION_KEY = 'nawi_mock_session'

export function mockLogin(email: string, password: string): User | null {
  const cleanEmail = email.trim().toLowerCase()
  const cleanPassword = password.trim()

  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === cleanEmail && a.password === cleanPassword
  )
  if (!account) return null
  localStorage.setItem(SESSION_KEY, JSON.stringify(account.user))
  return account.user
}

export function mockLogout(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getMockSession(): User | null {
  const data = localStorage.getItem(SESSION_KEY)
  if (!data) return null
  try {
    return JSON.parse(data) as User
  } catch {
    return null
  }
}
