/**
 * NAWI Rules Engine — tableValidation.ts
 * Validates instrument parameters against R 76-1:2006 Tables 3 and 4.
 */
import Decimal from 'decimal.js'
import type { AccuracyClass, InstrumentParams } from './types'
import { isValidEForm } from './mpe'
import rulesetJson from '@/rulesets/oiml-r76-1-2006.json'

export interface ValidationError {
  field: string
  message: string
  clause: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: string[]
}

type Table3Row = { eMin_g: number; eMax_g: number | null; nMin: number; nMax: number | null; minDivisions: number }

const table3 = rulesetJson.table3 as Record<AccuracyClass, Table3Row[]>
const table4 = rulesetJson.table4 as Record<AccuracyClass, number>

/**
 * Find the Table 3 row applicable for a given class and e value.
 */
function findTable3Row(cls: AccuracyClass, e_g: number): Table3Row | undefined {
  const rows = table3[cls]
  if (!rows) return undefined
  return rows.find((row) => {
    const eGtMin = new Decimal(e_g).gte(row.eMin_g)
    const eLtMax = row.eMax_g === null || new Decimal(e_g).lte(row.eMax_g)
    return eGtMin && eLtMax
  })
}

/**
 * Validate a single-interval instrument against Table 3.
 * R 76-1:2006 clause 3.2, Table 3
 */
export function validateTable3(params: InstrumentParams): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  const { accuracyClass: cls, max_g, min_g, e_g, d_g } = params

  // e must be valid form: 1, 2, 5 × 10^k
  if (!isValidEForm(e_g)) {
    errors.push({
      field: 'e',
      message: `e (${e_g} g) must be of the form 1, 2, or 5 × 10^k.`,
      clause: 'R 76-1 3.2',
    })
  }

  // d must be ≤ e
  if (new Decimal(d_g).gt(e_g)) {
    errors.push({
      field: 'd',
      message: `d (${d_g} g) must not exceed e (${e_g} g).`,
      clause: 'R 76-1 3.2',
    })
  }

  // When d < e, e must be ≤ 10d
  if (new Decimal(d_g).lt(e_g)) {
    if (new Decimal(e_g).gt(new Decimal(d_g).mul(10))) {
      errors.push({
        field: 'e',
        message: `When d < e, e must be ≤ 10d (e=${e_g}g, 10d=${new Decimal(d_g).mul(10)}g).`,
        clause: 'R 76-1 3.2',
      })
    }
  }

  const row = findTable3Row(cls, e_g)
  if (!row) {
    errors.push({
      field: 'e',
      message: `e (${e_g} g) is out of the allowed range for class ${cls}.`,
      clause: 'R 76-1 Table 3',
    })
    return { valid: false, errors, warnings }
  }

  const n = new Decimal(max_g).div(e_g).toNumber()

  // n must be ≥ nMin
  if (n < row.nMin) {
    errors.push({
      field: 'n',
      message: `n = Max/e = ${n.toFixed(0)} is below minimum ${row.nMin} for class ${cls}.`,
      clause: 'R 76-1 Table 3',
    })
  }

  // n must be ≤ nMax (if specified)
  if (row.nMax !== null && n > row.nMax) {
    errors.push({
      field: 'n',
      message: `n = Max/e = ${n.toFixed(0)} exceeds maximum ${row.nMax} for class ${cls}.`,
      clause: 'R 76-1 Table 3',
    })
  }

  // Min must be ≥ minDivisions × e
  const minMinRequired = new Decimal(row.minDivisions).mul(e_g).toNumber()
  if (min_g > 0 && min_g < minMinRequired) {
    errors.push({
      field: 'min',
      message: `Min (${min_g} g) must be ≥ ${row.minDivisions}e = ${minMinRequired} g for class ${cls}.`,
      clause: 'R 76-1 Table 3',
    })
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Validate a multi-interval instrument against Table 4.
 * R 76-1:2006 clause 3.5, Table 4
 */
export function validateTable4(params: InstrumentParams): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  if (!params.isMultiInterval || !params.intervals || params.intervals.length < 2) {
    return { valid: true, errors, warnings }
  }

  const cls = params.accuracyClass
  const nMinPartial = table4[cls]

  for (let i = 0; i < params.intervals.length; i++) {
    const interval = params.intervals[i]
    const prevMax_g = i === 0 ? 0 : params.intervals[i - 1].max_g
    const partialN = new Decimal(interval.max_g).minus(prevMax_g).div(interval.e_g).toNumber()

    if (partialN < nMinPartial) {
      errors.push({
        field: `interval[${i}].n`,
        message: `Partial n for interval ${i + 1} = ${partialN.toFixed(0)} < minimum ${nMinPartial} for class ${cls}.`,
        clause: 'R 76-1 Table 4',
      })
    }

    // Each e_i must be valid form
    if (!isValidEForm(interval.e_g)) {
      errors.push({
        field: `interval[${i}].e`,
        message: `e for interval ${i + 1} (${interval.e_g} g) must be of the form 1, 2, or 5 × 10^k.`,
        clause: 'R 76-1 3.5',
      })
    }

    // e must increase across intervals
    if (i > 0 && new Decimal(interval.e_g).lte(params.intervals[i - 1].e_g)) {
      errors.push({
        field: `interval[${i}].e`,
        message: `e for interval ${i + 1} must be greater than e for interval ${i}.`,
        clause: 'R 76-1 3.5',
      })
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Full instrument parameter validation combining Table 3 and Table 4 checks.
 */
export function validateInstrumentParams(params: InstrumentParams): ValidationResult {
  const t3 = validateTable3(params)

  const allErrors: ValidationError[] = [...t3.errors]
  const allWarnings: string[] = [...t3.warnings]

  if (params.isMultiInterval) {
    const t4 = validateTable4(params)
    allErrors.push(...t4.errors)
    allWarnings.push(...t4.warnings)
  }

  return { valid: allErrors.length === 0, errors: allErrors, warnings: allWarnings }
}

/**
 * Compute n = Max / e. Returns as an integer.
 */
export function computeN(max_g: number, e_g: number): number {
  return Math.round(new Decimal(max_g).div(e_g).toNumber())
}
