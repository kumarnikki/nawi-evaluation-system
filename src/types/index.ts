export type UserRole = 'admin' | 'technician' | 'reviewer' | 'approver' | 'viewer'

export type AccuracyClass = 'I' | 'II' | 'III' | 'IIII'

export type InstrumentType =
  | 'platform'
  | 'bench'
  | 'weighbridge'
  | 'lab_balance'
  | 'crane'
  | 'hopper'
  | 'retail'
  | 'other'

export type ReportStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  labId?: string
  createdAt: string
}

export interface Lab {
  id: string
  name: string
  address: string
  city: string
  state: string
  accreditationNo: string
  contactPerson: string
  contactPhone: string
  contactEmail: string
  logoUrl?: string
  createdAt: string
}

export interface Instrument {
  id: string
  manufacturer: string
  applicant: string
  model: string
  type_designation: string
  serial_no: string
  accuracy_class: AccuracyClass
  instrument_type: InstrumentType
  max_capacity: number
  min_capacity: number
  e: number
  d: number
  n: number
  tare_capacity?: number
  temperature_range_min: number
  temperature_range_max: number
  power_supply?: string
  software_version?: string
  interface_type?: string
  material?: string
  year_of_manufacture?: number
  labId: string
  createdAt: string
  updatedAt: string
}

export interface ReferenceStandard {
  name: string
  certNo: string
  traceability: string
  calibrationDate: string
  dueDate: string
  isExpired?: boolean
}

export interface EnvironmentRecord {
  temperature: number
  humidity: number
  pressure: number
  recordedAt: string
  location: string
}

export interface TestRowResult {
  load: number
  indication: number
  error: number
  correctedError?: number
  mpe: number
  pass: boolean
  notes?: string
}

export interface TestModuleResult {
  moduleId: string
  moduleName: string
  status: 'not_started' | 'in_progress' | 'completed'
  pass: boolean | null
  rows: TestRowResult[]
  computedValues: Record<string, number | string | boolean>
  reasons: string[]
  testedAt?: string
  testedBy?: string
}

export interface Attachment {
  id: string
  reportId: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  caption?: string
  uploadedAt: string
}

export interface AuditLogEntry {
  id: string
  reportId: string
  userId: string
  userName: string
  action: string
  fromStatus?: ReportStatus
  toStatus?: ReportStatus
  comment?: string
  createdAt: string
}

export interface DigitalSignature {
  signerName: string
  signerRole: string
  timestamp: string
  signatureData?: string // base64
  reportHash: string
}

export interface Report {
  id: string
  reportNo: string
  instrumentId: string
  instrument?: Instrument
  labId: string
  lab?: Lab
  createdBy: string
  createdByUser?: User
  status: ReportStatus
  rulesetVersion: string
  environment: EnvironmentRecord[]
  referenceStandards: ReferenceStandard[]
  testResults: TestModuleResult[]
  attachments: Attachment[]
  overallPass: boolean | null
  verdictReasons: string[]
  remarks?: string
  signature?: DigitalSignature
  auditLog: AuditLogEntry[]
  createdAt: string
  updatedAt: string
}

export interface DraftReport {
  id: string
  step: number
  instrumentData: Partial<Instrument>
  labData: Partial<Lab>
  environmentData: Partial<EnvironmentRecord>[]
  referenceStandards: ReferenceStandard[]
  testResults: Partial<TestModuleResult>[]
  updatedAt: string
}
