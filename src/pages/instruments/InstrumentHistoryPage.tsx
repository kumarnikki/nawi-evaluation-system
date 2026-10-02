/**
 * InstrumentHistoryPage.tsx
 * Chronological timeline of all evaluation tests, calibration verification records,
 * and pattern approval results for a specific instrument.
 */
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Scale,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react'
import Layout from '@/components/layout/Layout'
import mockDb, { SEED_INSTRUMENTS, SEED_LABS } from '@/data/mockDb'
import { format } from 'date-fns'

export default function InstrumentHistoryPage() {
  const { id } = useParams<{ id: string }>()
  const instrument = mockDb.getInstrument(id || '')
  const lab = SEED_LABS.find((l) => l.id === instrument?.labId)

  const reports = mockDb
    .getReports()
    .filter((r) => r.instrumentId === id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  if (!instrument) {
    return (
      <Layout title="Instrument Not Found">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="card space-y-4">
            <h2 className="text-xl font-bold text-navy-900">Instrument Record Not Found</h2>
            <p className="text-gray-500 text-sm">
              The requested instrument ID does not exist in the national registry.
            </p>
            <Link to="/instruments" className="btn btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Instruments
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={`History: ${instrument.model}`}>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/instruments"
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Instrument Evaluation History</h1>
            <p className="text-gray-500 text-sm">
              Complete audit trail and test lifecycle for {instrument.model} (S/N: {instrument.serial_no}).
            </p>
          </div>
        </div>

        {/* Instrument Overview Card */}
        <div className="card grid grid-cols-1 md:grid-cols-3 gap-6 bg-navy-900 text-white">
          <div className="md:col-span-2 space-y-2">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-saffron-500 text-navy-950">
              Class {instrument.accuracy_class}
            </div>
            <h2 className="text-xl font-bold text-white">{instrument.type_designation}</h2>
            <p className="text-xs text-navy-200">
              <strong>Manufacturer:</strong> {instrument.manufacturer}
            </p>
            <p className="text-xs text-navy-200">
              <strong>Applicant:</strong> {instrument.applicant}
            </p>
            <p className="text-xs text-navy-200">
              <strong>Testing Lab:</strong> {lab?.name || 'National Legal Metrology Laboratory'}
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 space-y-2 text-xs">
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-navy-200">Max Capacity:</span>
              <span className="font-semibold text-white">
                {instrument.max_capacity >= 1000000
                  ? `${instrument.max_capacity / 1000000} t`
                  : instrument.max_capacity >= 1000
                  ? `${instrument.max_capacity / 1000} kg`
                  : `${instrument.max_capacity} g`}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-navy-200">Min Capacity:</span>
              <span className="font-semibold text-white">{instrument.min_capacity} g</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-navy-200">Interval (e):</span>
              <span className="font-semibold text-white">
                {instrument.e >= 1000 ? `${instrument.e / 1000} kg` : `${instrument.e} g`}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-navy-200">Divisions (n):</span>
              <span className="font-semibold text-white">{instrument.n.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-navy-200">Tare Capacity:</span>
              <span className="font-semibold text-white">
                {instrument.tare_capacity ? `${instrument.tare_capacity} g` : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          <h2 className="card-title mb-6">Chronological Evaluation Records</h2>

          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No test reports have been submitted for this instrument yet.</p>
              <Link to="/reports/new" className="btn btn-sm btn-primary mt-4">
                Initiate New Evaluation
              </Link>
            </div>
          ) : (
            <div className="relative border-l-2 border-navy-200 ml-4 pl-6 space-y-8">
              {reports.map((report, idx) => (
                <div key={report.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                    report.overallPass === true ? 'bg-green-600' :
                    report.overallPass === false ? 'bg-red-600' :
                    'bg-yellow-500'
                  }`} />

                  <div className="card border border-gray-200 p-5 space-y-3 hover:border-navy-400 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-navy-900">
                          {report.reportNo}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${
                          report.status === 'approved' ? 'bg-green-100 text-green-700' :
                          report.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          report.status === 'under_review' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(report.createdAt), 'dd MMMM yyyy, HH:mm')}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-3 rounded-lg">
                      <div>
                        <span className="text-gray-400 block">Overall Verdict</span>
                        <span className="font-bold flex items-center gap-1 mt-0.5">
                          {report.overallPass === true && (
                            <span className="text-green-700 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> PASSED
                            </span>
                          )}
                          {report.overallPass === false && (
                            <span className="text-red-700 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> FAILED
                            </span>
                          )}
                          {report.overallPass === null && (
                            <span className="text-gray-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> In Evaluation
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Ruleset Standard</span>
                        <span className="font-semibold text-navy-900">{report.rulesetVersion}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Tests Performed</span>
                        <span className="font-semibold text-navy-900">
                          {report.testResults?.length || 0} Modules Logged
                        </span>
                      </div>
                    </div>

                    {report.remarks && (
                      <p className="text-xs text-gray-600 italic bg-white p-2 rounded border border-gray-100">
                        "{report.remarks}"
                      </p>
                    )}

                    <div className="flex justify-end pt-1">
                      <Link
                        to={`/reports/${report.id}`}
                        className="btn btn-sm btn-outline inline-flex items-center gap-1 text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Inspect Full Evaluation Form
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
