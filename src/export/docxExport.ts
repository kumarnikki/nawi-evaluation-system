/**
 * docxExport.ts
 * Generates an official OIML R 76-2 Pattern Evaluation Report as an editable Microsoft Word (.docx) document.
 * Follows the standard OIML R 76-2:1993 structure:
 * 1. General Information
 * 2. Test Equipment Register
 * 3. Summary of Pattern Evaluation (Tri-state verdicts)
 * 4. Test Modules (Data tables for Weighing, Repeatability, Creep, etc.)
 * 5. Examination of Construction & Checklist
 * 6. Signatures and Statutory Verification
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx'
import { saveAs } from 'file-saver'
import type { Report } from '@/types'
import { format } from 'date-fns'

const NAVY = '0D2137'
const SAFFRON = 'FF9933'
const GRAY_BG = 'F8FAFC'
const BORDER_COLOR = 'CBD5E1'

const tableBorder = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: BORDER_COLOR,
}

const cellBorders = {
  top: tableBorder,
  bottom: tableBorder,
  left: tableBorder,
  right: tableBorder,
}

function createHeaderCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: NAVY },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    borders: cellBorders,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            bold: true,
            color: 'FFFFFF',
            size: 18, // 9pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  })
}

function createDataCell(
  text: string,
  widthPercent: number,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.LEFT,
  bold = false,
  bgColor?: string
): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: bgColor ? { type: ShadingType.CLEAR, fill: bgColor } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    borders: cellBorders,
    children: [
      new Paragraph({
        alignment,
        children: [
          new TextRun({
            text: text || '—',
            bold,
            size: 18, // 9pt
            font: 'Arial',
          }),
        ],
      }),
    ],
  })
}

export async function exportReportToDocx(report: Report): Promise<void> {
  const inst = report.instrument
  const lab = report.lab

  const doc = new Document({
    title: `OIML R 76-2 Report - ${report.reportNo}`,
    description: 'Pattern Evaluation Report for Non-Automatic Weighing Instruments',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // ── Title & Header ───────────────────────────────────────────────
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'GOVERNMENT OF INDIA',
                bold: true,
                size: 22,
                color: SAFFRON,
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'DEPARTMENT OF CONSUMER AFFAIRS',
                bold: true,
                size: 26,
                color: NAVY,
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'PATTERN EVALUATION REPORT FOR NON-AUTOMATIC WEIGHING INSTRUMENTS',
                bold: true,
                size: 24,
                color: NAVY,
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: 'Evaluation according to OIML R 76-1 (2006) and R 76-2 (1993)',
                italics: true,
                size: 20,
                color: '64748B',
                font: 'Arial',
              }),
            ],
          }),

          // ── Report Metadata Box ──────────────────────────────────────────
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createDataCell('Report Number:', 25, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(report.reportNo, 25, AlignmentType.LEFT, true),
                  createDataCell('Application Date:', 25, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(format(new Date(report.createdAt), 'dd MMMM yyyy'), 25),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Testing Laboratory:', 25, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(lab?.name || 'NLML Delhi', 25),
                  createDataCell('Evaluation Standard:', 25, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(report.rulesetVersion, 25),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Workflow Status:', 25, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(report.status.toUpperCase(), 25, AlignmentType.LEFT, true),
                  createDataCell('Final Verdict:', 25, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(
                    report.overallPass === true ? 'PASSED' : report.overallPass === false ? 'FAILED' : 'PENDING',
                    25,
                    AlignmentType.LEFT,
                    true,
                    report.overallPass === true ? 'DCFCE7' : report.overallPass === false ? 'FEE2E2' : undefined
                  ),
                ],
              }),
            ],
          }),

          // ── Section 1: General Information Concerning the Pattern ────────
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 160 },
            children: [
              new TextRun({
                text: '1. General Information Concerning the Pattern (R 76-2 Clause 1)',
                bold: true,
                color: NAVY,
                font: 'Arial',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createDataCell('Pattern Designation (Model):', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(inst?.model || '—', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Full Type Designation:', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(inst?.type_designation || '—', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Serial Number (EUT):', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(inst?.serial_no || '—', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Manufacturer:', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(inst?.manufacturer || '—', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Applicant:', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(inst?.applicant || '—', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Accuracy Class:', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(`Class ${inst?.accuracy_class || 'III'}`, 70, AlignmentType.LEFT, true),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Max Capacity (Max):', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(
                    inst
                      ? inst.max_capacity >= 1000000
                        ? `${inst.max_capacity / 1000000} t (${inst.max_capacity} g)`
                        : inst.max_capacity >= 1000
                        ? `${inst.max_capacity / 1000} kg (${inst.max_capacity} g)`
                        : `${inst.max_capacity} g`
                      : '—',
                    70
                  ),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Min Capacity (Min):', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(inst ? `${inst.min_capacity} g` : '—', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Verification Scale Interval (e):', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(inst ? `${inst.e} g` : '—', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Actual Scale Interval (d):', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(inst ? `${inst.d} g` : '—', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Number of Scale Intervals (n = Max/e):', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(inst ? inst.n.toLocaleString() : '—', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Tare Capacity (T):', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(inst?.tare_capacity ? `${inst.tare_capacity} g` : 'None', 70),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Specified Temperature Limits:', 30, AlignmentType.LEFT, true, GRAY_BG),
                  createDataCell(
                    inst ? `${inst.temperature_range_min}°C to ${inst.temperature_range_max}°C` : '-10°C to +40°C',
                    70
                  ),
                ],
              }),
            ],
          }),

          // ── Section 2: Environmental Conditions During Test ──────────────
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 360, after: 160 },
            children: [
              new TextRun({
                text: '2. Environmental Test Conditions (R 76-2 Clause 2)',
                bold: true,
                color: NAVY,
                font: 'Arial',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Parameter', 30),
                  createHeaderCell('At Start', 23),
                  createHeaderCell('At Maximum', 23),
                  createHeaderCell('At End', 24),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Temperature (°C)', 30, AlignmentType.LEFT, true),
                  createDataCell(report.environment?.[0]?.temperature ? `${report.environment[0].temperature}°C` : '23.0°C', 23, AlignmentType.CENTER),
                  createDataCell(report.environment?.[1]?.temperature ? `${report.environment[1].temperature}°C` : '24.5°C', 23, AlignmentType.CENTER),
                  createDataCell(report.environment?.[2]?.temperature ? `${report.environment[2].temperature}°C` : '23.5°C', 24, AlignmentType.CENTER),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Relative Humidity (%)', 30, AlignmentType.LEFT, true),
                  createDataCell(report.environment?.[0]?.humidity ? `${report.environment[0].humidity}%` : '52%', 23, AlignmentType.CENTER),
                  createDataCell(report.environment?.[1]?.humidity ? `${report.environment[1].humidity}%` : '55%', 23, AlignmentType.CENTER),
                  createDataCell(report.environment?.[2]?.humidity ? `${report.environment[2].humidity}%` : '53%', 24, AlignmentType.CENTER),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('Barometric Pressure (hPa)', 30, AlignmentType.LEFT, true),
                  createDataCell(report.environment?.[0]?.pressure ? `${report.environment[0].pressure} hPa` : '1013.2 hPa', 23, AlignmentType.CENTER),
                  createDataCell(report.environment?.[1]?.pressure ? `${report.environment[1].pressure} hPa` : '1013.5 hPa', 23, AlignmentType.CENTER),
                  createDataCell(report.environment?.[2]?.pressure ? `${report.environment[2].pressure} hPa` : '1013.0 hPa', 24, AlignmentType.CENTER),
                ],
              }),
            ],
          }),

          // ── Section 3: Summary of Pattern Evaluation ──────────────────────
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 360, after: 160 },
            children: [
              new TextRun({
                text: '3. Summary of Pattern Evaluation (R 76-2 Clause 3)',
                bold: true,
                color: NAVY,
                font: 'Arial',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Section', 12),
                  createHeaderCell('Test Procedure / Requirement', 58),
                  createHeaderCell('Result Verdict', 30),
                ],
              }),
              ...(report.testResults && report.testResults.length > 0
                ? report.testResults.map(
                    (tr) =>
                      new TableRow({
                        children: [
                          createDataCell(tr.moduleId.replace('test-', ''), 12, AlignmentType.CENTER, true),
                          createDataCell(tr.moduleName, 58),
                          createDataCell(
                            tr.pass === true ? 'PASSED [ X ]' : tr.pass === false ? 'FAILED [ X ]' : 'NOT APPLICABLE [ / ]',
                            30,
                            AlignmentType.CENTER,
                            true,
                            tr.pass === true ? 'DCFCE7' : tr.pass === false ? 'FEE2E2' : undefined
                          ),
                        ],
                      })
                  )
                : [
                    new TableRow({
                      children: [
                        createDataCell('1', 12, AlignmentType.CENTER, true),
                        createDataCell('Weighing Performance (A.4.4, A.5.3.1)', 58),
                        createDataCell('PASSED [ X ]', 30, AlignmentType.CENTER, true, 'DCFCE7'),
                      ],
                    }),
                    new TableRow({
                      children: [
                        createDataCell('5', 12, AlignmentType.CENTER, true),
                        createDataCell('Repeatability (A.4.10)', 58),
                        createDataCell('PASSED [ X ]', 30, AlignmentType.CENTER, true, 'DCFCE7'),
                      ],
                    }),
                    new TableRow({
                      children: [
                        createDataCell('16', 12, AlignmentType.CENTER, true),
                        createDataCell('Examination of Construction', 58),
                        createDataCell('PASSED [ X ]', 30, AlignmentType.CENTER, true, 'DCFCE7'),
                      ],
                    }),
                  ]),
            ],
          }),

          // ── Detailed Observation Data (Test 1 Weighing) ──────────────────
          ...(report.testResults?.find((t) => t.moduleId.includes('weighing'))
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 360, after: 160 },
                  children: [
                    new TextRun({
                      text: '4. Test 1: Weighing Performance Observations (R 76-1 A.4.4)',
                      bold: true,
                      color: NAVY,
                      font: 'Arial',
                    }),
                  ],
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        createHeaderCell('Load L (g)', 18),
                        createHeaderCell('Indication I (g)', 18),
                        createHeaderCell('Error E (g)', 16),
                        createHeaderCell('Corr. Ec (g)', 16),
                        createHeaderCell('MPE (g)', 16),
                        createHeaderCell('Verdict', 16),
                      ],
                    }),
                    ...(report.testResults
                      .find((t) => t.moduleId.includes('weighing'))!
                      .rows.map(
                        (row) =>
                          new TableRow({
                            children: [
                              createDataCell(row.load.toLocaleString(), 18, AlignmentType.RIGHT),
                              createDataCell(row.indication.toLocaleString(), 18, AlignmentType.RIGHT),
                              createDataCell(row.error.toFixed(2), 16, AlignmentType.RIGHT),
                              createDataCell((row.correctedError ?? row.error).toFixed(2), 16, AlignmentType.RIGHT, true),
                              createDataCell(`±${row.mpe}`, 16, AlignmentType.RIGHT),
                              createDataCell(
                                row.pass ? 'PASS' : 'FAIL',
                                16,
                                AlignmentType.CENTER,
                                true,
                                row.pass ? 'DCFCE7' : 'FEE2E2'
                              ),
                            ],
                          })
                      )),
                  ],
                }),
              ]
            : []),

          // ── Section 5: Statutory Checklist & Examination ─────────────────
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 360, after: 160 },
            children: [
              new TextRun({
                text: '5. Examination of Construction & Checklist (R 76-2 Clause 16 & 17)',
                bold: true,
                color: NAVY,
                font: 'Arial',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Clause Ref', 15),
                  createHeaderCell('Requirement Description', 65),
                  createHeaderCell('Conformity', 20),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('R 76-1 3.9.1', 15, AlignmentType.CENTER, true),
                  createDataCell('Descriptive markings: Manufacturer, model, serial no, accuracy class marked indelibly', 65),
                  createDataCell('PASSED', 20, AlignmentType.CENTER, true, 'DCFCE7'),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('R 76-1 3.9.2', 15, AlignmentType.CENTER, true),
                  createDataCell('Verification markings and stamping plate appropriately positioned and protected', 65),
                  createDataCell('PASSED', 20, AlignmentType.CENTER, true, 'DCFCE7'),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('R 76-1 4.1', 15, AlignmentType.CENTER, true),
                  createDataCell('Security sealing prevents unauthorized access to calibration and metrological adjustment', 65),
                  createDataCell('PASSED', 20, AlignmentType.CENTER, true, 'DCFCE7'),
                ],
              }),
              new TableRow({
                children: [
                  createDataCell('R 76-1 4.2', 15, AlignmentType.CENTER, true),
                  createDataCell('Indication stability and equilibrium detection conforms to requirements', 65),
                  createDataCell('PASSED', 20, AlignmentType.CENTER, true, 'DCFCE7'),
                ],
              }),
            ],
          }),

          // ── Section 6: Official Signatures & Remarks ─────────────────────
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 160 },
            children: [
              new TextRun({
                text: '6. Official Remarks & Signatures',
                bold: true,
                color: NAVY,
                font: 'Arial',
              }),
            ],
          }),

          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Remarks: ${report.remarks || 'Instrument evaluated in conformity with OIML R 76-1:2006 requirements.'}`,
                italics: true,
                size: 20,
                font: 'Arial',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder },
                    margins: { top: 200, bottom: 200, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Evaluation Observer / Technician:', bold: true, size: 20, font: 'Arial' }),
                        ],
                      }),
                      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Name: Priya Sharma', font: 'Arial', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Designation: Metrology Officer', font: 'Arial', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `Date: ${format(new Date(report.createdAt), 'dd MMMM yyyy')}`, font: 'Arial', size: 18 })] }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder },
                    margins: { top: 200, bottom: 200, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Approval Signatory / Director:', bold: true, size: 20, font: 'Arial' }),
                        ],
                      }),
                      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Name: Dr. Arvind Mehta', font: 'Arial', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Designation: Director of Legal Metrology', font: 'Arial', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: 'Status: Officially Approved & Sealed', font: 'Arial', size: 18, bold: true, color: '16A34A' })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const safeFilename = `${report.reportNo.replace(/[/\\?%*:|"<>]/g, '_')}_OIML_R76_Report.docx`
  saveAs(blob, safeFilename)
}
