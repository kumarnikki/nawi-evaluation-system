/**
 * NAWI Rules Engine — calculations.ts
 * Higher-level calculation functions for individual test modules.
 */
import Decimal from 'decimal.js'
import { calcMpe, calcE_changeover, calcE_direct, calcEc, passCheck, eForLoad } from './mpe'
import type { InstrumentParams, AccuracyClass } from './types'

// ── Weighing Performance (Test 1) ──────────────────────────────────────────

export interface WeighingRow {
  load_g: number
  I_g: number      // indication
  dL_g: number     // ΔL (changeover supplementary weight)
  direction: 'up' | 'down'
}

export interface WeighingRowResult extends WeighingRow {
  P_g: number        // P = I + ½e - ΔL
  E_g: number        // E = P - L
  Ec_g: number       // Ec = E - E0
  mpe_g: number      // mpe applicable
  pass: boolean
  formula: string
}

export function calcWeighingPerformance(
  rows: WeighingRow[],
  params: InstrumentParams,
  inService = false
): { rows: WeighingRowResult[]; E0_g: number; verdict: boolean; reasons: string[] } {
  const reasons: string[] = []

  // First row is zero (E0)
  if (rows.length === 0) {
    return { rows: [], E0_g: 0, verdict: false, reasons: ['No data rows provided.'] }
  }

  const firstRow = rows[0]
  const e_g = params.isMultiInterval && params.intervals
    ? eForLoad(firstRow.load_g, params.intervals)
    : params.e_g

  const E0_g = calcE_changeover(firstRow.I_g, e_g, firstRow.dL_g, firstRow.load_g)

  const results: WeighingRowResult[] = rows.map((row) => {
    const rowE_g = params.isMultiInterval && params.intervals
      ? eForLoad(row.load_g, params.intervals)
      : params.e_g

    const P_g = calcE_changeover(row.I_g, rowE_g, row.dL_g, 0) + row.I_g - (row.I_g - row.dL_g + rowE_g / 2 - row.load_g + row.load_g)
    // Recalculate properly:
    const P_correct = new Decimal(row.I_g).plus(new Decimal(rowE_g).div(2)).minus(row.dL_g).toNumber()
    const E_g = new Decimal(P_correct).minus(row.load_g).toNumber()
    const Ec_g = calcEc(E_g, E0_g)
    const mpe_g = calcMpe(row.load_g, rowE_g, params.accuracyClass, inService)
    const pass = passCheck(Ec_g, mpe_g)

    if (!pass) {
      reasons.push(`Load ${row.load_g}g (${row.direction}): |Ec| = ${Math.abs(Ec_g).toFixed(4)}g > mpe = ${mpe_g}g`)
    }

    return {
      ...row,
      P_g: P_correct,
      E_g,
      Ec_g,
      mpe_g,
      pass,
      formula: `P = ${row.I_g} + ${rowE_g}/2 - ${row.dL_g} = ${P_correct.toFixed(4)}g; E = P - L = ${E_g.toFixed(4)}g; Ec = E - E0 = ${Ec_g.toFixed(4)}g; mpe = ${mpe_g}g`,
    }
  })

  const verdict = results.every((r) => r.pass)
  return { rows: results, E0_g, verdict, reasons }
}

// ── Repeatability (Test 5) ─────────────────────────────────────────────────

export interface RepeatabilityRow {
  load_g: number
  I_g: number
  dL_g: number
  series: 1 | 2
  trial: number
}

export interface RepeatabilityResult {
  series: 1 | 2
  load_g: number
  readings: number[]
  Pvalues: number[]
  Pmax: number
  Pmin: number
  range: number
  mpe_g: number
  pass: boolean
}

export function calcRepeatability(
  rows: RepeatabilityRow[],
  params: InstrumentParams,
  inService = false
): { results: RepeatabilityResult[]; verdict: boolean; reasons: string[] } {
  const reasons: string[] = []
  const seriesGroups = new Map<string, RepeatabilityRow[]>()

  for (const row of rows) {
    const key = `${row.series}-${row.load_g}`
    if (!seriesGroups.has(key)) seriesGroups.set(key, [])
    seriesGroups.get(key)!.push(row)
  }

  const results: RepeatabilityResult[] = []

  for (const [, groupRows] of seriesGroups) {
    const load_g = groupRows[0].load_g
    const e_g = params.isMultiInterval && params.intervals
      ? eForLoad(load_g, params.intervals)
      : params.e_g
    const mpe_g = calcMpe(load_g, e_g, params.accuracyClass, inService)

    const Pvalues = groupRows.map((r) =>
      new Decimal(r.I_g).plus(new Decimal(e_g).div(2)).minus(r.dL_g).toNumber()
    )
    const Pmax = Math.max(...Pvalues)
    const Pmin = Math.min(...Pvalues)
    const range = new Decimal(Pmax).minus(Pmin).toNumber()
    const pass = new Decimal(range).lte(mpe_g)

    if (!pass) {
      reasons.push(`Repeatability at ${load_g}g: range = ${range.toFixed(4)}g > mpe = ${mpe_g}g`)
    }

    results.push({
      series: groupRows[0].series,
      load_g,
      readings: groupRows.map((r) => r.I_g),
      Pvalues,
      Pmax,
      Pmin,
      range,
      mpe_g,
      pass,
    })
  }

  return { results, verdict: results.every((r) => r.pass), reasons }
}

// ── Creep (Test 6.2) ───────────────────────────────────────────────────────

export interface CreepRow {
  time_min: number
  I_g: number
  dL_g: number
}

export interface CreepResult {
  rows: Array<CreepRow & { P_g: number; dP_g: number; pass: boolean }>
  earlyTermination: boolean
  verdict: boolean
  reasons: string[]
}

export function calcCreep(
  rows: CreepRow[],
  params: InstrumentParams,
  loadNearMax_g: number,
  inService = false
): CreepResult {
  const reasons: string[] = []
  const e_g = params.isMultiInterval && params.intervals
    ? eForLoad(loadNearMax_g, params.intervals)
    : params.e_g

  const e1_g = params.isMultiInterval && params.intervals
    ? params.intervals[0].e_g
    : params.e_g

  const mpe_g = calcMpe(loadNearMax_g, e_g, params.accuracyClass, inService)

  const P0 = rows.length > 0
    ? new Decimal(rows[0].I_g).plus(new Decimal(e_g).div(2)).minus(rows[0].dL_g).toNumber()
    : 0

  const processedRows = rows.map((row) => {
    const P_g = new Decimal(row.I_g).plus(new Decimal(e_g).div(2)).minus(row.dL_g).toNumber()
    const dP_g = new Decimal(P_g).minus(P0).toNumber()
    return { ...row, P_g, dP_g, pass: true }
  })

  // Check early termination (within 30 min)
  const at15 = processedRows.find((r) => r.time_min === 15)
  const at30 = processedRows.find((r) => r.time_min === 30)

  let earlyTermination = false
  if (at15 && at30) {
    const change_15_30 = Math.abs(new Decimal(at30.dP_g).minus(at15.dP_g).toNumber())
    const maxAt30 = Math.abs(at30.dP_g)

    if (
      maxAt30 <= 0.5 * e1_g &&
      change_15_30 <= 0.2 * e1_g
    ) {
      earlyTermination = true
    }
  }

  // Determine pass/fail
  let verdict = true
  for (const row of processedRows) {
    const pass = Math.abs(row.dP_g) <= (earlyTermination ? 0.5 * e1_g : mpe_g)
    row.pass = pass
    if (!pass) {
      reasons.push(`Creep at t=${row.time_min} min: |ΔP| = ${Math.abs(row.dP_g).toFixed(4)}g > limit`)
      verdict = false
    }
  }

  return { rows: processedRows, earlyTermination, verdict, reasons }
}

// ── Temperature Effect (Test 2) ────────────────────────────────────────────

export interface TempEffectRow {
  date: string
  time: string
  temp_C: number
  I_g: number       // zero indication
  dL_g: number
}

export interface TempEffectResult {
  rows: Array<TempEffectRow & { P_g: number; dP_g: number; dTemp: number; changePerRef: number; pass: boolean }>
  verdict: boolean
  reasons: string[]
}

export function calcTempEffect(
  rows: TempEffectRow[],
  params: InstrumentParams,
): TempEffectResult {
  const reasons: string[] = []
  const cls = params.accuracyClass

  // Reference interval for temperature effect
  const refInterval_C = cls === 'I' ? 1 : 5

  // e to use: smallest e for multi-interval/multiple range
  const e_g = params.isMultiInterval && params.intervals
    ? Math.min(...params.intervals.map((i) => i.e_g))
    : params.e_g

  // Limit: 1e per reference interval
  const limit_g = e_g

  const P0 = rows.length > 0
    ? new Decimal(rows[0].I_g).plus(new Decimal(e_g).div(2)).minus(rows[0].dL_g).toNumber()
    : 0
  const temp0 = rows.length > 0 ? rows[0].temp_C : 20

  const processedRows = rows.map((row) => {
    const P_g = new Decimal(row.I_g).plus(new Decimal(e_g).div(2)).minus(row.dL_g).toNumber()
    const dP_g = new Decimal(P_g).minus(P0).toNumber()
    const dTemp = new Decimal(row.temp_C).minus(temp0).toNumber()

    const changePerRef = dTemp === 0
      ? 0
      : new Decimal(Math.abs(dP_g)).div(Math.abs(dTemp)).mul(refInterval_C).toNumber()

    const pass = changePerRef <= limit_g

    if (!pass) {
      reasons.push(
        `Temp effect at ${row.temp_C}°C: change = ${changePerRef.toFixed(4)}g per ${refInterval_C}°C > ${limit_g}g`
      )
    }

    return { ...row, P_g, dP_g, dTemp, changePerRef, pass }
  })

  return { rows: processedRows, verdict: processedRows.every((r) => r.pass), reasons }
}

// ── Span Stability plot data ───────────────────────────────────────────────

export interface SpanMeasurement {
  measurementNo: number
  date: string
  E0readings: number[]  // 5 zero error readings
  ELreadings: number[]  // 5 loaded error readings
  marker?: 'T' | 'D' | 'P' // T=temp, D=damp-heat, P=power disconnect
}

export interface SpanStabilityResult {
  measurements: Array<{
    measurementNo: number
    avgE0: number
    avgEL: number
    avgDiff: number   // EL - E0 average
    date: string
    marker?: 'T' | 'D' | 'P'
  }>
  maxDiff: number
  minDiff: number
  variation: number
  limit_g: number
  verdict: boolean
  reasons: string[]
}

export function calcSpanStability(
  measurements: SpanMeasurement[],
  params: InstrumentParams,
  spanStabilityLimit_e = 0.5,
  inService = false
): SpanStabilityResult {
  const e_g = params.isMultiInterval && params.intervals
    ? params.intervals[params.intervals.length - 1].e_g
    : params.e_g

  const limit_g = new Decimal(spanStabilityLimit_e).mul(e_g).toNumber()
  const reasons: string[] = []

  const processed = measurements.map((m) => {
    const avgE0 = m.E0readings.reduce((a, b) => a + b, 0) / m.E0readings.length
    const avgEL = m.ELreadings.reduce((a, b) => a + b, 0) / m.ELreadings.length
    const avgDiff = new Decimal(avgEL).minus(avgE0).toNumber()
    return {
      measurementNo: m.measurementNo,
      avgE0,
      avgEL,
      avgDiff,
      date: m.date,
      marker: m.marker,
    }
  })

  const diffs = processed.map((p) => p.avgDiff)
  const maxDiff = Math.max(...diffs)
  const minDiff = Math.min(...diffs)
  const variation = new Decimal(maxDiff).minus(minDiff).abs().toNumber()
  const verdict = variation <= limit_g

  if (!verdict) {
    reasons.push(`Span stability variation = ${variation.toFixed(4)}g > limit ${limit_g}g (${spanStabilityLimit_e}e = ${limit_g}g)`)
  }

  return { measurements: processed, maxDiff, minDiff, variation, limit_g, verdict, reasons }
}
