/**
 * CertificateNewPage.tsx
 * Form to issue a new OIML Type Approval Certificate linked to an approved report.
 */
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Award, CheckCircle2, AlertCircle } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import mockDb, { SEED_INSTRUMENTS } from '@/data/mockDb'
import { getCertificates, type Certificate } from './CertificatesPage'
import { format } from 'date-fns'

export default function CertificateNewPage() {
  const navigate = useNavigate()
  const approvedReports = mockDb.getReports().filter((r) => r.status === 'approved')

  const [selectedReportId, setSelectedReportId] = useState(approvedReports[0]?.id || '')
  const [scheme, setScheme] = useState<'A' | 'B'>('A')
  const [certNo, setCertNo] = useState(`R76/2006-A-IN01-${new Date().getFullYear()}.0${approvedReports.length + 1}`)
  const [typeDesignation, setTypeDesignation] = useState('')
  const [description, setDescription] = useState('Non-automatic weighing instrument evaluated per OIML R 76-1:2006.')
  const [applicant, setApplicant] = useState('')
  const [manufacturer, setManufacturer] = useState('')

  // When report changes, pre-fill fields
  const handleReportChange = (repId: string) => {
    setSelectedReportId(repId)
    const rep = mockDb.getReport(repId)
    const inst = SEED_INSTRUMENTS.find((i) => i.id === rep?.instrumentId)
    if (inst) {
      setTypeDesignation(inst.type_designation || inst.model)
      setApplicant(inst.applicant)
      setManufacturer(inst.manufacturer)
    }
  }

  // Pre-fill on mount if first report exists
  React.useEffect(() => {
    if (approvedReports[0]) {
      handleReportChange(approvedReports[0].id)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const rep = mockDb.getReport(selectedReportId)
    const inst = SEED_INSTRUMENTS.find((i) => i.id === rep?.instrumentId)

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certNo,
      scheme,
      edition: 2006,
      issuerName: 'National Legal Metrology Laboratory, Delhi',
      issuerAddress: 'Plot No. 42, Phase II, NSIC Complex, Okhla Industrial Estate, New Delhi',
      personResponsible: 'Director of Legal Metrology',
      applicant: applicant || 'Registered Applicant',
      manufacturer: manufacturer || 'Registered Manufacturer',
      typeDesignation: typeDesignation || 'NAWI Standard Series',
      description,
      accuracyClasses: [inst?.accuracy_class || 'III'],
      reportRef: rep?.reportNo || 'NLML/R76/2026/001',
      reportDate: rep ? format(new Date(rep.createdAt), 'yyyy-MM-dd') : '2026-04-10',
      reportPages: 42,
      techDocRef: `TD-${inst?.model || 'NAWI'}-2026`,
      techDocRevision: 'Rev. 0',
      techDocDate: format(new Date(), 'yyyy-MM-dd'),
      techDocPages: 95,
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'active',
      revisions: [{ rev: 0, date: format(new Date(), 'yyyy-MM-dd'), description: 'Initial certificate issue' }],
      variants: [
        {
          id: '-A',
          cls: inst?.accuracy_class || 'III',
          minRange: `${inst?.min_capacity || 100} g`,
          maxRange: `${inst?.max_capacity ? inst.max_capacity / 1000 : 60} kg`,
          eRange: `${inst?.e || 20} g`,
          dRange: `${inst?.d || 20} g`,
          nMax: inst?.n || 3000,
          tare: '100% Max',
          presetTare: 'None',
          panSize: 'Standard Platform',
        },
      ],
    }

    const currentCerts = getCertificates()
    currentCerts.unshift(newCert)
    localStorage.setItem('nawi_certificates', JSON.stringify(currentCerts))

    navigate(`/certificates/${newCert.id}`)
  }

  return (
    <Layout title="Issue OIML Certificate">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/certificates"
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Issue New OIML Certificate</h1>
            <p className="text-gray-500 text-sm">
              Generate a Type Approval Certificate of Conformity for an approved evaluation report.
            </p>
          </div>
        </div>

        {approvedReports.length === 0 ? (
          <div className="card text-center py-12 space-y-4">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
            <h3 className="text-lg font-bold text-navy-900">No Approved Reports Available</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              A certificate can only be issued for a report that has reached the <strong>Approved</strong> workflow
              state.
            </p>
            <Link to="/reports" className="btn btn-primary inline-flex">
              Review Reports List
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-6">
            <div className="space-y-4">
              <div>
                <label className="form-label">Link to Approved Evaluation Report *</label>
                <select
                  value={selectedReportId}
                  onChange={(e) => handleReportChange(e.target.value)}
                  className="form-input"
                  required
                >
                  {approvedReports.map((r) => {
                    const inst = SEED_INSTRUMENTS.find((i) => i.id === r.instrumentId)
                    return (
                      <option key={r.id} value={r.id}>
                        {r.reportNo} — {inst?.model || 'Instrument'} (Class {inst?.accuracy_class})
                      </option>
                    )
                  })}
                </select>
                <p className="form-hint">Only reports marked Approved can receive an official certificate.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Certificate Number *</label>
                  <input
                    type="text"
                    value={certNo}
                    onChange={(e) => setCertNo(e.target.value)}
                    className="form-input font-mono"
                    required
                  />
                  <p className="form-hint">Pattern: R76/edition-scheme-country-year.seq</p>
                </div>
                <div>
                  <label className="form-label">Certification Scheme *</label>
                  <select
                    value={scheme}
                    onChange={(e) => setScheme(e.target.value as 'A' | 'B')}
                    className="form-input"
                  >
                    <option value="A">Scheme A (Full Mutual Acceptance)</option>
                    <option value="B">Scheme B (Basic Acceptance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Pattern Designation *</label>
                <input
                  type="text"
                  value={typeDesignation}
                  onChange={(e) => setTypeDesignation(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Model XYZ Series Weighing Instruments"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Applicant Name *</label>
                  <input
                    type="text"
                    value={applicant}
                    onChange={(e) => setApplicant(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Manufacturer Name &amp; Location *</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">General Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <Link to="/certificates" className="btn btn-ghost">
                Cancel
              </Link>
              <button type="submit" className="btn btn-saffron flex items-center gap-2">
                <Award className="w-4 h-4" /> Issue and Seal Certificate
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  )
}
