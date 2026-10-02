/**
 * CertificatesPage.tsx
 * OIML Certificate Management — List of Pattern Approval Certificates issued under OIML R 76.
 */
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Plus, Search, FileText, CheckCircle2, ShieldCheck, Eye } from 'lucide-react'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

export interface CertificateVariant {
  id: string
  cls: string
  minRange: string
  maxRange: string
  eRange: string
  dRange: string
  nMax: number
  tare: string
  presetTare: string
  panSize: string
}

export interface CertificateRevision {
  rev: number
  date: string
  description: string
}

export interface Certificate {
  id: string
  certNo: string
  scheme: 'A' | 'B'
  edition: number
  issuerName: string
  issuerAddress: string
  personResponsible: string
  applicant: string
  manufacturer: string
  typeDesignation: string
  description: string
  accuracyClasses: string[]
  reportRef: string
  reportDate: string
  reportPages: number
  techDocRef: string
  techDocRevision: string
  techDocDate: string
  techDocPages: number
  issueDate: string
  status: 'active' | 'superseded' | 'revoked'
  revisions: CertificateRevision[]
  variants: CertificateVariant[]
}

export const SEED_CERT: Certificate = {
  id: 'cert-001',
  certNo: 'R76/2006-A-IN01-2026.01',
  scheme: 'A',
  edition: 2006,
  issuerName: 'National Legal Metrology Laboratory, Delhi',
  issuerAddress: 'Plot No. 42, Phase II, NSIC Complex, Okhla Industrial Estate, New Delhi - 110020',
  personResponsible: 'Dr. Arvind Mehta, Director of Legal Metrology',
  applicant: 'Precision Scale Works Pvt. Ltd.',
  manufacturer: 'Precision Scale Works Pvt. Ltd., Pune, Maharashtra, India',
  typeDesignation: 'PSW-P Series Non-Automatic Weighing Instruments',
  description: 'Self-indicating electronic platform weighing instruments for general commercial and industrial trade use.',
  accuracyClasses: ['III', 'II'],
  reportRef: 'NLML/R76/2026/001',
  reportDate: '2026-04-10',
  reportPages: 48,
  techDocRef: 'TD-PSW-P-2026-001',
  techDocRevision: 'Rev. 1',
  techDocDate: '2026-03-01',
  techDocPages: 120,
  issueDate: '2026-04-15',
  status: 'active',
  revisions: [
    { rev: 0, date: '2026-04-15', description: 'Initial certificate issue covering variants -A through -D.' },
    { rev: 1, date: '2026-06-01', description: 'Added high-capacity industrial variants -E to -L.' },
    { rev: 2, date: '2026-07-15', description: 'Updated Max parameter verification for variant -C platform.' },
    { rev: 3, date: '2026-08-01', description: 'Extended tare range tolerance for variants -A and -B.' },
    { rev: 4, date: '2026-09-01', description: 'Added Class II laboratory variants -M and -N.' },
  ],
  variants: [
    { id: '-A', cls: 'III', minRange: '100 g', maxRange: '15 kg', eRange: '5 g', dRange: '5 g', nMax: 3000, tare: '100% Max', presetTare: 'None', panSize: '350 × 350 mm' },
    { id: '-B', cls: 'III', minRange: '200 g', maxRange: '30 kg', eRange: '10 g', dRange: '10 g', nMax: 3000, tare: '100% Max', presetTare: 'None', panSize: '400 × 400 mm' },
    { id: '-C', cls: 'III', minRange: '400 g', maxRange: '60 kg', eRange: '20 g', dRange: '20 g', nMax: 3000, tare: '100% Max', presetTare: 'None', panSize: '500 × 500 mm' },
    { id: '-D', cls: 'III', minRange: '1 kg', maxRange: '150 kg', eRange: '50 g', dRange: '50 g', nMax: 3000, tare: '100% Max', presetTare: 'None', panSize: '600 × 600 mm' },
    { id: '-E', cls: 'III', minRange: '2 kg', maxRange: '300 kg', eRange: '100 g', dRange: '100 g', nMax: 3000, tare: '100% Max', presetTare: 'None', panSize: '800 × 800 mm' },
    { id: '-F', cls: 'III', minRange: '5 kg', maxRange: '600 kg', eRange: '200 g', dRange: '200 g', nMax: 3000, tare: '100% Max', presetTare: 'None', panSize: '1000 × 1000 mm' },
    { id: '-G', cls: 'III', minRange: '10 kg', maxRange: '1500 kg', eRange: '500 g', dRange: '500 g', nMax: 3000, tare: '100% Max', presetTare: 'None', panSize: '1200 × 1200 mm' },
    { id: '-H', cls: 'III', minRange: '20 kg', maxRange: '3000 kg', eRange: '1 kg', dRange: '1 kg', nMax: 3000, tare: '50% Max', presetTare: 'None', panSize: '1500 × 1500 mm' },
    { id: '-I', cls: 'III', minRange: '50 kg', maxRange: '6000 kg', eRange: '2 kg', dRange: '2 kg', nMax: 3000, tare: '50% Max', presetTare: 'None', panSize: '2000 × 2000 mm' },
    { id: '-J', cls: 'III', minRange: '100 kg', maxRange: '15 t', eRange: '5 kg', dRange: '5 kg', nMax: 3000, tare: '50% Max', presetTare: 'None', panSize: 'Heavy Deck' },
    { id: '-K', cls: 'III', minRange: '200 kg', maxRange: '30 t', eRange: '10 kg', dRange: '10 kg', nMax: 3000, tare: '50% Max', presetTare: 'None', panSize: 'Heavy Deck' },
    { id: '-L', cls: 'III', minRange: '500 kg', maxRange: '60 t', eRange: '20 kg', dRange: '20 kg', nMax: 3000, tare: '50% Max', presetTare: 'None', panSize: 'Weighbridge Pit' },
    { id: '-M', cls: 'II', minRange: '20 g', maxRange: '6 kg', eRange: '2 g', dRange: '2 g', nMax: 3000, tare: '100% Max', presetTare: 'None', panSize: '300 × 300 mm' },
    { id: '-N', cls: 'II', minRange: '50 g', maxRange: '15 kg', eRange: '5 g', dRange: '5 g', nMax: 3000, tare: '100% Max', presetTare: 'None', panSize: '350 × 350 mm' },
  ],
}

export function getCertificates(): Certificate[] {
  const stored = localStorage.getItem('nawi_certificates')
  if (!stored) {
    localStorage.setItem('nawi_certificates', JSON.stringify([SEED_CERT]))
    return [SEED_CERT]
  }
  try {
    return JSON.parse(stored)
  } catch {
    return [SEED_CERT]
  }
}

export default function CertificatesPage() {
  const { hasRole } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const certificates = getCertificates()

  const filtered = certificates.filter((c) => {
    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      c.certNo.toLowerCase().includes(q) ||
      c.typeDesignation.toLowerCase().includes(q) ||
      c.applicant.toLowerCase().includes(q) ||
      c.manufacturer.toLowerCase().includes(q)
    )
  })

  return (
    <Layout title="OIML Certificates">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-navy-700" />
              OIML Type Evaluation Certificates
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Official Certificates of Conformity issued under OIML Recommendation R 76.
            </p>
          </div>
          {hasRole('admin', 'approver') && (
            <Link to="/certificates/new" className="btn btn-saffron flex items-center gap-2">
              <Plus className="w-4 h-4" /> Issue Certificate
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="card">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by certificate number, type designation, applicant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-9 text-sm"
            />
          </div>
        </div>

        {/* Certificates Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Certificate No.</th>
                  <th className="table-header">Type Designation</th>
                  <th className="table-header">Applicant</th>
                  <th className="table-header">Classes</th>
                  <th className="table-header">Scheme</th>
                  <th className="table-header">Variants</th>
                  <th className="table-header">Revision</th>
                  <th className="table-header">Issue Date</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="table-cell font-mono text-xs font-bold text-navy-800">
                      {cert.certNo}
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-navy-900 block">{cert.typeDesignation}</span>
                      <span className="text-xs text-gray-400">Ref: {cert.reportRef}</span>
                    </td>
                    <td className="table-cell text-xs text-gray-600">{cert.applicant}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        {cert.accuracyClasses.map((cls) => (
                          <span
                            key={cls}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-navy-100 text-navy-800"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                        Scheme {cert.scheme}
                      </span>
                    </td>
                    <td className="table-cell text-xs font-semibold text-navy-700">
                      {cert.variants.length} Variants
                    </td>
                    <td className="table-cell text-xs font-mono">
                      Rev. {cert.revisions.length - 1}
                    </td>
                    <td className="table-cell text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(cert.issueDate), 'dd MMM yyyy')}
                    </td>
                    <td className="table-cell text-right whitespace-nowrap">
                      <Link
                        to={`/certificates/${cert.id}`}
                        className="btn btn-sm btn-outline inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
