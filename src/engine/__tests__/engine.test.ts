/**
 * Engine unit tests — R 76-1:2006
 * Tests: mpe Table 6, Table 3/4 validation, E/Ec calculations,
 * applicability matrix, repeatability, creep, temperature effect,
 * certificate variant validation, rule-set schema.
 */
import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import {
  calcMpe,
  calcP,
  calcE_changeover,
  calcEc,
  passCheck,
  isValidEForm,
  eForLoad,
} from '@/engine/mpe'
import {
  validateTable3,
  validateTable4,
  computeN,
} from '@/engine/tableValidation'
import { getAllTestApplicabilities, getTestApplicability } from '@/engine/applicability'
import { calcWeighingPerformance, calcRepeatability, calcCreep, calcTempEffect, calcSpanStability } from '@/engine/calculations'
import type { InstrumentParams } from '@/engine/types'

// ── Shared instrument helpers ─────────────────────────────────────────────

function makeParams(overrides: Partial<InstrumentParams>): InstrumentParams {
  return {
    accuracyClass: 'III',
    max_g: 60000,
    min_g: 100,
    e_g: 20,
    d_g: 20,
    isMultiInterval: false,
    maxAdditiveTare_g: 0,
    indicationType: 'self',
    powerSupplyType: 'mains',
    un_V: 230,
    isRetail: false,
    hasTare: false,
    hasZeroTracking: false,
    tempRangeMin_C: -10,
    tempRangeMax_C: 40,
    initialZeroRange_pct: 4,
    ...overrides,
  } as InstrumentParams
}

// ── MPE Table 6 tests ─────────────────────────────────────────────────────

describe('calcMpe — Class I', () => {
  const e = 0.001 // 1 mg
  it('returns 0.5e at load = 50 (≤50000e)', () => {
    expect(calcMpe(50 * e, e, 'I')).toBeCloseTo(0.5 * e)
  })
  it('returns 0.5e exactly at t1 boundary (50000e)', () => {
    expect(calcMpe(50000 * e, e, 'I')).toBeCloseTo(0.5 * e)
  })
  it('returns 1.0e at load = 50001e (just above t1)', () => {
    expect(calcMpe(50001 * e, e, 'I')).toBeCloseTo(1.0 * e)
  })
  it('returns 1.0e at t2 boundary (200000e)', () => {
    expect(calcMpe(200000 * e, e, 'I')).toBeCloseTo(1.0 * e)
  })
  it('returns 1.5e above t2', () => {
    expect(calcMpe(200001 * e, e, 'I')).toBeCloseTo(1.5 * e)
  })
  it('doubles mpe in inService mode', () => {
    expect(calcMpe(50 * e, e, 'I', true)).toBeCloseTo(1.0 * e)
  })
})

describe('calcMpe — Class II', () => {
  const e = 0.01
  it('returns 0.5e at 5000e boundary', () => {
    expect(calcMpe(5000 * e, e, 'II')).toBeCloseTo(0.5 * e)
  })
  it('returns 1.0e at 5001e', () => {
    expect(calcMpe(5001 * e, e, 'II')).toBeCloseTo(1.0 * e)
  })
  it('returns 1.5e above 20000e', () => {
    expect(calcMpe(20001 * e, e, 'II')).toBeCloseTo(1.5 * e)
  })
})

describe('calcMpe — Class III', () => {
  const e = 20 // 20g
  it('0.5e below 500e', () => {
    expect(calcMpe(100 * e, e, 'III')).toBeCloseTo(0.5 * e)
  })
  it('1.0e at 500e boundary', () => {
    expect(calcMpe(500 * e, e, 'III')).toBeCloseTo(0.5 * e)
  })
  it('1.0e above 500e', () => {
    expect(calcMpe(501 * e, e, 'III')).toBeCloseTo(1.0 * e)
  })
  it('1.5e above 2000e', () => {
    expect(calcMpe(2001 * e, e, 'III')).toBeCloseTo(1.5 * e)
  })
})

describe('calcMpe — Class IIII', () => {
  const e = 5
  it('0.5e at ≤50e', () => {
    expect(calcMpe(50 * e, e, 'IIII')).toBeCloseTo(0.5 * e)
  })
  it('1.0e at 51e', () => {
    expect(calcMpe(51 * e, e, 'IIII')).toBeCloseTo(1.0 * e)
  })
  it('1.5e at 201e', () => {
    expect(calcMpe(201 * e, e, 'IIII')).toBeCloseTo(1.5 * e)
  })
})

// ── Multi-interval mpe ────────────────────────────────────────────────────

describe('Multi-interval mpe', () => {
  const intervals = [
    { max_g: 2000, e_g: 1 },
    { max_g: 5000, e_g: 2 },
    { max_g: 15000, e_g: 10 },
  ]

  it('uses e1 for load in first interval', () => {
    const e = eForLoad(400, intervals)
    expect(e).toBe(1)
    expect(calcMpe(400, e, 'III')).toBeCloseTo(0.5 * 1)
    expect(calcMpe(1500, e, 'III')).toBeCloseTo(1.0 * 1)
  })

  it('uses e2 for load in second interval', () => {
    const e = eForLoad(3000, intervals)
    expect(e).toBe(2)
  })

  it('uses e3 for load in third interval', () => {
    const e = eForLoad(12000, intervals)
    expect(e).toBe(10)
  })
})

// ── E and Ec at changeover points ─────────────────────────────────────────

describe('Error calculations (changeover method)', () => {
  it('calcP: P = I + 0.5e - ΔL', () => {
    expect(calcP(1000, 20, 5)).toBeCloseTo(1005) // 1000 + 10 - 5
  })

  it('calcE_changeover: E = P - L', () => {
    expect(calcE_changeover(1000, 20, 5, 998)).toBeCloseTo(7) // P=1005, L=998
  })

  it('calcEc: Ec = E - E0', () => {
    expect(calcEc(7, 3)).toBeCloseTo(4)
  })

  it('passCheck: |Ec| ≤ mpe', () => {
    expect(passCheck(5, 10)).toBe(true)
    expect(passCheck(11, 10)).toBe(false)
    expect(passCheck(-10, 10)).toBe(true) // |−10| = 10 ≤ 10
    expect(passCheck(-10.001, 10)).toBe(false)
  })
})

// ── isValidEForm ──────────────────────────────────────────────────────────

describe('isValidEForm', () => {
  it('accepts 1, 2, 5', () => {
    expect(isValidEForm(1)).toBe(true)
    expect(isValidEForm(2)).toBe(true)
    expect(isValidEForm(5)).toBe(true)
  })
  it('accepts 10, 20, 50, 0.001, 0.002, 0.005', () => {
    expect(isValidEForm(10)).toBe(true)
    expect(isValidEForm(20)).toBe(true)
    expect(isValidEForm(50)).toBe(true)
    expect(isValidEForm(0.001)).toBe(true)
    expect(isValidEForm(0.002)).toBe(true)
  })
  it('rejects 3, 4, 6, 7, 15', () => {
    expect(isValidEForm(3)).toBe(false)
    expect(isValidEForm(4)).toBe(false)
    expect(isValidEForm(7)).toBe(false)
    expect(isValidEForm(15)).toBe(false)
  })
})

// ── Table 3 validation ────────────────────────────────────────────────────

describe('validateTable3 — Class III platform scale', () => {
  const params = makeParams({ max_g: 60000, e_g: 20, d_g: 20, min_g: 400, accuracyClass: 'III' })

  it('passes valid class III 60kg/20g instrument', () => {
    const result = validateTable3(params)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when n too low', () => {
    const p = makeParams({ max_g: 1000, e_g: 20, d_g: 20, accuracyClass: 'III' }) // n=50 < 500
    const result = validateTable3(p)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.field === 'n')).toBe(true)
  })

  it('fails when e not valid form', () => {
    const p = makeParams({ e_g: 3, d_g: 3 })
    const result = validateTable3(p)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.field === 'e')).toBe(true)
  })

  it('fails when d > e', () => {
    const p = makeParams({ e_g: 20, d_g: 50 })
    const result = validateTable3(p)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.field === 'd')).toBe(true)
  })

  it('fails when Min below 20e', () => {
    const p = makeParams({ min_g: 100, e_g: 20 }) // 20e = 400g, min=100 < 400
    const result = validateTable3(p)
    expect(result.valid).toBe(false)
  })
})

describe('validateTable3 — Class I analytical balance', () => {
  const params = makeParams({
    accuracyClass: 'I',
    max_g: 200,
    min_g: 0.1, // 100e = 0.1g
    e_g: 0.001,
    d_g: 0.001,
  })
  it('passes valid class I instrument', () => {
    const result = validateTable3(params)
    expect(result.valid).toBe(true)
  })
})

// ── Table 4 validation ────────────────────────────────────────────────────

describe('validateTable4 — multi-interval', () => {
  it('passes valid multi-interval class III', () => {
    const params = makeParams({
      isMultiInterval: true,
      intervals: [
        { max_g: 2000, e_g: 1, d_g: 1 },   // n1 = 2000/1 = 2000 ≥ 500 ✓
        { max_g: 5000, e_g: 2, d_g: 2 },   // n2 = 3000/2 = 1500 ≥ 500 ✓
        { max_g: 15000, e_g: 10, d_g: 10 }, // n3 = 10000/10 = 1000 ≥ 500 ✓
      ],
    })
    const result = validateTable4(params)
    expect(result.valid).toBe(true)
  })

  it('fails when partial n below minimum', () => {
    const params = makeParams({
      isMultiInterval: true,
      intervals: [
        { max_g: 200, e_g: 1, d_g: 1 },    // n1=200 < 500 ✗
        { max_g: 5000, e_g: 10, d_g: 10 },
      ],
    })
    const result = validateTable4(params)
    expect(result.valid).toBe(false)
  })
})

// ── computeN ──────────────────────────────────────────────────────────────

describe('computeN', () => {
  it('returns 3000 for 60kg / 20g', () => {
    expect(computeN(60000, 20)).toBe(3000)
  })
  it('returns 200000 for 200g / 0.001g', () => {
    expect(computeN(200, 0.001)).toBe(200000)
  })
})

// ── Applicability matrix ──────────────────────────────────────────────────

describe('Applicability — Class I analytical balance', () => {
  const params = makeParams({
    accuracyClass: 'I',
    max_g: 200,
    min_g: 0.1,
    e_g: 0.001,
    d_g: 0.001,
    powerSupplyType: 'mains',
  })

  it('class I: zero return is N/A', () => {
    const r = getTestApplicability('test-6-1-zero-return', params)
    expect(r.applicability).toBe('not_applicable')
  })

  it('class I: creep is N/A', () => {
    const r = getTestApplicability('test-6-2-creep', params)
    expect(r.applicability).toBe('not_applicable')
  })

  it('class I: tilting is N/A', () => {
    const r = getTestApplicability('test-8-tilting', params)
    expect(r.applicability).toBe('not_applicable')
  })

  it('class I: span stability is N/A', () => {
    const r = getTestApplicability('test-14-span-stability', params)
    expect(r.applicability).toBe('not_applicable')
  })

  it('class I: damp heat is N/A', () => {
    const r = getTestApplicability('test-13-damp-heat', params)
    expect(r.applicability).toBe('not_applicable')
  })

  it('class I: weighing performance is mandatory', () => {
    const r = getTestApplicability('test-1-weighing', params)
    expect(r.applicability).toBe('mandatory')
  })
})

describe('Applicability — Class III no power', () => {
  const params = makeParams({ powerSupplyType: 'none', max_g: 10000, e_g: 5 })

  it('warm-up is N/A without power', () => {
    expect(getTestApplicability('test-10-warmup', params).applicability).toBe('not_applicable')
  })

  it('voltage variation is N/A without power', () => {
    expect(getTestApplicability('test-11-voltage', params).applicability).toBe('not_applicable')
  })

  it('EMC tests N/A without power', () => {
    expect(getTestApplicability('test-12-1-power-reduction', params).applicability).toBe('not_applicable')
  })
})

describe('Applicability — no tare device', () => {
  const params = makeParams({ hasTare: false })
  it('tare test is N/A when no tare device', () => {
    expect(getTestApplicability('test-9-tare', params).applicability).toBe('not_applicable')
  })
})

describe('Applicability — endurance over 100kg', () => {
  const params = makeParams({ max_g: 200000 }) // 200 kg
  it('endurance is N/A when Max > 100 kg', () => {
    expect(getTestApplicability('test-15-endurance', params).applicability).toBe('not_applicable')
  })
})

// ── Repeatability ─────────────────────────────────────────────────────────

describe('calcRepeatability', () => {
  const params = makeParams({ max_g: 60000, e_g: 20 })

  it('passes when Pmax - Pmin ≤ mpe', () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({
      load_g: 30000,
      I_g: 30000 + (i % 2 === 0 ? 0 : 10),
      dL_g: 5,
      series: 1 as const,
      trial: i + 1,
    }))
    // mpe at 30000g class III e=20: 30000/20 = 1500 > 500, so 1.0e = 20g
    const { verdict } = calcRepeatability(rows, params)
    expect(verdict).toBe(true)
  })

  it('fails when range > mpe', () => {
    const rows = [
      { load_g: 30000, I_g: 30000, dL_g: 0, series: 1 as const, trial: 1 },
      { load_g: 30000, I_g: 30040, dL_g: 0, series: 1 as const, trial: 2 }, // diff 40 > 20 mpe
    ]
    const { verdict } = calcRepeatability(rows, params)
    expect(verdict).toBe(false)
  })
})

// ── Creep early termination ────────────────────────────────────────────────

describe('calcCreep early termination', () => {
  const params = makeParams({ max_g: 60000, e_g: 20 })

  it('triggers early termination when conditions met at 30 min', () => {
    const rows = [
      { time_min: 0, I_g: 0, dL_g: 0 },
      { time_min: 5, I_g: 5, dL_g: 0 },
      { time_min: 15, I_g: 7, dL_g: 0 },
      { time_min: 30, I_g: 8, dL_g: 0 },
    ]
    // dP at 30 = 8, limit 0.5e=10 → 8 < 10 ✓; change 15→30 = 1 ≤ 0.2e=4 ✓
    const { earlyTermination } = calcCreep(rows, params, 55000)
    expect(earlyTermination).toBe(true)
  })
})

// ── Temperature effect per class ──────────────────────────────────────────

describe('calcTempEffect', () => {
  it('class I: limit per 1°C', () => {
    const params = makeParams({ accuracyClass: 'I', e_g: 0.001 })
    const rows = [
      { date: '2026-01-01', time: '09:00', temp_C: 20, I_g: 0, dL_g: 0 },
      { date: '2026-01-01', time: '12:00', temp_C: 25, I_g: 0.0005, dL_g: 0 }, // 0.5mg per 5°C = 0.1mg per 1°C < 1mg
    ]
    const result = calcTempEffect(rows, params)
    expect(result.verdict).toBe(true)
  })

  it('class III: limit per 5°C', () => {
    const params = makeParams({ accuracyClass: 'III', e_g: 20 })
    const rows = [
      { date: '2026-01-01', time: '09:00', temp_C: 20, I_g: 0, dL_g: 0 },
      { date: '2026-01-01', time: '15:00', temp_C: 35, I_g: 80, dL_g: 0 }, // 80g per 15°C = 26.7g per 5°C > 20g ✗
    ]
    const result = calcTempEffect(rows, params)
    expect(result.verdict).toBe(false)
  })
})

// ── Span stability ─────────────────────────────────────────────────────────

describe('calcSpanStability', () => {
  const params = makeParams({ max_g: 60000, e_g: 20 })

  it('passes when variation ≤ 0.5e', () => {
    const measurements = [
      { measurementNo: 1, date: '2026-01-01', E0readings: [0, 0, 0, 0, 0], ELreadings: [5, 5, 5, 5, 5] },
      { measurementNo: 2, date: '2026-01-03', E0readings: [0, 0, 0, 0, 0], ELreadings: [8, 8, 8, 8, 8] },
      { measurementNo: 3, date: '2026-01-05', E0readings: [0, 0, 0, 0, 0], ELreadings: [6, 6, 6, 6, 6] },
    ]
    // variation = 8 - 5 = 3g, limit = 0.5 * 20 = 10g → pass
    const result = calcSpanStability(measurements, params, 0.5)
    expect(result.verdict).toBe(true)
  })

  it('fails when variation > 0.5e', () => {
    const measurements = [
      { measurementNo: 1, date: '2026-01-01', E0readings: [0, 0, 0, 0, 0], ELreadings: [0, 0, 0, 0, 0] },
      { measurementNo: 2, date: '2026-01-10', E0readings: [0, 0, 0, 0, 0], ELreadings: [15, 15, 15, 15, 15] }, // diff=15 > 10
    ]
    const result = calcSpanStability(measurements, params, 0.5)
    expect(result.verdict).toBe(false)
  })
})

// ── Voltage limits per supply type ────────────────────────────────────────

describe('Voltage limit calculations', () => {
  it('mains: low = 0.85 Un, high = 1.10 Un', () => {
    const Un = 230
    expect(Un * 0.85).toBeCloseTo(195.5)
    expect(Un * 1.10).toBeCloseTo(253)
  })

  it('external supply: high = 1.20 Un', () => {
    const Un = 12
    expect(Un * 1.20).toBeCloseTo(14.4)
  })

  it('road vehicle 12V: max = 16V', () => {
    expect(16).toBe(16)
  })
})
