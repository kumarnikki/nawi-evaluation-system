/**
 * DashboardPage — main landing page for authenticated users.
 * Shows live stats from mockDb, Recharts charts, recent reports table,
 * and a pending-actions panel for reviewers/approvers.
 */
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  FileText,
  FilePen,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import mockDb from '@/data/mockDb'
import type { ReportStatus } from '@/types'

// ── Monthly chart mock data ──────────────────────────────────────────────────
const MONTHLY_DATA = [
  { month: 'Jan 2026', reports: 4,  approved: 3,  rejected: 1 },
  { month: 'Feb 2026', reports: 7,  approved: 5,  rejected: 2 },
  { month: 'Mar 2026', reports: 5,  approved: 4,  rejected: 1 },
  { month: 'Apr 2026', reports: 9,  approved: 7,  rejected: 2 },
  { month: 'May 2026', reports: 11, approved: 8,  rejected: 3 },
  { month: 'Jun 2026', reports: 8,  approved: 6,  rejected: 2 },
]

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; cls: string; dot: string }
> = {
  draft:        { label: 'Draft',        cls: 'bg-gray-100 text-gray-700',    dot: 'bg-gray-400'   },
  submitted:    { label: 'Submitted',    cls: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-500'   },
  under_review: { label: 'Under Review', cls: 'bg-yellow-100 text-yellow-800',dot: 'bg-yellow-500' },
  approved:     { label: 'Approved',     cls: 'bg-green-100 text-green-800',  dot: 'bg-green-500'  },
  rejected:     { label: 'Rejected',     cls: 'bg-red-100 text-red-800',      dot: 'bg-red-500'    },
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  iconBg: string
  trend?: string
}

function StatCard({ label, value, icon, iconBg, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-500 text-xs font-medium mb-0.5 truncate">{label}</p>
        <p className="text-navy-900 text-2xl font-bold leading-none">{value}</p>
        {trend && (
          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
            <TrendingUp size={11} />
            {trend}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Recharts custom tooltip ───────────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      {label && <p className="font-semibold text-navy-800 mb-1.5">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-gray-600 capitalize">{entry.name}:</span>
          <span className="font-semibold text-navy-800">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

// ── Dashboard page ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, hasRole } = useAuth()

  // Fetch stats and reports from mockDb
  const labFilter = hasRole('admin', 'reviewer', 'approver') ? undefined : user?.labId
  const stats = useMemo(() => mockDb.getDashboardStats(labFilter), [labFilter])
  const allReports = useMemo(() => mockDb.getReports({ labId: labFilter }), [labFilter])

  // Recent 5 reports
  const recentReports = useMemo(() => allReports.slice(0, 5), [allReports])

  // Pending actions: submitted + under_review
  const pendingReports = useMemo(
    () =>
      allReports.filter(
        (r) => r.status === 'submitted' || r.status === 'under_review'
      ),
    [allReports]
  )

  // Pie chart data
  const pieData = useMemo(() => {
    const pass = stats.passCount
    const fail = stats.failCount
    const unverified = stats.total - pass - fail
    return [
      { name: 'Pass', value: pass },
      { name: 'Fail', value: fail },
      ...(unverified > 0 ? [{ name: 'Pending', value: unverified }] : []),
    ].filter((d) => d.value > 0)
  }, [stats])

  const PIE_COLORS = ['#16a34a', '#dc2626', '#94a3b8']

  const today = format(new Date(), "EEEE, d MMMM yyyy")

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto">

      {/* ── Page title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-navy-900 text-2xl font-extrabold">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{today}</p>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-navy-800 text-sm font-semibold leading-tight">{user.name}</p>
              <p className="text-gray-500 text-xs capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
              {user.name.trim().charAt(0)}
            </div>
          </div>
        )}
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Reports"
          value={stats.total}
          icon={<FileText size={20} className="text-navy-600" />}
          iconBg="bg-navy-100"
          trend="All time"
        />
        <StatCard
          label="Drafts"
          value={stats.draft}
          icon={<FilePen size={20} className="text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Under Review"
          value={stats.submitted + stats.under_review}
          icon={<Eye size={20} className="text-yellow-600" />}
          iconBg="bg-yellow-50"
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={<CheckCircle2 size={20} className="text-green-600" />}
          iconBg="bg-green-50"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={<XCircle size={20} className="text-red-600" />}
          iconBg="bg-red-50"
        />
      </div>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pass/Fail pie */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-navy-800 font-semibold text-sm mb-1">Pass / Fail Distribution</h2>
          <p className="text-gray-400 text-xs mb-4">Overall verdict across all evaluated reports</p>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No evaluated reports yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Summary below pie */}
          <div className="flex justify-center gap-6 mt-2">
            <div className="text-center">
              <p className="text-green-600 font-bold text-lg">{stats.passCount}</p>
              <p className="text-gray-500 text-xs">Passed</p>
            </div>
            <div className="text-center">
              <p className="text-red-600 font-bold text-lg">{stats.failCount}</p>
              <p className="text-gray-500 text-xs">Failed</p>
            </div>
          </div>
        </div>

        {/* Monthly bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-navy-800 font-semibold text-sm mb-1">Monthly Report Activity</h2>
          <p className="text-gray-400 text-xs mb-4">Jan – Jun 2026 — reports submitted vs outcomes</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_DATA} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="square"
                iconSize={10}
                formatter={(value) => (
                  <span className="text-xs text-gray-600 capitalize">{value}</span>
                )}
              />
              <Bar dataKey="reports"  name="Total"    fill="#0d2137" radius={[3, 3, 0, 0]} />
              <Bar dataKey="approved" name="Approved" fill="#16a34a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" fill="#dc2626" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Lower section ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent reports table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-navy-800 font-semibold text-sm">Recent Reports</h2>
            <Link
              to="/reports"
              className="text-saffron-600 hover:text-saffron-700 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              No reports found. Start a new evaluation.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-100">
                    <th className="px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      Report No.
                    </th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      Instrument
                    </th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      Date
                    </th>
                    <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-navy-700 font-semibold whitespace-nowrap">
                        {report.reportNo}
                      </td>
                      <td className="px-3 py-3 text-gray-700 max-w-[180px]">
                        <p className="truncate text-sm font-medium">
                          {report.instrument?.model ?? report.instrumentId}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                          {report.instrument?.manufacturer ?? '—'}
                        </p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {format(new Date(report.createdAt), 'd MMM yyyy')}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Link
                          to={`/reports/${report.id}`}
                          className="text-saffron-600 hover:text-saffron-700 text-xs font-semibold hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending actions panel */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-navy-800 font-semibold text-sm">Pending Actions</h2>
            {pendingReports.length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingReports.length}
              </span>
            )}
          </div>

          {pendingReports.length === 0 ? (
            <div className="px-5 py-10 text-center text-gray-400 text-sm">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-green-300" />
              <p className="text-green-600 font-medium text-sm">All clear!</p>
              <p className="text-gray-400 text-xs mt-0.5">No reports awaiting action.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 overflow-y-auto max-h-[340px]">
              {pendingReports.map((report) => (
                <li key={report.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs text-navy-700 font-semibold truncate">
                        {report.reportNo}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {report.instrument?.model ?? report.instrumentId}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <StatusBadge status={report.status} />
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock size={11} />
                          {format(new Date(report.updatedAt), 'd MMM')}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/reports/${report.id}`}
                      className="flex-shrink-0 mt-0.5 text-saffron-600 hover:text-saffron-700"
                      title="Review report"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Quick action footer for reviewers/approvers */}
          {hasRole('reviewer', 'approver', 'admin') && pendingReports.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
                <span>
                  {pendingReports.length} report{pendingReports.length !== 1 ? 's' : ''} awaiting your review
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
