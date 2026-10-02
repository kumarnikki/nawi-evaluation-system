import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, UserRole } from '@/types'
import { login as authLogin, logout as authLogout, getCurrentUser } from '@/lib/auth'
import { isMockMode, supabase } from '@/lib/supabase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  logout: () => Promise<void>
  hasRole: (...roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isMockMode) {
      setUser(getCurrentUser())
      setLoading(false)
      return
    }

    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          const u = data.session.user
          setUser({
            id: u.id,
            email: u.email!,
            name: u.user_metadata?.name ?? u.email!,
            role: u.user_metadata?.role ?? 'viewer',
            labId: u.user_metadata?.lab_id,
            createdAt: u.created_at,
          })
        }
        setLoading(false)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user
          setUser({
            id: u.id,
            email: u.email!,
            name: u.user_metadata?.name ?? u.email!,
            role: u.user_metadata?.role ?? 'viewer',
            labId: u.user_metadata?.lab_id,
            createdAt: u.created_at,
          })
        } else {
          setUser(null)
        }
      })
      return () => subscription.unsubscribe()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    const result = await authLogin(email, password)
    if (result.user) {
      setUser(result.user)
    }
    setLoading(false)
    return result
  }

  const logout = async () => {
    await authLogout()
    setUser(null)
  }

  const hasRole = (...roles: UserRole[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
