/**
 * RepositoryPage.tsx
 * Searchable repository for all NAWI Type Evaluation Reports with advanced filters,
 * multi-field queries, pagination, and CSV export.
 */
import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react'
import Layout from '@/components/layout/Layout'
import mockDb, { SEED_INSTRUMENTS, SEED_LABS } from '@/data/mockDb'
import type { Report, ReportStatus, AccuracyClass } from '@/types'
import { format } from 'date-fns'
import { exportReportToPdf } from '@/export/pdfExport'
import { exportReportToDocx } from '@/export/docxExport'

const PAGE_SIZE = 10

export default function RepositoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [selectedVerdict, setSelectedVerdict] = useState<string>('all')
  const [selectedLab, setSelectedLab] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const allReports = mockDb.getReports()
  const labs = SEED_LABS

  const filteredReports = useMemo(() => {
    return allReports.filter((report) => {
      const inst = SEED_INSTRUMENTS.find((i) => i.id === report.instrumentId)

      // Search query across reportNo, model, manufacturer, serialNo
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchesQuery =
          report.reportNo.toLowerCase().includes(q) ||
          (inst?.model && inst.model.toLowerCase().includes(q)) ||
          (inst?.manufacturer && inst.manufacturer.toLowerCase().includes(q)) ||
          (inst?.serial_no && inst.serial_no.toLowerCase().includes(q))
        if (!matchesQuery) return false
      }

      // Status
      if (selectedStatus !== 'all' && report.status !== selectedStatus) {
        return false
      }

      // Accuracy Class
      if (selectedClass !== 'all' && inst?.accuracy_class !== selectedClass) {
        return false
      }

      // Verdict
      if (selectedVerdict === 'pass' && report.overallPass !== true) return false
      if (selectedVerdict === 'fail' && report.overallPass !== false) return false
      if (selectedVerdict === 'pending' && report.overallPass !== null) return false

      // Lab
      if (selectedLab !== 'all' && report.labId !== selectedLab) return false

      // Date range
      if (dateFrom && new Date(report.createdAt) < new Date(dateFrom)) return false
      if (dateTo && new Date(report.createdAt) > new Date(`${dateTo}T23:59:59`)) return false

      return true
    })
  }, [allReports, searchTerm, selectedStatus, selectedClass, selectedVerdict, selectedLab, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE))
  const paginatedReports = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredReports.slice(start, start + PAGE_SIZE)
  }, [filteredReports, page])

  const handleExportCSV = () => {
    const headers = [
      'Report No',
      'Instrument Model',
      'Manufacturer',
      'Serial No',
      'Class',
      'Max (g)',
      'e (g)',
      'Lab',
      'Status',
      'Verdict',
      'Created Date',
    ]

    const rows = filteredReports.map((r) => {
      const inst = SEED_INSTRUMENTS.find((i) => i.id === r.instrumentId)
      const lab = labs.find((l) => l.id === r.labId)
      return [
        `"${r.reportNo}"`,
        `"${inst?.model || ''}"`,
        `"${inst?.manufacturer || ''}"`,
        `"${inst?.serial_no || ''}"`,
        `"${inst?.accuracy_class || ''}"`,
        inst?.max_capacity || '',
        inst?.e || '',
        `"${lab?.name || ''}"`,
        `"${r.status}"`,
        r.overallPass === true ? 'PASS' : r.overallPass === false ? 'FAIL' : 'PENDING',
        format(new Date(r.createdAt), 'yyyy-MM-dd'),
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `NAWI_Repository_Export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Layout title="Report Repository">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
              <Archive className="w-6 h-6 text-navy-700" />
              Report Repository &amp; Archive
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Comprehensive statutory archive of all pattern evaluation records under OIML R 76.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="btn btn-outline flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Export Filtered CSV
          </button>
        </div>

        {/* Filters Card */}
        <div className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1 relative">
              <label className="form-label">Search Repository</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Report No, Model, Serial, Manufacturer..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="form-input pl-9"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="form-label">Workflow Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setPage(1)
                }}
                className="form-input"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="under_review">Under Review</option>
                <option value="submitted">Submitted</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="form-label">Accuracy Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setPage(1)
                }}
                className="form-input"
              >
                <option value="all">All Classes</option>
                <option value="I">Class I (Special)</option>
                <option value="II">Class II (High)</option>
                <option value="III">Class III (Medium)</option>
                <option value="IIII">Class IIII (Ordinary)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
            {/* Verdict */}
            <div>
              <label className="form-label">Final Verdict</label>
              <select
                value={selectedVerdict}
                onChange={(e) => {
                  setSelectedVerdict(e.target.value)
                  setPage(1)
                }}
                className="form-input text-xs"
              >
                <option value="all">All Verdicts</option>
                <option value="pass">PASS Only</option>
                <option value="fail">FAIL Only</option>
                <option value="pending">In Progress / Pending</option>
              </select>
            </div>

            {/* Lab */}
            <div>
              <label className="form-label">Testing Laboratory</label>
              <select
                value={selectedLab}
                onChange={(e) => {
                  setSelectedLab(e.target.value)
                  setPage(1)
                }}
                className="form-input text-xs"
              >
                <option value="all">All Laboratories</option>
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="form-label">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
                className="form-input text-xs"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="form-label">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
                className="form-input text-xs"
              />
            </div>
          </div>

          {(searchTerm || selectedStatus !== 'all' || selectedClass !== 'all' || selectedVerdict !== 'all' || selectedLab !== 'all' || dateFrom || dateTo) && (
            <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
              <span>Showing {filteredReports.length} results</span>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedStatus('all')
                  setSelectedClass('all')
                  setSelectedVerdict('all')
                  setSelectedLab('all')
                  setDateFrom('')
                  setDateTo('')
                  setPage(1)
                }}
                className="text-navy-600 hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Report No.</th>
                  <th className="table-header">Instrument Model</th>
                  <th className="table-header">Manufacturer</th>
                  <th className="table-header">Class</th>
                  <th className="table-header">Capacity / e</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Verdict</th>
                  <th className="table-header">Date</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedReports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      No reports match the selected repository criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((report) => {
                    const inst = SEED_INSTRUMENTS.find((i) => i.id === report.instrumentId)
                    return (
                      <tr key={report.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="table-cell font-mono text-xs font-bold text-navy-800">
                          {report.reportNo}
                        </td>
                        <td className="table-cell">
                          <span className="font-semibold text-navy-900">{inst?.model || '—'}</span>
                          <div className="text-xs text-gray-400 font-mono">S/N: {inst?.serial_no || '—'}</div>
                        </td>
                        <td className="table-cell text-xs text-gray-600">
                          {inst?.manufacturer?.split(',')[0] || '—'}
                        </td>
                        <td className="table-cell">
                          {inst?.accuracy_class && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-navy-100 text-navy-800">
                              Class {inst.accuracy_class}
                            </span>
                          )}
                        </td>
                        <td className="table-cell text-xs text-gray-500">
                          {inst ? (
                            <>
                              Max: {inst.max_capacity >= 1000000 ? `${inst.max_capacity / 1000000} t` : inst.max_capacity >= 1000 ? `${inst.max_capacity / 1000} kg` : `${inst.max_capacity} g`}
                              <br />
                              e: {inst.e >= 1000 ? `${inst.e / 1000} kg` : `${inst.e} g`}
                            </>
                          ) : '—'}
                        </td>
                        <td className="table-cell">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            report.status === 'approved' ? 'bg-green-100 text-green-700' :
                            report.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            report.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                            report.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {report.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="table-cell">
                          {report.overallPass === true && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              <CheckCircle className="w-3.5 h-3.5" /> PASS
                            </span>
                          )}
                          {report.overallPass === false && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                              <XCircle className="w-3.5 h-3.5" /> FAIL
                            </span>
                          )}
                          {report.overallPass === null && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                              <Clock className="w-3.5 h-3.5" /> PENDING
                            </span>
                          )}
                        </td>
                        <td className="table-cell text-xs text-gray-500 whitespace-nowrap">
                          {format(new Date(report.createdAt), 'dd MMM yyyy')}
                        </td>
                        <td className="table-cell text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/reports/${report.id}`}
                              className="btn btn-sm btn-outline inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => exportReportToPdf(report)}
                              className="btn btn-sm inline-flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                              title="Export PDF (A4 format)"
                            >
                              <Download className="w-3.5 h-3.5" />
                              PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => exportReportToDocx(report)}
                              className="btn btn-sm inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                              title="Export Microsoft Word (.docx)"
                            >
                              <Download className="w-3.5 h-3.5" />
                              DOCX
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages} ({filteredReports.length} total records)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn btn-sm btn-outline disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="btn btn-sm btn-outline disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
