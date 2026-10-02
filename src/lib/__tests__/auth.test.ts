/**
 * auth.test.ts
 * Unit tests for authentication, mock sessions, and role checks.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { login, logout, getCurrentUser } from '@/lib/auth'
import { mockLogin, mockLogout, getMockSession, DEMO_ACCOUNTS } from '@/lib/mockAuth'

describe('Authentication & Mock Session Store', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('authenticates admin with valid credentials', async () => {
    const res = await login('admin@nawi.gov.in', 'Admin@123')
    expect(res.error).toBeNull()
    expect(res.user).not.toBeNull()
    expect(res.user?.role).toBe('admin')
    expect(res.user?.email).toBe('admin@nawi.gov.in')
  })

  it('authenticates with trimmed/case-insensitive email', async () => {
    const res = await login('  Admin@NAWI.gov.in  ', 'Admin@123')
    expect(res.error).toBeNull()
    expect(res.user?.role).toBe('admin')
  })

  it('rejects invalid password', async () => {
    const res = await login('admin@nawi.gov.in', 'WrongPassword')
    expect(res.error).toBe('Invalid email or password')
    expect(res.user).toBeNull()
  })

  it('rejects unknown email', async () => {
    const res = await login('unknown@user.com', 'Admin@123')
    expect(res.error).toBe('Invalid email or password')
    expect(res.user).toBeNull()
  })

  it('persists session in localStorage after login and clears on logout', async () => {
    await login('technician@nawi.gov.in', 'Tech@123')
    expect(getCurrentUser()?.role).toBe('technician')

    await logout()
    expect(getCurrentUser()).toBeNull()
  })

  it('verifies all 5 demo roles can log in', async () => {
    for (const acc of DEMO_ACCOUNTS) {
      const res = await login(acc.email, acc.password)
      expect(res.error).toBeNull()
      expect(res.user?.role).toBe(acc.user.role)
    }
  })
})
