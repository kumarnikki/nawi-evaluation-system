/**
 * ProfilePage.tsx
 * Authenticated officer profile, credentials summary, and active session view.
 */
import React, { useState } from 'react'
import { User, Shield, KeyRound, Building, CheckCircle2 } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { SEED_LABS } from '@/data/mockDb'

export default function ProfilePage() {
  const { user } = useAuth()
  const lab = SEED_LABS.find((l) => l.id === user?.labId)
  const [passwordToast, setPasswordToast] = useState(false)

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordToast(true)
    setTimeout(() => setPasswordToast(false), 4000)
  }

  return (
    <Layout title="Officer Profile">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Officer Profile &amp; Credentials</h1>
          <p className="text-gray-500 text-sm">
            Statutory metrology officer credentials and laboratory affiliation.
          </p>
        </div>

        {/* Profile Card */}
        <div className="card grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center text-center p-4 bg-navy-50 rounded-xl">
            <div className="w-20 h-20 rounded-full bg-navy-800 text-saffron-400 font-bold text-2xl flex items-center justify-center mb-3 shadow">
              {user?.name
                ?.split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('') || 'LM'}
            </div>
            <h2 className="font-bold text-navy-900 text-lg">{user?.name}</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 mt-1 rounded-full bg-navy-100 text-navy-800 capitalize">
              {user?.role} Officer
            </span>
          </div>

          <div className="md:col-span-2 space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400 block">Email Address</span>
                <span className="font-semibold text-navy-900 font-mono text-xs">{user?.email}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">User Identifier</span>
                <span className="font-semibold text-navy-900 font-mono text-xs">{user?.id}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Assigned Testing Facility</span>
                <span className="font-semibold text-navy-900 text-xs">
                  {lab?.name || 'National Legal Metrology Directorate, New Delhi'}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Statutory Clearance</span>
                <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
                  <Shield className="w-3.5 h-3.5" /> Full OIML R 76 Authority
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <KeyRound className="w-5 h-5 text-navy-700" />
            <h3 className="font-bold text-navy-900">Security &amp; Password Update</h3>
          </div>

          {passwordToast && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Password updated successfully in demo session storage.
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="form-label">Current Password</label>
              <input type="password" required className="form-input" placeholder="••••••••" />
            </div>
            <div>
              <label className="form-label">New Secure Password</label>
              <input type="password" required className="form-input" placeholder="••••••••" />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input type="password" required className="form-input" placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary text-sm">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
