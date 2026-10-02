/**
 * Initialize seed data into localStorage on first load.
 * This powers the demo/mock mode without any backend.
 */
import { SEED_LABS } from './mockDb'
import SEED_REPORTS from './seedReports'
import type { Report, Lab } from '@/types'

export function initSeedData() {
  // Only seed if no existing data
  const existingReports = localStorage.getItem('nawi_reports')
  if (!existingReports || JSON.parse(existingReports).length === 0) {
    const reportsWithLab = SEED_REPORTS.map((r) => ({
      ...r,
      lab: SEED_LABS.find((l) => l.id === r.labId),
    }))
    localStorage.setItem('nawi_reports', JSON.stringify(reportsWithLab))
  }

  const existingLabs = localStorage.getItem('nawi_labs')
  if (!existingLabs) {
    localStorage.setItem('nawi_labs', JSON.stringify(SEED_LABS))
  }
}
