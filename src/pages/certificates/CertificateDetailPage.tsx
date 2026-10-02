/**
 * CertificateDetailPage.tsx
 * Comprehensive OIML Certificate View matching official OIML Certificate Format:
 * - Issuing Authority, Applicant, Manufacturer
 * - 3-column-per-row Variant matrix (14 variants)
 * - Multi-revision history table
 * - Statutory legal disclaimer and signature blocks
 */
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  Building,
  FileCheck,
  CheckCircle,
} from 'lucide-react'
import Layout from '@/components/layout/Layout'
import { getCertificates } from './CertificatesPage'
import { format } from 'date-fns'

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const certs = getCertificates()
  const cert = certs.find((c) => c.id === id) || certs[0]

  const handlePrint = () => {
    window.print()
  }

  return (
    <Layout title={`Certificate: ${cert.certNo}`}>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <Link
              to="/certificates"
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">OIML Certificate of Conformity</h1>
              <p className="text-gray-500 text-sm">Certificate ID: {cert.certNo}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn btn-outline flex items-center gap-2 text-sm">
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <Link
              to={`/verify/cert/${cert.certNo}`}
              className="btn btn-saffron flex items-center gap-2 text-sm"
            >
              <ShieldCheck className="w-4 h-4" /> Verify Certificate
            </Link>
          </div>
        </div>

        {/* Official Certificate Sheet Container (Print Friendly) */}
        <div className="bg-white border-2 border-navy-900 shadow-xl rounded-xl p-8 sm:p-12 space-y-8 text-navy-950 font-sans">
          {/* Header */}
          <div className="text-center border-b-2 border-navy-900 pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-navy-50 border border-navy-200 rounded-full text-xs font-bold text-navy-900 mb-2">
              <Award className="w-4 h-4 text-saffron-500" />
              OIML CERTIFICATE SYSTEM FOR MEASURING INSTRUMENTS
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-navy-900">
              OIML Certificate of Conformity
            </h2>
            <div className="text-sm font-semibold text-gray-600">
              OIML Recommendation: <strong>R 76-1, Edition {cert.edition} (E)</strong>
            </div>
            <div className="text-lg font-mono font-bold text-navy-900 pt-2">
              Certificate No.: <span className="underline decoration-saffron-500 decoration-2">{cert.certNo}</span>
            </div>
            <div className="text-xs text-gray-500">
              Scheme: <strong>Scheme {cert.scheme}</strong> | Revision: <strong>{cert.revisions.length - 1}</strong>
            </div>
          </div>

          {/* Section: Authority & Identification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border-b border-gray-200 pb-6">
            <div className="space-y-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Issuing Authority</h3>
              <p className="font-bold text-navy-900">{cert.issuerName}</p>
              <p className="text-gray-600 text-xs">{cert.issuerAddress}</p>
              <p className="text-xs pt-1">
                <strong>Responsible Person:</strong> {cert.personResponsible}
              </p>
            </div>
            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Applicant</h3>
                <p className="font-bold text-navy-900">{cert.applicant}</p>
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Manufacturer</h3>
                <p className="text-gray-700 text-xs">{cert.manufacturer}</p>
              </div>
            </div>
          </div>

          {/* Instrument Designation */}
          <div className="space-y-2 border-b border-gray-200 pb-6 text-sm">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
              Identification of the Certified Pattern
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-base text-navy-900">{cert.typeDesignation}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500">Accuracy Classes:</span>
                  {cert.accuracyClasses.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded text-xs font-bold bg-navy-800 text-white"
                    >
                      Class {c}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{cert.description}</p>
            </div>
          </div>

          {/* Technical Documentation References */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-navy-50/50 p-4 rounded-lg border border-navy-100">
            <div>
              <span className="font-bold block text-navy-900">Type Evaluation Report:</span>
              <span className="font-mono text-navy-700">No. {cert.reportRef}</span>
              <span className="text-gray-500 block">
                Dated {cert.reportDate} ({cert.reportPages} pages)
              </span>
            </div>
            <div>
              <span className="font-bold block text-navy-900">Technical Documentation File:</span>
              <span className="font-mono text-navy-700">
                {cert.techDocRef} ({cert.techDocRevision})
              </span>
              <span className="text-gray-500 block">
                Dated {cert.techDocDate} ({cert.techDocPages} pages)
              </span>
            </div>
          </div>

          {/* Variants Grid (Rendered 3 per row as required by prompt) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="font-bold text-sm uppercase tracking-wider text-navy-900">
                Pattern Variants &amp; Technical Characteristics ({cert.variants.length} Variants)
              </h3>
              <span className="text-xs text-gray-500">Table format: 3 variants per row</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cert.variants.map((v) => (
                <div
                  key={v.id}
                  className="border border-gray-200 rounded-lg p-3 text-xs space-y-1.5 bg-gray-50/40 hover:border-navy-400 transition-colors"
                >
                  <div className="flex items-center justify-between font-bold border-b border-gray-200 pb-1">
                    <span className="text-navy-900 font-mono text-sm">Variant {v.id}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-navy-100 text-navy-800">
                      Class {v.cls}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px]">
                    <div>
                      <span className="text-gray-400 block">Min:</span>
                      <span className="font-semibold text-gray-800">{v.minRange}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Max:</span>
                      <span className="font-semibold text-gray-800">{v.maxRange}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Interval e:</span>
                      <span className="font-semibold text-gray-800">{v.eRange}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Divisions d:</span>
                      <span className="font-semibold text-gray-800">{v.dRange}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Max n:</span>
                      <span className="font-semibold text-gray-800">{v.nMax.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Tare:</span>
                      <span className="font-semibold text-gray-800">{v.tare}</span>
                    </div>
                  </div>
                  <div className="pt-1 text-[11px] text-gray-500 border-t border-gray-100">
                    <strong>Receptor/Pan:</strong> {v.panSize}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate Revision History */}
          <div className="space-y-2 border-t border-gray-200 pt-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
              Certificate History &amp; Addenda
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                  <tr>
                    <th className="py-2 px-3">Revision</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Description of Modification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cert.revisions.map((rev) => (
                    <tr key={rev.rev}>
                      <td className="py-2 px-3 font-mono font-bold text-navy-900">Rev. {rev.rev}</td>
                      <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{rev.date}</td>
                      <td className="py-2 px-3 text-gray-700">{rev.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Disclaimers & Signature */}
          <div className="border-t-2 border-navy-900 pt-6 space-y-6 text-xs text-gray-600">
            <p className="leading-relaxed text-[11px] text-justify">
              <strong>Important Notice:</strong> This certificate is issued under the OIML Certificate System for
              Measuring Instruments, Scheme A. Conformity with the relevant OIML Recommendation is attested by the
              Issuing Authority. The issuance of this certificate does not imply any approval by the International
              Organization of Legal Metrology (OIML) or any obligation by OIML member bodies to admit this pattern
              without national pattern approval verification where mandated.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <p className="text-gray-400">Date of Original Issue:</p>
                <p className="font-bold text-sm text-navy-900">{cert.issueDate}</p>
                <p className="text-[10px] text-gray-400 mt-2">Seal of the Issuing Authority</p>
                <div className="w-24 h-24 border border-dashed border-gray-300 rounded-full flex items-center justify-center text-[10px] text-gray-400 mt-1">
                  OFFICIAL SEAL
                </div>
              </div>
              <div className="text-right flex flex-col justify-end">
                <div className="inline-block border-t border-gray-400 pt-2 w-56 ml-auto">
                  <p className="font-bold text-sm text-navy-900">{cert.personResponsible}</p>
                  <p className="text-[11px] text-gray-500">Signatory for Issuing Authority</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
