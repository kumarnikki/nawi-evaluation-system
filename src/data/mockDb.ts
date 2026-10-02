/**
 * Mock data store — IndexedDB-backed persistent store for demo/mock mode.
 * Falls back to in-memory when IndexedDB is not available.
 */
import type { Report, Lab, Instrument, User, AuditLogEntry } from '@/types'

// ── Seed Data ──────────────────────────────────────────────────────────────

export const SEED_LABS: Lab[] = [
  {
    id: 'lab-001',
    name: 'National Legal Metrology Laboratory, Delhi',
    address: 'Plot No. 42, Phase II, NSIC Complex, Okhla Industrial Estate',
    city: 'New Delhi',
    state: 'Delhi',
    accreditationNo: 'NABL/LM/001/2024',
    contactPerson: 'Dr. Arvind Mehta',
    contactPhone: '+91-11-41234567',
    contactEmail: 'nlml.delhi@weights.gov.in',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lab-002',
    name: 'Regional Weights & Measures Laboratory, Mumbai',
    address: 'B/2, MIDC Industrial Area, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    accreditationNo: 'NABL/LM/007/2024',
    contactPerson: 'Shri Dinesh Joshi',
    contactPhone: '+91-22-28901234',
    contactEmail: 'rwml.mumbai@weights.mah.gov.in',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'lab-003',
    name: 'State Legal Metrology Office, Bengaluru',
    address: '18th Cross, Malleshwaram, Near District Court',
    city: 'Bengaluru',
    state: 'Karnataka',
    accreditationNo: 'NABL/LM/012/2024',
    contactPerson: 'Smt. Kavitha Reddy',
    contactPhone: '+91-80-23456789',
    contactEmail: 'slmo.blr@commerce.kar.gov.in',
    createdAt: '2026-01-01T00:00:00Z',
  },
]

export const SEED_INSTRUMENTS: Instrument[] = [
  {
    id: 'inst-001',
    manufacturer: 'Precision Scale Works Pvt. Ltd., Pune',
    applicant: 'Precision Scale Works Pvt. Ltd.',
    model: 'PSW-P60',
    type_designation: 'PSW-P60 Platform Scale',
    serial_no: 'PSW-2026-001',
    accuracy_class: 'III',
    instrument_type: 'platform',
    max_capacity: 60000,
    min_capacity: 400,
    e: 20,
    d: 20,
    n: 3000,
    tare_capacity: 60000,
    temperature_range_min: -10,
    temperature_range_max: 40,
    power_supply: 'mains',
    software_version: 'v2.1.4',
    interface_type: 'RS-232',
    labId: 'lab-001',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'inst-002',
    manufacturer: 'AnalytX Instruments Ltd., Hyderabad',
    applicant: 'AnalytX Instruments Ltd.',
    model: 'AX-LB200',
    type_designation: 'AX-LB200 Laboratory Balance',
    serial_no: 'AX-2026-002',
    accuracy_class: 'II',
    instrument_type: 'lab_balance',
    max_capacity: 200,
    min_capacity: 1,
    e: 0.01,
    d: 0.01,
    n: 20000,
    tare_capacity: 200,
    temperature_range_min: 10,
    temperature_range_max: 30,
    power_supply: 'mains',
    software_version: 'v3.0.1',
    labId: 'lab-002',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'inst-003',
    manufacturer: 'MicroWeigh Technologies Pvt. Ltd., Chennai',
    applicant: 'MicroWeigh Technologies Pvt. Ltd.',
    model: 'MW-A100',
    type_designation: 'MW-A100 Analytical Balance',
    serial_no: 'MW-2026-003',
    accuracy_class: 'I',
    instrument_type: 'lab_balance',
    max_capacity: 100,
    min_capacity: 0.1,
    e: 0.001,
    d: 0.0001,
    n: 100000,
    tare_capacity: 100,
    temperature_range_min: 15,
    temperature_range_max: 25,
    power_supply: 'mains',
    software_version: 'v1.8.2',
    labId: 'lab-001',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'inst-004',
    manufacturer: 'BridgeScale Industries, Ahmedabad',
    applicant: 'BridgeScale Industries',
    model: 'BS-WB60T',
    type_designation: 'BS-WB60T Weighbridge',
    serial_no: 'BS-2026-004',
    accuracy_class: 'III',
    instrument_type: 'weighbridge',
    max_capacity: 60000000,
    min_capacity: 200000,
    e: 20000,
    d: 20000,
    n: 3000,
    temperature_range_min: -10,
    temperature_range_max: 50,
    power_supply: 'mains',
    software_version: 'v4.2.0',
    labId: 'lab-003',
    createdAt: '2026-02-10T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'inst-005',
    manufacturer: 'MultiRange Scale Co., Kolkata',
    applicant: 'MultiRange Scale Co.',
    model: 'MRS-MI15',
    type_designation: 'MRS-MI15 Multi-interval Scale',
    serial_no: 'MRS-2026-005',
    accuracy_class: 'III',
    instrument_type: 'bench',
    max_capacity: 15000,
    min_capacity: 20,
    e: 1,
    d: 1,
    n: 15000,
    tare_capacity: 15000,
    temperature_range_min: -10,
    temperature_range_max: 40,
    power_supply: 'mains',
    software_version: 'v2.0.0',
    labId: 'lab-002',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'inst-006',
    manufacturer: 'FailSafe Weighing Pvt. Ltd., Surat',
    applicant: 'FailSafe Weighing Pvt. Ltd.',
    model: 'FS-RX100',
    type_designation: 'FS-RX100 Retail Scale (Failing)',
    serial_no: 'FS-2026-006',
    accuracy_class: 'III',
    instrument_type: 'retail',
    max_capacity: 15000,
    min_capacity: 100,
    e: 5,
    d: 5,
    n: 3000,
    tare_capacity: 15000,
    temperature_range_min: -10,
    temperature_range_max: 40,
    power_supply: 'mains',
    software_version: 'v1.0.0',
    labId: 'lab-001',
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
]

// ── In-memory store ────────────────────────────────────────────────────────

import { SEED_REPORTS } from './seedReports'

const _labs: Map<string, Lab> = new Map(SEED_LABS.map((l) => [l.id, l]))
const _instruments: Map<string, Instrument> = new Map(SEED_INSTRUMENTS.map((i) => [i.id, i]))
const _reports: Map<string, Report> = new Map()

// Load from localStorage if available
function persist(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // ignore quota errors in tests
  }
}

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback
  } catch {
    return fallback
  }
}

function initReports() {
  const saved = load<Report>('nawi_reports', SEED_REPORTS)
  saved.forEach((r) => {
    // Attach lab and instrument if missing
    if (!r.lab && r.labId) {
      r.lab = _labs.get(r.labId)
    }
    if (!r.instrument && r.instrumentId) {
      r.instrument = _instruments.get(r.instrumentId)
    }
    _reports.set(r.id, r)
  })
  // Persist back to ensure localStorage has seed data
  persist('nawi_reports', Array.from(_reports.values()))
}

// Initialize on module load
initReports()

// ── CRUD operations ────────────────────────────────────────────────────────

export const mockDb = {
  // Labs
  getLabs: (): Lab[] => Array.from(_labs.values()),
  getLab: (id: string): Lab | undefined => _labs.get(id),

  // Instruments
  getInstruments: (labId?: string): Instrument[] => {
    const all = Array.from(_instruments.values())
    return labId ? all.filter((i) => i.labId === labId) : all
  },
  getInstrument: (id: string): Instrument | undefined => _instruments.get(id),
  saveInstrument: (instrument: Instrument) => {
    _instruments.set(instrument.id, instrument)
  },

  // Reports
  getReports: (filters?: { labId?: string; status?: string; search?: string }): Report[] => {
    if (_reports.size === 0) {
      initReports()
    }
    let reports = Array.from(_reports.values())
    if (filters?.labId) reports = reports.filter((r) => r.labId === filters.labId)
    if (filters?.status) reports = reports.filter((r) => r.status === filters.status)
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      reports = reports.filter(
        (r) =>
          r.reportNo.toLowerCase().includes(q) ||
          r.instrument?.manufacturer?.toLowerCase().includes(q) ||
          r.instrument?.model?.toLowerCase().includes(q)
      )
    }
    return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  getReport: (id: string): Report | undefined => {
    let rep = _reports.get(id)
    if (!rep) {
      initReports()
      rep = _reports.get(id)
    }
    return rep
  },
  saveReport: (report: Report) => {
    _reports.set(report.id, report)
    persist('nawi_reports', Array.from(_reports.values()))
  },
  deleteReport: (id: string) => {
    _reports.delete(id)
    persist('nawi_reports', Array.from(_reports.values()))
  },

  // Dashboard stats
  getDashboardStats: (labId?: string) => {
    const reports = mockDb.getReports({ labId })
    return {
      total: reports.length,
      draft: reports.filter((r) => r.status === 'draft').length,
      submitted: reports.filter((r) => r.status === 'submitted').length,
      under_review: reports.filter((r) => r.status === 'under_review').length,
      approved: reports.filter((r) => r.status === 'approved').length,
      rejected: reports.filter((r) => r.status === 'rejected').length,
      passCount: reports.filter((r) => r.overallPass === true).length,
      failCount: reports.filter((r) => r.overallPass === false).length,
    }
  },
}

export default mockDb
