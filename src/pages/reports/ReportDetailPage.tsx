/**
 * ReportDetailPage.tsx
 * View and manage a single type evaluation report.
 * Role-based actions, test results accordion, audit log timeline.
 */
import React, { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Circle,
  ChevronRight,
  FileText,
  Download,
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
  Eye,
  Printer,
} from 'lucide-react'
import mockDb from '@/data/mockDb'
import type { Report, ReportStatus, AuditLogEntry, TestModuleResult } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { v4 as uuidv4 } from 'uuid'
import { exportReportToPdf } from '@/export/pdfExport'
import { exportReportToDocx } from '@/export/docxExport'


// ── Constants ────────────────────────────────────────────────────────────────

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

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`text-sm font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

function InfoPanel({ report }: { report: Report }) {
  const inst = report.instrument
  if (!inst) return null

  const fields = [
    { label: 'Report No.', value: report.reportNo },
    { label: 'Instrument Model', value: inst.model },
    { label: 'Type Designation', value: inst.type_designation },
    { label: 'Manufacturer', value: inst.manufacturer },
    { label: 'Applicant', value: inst.applicant },
    { label: 'Accuracy Class', value: `Class ${inst.accuracy_class}` },
    { label: 'Max Capacity', value: `${inst.max_capacity.toLocaleString()} g` },
    { label: 'Min Capacity', value: `${inst.min_capacity.toLocaleString()} g` },
    { label: 'Scale Interval (e)', value: `${inst.e} g` },
    { label: 'Scale Division (d)', value: `${inst.d} g` },
    { label: 'n = Max/e', value: inst.e > 0 ? Math.round(inst.max_capacity / inst.e).toLocaleString() : '—' },
    { label: 'Ruleset', value: report.rulesetVersion },
    { label: 'Created', value: new Date(report.createdAt).toLocaleString('en-IN') },
    { label: 'Last Updated', value: new Date(report.updatedAt).toLocaleString('en-IN') },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-sm font-bold text-[#0d2137] mb-4 flex items-center gap-2">
        <FileText size={16} className="text-[#FF9933]" />
        General Information
      </h2>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
            <dd className="text-sm font-semibold text-[#0d2137] mt-0.5">{value ?? '—'}</dd>
          </div>
        ))}
      </dl>

      {/* Environment */}
      {report.environment.length > 0 && (
        <>
          <div className="border-t border-gray-100 mt-4 pt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Environmental Conditions</h3>
            {report.environment.map((env, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Temperature', value: `${env.temperature} °C` },
                  { label: 'Humidity', value: `${env.humidity} %` },
                  { label: 'Pressure', value: `${env.pressure} hPa` },
                  { label: 'Recorded At', value: new Date(env.recordedAt).toLocaleString('en-IN') },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-[10px] text-gray-400 uppercase font-semibold">{label}</dt>
                    <dd className="text-sm font-semibold text-[#0d2137]">{value}</dd>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reference Standards */}
      {report.referenceStandards.length > 0 && (
        <div className="border-t border-gray-100 mt-4 pt-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Reference Standards</h3>
          <div className="space-y-2">
            {report.referenceStandards.map((ref, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 text-xs p-2 rounded-lg border ${
                  ref.isExpired ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                {ref.isExpired ? (
                  <AlertTriangle size={14} className="text-red-500 shrink-0" />
                ) : (
                  <CheckCircle size={14} className="text-green-500 shrink-0" />
                )}
                <span className="font-semibold text-[#0d2137]">{ref.name}</span>
                <span className="text-gray-500">Cert: {ref.certNo}</span>
                <span className="text-gray-500">Cal: {ref.calibrationDate}</span>
                <span className={ref.isExpired ? 'text-red-600 font-bold' : 'text-gray-500'}>
                  Due: {ref.dueDate}
                  {ref.isExpired && ' (EXPIRED)'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TestResultsAccordion({ results }: { results: TestModuleResult[] }) {
  const [open, setOpen] = useState<string | null>(null)

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-400">
        <Circle size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No test results recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#0d2137] flex items-center gap-2">
          <CheckCircle size={16} className="text-[#FF9933]" />
          Test Results ({results.length} modules)
        </h2>
      </div>

      <div className="divide-y divide-gray-100">
        {results.map((result) => {
          const isOpen = open === result.moduleId
          const statusIcon =
            result.status === 'completed' && result.pass === true ? (
              <CheckCircle size={18} className="text-green-500 shrink-0" />
            ) : result.status === 'completed' && result.pass === false ? (
              <XCircle size={18} className="text-red-500 shrink-0" />
            ) : (
              <Circle size={18} className="text-gray-300 shrink-0" />
            )

          return (
            <div key={result.moduleId}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : result.moduleId)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                {statusIcon}
                <span className="flex-1 text-sm font-semibold text-[#0d2137]">
                  {result.moduleName}
                </span>
                {result.status === 'completed' && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      result.pass
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    }`}
                  >
                    {result.pass ? 'PASS' : 'FAIL'}
                  </span>
                )}
                {result.status === 'in_progress' && (
                  <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                    In Progress
                  </span>
                )}
                {result.status === 'not_started' && (
                  <span className="text-xs text-gray-400">Not started</span>
                )}
                <ChevronRight
                  size={15}
                  className={`text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                  {result.rows.length > 0 ? (
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#0d2137] text-white">
                            <th className="px-3 py-1.5 text-left">#</th>
                            <th className="px-3 py-1.5 text-left">Load (g)</th>
                            <th className="px-3 py-1.5 text-left">Indication (g)</th>
                            <th className="px-3 py-1.5 text-left">Error (g)</th>
                            <th className="px-3 py-1.5 text-left">MPE (g)</th>
                            <th className="px-3 py-1.5 text-left">Pass/Fail</th>
                            {result.rows.some((r) => r.notes) && (
                              <th className="px-3 py-1.5 text-left">Notes</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {result.rows.map((row, i) => (
                            <tr
                              key={i}
                              className={`border-b ${row.pass ? 'bg-green-50' : 'bg-red-50'}`}
                            >
                              <td className="px-3 py-1.5 text-gray-500">{i + 1}</td>
                              <td className="px-3 py-1.5">{row.load.toLocaleString()}</td>
                              <td className="px-3 py-1.5">{row.indication.toLocaleString()}</td>
                              <td
                                className={`px-3 py-1.5 font-semibold ${
                                  Math.abs(row.error) > row.mpe ? 'text-red-600' : 'text-gray-700'
                                }`}
                              >
                                {row.error > 0 ? '+' : ''}
                                {row.error}
                              </td>
                              <td className="px-3 py-1.5">±{row.mpe}</td>
                              <td className="px-3 py-1.5 font-bold">
                                {row.pass ? (
                                  <span className="text-green-600">PASS</span>
                                ) : (
                                  <span className="text-red-600">FAIL</span>
                                )}
                              </td>
                              {result.rows.some((r) => r.notes) && (
                                <td className="px-3 py-1.5 text-gray-500 italic">{row.notes ?? '—'}</td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic mt-3">
                      No measurement rows recorded for this module.
                    </p>
                  )}
                  {result.reasons.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-semibold">Basis:</span> {result.reasons.join('; ')}
                    </p>
                  )}
                  {result.testedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Tested:{' '}
                      {new Date(result.testedAt).toLocaleString('en-IN')}
                      {result.testedBy ? ` by ${result.testedBy}` : ''}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AuditTimeline({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-sm font-bold text-[#0d2137] mb-5 flex items-center gap-2">
        <Clock size={16} className="text-[#FF9933]" />
        Audit Log
      </h2>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No audit entries yet.</p>
      ) : (
        <ol className="relative border-l-2 border-gray-200 ml-3 space-y-4">
          {[...entries].reverse().map((entry) => (
            <li key={entry.id} className="ml-5">
              <span className="absolute -left-2 flex items-center justify-center w-4 h-4 bg-[#FF9933] rounded-full ring-2 ring-white">
                <User size={9} className="text-white" />
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#0d2137]">{entry.userName}</span>
                {entry.toStatus && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[entry.toStatus]}`}
                  >
                    → {STATUS_LABELS[entry.toStatus]}
                  </span>
                )}
                <span className="text-[10px] text-gray-400 ml-auto">
                  {new Date(entry.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">{entry.action}</p>
              {entry.comment && (
                <p className="text-xs text-gray-500 italic mt-0.5">"{entry.comment}"</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

// ── Reject dialog ────────────────────────────────────────────────────────────

function RejectDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: (comment: string) => void
  onCancel: () => void
}) {
  const [comment, setComment] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-base font-bold text-[#0d2137] mb-1">Reject Report</h3>
        <p className="text-xs text-gray-500 mb-4">
          Provide a reason for rejection. This will be recorded in the audit log.
        </p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Enter rejection reason..."
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!comment.trim()) return alert('Please enter a rejection reason.')
              onConfirm(comment.trim())
            }}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()

  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [isExportingDocx, setIsExportingDocx] = useState(false)
  const [report, setReport] = useState<Report | undefined>(() =>
    id ? mockDb.getReport(id) : undefined
  )

  const handleExportPdf = () => {
    if (!report) return
    exportReportToPdf(report)
  }

  const handleExportDocx = async () => {
    if (!report) return
    try {
      setIsExportingDocx(true)
      await exportReportToDocx(report)
    } catch (err: any) {
      alert(`DOCX generation failed: ${err.message}`)
    } finally {
      setIsExportingDocx(false)
    }
  }

  const refreshReport = () => {
    if (id) setReport(mockDb.getReport(id))
  }

  const addAuditEntry = (action: string, toStatus?: ReportStatus, comment?: string) => {
    if (!report) return
    const entry: AuditLogEntry = {
      id: uuidv4(),
      reportId: report.id,
      userId: user?.id ?? 'unknown',
      userName: user?.name ?? 'Unknown',
      action,
      fromStatus: report.status,
      toStatus,
      comment,
      createdAt: new Date().toISOString(),
    }
    const updated: Report = {
      ...report,
      status: toStatus ?? report.status,
      updatedAt: new Date().toISOString(),
      auditLog: [...report.auditLog, entry],
    }
    mockDb.saveReport(updated)
    setReport(updated)
  }

  const handleSubmitForReview = () => {
    if (!window.confirm('Submit this report for review? You will not be able to edit it afterwards.')) return
    addAuditEntry('Submitted for review', 'submitted')
  }

  const handleStartReview = () => {
    addAuditEntry('Review started', 'under_review')
  }

  const handleApprove = () => {
    if (!window.confirm('Approve this report? This action cannot be undone.')) return
    addAuditEntry('Report approved', 'approved')
  }

  const handleReject = (comment: string) => {
    addAuditEntry(`Report rejected: ${comment}`, 'rejected', comment)
    setShowRejectDialog(false)
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={40} className="mx-auto mb-3 text-amber-400" />
          <h2 className="text-lg font-bold text-[#0d2137] mb-1">Report Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">
            Report with ID "{id}" does not exist or has been removed.
          </p>
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF9933] hover:underline"
          >
            <ArrowLeft size={14} />
            Back to Reports
          </Link>
        </div>
      </div>
    )
  }

  const overall =
    report.overallPass === true
      ? { label: 'PASS', cls: 'bg-green-100 text-green-700 border-green-300' }
      : report.overallPass === false
      ? { label: 'FAIL', cls: 'bg-red-100 text-red-700 border-red-300' }
      : { label: 'PENDING', cls: 'bg-gray-100 text-gray-500 border-gray-200' }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0d2137] text-white px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/reports')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="font-mono text-base font-bold tracking-tight">
                  {report.reportNo}
                </h1>
                <p className="text-xs text-gray-300 mt-0.5">
                  {report.instrument?.model ?? 'Unknown instrument'} ·{' '}
                  {report.instrument?.manufacturer ?? ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={report.status} />
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${overall.cls}`}
              >
                {overall.label}
              </span>

              {/* Export buttons */}
              <button
                type="button"
                onClick={() => navigate(`/reports/${report.id}/print`)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors bg-white/5 active:scale-95"
                title="Full-screen A4 Printable Preview"
              >
                <Printer size={13} />
                Print Preview
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors bg-white/5 active:scale-95"
                title="Print or Save as PDF"
              >
                <Download size={13} />
                Export PDF
              </button>
              <button
                type="button"
                disabled={isExportingDocx}
                onClick={handleExportDocx}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors bg-white/5 disabled:opacity-50 active:scale-95"
                title="Download editable Microsoft Word document"
              >
                <Download size={13} />
                {isExportingDocx ? 'Generating…' : 'Export DOCX'}
              </button>
            </div>
          </div>

          {/* Role-based action buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            {/* Technician / Draft */}
            {report.status === 'draft' && hasRole('admin', 'technician') && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/reports/new?edit=${report.id}`)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
                >
                  <Eye size={13} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#FF9933] text-white hover:bg-orange-400 transition-colors"
                >
                  Submit for Review
                </button>
              </>
            )}

            {/* Reviewer / Submitted */}
            {report.status === 'submitted' && hasRole('admin', 'reviewer') && (
              <button
                type="button"
                onClick={handleStartReview}
                className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-yellow-400 text-[#0d2137] hover:bg-yellow-300 transition-colors"
              >
                Start Review
              </button>
            )}

            {/* Approver / Under Review */}
            {report.status === 'under_review' && hasRole('admin', 'approver') && (
              <>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-colors"
                >
                  <CheckCircle size={13} />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectDialog(true)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-colors"
                >
                  <XCircle size={13} />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <InfoPanel report={report} />
        <TestResultsAccordion results={report.testResults} />
        <AuditTimeline entries={report.auditLog} />
      </main>

      {showRejectDialog && (
        <RejectDialog
          onConfirm={handleReject}
          onCancel={() => setShowRejectDialog(false)}
        />
      )}
    </div>
  )
}
