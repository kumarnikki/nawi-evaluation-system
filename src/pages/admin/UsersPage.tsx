/**
 * UsersPage.tsx
 * Role-Based User Management Page for Legal Metrology Officers.
 */
import React, { useState } from 'react'
import { Users, Plus, Shield, Search, Mail, UserCheck, X } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import { DEMO_ACCOUNTS } from '@/lib/mockAuth'
import type { UserRole } from '@/types'

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  technician: 'bg-blue-100 text-blue-700 border-blue-200',
  reviewer: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approver: 'bg-green-100 text-green-700 border-green-200',
  viewer: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function UsersPage() {
  const [users, setUsers] = useState(DEMO_ACCOUNTS.map((a) => a.user))
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)

  // New user form state
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('technician')

  const filtered = users.filter((u) => {
    if (filterRole !== 'all' && u.role !== filterRole) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newEmail) return

    const newUser = {
      id: `user-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      labId: 'lab-001',
      createdAt: new Date().toISOString(),
    }

    setUsers([...users, newUser])
    setNewName('')
    setNewEmail('')
    setModalOpen(false)
  }

  return (
    <Layout title="User Management">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-navy-700" />
              Authorized Metrological Personnel
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Manage system access, laboratory assignments, and statutory signing roles.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-saffron flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Authorized Officer
          </button>
        </div>

        {/* Toolbar */}
        <div className="card grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search officer by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 text-sm"
            />
          </div>
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="form-input text-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">System Administrator</option>
              <option value="technician">Lab Technician</option>
              <option value="reviewer">Peer Reviewer</option>
              <option value="approver">Statutory Approver</option>
              <option value="viewer">Regulatory Viewer</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Officer Name</th>
                  <th className="table-header">Official Email</th>
                  <th className="table-header">Statutory Role</th>
                  <th className="table-header">Assigned Lab</th>
                  <th className="table-header">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-800 font-bold flex items-center justify-center text-xs">
                          {u.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <span className="font-semibold text-navy-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs text-gray-600">{u.email}</td>
                    <td className="table-cell">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                          ROLE_COLORS[u.role]
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="table-cell text-xs text-gray-500">
                      {u.labId ? 'NLML Delhi / Bay 1' : 'National Directorate'}
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
                        <UserCheck className="w-3.5 h-3.5" /> Active &amp; Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Officer Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-navy-900">Add Authorized Officer</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="form-label">Full Name &amp; Designation *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Smt. Anita Desai"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Government Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. anita.desai@nawi.gov.in"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Assigned Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="form-input"
                  >
                    <option value="technician">Lab Technician (Create &amp; Test)</option>
                    <option value="reviewer">Peer Reviewer (Audit &amp; Check)</option>
                    <option value="approver">Approver (Sign &amp; Certify)</option>
                    <option value="admin">System Administrator</option>
                    <option value="viewer">Regulatory Viewer (Read Only)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-saffron">
                    Save Personnel Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
