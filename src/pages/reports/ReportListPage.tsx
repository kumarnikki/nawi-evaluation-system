/**
 * ReportListPage.tsx
 * List all evaluation reports with search, filter, and pagination.
 */
import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Download,
  Printer,
} from 'lucide-react'
import mockDb from '@/data/mockDb'
import type { Report, ReportStatus, AccuracyClass } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { exportReportToPdf } from '@/export/pdfExport'
import { exportReportToDocx } from '@/export/docxExport'

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

const STATUS_COLORS: Record<ReportStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  submitted: 'bg-blue-100 text-blue-700 border-blue-300',
  under_review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  approved: 'bg-green-100 text-green-700 border-green-300',
  rejected: 'bg-red-100 text-red-700 border-red-300',
}

const CLASS_COLORS: Record<string, string> = {
  I: 'bg-purple-100 text-purple-800',
  II: 'bg-blue-100 text-blue-800',
  III: 'bg-green-100 text-green-800',
  IIII: 'bg-orange-100 text-orange-800',
}

const PAGE_SIZE = 10

function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ReportListPage() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ReportStatus>('all')
  const [classFilter, setClassFilter] = useState<'all' | AccuracyClass>('all')
  const [page, setPage] = useState(1)

  const allReports: Report[] = useMemo(() => mockDb.getReports(), [])

  const filtered = useMemo(() => {
    let result = allReports

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (r) =>
          r.reportNo.toLowerCase().includes(q) ||
          (r.instrument?.manufacturer ?? '').toLowerCase().includes(q) ||
          (r.instrument?.model ?? '').toLowerCase().includes(q) ||
          (r.instrument?.type_designation ?? '').toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter)
    }

    if (classFilter !== 'all') {
      result = result.filter((r) => r.instrument?.accuracy_class === classFilter)
    }

    return result
  }, [allReports, search, statusFilter, classFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(page, totalPages)

  const paged = useMemo(
    () => filtered.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE),
    [filtered, safeCurrentPage]
  )

  const canCreate = hasRole('admin', 'technician')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0d2137] text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <FileText size={20} className="text-[#FF9933]" />
              Evaluation Reports
            </h1>
            <p className="text-xs text-gray-300 mt-0.5">
              {filtered.length} report{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>
          {canCreate && (
            <Link
              to="/reports/new"
              className="flex items-center gap-2 bg-[#FF9933] hover:bg-orange-500 text-white font-bold text-sm px-4 py-2 rounded-xl shadow transition-colors"
            >
              <Plus size={16} />
              Create New
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by report no, instrument, manufacturer..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as typeof statusFilter)
                setPage(1)
              }}
              className="pl-8 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933] appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Class filter */}
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value as typeof classFilter)
              setPage(1)
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
          >
            <option value="all">All Classes</option>
            <option value="I">Class I</option>
            <option value="II">Class II</option>
            <option value="III">Class III</option>
            <option value="IIII">Class IIII</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0d2137] text-white text-xs uppercase">
                  <th className="px-4 py-3 text-left font-semibold">Report No.</th>
                  <th className="px-4 py-3 text-left font-semibold">Instrument</th>
                  <th className="px-4 py-3 text-left font-semibold">Lab</th>
                  <th className="px-4 py-3 text-left font-semibold">Class</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <FileText size={36} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-400 text-sm">No reports found.</p>
                      {canCreate && (
                        <Link
                          to="/reports/new"
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#FF9933] hover:underline"
                        >
                          <Plus size={14} /> Create the first report
                        </Link>
                      )}
                    </td>
                  </tr>
                )}
                {paged.map((report) => {
                  const lab = report.lab ?? mockDb.getLab(report.labId)
                  const cls = report.instrument?.accuracy_class
                  return (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-[#0d2137]">
                          {report.reportNo}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#0d2137] text-sm">
                          {report.instrument?.model ?? '—'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {report.instrument?.manufacturer ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {lab?.name ?? report.labId}
                      </td>
                      <td className="px-4 py-3">
                        {cls ? (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              CLASS_COLORS[cls] ?? 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {cls}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/reports/${report.id}`)}
                            className="flex items-center gap-1 text-xs font-semibold text-[#0d2137] hover:text-[#FF9933] transition-colors"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => exportReportToPdf(report)}
                            className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
                            title="Export PDF (A4 standard format)"
                          >
                            <Download size={12} />
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => exportReportToDocx(report)}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors"
                            title="Export Microsoft Word (.docx)"
                          >
                            <Download size={12} />
                            DOCX
                          </button>
                          {report.status === 'draft' && hasRole('admin', 'technician') && (
                            <button
                              type="button"
                              onClick={() => navigate(`/reports/${report.id}?edit=true`)}
                              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#FF9933] transition-colors"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <span className="text-xs text-gray-500">
                Showing {(safeCurrentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(safeCurrentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safeCurrentPage) <= 2
                  )
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    p === 'ellipsis' ? (
                      <span key={`e${idx}`} className="px-1 text-gray-400 text-xs">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          safeCurrentPage === p
                            ? 'bg-[#0d2137] text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-white'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
