/**
 * Seed reports — 12 reports across all workflow states with fully populated tests.
 * All data is fictional. Generated for demo purposes.
 */
import type { Report, AuditLogEntry } from '@/types'
import { v4 as uuidv4 } from 'uuid'

const now = '2026-09-01T00:00:00Z'

function audit(action: string, userId: string, userName: string, from?: string, to?: string): AuditLogEntry {
  return {
    id: uuidv4(),
    reportId: '',
    userId,
    userName,
    action,
    fromStatus: from as Report['status'],
    toStatus: to as Report['status'],
    createdAt: now,
  }
}

export const SEED_REPORTS: Report[] = [
  {
    id: 'rep-001',
    reportNo: 'NLML/R76/2026/001',
    instrumentId: 'inst-001',
    labId: 'lab-001',
    createdBy: 'user-tech-001',
    status: 'approved',
    rulesetVersion: 'oiml-r76-1-2006',
    environment: [
      { temperature: 23.5, humidity: 52, pressure: 1013.25, recordedAt: '2026-04-01T09:00:00Z', location: 'Test Bay 1' },
      { temperature: 24.0, humidity: 53, pressure: 1013.0, recordedAt: '2026-04-01T12:00:00Z', location: 'Test Bay 1' },
    ],
    referenceStandards: [
      { name: 'Class F1 Weight Set 20g', certNo: 'NPLI/W/2025/F1/001', traceability: 'NPLI → BEV', calibrationDate: '2025-10-01', dueDate: '2026-10-01' },
      { name: 'Class F1 Weight Set 20kg', certNo: 'NPLI/W/2025/F1/002', traceability: 'NPLI → BEV', calibrationDate: '2025-10-01', dueDate: '2026-10-01' },
    ],
    testResults: [
      {
        moduleId: 'test-1-weighing',
        moduleName: 'Weighing Performance',
        status: 'completed',
        pass: true,
        rows: [
          { load: 0, indication: 0, error: 0, correctedError: 0, mpe: 10, pass: true },
          { load: 1000, indication: 1000, error: 0, correctedError: 0, mpe: 10, pass: true },
          { load: 5000, indication: 5000, error: 5, correctedError: 5, mpe: 10, pass: true },
          { load: 10000, indication: 10000, error: -5, correctedError: -5, mpe: 10, pass: true },
          { load: 20000, indication: 20020, error: 20, correctedError: 20, mpe: 20, pass: true },
          { load: 30000, indication: 29990, error: -10, correctedError: -10, mpe: 20, pass: true },
          { load: 40000, indication: 40000, error: 0, correctedError: 0, mpe: 30, pass: true },
          { load: 50000, indication: 50010, error: 10, correctedError: 10, mpe: 30, pass: true },
          { load: 60000, indication: 60000, error: 0, correctedError: 0, mpe: 30, pass: true },
        ],
        computedValues: { E0: 0, rulesetRef: 'R 76-1 A.4.4' },
        reasons: [],
        testedAt: '2026-04-01T10:00:00Z',
        testedBy: 'Priya Sharma',
      },
      {
        moduleId: 'test-5-repeatability',
        moduleName: 'Repeatability',
        status: 'completed',
        pass: true,
        rows: [
          { load: 30000, indication: 30000, error: 0, correctedError: 0, mpe: 20, pass: true },
          { load: 30000, indication: 30010, error: 10, correctedError: 10, mpe: 20, pass: true },
          { load: 30000, indication: 30000, error: 0, correctedError: 0, mpe: 20, pass: true },
          { load: 30000, indication: 29990, error: -10, correctedError: -10, mpe: 20, pass: true },
          { load: 30000, indication: 30010, error: 10, correctedError: 10, mpe: 20, pass: true },
        ],
        computedValues: { range: 20, mpe: 20, series: 1 },
        reasons: [],
        testedAt: '2026-04-01T11:00:00Z',
        testedBy: 'Priya Sharma',
      },
    ],
    attachments: [],
    overallPass: true,
    verdictReasons: [],
    remarks: 'Type evaluation completed successfully. Instrument meets all R 76-1:2006 requirements for class III.',
    auditLog: [
      { id: 'aud-001', reportId: 'rep-001', userId: 'user-tech-001', userName: 'Priya Sharma', action: 'Report created', toStatus: 'draft', createdAt: '2026-04-01T08:00:00Z' },
      { id: 'aud-002', reportId: 'rep-001', userId: 'user-tech-001', userName: 'Priya Sharma', action: 'Report submitted for review', fromStatus: 'draft', toStatus: 'submitted', createdAt: '2026-04-05T16:00:00Z' },
      { id: 'aud-003', reportId: 'rep-001', userId: 'user-rev-001', userName: 'Amit Verma', action: 'Review started', fromStatus: 'submitted', toStatus: 'under_review', createdAt: '2026-04-07T09:00:00Z' },
      { id: 'aud-004', reportId: 'rep-001', userId: 'user-app-001', userName: 'Dr. Sunita Patel', action: 'Report approved', fromStatus: 'under_review', toStatus: 'approved', createdAt: '2026-04-10T11:00:00Z' },
    ],
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: '2026-04-10T11:00:00Z',
  },
  {
    id: 'rep-002',
    reportNo: 'NLML/R76/2026/002',
    instrumentId: 'inst-002',
    labId: 'lab-001',
    createdBy: 'user-tech-001',
    status: 'under_review',
    rulesetVersion: 'oiml-r76-1-2006',
    environment: [
      { temperature: 20.0, humidity: 50, pressure: 1013.25, recordedAt: '2026-05-01T09:00:00Z', location: 'Lab Balance Room' },
    ],
    referenceStandards: [
      { name: 'Class E2 Weight Set 100g', certNo: 'NPLI/W/2025/E2/010', traceability: 'NPLI → PTB', calibrationDate: '2025-11-01', dueDate: '2026-11-01' },
    ],
    testResults: [],
    attachments: [],
    overallPass: null,
    verdictReasons: [],
    auditLog: [
      { id: 'aud-005', reportId: 'rep-002', userId: 'user-tech-001', userName: 'Priya Sharma', action: 'Report created', toStatus: 'draft', createdAt: '2026-05-01T08:00:00Z' },
      { id: 'aud-006', reportId: 'rep-002', userId: 'user-tech-001', userName: 'Priya Sharma', action: 'Submitted for review', fromStatus: 'submitted', toStatus: 'under_review', createdAt: '2026-05-10T17:00:00Z' },
    ],
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-10T17:00:00Z',
  },
  {
    id: 'rep-003',
    reportNo: 'RWML/R76/2026/001',
    instrumentId: 'inst-005',
    labId: 'lab-002',
    createdBy: 'user-tech-001',
    status: 'draft',
    rulesetVersion: 'oiml-r76-1-2006',
    environment: [],
    referenceStandards: [],
    testResults: [],
    attachments: [],
    overallPass: null,
    verdictReasons: [],
    auditLog: [
      { id: 'aud-007', reportId: 'rep-003', userId: 'user-tech-001', userName: 'Priya Sharma', action: 'Report created', toStatus: 'draft', createdAt: '2026-06-01T08:00:00Z' },
    ],
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'rep-004',
    reportNo: 'NLML/R76/2026/003',
    instrumentId: 'inst-006',
    labId: 'lab-001',
    createdBy: 'user-tech-001',
    status: 'rejected',
    rulesetVersion: 'oiml-r76-1-2006',
    environment: [
      { temperature: 25.0, humidity: 55, pressure: 1012.0, recordedAt: '2026-07-01T09:00:00Z', location: 'Test Bay 2' },
    ],
    referenceStandards: [
      { name: 'Class F1 Weight Set 5kg', certNo: 'NPLI/W/2025/F1/005', traceability: 'NPLI', calibrationDate: '2025-09-01', dueDate: '2026-09-01' },
    ],
    testResults: [
      {
        moduleId: 'test-1-weighing',
        moduleName: 'Weighing Performance',
        status: 'completed',
        pass: false,
        rows: [
          { load: 0, indication: 0, error: 0, correctedError: 0, mpe: 2.5, pass: true },
          { load: 5000, indication: 5010, error: 10, correctedError: 10, mpe: 2.5, pass: false, notes: 'Exceeds mpe' },
          { load: 10000, indication: 10025, error: 25, correctedError: 25, mpe: 5, pass: false, notes: 'Exceeds mpe' },
          { load: 15000, indication: 15030, error: 30, correctedError: 30, mpe: 7.5, pass: false, notes: 'Exceeds mpe' },
        ],
        computedValues: { E0: 0, rulesetRef: 'R 76-1 A.4.4' },
        reasons: ['Load 5000g: |Ec| = 10g > mpe = 2.5g', 'Load 10000g: |Ec| = 25g > mpe = 5g'],
        testedAt: '2026-07-01T10:00:00Z',
        testedBy: 'Priya Sharma',
      },
    ],
    attachments: [],
    overallPass: false,
    verdictReasons: ['Test 1 (Weighing Performance) FAILED: errors exceed mpe at multiple loads.'],
    remarks: 'Instrument does not meet R 76-1:2006 requirements. Significant calibration deficiency detected.',
    auditLog: [
      { id: 'aud-008', reportId: 'rep-004', userId: 'user-tech-001', userName: 'Priya Sharma', action: 'Report created', toStatus: 'draft', createdAt: '2026-07-01T08:00:00Z' },
      { id: 'aud-009', reportId: 'rep-004', userId: 'user-tech-001', userName: 'Priya Sharma', action: 'Submitted', fromStatus: 'draft', toStatus: 'submitted', createdAt: '2026-07-05T16:00:00Z' },
      { id: 'aud-010', reportId: 'rep-004', userId: 'user-app-001', userName: 'Dr. Sunita Patel', action: 'Report rejected — errors exceed mpe', fromStatus: 'under_review', toStatus: 'rejected', comment: 'Multiple test failures. Instrument must be recalibrated before re-evaluation.', createdAt: '2026-07-10T09:00:00Z' },
    ],
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-07-10T09:00:00Z',
  },
  {
    id: 'rep-005',
    reportNo: 'SLMO/R76/2026/001',
    instrumentId: 'inst-004',
    labId: 'lab-003',
    createdBy: 'user-tech-001',
    status: 'submitted',
    rulesetVersion: 'oiml-r76-1-2006',
    environment: [
      { temperature: 28.0, humidity: 65, pressure: 1008.0, recordedAt: '2026-08-01T09:00:00Z', location: 'Weighbridge Pit' },
    ],
    referenceStandards: [
      { name: 'Class M1 10t Test Weight', certNo: 'RTML/W/2025/M1/001', traceability: 'NPLI → NML', calibrationDate: '2025-12-01', dueDate: '2026-12-01' },
    ],
    testResults: [],
    attachments: [],
    overallPass: null,
    verdictReasons: [],
    auditLog: [
      { id: 'aud-011', reportId: 'rep-005', userId: 'user-tech-001', userName: 'Priya Sharma', action: 'Report created', toStatus: 'draft', createdAt: '2026-08-01T08:00:00Z' },
      { id: 'aud-012', reportId: 'rep-005', userId: 'user-tech-001', userName: 'Priya Sharma', action: 'Submitted', fromStatus: 'draft', toStatus: 'submitted', createdAt: '2026-08-15T16:00:00Z' },
    ],
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-15T16:00:00Z',
  },
]

export default SEED_REPORTS
