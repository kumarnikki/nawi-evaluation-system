/**
 * NAWI Rules Engine — mpe.ts
 * Maximum Permissible Error calculations per OIML R 76-1:2006 Table 6
 * Uses decimal.js to avoid floating-point errors in scale-division comparisons.
 */
import Decimal from 'decimal.js'
import type { AccuracyClass } from './types'

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/** Table 6 thresholds in number-of-e units, per class */
const TABLE6: Record<
  AccuracyClass,
  { t: number[]; mpe_e: number[] }
> = {
  I:    { t: [50000, 200000],       mpe_e: [0.5, 1.0, 1.5] },
  II:   { t: [5000,  20000, 100000], mpe_e: [0.5, 1.0, 1.5] },
  III:  { t: [500,   2000,  10000],  mpe_e: [0.5, 1.0, 1.5] },
  IIII: { t: [50,    200,   1000],   mpe_e: [0.5, 1.0, 1.5] },
}

/**
 * Calculate mpe (in grams) for a given load on initial verification.
 *
 * @param load_g    - load in grams
 * @param e_g       - scale interval for the sub-range containing load_g
 * @param cls       - accuracy class
 * @param inService - if true, multiply mpe by 2 (in-service verification)
 *
 * R 76-1:2006 Table 6 / clause 3.6.1
 */
export function calcMpe(
  load_g: number,
  e_g: number,
  cls: AccuracyClass,
  inService = false
): number {
  const { t, mpe_e } = TABLE6[cls]

  // Number of e-divisions for this load
  const ne = new Decimal(load_g).div(e_g)

  let mpe_in_e: number
  if (ne.lte(t[0])) {
    mpe_in_e = mpe_e[0]
  } else if (ne.lte(t[1])) {
    mpe_in_e = mpe_e[1]
  } else if (t.length > 2 && ne.lte(t[2])) {
    mpe_in_e = mpe_e[2]
  } else {
    // Class I above 200 000 e is still 1.5e; class II above 100 000 e (n limit)
    // would fail Table 3 validation — we return mpe3 here for completeness
    mpe_in_e = mpe_e[mpe_e.length - 1]
  }

  const mpe = new Decimal(mpe_in_e).mul(e_g)
  return inService ? mpe.mul(2).toNumber() : mpe.toNumber()
}

/**
 * For multi-interval instruments, determine which interval a load belongs to
 * and return the corresponding e.
 *
 * @param load_g    - load in grams (net weight)
 * @param intervals - sorted ascending [{max_g, e_g}] list
 * @returns the e_g for that interval
 */
export function eForLoad(
  load_g: number,
  intervals: { max_g: number; e_g: number }[]
): number {
  // Near-zero: use e of first interval (R 76-1 clause 3.5)
  if (load_g <= 0) return intervals[0].e_g

  for (const interval of intervals) {
    if (new Decimal(load_g).lte(interval.max_g)) {
      return interval.e_g
    }
  }
  // Above max of last interval — shouldn't happen with valid data
  return intervals[intervals.length - 1].e_g
}

/**
 * Round to nearest scale division d.
 * Used when checking if an entered indication I is valid.
 */
export function roundToD(value_g: number, d_g: number): number {
  return new Decimal(value_g).div(d_g).toDecimalPlaces(0).mul(d_g).toNumber()
}

/**
 * Check if a value is a valid multiple of d (within float tolerance).
 */
export function isMultipleOfD(value_g: number, d_g: number): boolean {
  const rem = new Decimal(value_g).mod(d_g).abs()
  return rem.lt(new Decimal(d_g).mul(1e-9))
}

/**
 * Calculate P (true value at changeover point) per R 76-1 clause 3.8.
 * P = I + ½e − ΔL
 *
 * @param I    - indication in grams
 * @param e_g  - scale interval
 * @param dL   - ΔL = smallest supplementary weight that changes indication (in grams)
 */
export function calcP(I: number, e_g: number, dL: number): number {
  return new Decimal(I).plus(new Decimal(e_g).div(2)).minus(dL).toNumber()
}

/**
 * Calculate error E using the changeover method.
 * E = I + ½e − ΔL − L = P − L
 * (R 76-1 clause 3.8.3.2 / Annex A)
 */
export function calcE_changeover(I: number, e_g: number, dL: number, L: number): number {
  return new Decimal(calcP(I, e_g, dL)).minus(L).toNumber()
}

/**
 * Calculate error E by direct reading (when d < 0.2e is not true — simplified form).
 * E = I − L
 */
export function calcE_direct(I: number, L: number): number {
  return new Decimal(I).minus(L).toNumber()
}

/**
 * Calculate corrected error Ec = E − E0
 * where E0 is the error at or near zero.
 */
export function calcEc(E: number, E0: number): number {
  return new Decimal(E).minus(E0).toNumber()
}

/**
 * Check if the error passes: |Ec| ≤ mpe
 */
export function passCheck(Ec: number, mpe: number): boolean {
  return new Decimal(Ec).abs().lte(mpe)
}

/**
 * Validate that e is of the form 1, 2, or 5 × 10^k.
 */
export function isValidEForm(e_g: number): boolean {
  if (e_g <= 0 || !Number.isFinite(e_g)) return false
  const log10 = Math.floor(Math.log10(e_g))
  const mantissa = e_g / Math.pow(10, log10)
  return (
    Math.abs(mantissa - 1) < 1e-9 ||
    Math.abs(mantissa - 2) < 1e-9 ||
    Math.abs(mantissa - 5) < 1e-9
  )
}

