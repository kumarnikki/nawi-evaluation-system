import { z } from 'zod'

// ── Accuracy class ─────────────────────────────────────────────────────────
export const AccuracyClassSchema = z.enum(['I', 'II', 'III', 'IIII'])
export type AccuracyClass = z.infer<typeof AccuracyClassSchema>

// ── Instrument parameter ────────────────────────────────────────────────────
export const InstrumentParamsSchema = z.object({
  accuracyClass: AccuracyClassSchema,
  /** Max capacity in grams */
  max_g: z.number().positive(),
  /** Min capacity in grams */
  min_g: z.number().nonnegative(),
  /** Scale interval e in grams */
  e_g: z.number().positive(),
  /** Actual scale division d in grams (≤ e) */
  d_g: z.number().positive(),
  /** Multi-interval flag */
  isMultiInterval: z.boolean().default(false),
  /** Multi-range intervals [{max_g, e_g, d_g}] */
  intervals: z
    .array(
      z.object({
        max_g: z.number().positive(),
        e_g: z.number().positive(),
        d_g: z.number().positive(),
      })
    )
    .optional(),
  /** Max additive tare in grams */
  maxAdditiveTare_g: z.number().nonnegative().default(0),
  /** Indication type */
  indicationType: z.enum(['self', 'semi-self', 'non-self']).default('self'),
  /** Power supply type */
  powerSupplyType: z.enum(['mains', 'external', 'battery_nonrechargeable', 'road_vehicle_12v', 'road_vehicle_24v', 'none']).default('mains'),
  /** Nominal supply voltage */
  un_V: z.number().optional(),
  /** Min supply voltage */
  umin_V: z.number().optional(),
  /** Max supply voltage */
  umax_V: z.number().optional(),
  /** Is retail/price-computing */
  isRetail: z.boolean().default(false),
  /** Has tare device */
  hasTare: z.boolean().default(false),
  /** Tare type */
  tareType: z.enum(['balancing', 'weighing', 'preset', 'subtractive', 'additive', 'combined']).optional(),
  /** Has zero-tracking */
  hasZeroTracking: z.boolean().default(false),
  /** Temperature range min (°C) */
  tempRangeMin_C: z.number().default(-10),
  /** Temperature range max (°C) */
  tempRangeMax_C: z.number().default(40),
  /** Initial zero-setting range as % of Max */
  initialZeroRange_pct: z.number().min(0).max(100).default(4),
})
export type InstrumentParams = z.infer<typeof InstrumentParamsSchema>

// ── Ruleset schema ──────────────────────────────────────────────────────────
export const Table3RowSchema = z.object({
  eMin_g: z.number(),
  eMax_g: z.number().nullable(),
  nMin: z.number(),
  nMax: z.number().nullable(),
  minDivisions: z.number(),
})

export const Table6EntrySchema = z.object({
  t1: z.number(),
  t2: z.number(),
  t3: z.number().optional(),
  mpe1_e: z.number(),
  mpe2_e: z.number(),
  mpe3_e: z.number(),
})

export const RulesetSchema = z.object({
  id: z.string(),
  name: z.string(),
  edition: z.number(),
  version: z.string(),
  table3: z.record(AccuracyClassSchema, z.array(Table3RowSchema)),
  table4: z.record(AccuracyClassSchema, z.number()),
  table6: z.record(AccuracyClassSchema, Table6EntrySchema),
  inServiceMpeMultiplier: z.number(),
  temperatureDefaults: z.object({
    min_C: z.number(),
    max_C: z.number(),
    minRangeByClass: z.record(AccuracyClassSchema, z.number()),
  }),
  spanStability: z.object({
    passLimit_e: z.number(),
    minMeasurements: z.number(),
    maxDays: z.number(),
    readingsPerMeasurement: z.number(),
    singleReadingCondition_limit_e: z.number(),
  }),
  tare: z.object({ accuracy_limit_e: z.number() }),
  zeroSetting: z.object({ accuracy_limit_e: z.number() }),
})
export type Ruleset = z.infer<typeof RulesetSchema>
