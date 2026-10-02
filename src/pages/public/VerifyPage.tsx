/**
 * VerifyPage.tsx
 * Public Statutory Verification Portal (No login required).
 * Verifies authenticity of Pattern Evaluation Reports and OIML Certificates
 * using cryptographic SHA-256 hashes and national registry lookups.
 */
import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
  Scale,
  Award,
  Hash,
  ArrowLeft,
  Home,
  FileText,
} from 'lucide-react'
import mockDb, { SEED_INSTRUMENTS } from '@/data/mockDb'
import { getCertificates } from '@/pages/certificates/CertificatesPage'
import { format } from 'date-fns'

async function computeSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function VerifyPage() {
  const navigate = useNavigate()
  const { type: paramType, id: paramId, '*': wildcard } = useParams<{ type?: string; id?: string; '*': string }>()
  const [searchParams] = useSearchParams()

  const rawQuery = wildcard || paramId || searchParams.get('id') || searchParams.get('q') || ''
  const decodedQuery = decodeURIComponent(rawQuery).trim()
  const initialType: 'report' | 'cert' =
    paramType === 'cert' || searchParams.get('type') === 'cert' ? 'cert' : 'report'

  const [verifyType, setVerifyType] = useState<'report' | 'cert'>(initialType)
  const [query, setQuery] = useState(decodedQuery)
  const [result, setResult] = useState<{
    found: boolean
    data?: any
    hash?: string
    message?: string
  } | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const performVerification = async (targetQuery: string, targetType: 'report' | 'cert') => {
    if (!targetQuery.trim()) return
    setIsVerifying(true)
    setResult(null)

    const q = targetQuery.trim()

    if (targetType === 'report') {
      const reports = mockDb.getReports()
      const match = reports.find(
        (r) =>
          r.reportNo.toLowerCase() === q.toLowerCase() ||
          r.reportNo.replace(/[\/\s-]/g, '').toLowerCase() === q.replace(/[\/\s-]/g, '').toLowerCase() ||
          r.id === q
      )

      if (match) {
        const canonicalString = `${match.reportNo}|${match.instrumentId}|${match.rulesetVersion}|${match.status}|${match.overallPass}`
        const hash = await computeSHA256(canonicalString)
        const inst = SEED_INSTRUMENTS.find((i) => i.id === match.instrumentId)

        setResult({
          found: true,
          data: { ...match, instrument: inst },
          hash,
        })
      } else {
        setResult({
          found: false,
          message: `No authentic evaluation report found matching identifier "${q}" in the national registry.`,
        })
      }
    } else {
      const certs = getCertificates()
      const match = certs.find(
        (c) =>
          c.certNo.toLowerCase() === q.toLowerCase() ||
          c.certNo.replace(/[\/\s-]/g, '').toLowerCase() === q.replace(/[\/\s-]/g, '').toLowerCase() ||
          c.id.toLowerCase() === q.toLowerCase()
      )

      if (match) {
        const canonicalString = `${match.certNo}|${match.typeDesignation}|${match.applicant}|${match.issueDate}|${match.status}`
        const hash = await computeSHA256(canonicalString)

        setResult({
          found: true,
          data: match,
          hash,
        })
      } else {
        setResult({
          found: false,
          message: `No authentic OIML Certificate found matching certificate number "${q}".`,
        })
      }
    }

    setIsVerifying(false)
  }

  useEffect(() => {
    if (decodedQuery) {
      setQuery(decodedQuery)
      setVerifyType(initialType)
      performVerification(decodedQuery, initialType)
    }
  }, [decodedQuery, initialType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performVerification(query, verifyType)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Tricolor Header */}
      <div
        className="h-1.5 w-full"
        style={{
          background: 'linear-gradient(to right, #FF9933 33.3%, #FFFFFF 33.3% 66.6%, #138808 66.6%)',
        }}
      />

      <header className="bg-navy-900 text-white px-6 py-3.5 shadow flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <Link
            to="/"
            className="p-1.5 rounded-lg border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Portal Home"
          >
            <Home size={16} />
          </Link>
          <Link to="/" className="flex items-center gap-2.5 border-l border-white/20 pl-3">
            <div className="w-8 h-8 rounded-full border border-saffron-400 flex items-center justify-center">
              <Scale className="w-4 h-4 text-saffron-400" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Public Verification Portal</div>
              <div className="text-[11px] text-navy-300 leading-tight">Department of Consumer Affairs, Govt. of India</div>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="btn btn-sm btn-ghost text-white hover:bg-white/10">
            Dashboard
          </Link>
          <Link to="/login" className="btn btn-sm btn-saffron font-bold text-white shadow-sm">
            Officer Login →
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-navy-100 text-navy-800 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-8 h-8 text-navy-800" />
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900">
            Legal Metrology Certificate &amp; Report Verification
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Verify the genuine statutory validity, cryptographic hash, and approval status of pattern
            evaluation reports under OIML R 76.
          </p>
        </div>

        {/* Verification Form */}
        <div className="card shadow-lg p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Document Type</label>
                <select
                  value={verifyType}
                  onChange={(e) => {
                    setVerifyType(e.target.value as 'report' | 'cert')
                    setResult(null)
                  }}
                  className="form-input text-sm"
                >
                  <option value="report">Pattern Evaluation Report</option>
                  <option value="cert">OIML Certificate of Conformity</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">
                  {verifyType === 'report' ? 'Report Reference Number' : 'Certificate Number'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      verifyType === 'report'
                        ? 'e.g. NLML/R76/2026/001'
                        : 'e.g. R76/2006-A-IN01-2026.01'
                    }
                    className="form-input pr-24 font-mono text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="btn btn-saffron btn-sm absolute right-1.5 top-1/2 -translate-y-1/2"
                  >
                    {isVerifying ? 'Checking...' : 'Verify →'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Hash className="w-3.5 h-3.5" />
              <span>
                Tip: Try test report{' '}
                <button
                  type="button"
                  onClick={() => {
                    setVerifyType('report')
                    setQuery('NLML/R76/2026/001')
                    performVerification('NLML/R76/2026/001', 'report')
                  }}
                  className="text-navy-600 underline font-mono"
                >
                  NLML/R76/2026/001
                </button>{' '}
                or certificate{' '}
                <button
                  type="button"
                  onClick={() => {
                    setVerifyType('cert')
                    setQuery('R76/2006-A-IN01-2026.01')
                    performVerification('R76/2006-A-IN01-2026.01', 'cert')
                  }}
                  className="text-navy-600 underline font-mono"
                >
                  R76/2006-A-IN01-2026.01
                </button>
              </span>
            </div>
          </form>

          {/* Verification Results */}
          {result && (
            <div className="pt-4 border-t border-gray-100">
              {result.found ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-green-800 uppercase tracking-wider block">
                          Official Statutory Document Confirmed
                        </span>
                        <h2 className="text-xl font-bold text-navy-900">
                          {verifyType === 'report' ? result.data.reportNo : result.data.certNo}
                        </h2>
                      </div>
                    </div>
                    <span className="badge badge-approved text-xs px-3 py-1">
                      {result.data.status?.toUpperCase() || 'VALID'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-green-200">
                    {verifyType === 'report' ? (
                      <>
                        <div>
                          <span className="text-gray-500 block">Instrument Pattern:</span>
                          <span className="font-semibold text-navy-900">
                            {result.data.instrument?.model || 'NAWI Standard'} (Class{' '}
                            {result.data.instrument?.accuracy_class})
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Manufacturer:</span>
                          <span className="font-semibold text-navy-900">
                            {result.data.instrument?.manufacturer}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Final Compliance Verdict:</span>
                          <span className="font-bold text-green-700">
                            {result.data.overallPass ? 'PASSED (Compliant with OIML R 76)' : 'FAILED'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Date of Evaluation:</span>
                          <span className="font-semibold text-navy-900">
                            {format(new Date(result.data.createdAt), 'dd MMMM yyyy')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-gray-500 block">Pattern Designation:</span>
                          <span className="font-semibold text-navy-900">
                            {result.data.typeDesignation}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Issuing Authority:</span>
                          <span className="font-semibold text-navy-900">{result.data.issuerName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Accuracy Classes:</span>
                          <span className="font-semibold text-navy-900">
                            Class {result.data.accuracyClasses?.join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Issue Date:</span>
                          <span className="font-semibold text-navy-900">
                            {format(new Date(result.data.issueDate), 'dd MMMM yyyy')}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* SHA-256 Hash Verification */}
                  <div className="bg-white p-3 rounded-lg border border-green-200 text-xs space-y-1">
                    <span className="text-gray-400 font-medium block">
                      Cryptographic SHA-256 Verification Hash:
                    </span>
                    <span className="font-mono text-navy-900 break-all text-[11px] block select-all">
                      {result.hash}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 text-center space-y-2">
                  <XCircle className="w-10 h-10 text-red-600 mx-auto" />
                  <h3 className="text-lg font-bold text-red-900">Verification Failed</h3>
                  <p className="text-xs text-red-700 max-w-md mx-auto">{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-navy-950 text-gray-400 py-6 text-center text-xs">
        <p>Smart India Hackathon 2026 | Problem Statement SIH26035 | Department of Consumer Affairs</p>
      </footer>
    </div>
  )
}
