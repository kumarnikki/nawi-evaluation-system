import { supabase, isMockMode } from './supabase'
import { mockLogin, mockLogout, getMockSession } from './mockAuth'
import type { User } from '@/types'

export async function login(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  if (isMockMode) {
    const user = mockLogin(email, password)
    if (!user) return { user: null, error: 'Invalid email or password' }
    return { user, error: null }
  }
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password })
  if (error) return { user: null, error: error.message }
  // map supabase user to our User type
  const profile = data.user?.user_metadata
  return {
    user: {
      id: data.user!.id,
      email: data.user!.email!,
      name: profile?.name ?? email,
      role: profile?.role ?? 'viewer',
      labId: profile?.lab_id,
      createdAt: data.user!.created_at,
    },
    error: null,
  }
}

export async function logout(): Promise<void> {
  if (isMockMode) {
    mockLogout()
    return
  }
  await supabase!.auth.signOut()
}

export function getCurrentUser(): User | null {
  if (isMockMode) return getMockSession()
  return null // handled by supabase session listener
}
