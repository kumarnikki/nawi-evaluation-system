/**
 * export.test.ts
 * Tests for DOCX and PDF report generation.
 */
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { exportReportToDocx } from '@/export/docxExport'
import { exportReportToPdf, generateReportHtml } from '@/export/pdfExport'
import SEED_REPORTS from '@/data/seedReports'
import { SEED_INSTRUMENTS, SEED_LABS } from '@/data/mockDb'
import type { Report } from '@/types'

describe('Report Export Engine (DOCX & PDF)', () => {
  const sampleReport: Report = {
    ...SEED_REPORTS[0],
    instrument: SEED_INSTRUMENTS[0],
    lab: SEED_LABS[0],
  }

  beforeAll(() => {
    if (!window.URL.createObjectURL) {
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    }
  })

  it('generates DOCX blob without throwing', async () => {
    await expect(exportReportToDocx(sampleReport)).resolves.not.toThrow()
  })

  it('generates statutory HTML document for PDF export with all OIML sections', () => {
    const html = generateReportHtml(sampleReport)
    expect(html).toContain('PATTERN EVALUATION REPORT')
    expect(html).toContain(sampleReport.reportNo)
    expect(html).toContain(sampleReport.instrument!.model)
    expect(html).toContain('Weighing Performance')
    expect(html).toContain('DEPARTMENT OF CONSUMER AFFAIRS')
    expect(html).toContain('OIML R 76-2')
  })

  it('triggers PDF export without throwing', () => {
    expect(() => exportReportToPdf(sampleReport)).not.toThrow()
  })
})
